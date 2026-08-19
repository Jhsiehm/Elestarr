import { type Candidate, type InterviewRound, registerLive, clearLive } from "../data"
import { hasCloud, supabase } from "./supabase"

export type Role = "firm" | "creative"

export type LiveInterview = {
  company: string
  round: string
  role_title: string
  occurred_on: string
  proved: boolean
}

export type LiveWork = {
  url: string
  storage_path: string
  sort: number
}

export type LiveProfile = {
  id: string
  role: Role
  display_name: string
  title: string
  location: string
  firm_name: string
  hiring_for: string
  onboarded: boolean
  work: LiveWork[]
  interviews: LiveInterview[]
}

const LIVE_KEY = "elestarr.live.v1"

function emptyProfile(id: string, role: Role): LiveProfile {
  return {
    id,
    role,
    display_name: "",
    title: "",
    location: "",
    firm_name: "",
    hiring_for: "",
    onboarded: false,
    work: [],
    interviews: [],
  }
}

export function wallId(userId: string) {
  let h = 2166136261
  for (let i = 0; i < userId.length; i++) {
    h ^= userId.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return 9000 + ((h >>> 0) % 80000)
}

function prettyDate(iso: string) {
  if (!iso) return ""
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function initialsAvatar(name: string) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join("") || "EL"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="#152238" width="120" height="120"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#f5f0e6" font-family="Georgia, serif" font-size="42">${initials}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function toCandidate(profile: LiveProfile): Candidate {
  const images = profile.work.slice().sort((a, b) => a.sort - b.sort).map(w => w.url)
  const proved = profile.interviews.filter(iv => iv.proved)
  const interviews: InterviewRound[] = proved.map(iv => ({
    company: iv.company,
    logo: iv.company.slice(0, 1).toUpperCase(),
    role: iv.role_title,
    type: "Full-time",
    round: iv.round,
    date: prettyDate(iv.occurred_on),
    verified: true,
  }))
  const name = profile.display_name.trim() || "Untitled"
  const title = profile.title.trim() || "Designer"
  return {
    id: wallId(profile.id),
    name,
    title,
    disc: title,
    location: profile.location.trim() || "Remote",
    available: true,
    avatar: images[0] || initialsAvatar(name),
    portfolioImages: images,
    aestheticTags: [],
    tags: [],
    skills: [],
    matchScore: 0,
    cred: 0,
    tier: proved.length ? "FINALIST" : "SEMIFINALIST",
    stage: "Sourced",
    vch: "maya",
    chain: [["maya", 1]],
    vround: proved[0] ? `${proved[0].round}, ${proved[0].company}` : undefined,
    seed: wallId(profile.id),
    specimenH: 300,
    bio: "",
    interviews,
  }
}

function loadLocalStore(): Record<string, LiveProfile> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(LIVE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object" ? parsed as Record<string, LiveProfile> : {}
  } catch {
    return {}
  }
}

function saveLocalStore(store: Record<string, LiveProfile>) {
  window.localStorage.setItem(LIVE_KEY, JSON.stringify(store))
}

function publicUrl(storagePath: string) {
  if (!supabase) return storagePath
  return supabase.storage.from("work").getPublicUrl(storagePath).data.publicUrl
}

type ProfileRow = {
  id: string
  role: Role
  display_name: string
  title: string
  location: string
  firm_name: string
  hiring_for: string
  onboarded: boolean
  work?: { storage_path: string; sort: number }[]
  interviews?: { company: string; round: string; role_title: string; occurred_on: string | null; proved: boolean }[]
}

function fromRow(row: ProfileRow): LiveProfile {
  return {
    id: row.id,
    role: row.role,
    display_name: row.display_name ?? "",
    title: row.title ?? "",
    location: row.location ?? "",
    firm_name: row.firm_name ?? "",
    hiring_for: row.hiring_for ?? "",
    onboarded: Boolean(row.onboarded),
    work: (row.work ?? []).map(w => ({
      storage_path: w.storage_path,
      sort: w.sort,
      url: publicUrl(w.storage_path),
    })),
    interviews: (row.interviews ?? []).map(iv => ({
      company: iv.company,
      round: iv.round,
      role_title: iv.role_title ?? "",
      occurred_on: iv.occurred_on ?? "",
      proved: Boolean(iv.proved),
    })),
  }
}

export async function ensureProfile(userId: string, role: Role) {
  if (supabase) {
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()
    if (!existing) {
      const { error } = await supabase.from("profiles").insert({ id: userId, role })
      if (error && !error.message.toLowerCase().includes("duplicate")) return error.message
    }
    return null
  }
  const store = loadLocalStore()
  if (!store[userId]) {
    store[userId] = emptyProfile(userId, role)
    saveLocalStore(store)
  }
  return null
}

