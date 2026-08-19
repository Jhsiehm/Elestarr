const CONSUMER = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "live.com", "icloud.com", "me.com", "proton.me", "protonmail.com",
])

export type EmlParse = {
  fromAddr: string
  fromDomain: string
  subject: string
  messageId: string
  dkimPass: boolean | null
  spfPass: boolean | null
  authentic: boolean
  note: string
  guessedRound: string
}

function unfold(raw: string) {
  return raw.replace(/\r\n[ \t]/g, " ").replace(/\n[ \t]/g, " ")
}

function headerMap(head: string) {
  const map = new Map<string, string>()
  for (const line of unfold(head).split(/\r?\n/)) {
    const i = line.indexOf(":")
    if (i < 1) continue
    const key = line.slice(0, i).trim().toLowerCase()
    const val = line.slice(i + 1).trim()
    map.set(key, map.has(key) ? `${map.get(key)} ${val}` : val)
  }
  return map
}

function addr(value: string) {
  const angle = value.match(/<([^>]+)>/)
  return (angle ? angle[1] : value).trim().toLowerCase()
}

function domainOf(email: string) {
  const at = email.lastIndexOf("@")
  return at >= 0 ? email.slice(at + 1).toLowerCase() : ""
}

function authResult(value: string, kind: "dkim" | "spf") {
  const re = kind === "dkim" ? /dkim\s*=\s*(pass|fail|none)/i : /spf\s*=\s*(pass|fail|none)/i
  const m = value.match(re)
  if (!m) return null
  if (m[1].toLowerCase() === "pass") return true
  if (m[1].toLowerCase() === "fail") return false
  return null
}

function guessRound(subject: string, body: string) {
  const t = `${subject}\n${body}`.toLowerCase()
  if (/\bfinal\b/.test(t)) return "Final round"
  if (/\bpanel\b|\bonsite\b/.test(t)) return "Panel"
  if (/\btake-?home\b/.test(t)) return "Take-home"
  if (/\btechnical\b/.test(t)) return "Technical"
  if (/\bscreen\b|\bphone\b/.test(t)) return "Screen"
  return "Interview"
}

export function parseEml(raw: string): EmlParse {
  const split = raw.search(/\r?\n\r?\n/)
  const head = split >= 0 ? raw.slice(0, split) : raw
  const body = split >= 0 ? raw.slice(split) : ""
  const h = headerMap(head)
  const fromAddr = addr(h.get("from") || "")
  const fromDomain = domainOf(fromAddr)
  const subject = h.get("subject") || ""
  const auth = h.get("authentication-results") || ""
  const dkimPass = authResult(auth, "dkim")
  const spfPass = authResult(auth, "spf")
  const consumer = CONSUMER.has(fromDomain)
  const authentic = Boolean(fromDomain) && !consumer && (dkimPass === true || spfPass === true || Boolean(h.get("dkim-signature")))
  let note = "Headers read from the original file."
  if (!fromDomain) note = "No From address in this file."
  else if (consumer) note = "Personal mailbox, not a company mail server."
  else if (authentic) note = "Employer domain with signed headers."
  else note = "Company domain, but no DKIM/SPF pass. Forward as attachment."

  return {
    fromAddr,
    fromDomain,
    subject,
    messageId: (h.get("message-id") || "").replace(/[<>]/g, ""),
    dkimPass,
    spfPass,
    authentic,
    note,
    guessedRound: guessRound(subject, body),
  }
}

export function companyFromDomain(domain: string, fallback: string) {
  if (!domain || CONSUMER.has(domain)) return fallback
  const host = domain.replace(/^mail\./, "").replace(/^email\./, "")
  const label = host.split(".")[0] || fallback
  if (!label) return fallback
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function extractAttachedOriginal(raw: string) {
  const marker = raw.search(/content-type:\s*message\/rfc822/i)
  if (marker < 0) return raw
  const rest = raw.slice(marker)
  const bodyAt = rest.search(/\r?\n\r?\n/)
  if (bodyAt < 0) return raw
  let body = rest.slice(bodyAt).replace(/^\r?\n/, "")
  const next = body.search(/\r?\n--/)
  if (next > 40) body = body.slice(0, next)
  return body.trim() || raw
}

export function plusToken(toHeader: string) {
  const m = toHeader.match(/(?:prove|verify)\+([a-z0-9]+)@/i)
  return m?.[1]?.toLowerCase() ?? ""
}
