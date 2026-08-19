import { ensureProfile, loadProfile, markProfileOnboarded, type Role } from "./lib/backend"
import { hasCloud, supabase } from "./lib/supabase"

const ACCOUNTS_KEY = "elestarr.accounts.v1"
const SESSION_KEY = "elestarr.session.v1"

export type SessionAccount = {
  userId: string
  email: string
  role: Role
  onboarded: boolean
}

type StoredAccount = {
  userId: string
  email: string
  pass: string
  role: Role
  onboarded: boolean
  createdAt: number
}

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((row: StoredAccount) => ({
      ...row,
      userId: row.userId || row.email,
    }))
  } catch {
    return []
  }
}

function saveAccounts(list: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list))
}

async function digest(email: string, password: string) {
  const data = new TextEncoder().encode(`${email}:${password}`)
  const buf = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("")
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "That email already has an account. Sign in."
  }
  if (lower.includes("invalid login")) return "Wrong email or password."
  if (lower.includes("email not confirmed")) {
    return "Confirm your email, or turn off Confirm email in the Supabase dashboard for this prototype."
  }
  if (lower.includes("password")) return "Password needs at least 8 characters."
  return message
}

export function cloudConfigured() {
  return hasCloud()
}

async function sessionFromUser(userId: string, email: string, fallbackRole: Role): Promise<SessionAccount> {
  const profile = await loadProfile(userId)
  return {
    userId,
    email,
    role: profile?.role ?? fallbackRole,
    onboarded: profile?.onboarded ?? false,
  }
}

export async function getActiveSession(): Promise<SessionAccount | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (!user?.email) return null
    const role = user.user_metadata?.role === "firm" ? "firm" : "creative"
    await ensureProfile(user.id, role)
    return sessionFromUser(user.id, user.email, role)
  }
  if (typeof window === "undefined") return null
  const email = window.localStorage.getItem(SESSION_KEY)
  if (!email) return null
  const acc = loadAccounts().find(a => a.email === email)
  if (!acc) return null
  const profile = await loadProfile(acc.userId)
  return {
    userId: acc.userId,
    email: acc.email,
    role: profile?.role ?? acc.role,
    onboarded: profile?.onboarded ?? acc.onboarded,
  }
}

export async function createAccount(email: string, password: string, role: Role) {
  const key = email.trim().toLowerCase()
  if (!validEmail(key)) return "Use a real work email."
  if (password.length < 8) return "Password needs at least 8 characters."

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: key,
      password,
      options: { data: { role } },
    })
    if (error) return mapAuthError(error.message)
    if (!data.user) return "Could not create the account."
    if (!data.session) {
      return "Confirm your email before signing in. For this prototype, turn off Confirm email in Supabase Auth settings."
    }
    const fail = await ensureProfile(data.user.id, role)
    if (fail) return fail
    return null
  }

  const list = loadAccounts()
  if (list.some(a => a.email === key)) return "That email already has an account. Sign in."
  const pass = await digest(key, password)
  const userId = crypto.randomUUID()
  list.push({
    userId,
    email: key,
    pass,
    role,
    onboarded: false,
    createdAt: Date.now(),
  })
  saveAccounts(list)
  window.localStorage.setItem(SESSION_KEY, key)
  await ensureProfile(userId, role)
  return null
}

export async function signInAccount(email: string, password: string) {
  const key = email.trim().toLowerCase()
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: key, password })
    if (error) return mapAuthError(error.message)
    const user = data.user
    if (!user) return "Could not sign in."
    const role = user.user_metadata?.role === "firm" ? "firm" : "creative"
    await ensureProfile(user.id, role)
    return null
  }

  const acc = loadAccounts().find(a => a.email === key)
  if (!acc) return "No account with that email. Create one."
  const pass = await digest(key, password)
  if (pass !== acc.pass) return "Wrong password."
  window.localStorage.setItem(SESSION_KEY, key)
  await ensureProfile(acc.userId, acc.role)
  return null
}

export async function markOnboarded(userId: string) {
  const fail = await markProfileOnboarded(userId)
  if (fail) return fail
  if (!supabase) {
    saveAccounts(loadAccounts().map(a => (a.userId === userId ? { ...a, onboarded: true } : a)))
  }
  return null
}

export async function clearSession() {
  if (supabase) {
    await supabase.auth.signOut()
    return
  }
  if (typeof window === "undefined") return
  window.localStorage.removeItem(SESSION_KEY)
}

export function subscribeAuth(handler: () => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(() => { handler() })
  return () => data.subscription.unsubscribe()
}