export async function loadProfile(userId: string): Promise<LiveProfile | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, work(storage_path, sort), interviews(company, round, role_title, occurred_on, proved)")
      .eq("id", userId)
      .maybeSingle()
    if (error || !data) return null
    return fromRow(data as ProfileRow)
  }
  return loadLocalStore()[userId] ?? null
}

export async function saveBasics(userId: string, patch: Partial<Pick<LiveProfile, "display_name" | "title" | "location" | "firm_name" | "hiring_for" | "role">>) {
  if (supabase) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId)
    return error?.message ?? null
  }
  const store = loadLocalStore()
  const current = store[userId] ?? emptyProfile(userId, patch.role ?? "creative")
  store[userId] = { ...current, ...patch }
  saveLocalStore(store)
  return null
}

function readFileDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read that file."))
    reader.readAsDataURL(file)
  })
}

export async function replaceWork(userId: string, files: File[]) {
  if (files.length < 1 || files.length > 6) return "Publish between 1 and 6 pieces."
  for (const file of files) {
    if (!file.type.startsWith("image/")) return "Work has to be images."
    if (file.size > 4_000_000) return "Each image needs to stay under 4 MB."
  }

  if (supabase) {
    const { data: existing } = await supabase.from("work").select("id, storage_path").eq("profile_id", userId)
    for (const row of existing ?? []) {
      await supabase.storage.from("work").remove([row.storage_path])
      await supabase.from("work").delete().eq("id", row.id)
    }
    for (const [i, file] of files.entries()) {
      const safe = file.name.replace(/[^\w.-]+/g, "-").slice(0, 80) || "work"
      const path = `${userId}/${Date.now()}-${i}-${safe}`
      const up = await supabase.storage.from("work").upload(path, file, { contentType: file.type, upsert: false })
      if (up.error) return up.error.message
      const ins = await supabase.from("work").insert({ profile_id: userId, storage_path: path, sort: i })
      if (ins.error) return ins.error.message
    }
    return null
  }

  const work: LiveWork[] = []
  for (const [i, file] of files.entries()) {
    const url = await readFileDataUrl(file)
    work.push({ url, storage_path: `local/${i}`, sort: i })
  }
  const store = loadLocalStore()
  const current = store[userId] ?? emptyProfile(userId, "creative")
  store[userId] = { ...current, work }
  saveLocalStore(store)
  return null
}

export async function addProvedInterview(userId: string, fact: { company: string; round: string; role_title: string; occurred_on: string }) {
  const row = { ...fact, proved: true }
  if (supabase) {
    const { error } = await supabase.from("interviews").insert({
      profile_id: userId,
      company: fact.company,
      round: fact.round,
      role_title: fact.role_title,
      occurred_on: fact.occurred_on || null,
      proved: true,
    })
    return error?.message ?? null
  }
  const store = loadLocalStore()
  const current = store[userId] ?? emptyProfile(userId, "creative")
  store[userId] = { ...current, interviews: [...current.interviews, row] }
  saveLocalStore(store)
  return null
}

export async function markProfileOnboarded(userId: string) {
  if (supabase) {
    const { error } = await supabase.from("profiles").update({ onboarded: true }).eq("id", userId)
    return error?.message ?? null
  }
  const store = loadLocalStore()
  if (store[userId]) {
    store[userId] = { ...store[userId], onboarded: true }
    saveLocalStore(store)
  }
  return null
}

export async function loadWallCreatives(viewer: { userId: string; role: Role }): Promise<Candidate[]> {
  if (supabase) {
    if (viewer.role === "firm") {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, work(storage_path, sort), interviews(company, round, role_title, occurred_on, proved)")
        .eq("role", "creative")
        .eq("onboarded", true)
      if (error || !data) return []
      return (data as ProfileRow[])
        .map(fromRow)
        .filter(p => p.work.length > 0)
        .map(toCandidate)
    }
    const mine = await loadProfile(viewer.userId)
    if (mine && mine.role === "creative" && mine.onboarded && mine.work.length > 0) {
      return [toCandidate(mine)]
    }
    return []
  }

  return Object.values(loadLocalStore())
    .filter(p => p.role === "creative" && p.onboarded && p.work.length > 0)
    .map(toCandidate)
}

export async function hydrateLive(viewer: { userId: string; role: Role } | null) {
  clearLive()
  if (!viewer) return
  const mine = await loadProfile(viewer.userId)
  if (mine) registerLive(toCandidate(mine))
  for (const person of await loadWallCreatives(viewer)) registerLive(person)
}
