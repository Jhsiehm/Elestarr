import { type Candidate, type InterviewRound, registerLive, clearLive, livePeople } from "../data"
import { companyFromDomain, parseEml, readEmlFile } from "./eml"
import { normalizeUrl, validSite } from "./site"
import { hasCloud, supabase } from "./supabase"

export type Role = "firm" | "creative"
export type Availability = "open" | "conversation" | "not_looking"

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

export type LiveSite = {
  url: string
  label: string
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
  avatar_path: string
  avatar_url: string
  availability: Availability
  open_to: string
  proof_token: string
  onboarded: boolean
  work: LiveWork[]
  sites: LiveSite[]
  interviews: LiveInterview[]
}

const LIVE_KEY = "elestarr.live.v1"
const MAIL_DOMAIN = "elestarr.io"
const PUBLIC_PROFILE =
  "id, role, display_name, title, location, firm_name, hiring_for, avatar_path, availability, open_to, onboarded"

function emptyProfile(id: string, role: Role): LiveProfile {
  return {
    id,
    role,
    display_name: "",
    title: "",
    location: "",
    firm_name: "",
    hiring_for: "",
    avatar_path: "",
    avatar_url: "",
    availability: "open",
    open_to: "",
    proof_token: id.slice(0, 10).replace(/-/g, ""),
    onboarded: false,
    work: [],
    sites: [],
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

export function proofAddress(token: string) {
  const t = token.trim()
  if (!t) return `prove@${MAIL_DOMAIN}`
  return `prove+${t}@${MAIL_DOMAIN}`
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
  const sites = profile.sites.slice().sort((a, b) => a.sort - b.sort)
  return {
    id: wallId(profile.id),
    name,
    title,
    disc: title,
    location: profile.location.trim() || "Remote",
    available: profile.availability !== "not_looking",
    avatar: profile.avatar_url || images[0] || initialsAvatar(name),
    portfolioImages: images,
    aestheticTags: sites.map(s => s.label || "Site"),
    tags: [],
    skills: profile.open_to.split(/[,/]/).map(s => s.trim()).filter(Boolean),
    matchScore: 0,
    cred: 0,
    tier: proved.length ? "FINALIST" : "SEMIFINALIST",
    stage: "Sourced",
    vch: "maya",
    chain: [["maya", 1]],
    vround: proved[0] ? `${proved[0].round}, ${proved[0].company}` : undefined,
    seed: wallId(profile.id),
    specimenH: 300,
    bio: profile.open_to,
    interviews,
    sites,
    availability: profile.availability,
    openTo: profile.open_to,
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

function publicUrl(bucket: string, storagePath: string) {
  if (!supabase) return storagePath
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
}

const WALL_SELECT = `${PUBLIC_PROFILE}, work(storage_path, sort), sites(url, label, sort), interviews(company, round, role_title, occurred_on, proved)`

type ProfileRow = {
  id: string
  role: Role
  display_name: string
  title: string
  location: string
  firm_name: string
  hiring_for: string
  avatar_path?: string
  availability?: Availability
  open_to?: string
  proof_token?: string
  onboarded: boolean
  work?: { storage_path: string; sort: number }[]
  sites?: { url: string; label: string; sort: number }[]
  interviews?: { company: string; round: string; role_title: string; occurred_on: string | null; proved: boolean }[]
}

function fromRow(row: ProfileRow): LiveProfile {
  const avatarPath = row.avatar_path ?? ""
  return {
    id: row.id,
    role: row.role,
    display_name: row.display_name ?? "",
    title: row.title ?? "",
    location: row.location ?? "",
    firm_name: row.firm_name ?? "",
    hiring_for: row.hiring_for ?? "",
    avatar_path: avatarPath,
    avatar_url: avatarPath ? publicUrl("avatars", avatarPath) : "",
    availability: row.availability === "conversation" || row.availability === "not_looking" ? row.availability : "open",
    open_to: row.open_to ?? "",
    proof_token: row.proof_token ?? "",
    onboarded: Boolean(row.onboarded),
    work: (row.work ?? []).map(w => ({
      storage_path: w.storage_path,
      sort: w.sort,
      url: publicUrl("work", w.storage_path),
    })),
    sites: (row.sites ?? []).map(s => ({ url: s.url, label: s.label, sort: s.sort })),
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
      .select(`${WALL_SELECT}, proof_token`)
      .eq("id", userId)
      .maybeSingle()
    if (error || !data) return null
    return fromRow(data as ProfileRow)
  }
  return loadLocalStore()[userId] ?? null
}

export type BasicsPatch = Partial<Pick<LiveProfile, "display_name" | "title" | "location" | "firm_name" | "hiring_for" | "role" | "availability" | "open_to">>

export async function saveBasics(userId: string, patch: BasicsPatch) {
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

export async function saveAvatar(userId: string, file: File) {
  if (!file.type.startsWith("image/")) return "Use a photograph."
  if (file.size > 3_000_000) return "Keep the portrait under 3 MB."

  if (supabase) {
    const safe = file.name.replace(/[^\w.-]+/g, "-").slice(0, 40) || "avatar"
    const path = `${userId}/${Date.now()}-${safe}`
    const { data: existing } = await supabase.from("profiles").select("avatar_path").eq("id", userId).maybeSingle()
    if (existing?.avatar_path) await supabase.storage.from("avatars").remove([existing.avatar_path])
    const up = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false })
    if (up.error) return up.error.message
    const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId)
    return error?.message ?? null
  }

  const url = await readFileDataUrl(file)
  const store = loadLocalStore()
  const current = store[userId] ?? emptyProfile(userId, "creative")
  store[userId] = { ...current, avatar_path: "local", avatar_url: url }
  saveLocalStore(store)
  return null
}

export async function replaceWork(userId: string, files: File[]) {
  if (files.length > 6) return "Publish at most 6 pieces."
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

export async function replaceSites(userId: string, sites: { url: string; label: string }[]) {
  const cleaned: LiveSite[] = []
  for (const [i, site] of sites.entries()) {
    const url = normalizeUrl(site.url)
    if (!url) continue
    if (!validSite(url)) return "Use a full site address, like yourname.com."
    cleaned.push({ url, label: site.label.trim(), sort: i })
  }
  if (cleaned.length > 6) return "Six sites is enough."

  if (supabase) {
    await supabase.from("sites").delete().eq("profile_id", userId)
    if (!cleaned.length) return null
    const ins = await supabase.from("sites").insert(cleaned.map(s => ({
      profile_id: userId,
      url: s.url,
      label: s.label,
      sort: s.sort,
    })))
    return ins.error?.message ?? null
  }

  const store = loadLocalStore()
  const current = store[userId] ?? emptyProfile(userId, "creative")
  store[userId] = { ...current, sites: cleaned }
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

export async function proveWithEml(
  userId: string,
  file: File,
  named: { company: string; round: string; role_title: string; occurred_on: string },
): Promise<{ error: string; fact?: undefined; parse?: undefined } | { error: null; fact: LiveInterview; parse: ReturnType<typeof parseEml> }> {
  const { parse } = await readEmlFile(file)
  const company = named.company.trim() || companyFromDomain(parse.fromDomain, "")
  const round = named.round.trim() || parse.guessedRound || "Interview"
  if (!company) return { error: "Name the company, or drop an email whose From domain is the employer." }

  const proved = parse.authentic
  const fact = {
    company,
    round,
    role_title: named.role_title.trim(),
    occurred_on: named.occurred_on,
    proved,
  }

  if (supabase) {
    const { data: interview, error: ivErr } = await supabase.from("interviews").insert({
      profile_id: userId,
      company: fact.company,
      round: fact.round,
      role_title: fact.role_title,
      occurred_on: fact.occurred_on || null,
      proved,
    }).select("id").single()
    if (ivErr) return { error: ivErr.message }

    const safe = file.name.replace(/[^\w.-]+/g, "-").slice(0, 80) || "message.eml"
    const path = `${userId}/${Date.now()}-${safe}`
    const up = await supabase.storage.from("proofs").upload(path, file, {
      contentType: file.type || "message/rfc822",
      upsert: false,
    })
    if (up.error) return { error: up.error.message }

    const { error: pErr } = await supabase.from("proofs").insert({
      profile_id: userId,
      interview_id: interview.id,
      storage_path: path,
      source: "upload",
      message_id: parse.messageId,
      from_addr: parse.fromAddr,
      from_domain: parse.fromDomain,
      subject: parse.subject,
      dkim_pass: parse.dkimPass,
      spf_pass: parse.spfPass,
      authentic: parse.authentic,
      parse_note: parse.note,
    })
    if (pErr) return { error: pErr.message }

    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (token) {
      void supabase.functions.invoke("parse-proof", {
        body: { proof_path: path, interview_id: interview.id },
      })
    }

    return { error: null, fact, parse }
  }

  const store = loadLocalStore()
  const current = store[userId] ?? emptyProfile(userId, "creative")
  store[userId] = { ...current, interviews: [...current.interviews, fact] }
  saveLocalStore(store)
  return { error: null, fact, parse }
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
        .select(WALL_SELECT)
        .eq("role", "creative")
        .eq("onboarded", true)
      if (error || !data) return []
      return (data as ProfileRow[])
        .map(fromRow)
        .filter(p => p.work.length > 0 || p.sites.length > 0)
        .map(toCandidate)
    }
    const mine = await loadProfile(viewer.userId)
    if (mine && mine.role === "creative" && mine.onboarded && (mine.work.length > 0 || mine.sites.length > 0)) {
      return [toCandidate(mine)]
    }
    return []
  }

  return Object.values(loadLocalStore())
    .filter(p => p.role === "creative" && p.onboarded && (p.work.length > 0 || p.sites.length > 0))
    .map(toCandidate)
}

export async function hydrateLive(viewer: { userId: string; role: Role } | null) {
  clearLive()
  if (!viewer) return
  const mine = await loadProfile(viewer.userId)
  if (mine) registerLive(toCandidate(mine))
  for (const person of await loadWallCreatives(viewer)) registerLive(person)
}

export function deskPeople() {
  return livePeople()
}

export { parseEml }
