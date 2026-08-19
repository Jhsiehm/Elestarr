const CONSUMER = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "outlook.com",
  "hotmail.com", "live.com", "icloud.com", "me.com", "proton.me", "protonmail.com",
  "aol.com", "mail.com", "pm.me",
])

export type EmlParse = {
  fromAddr: string
  fromDomain: string
  subject: string
  messageId: string
  date: string
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
  if (/\bfinal\b|\blast round\b|\bonsite final\b/.test(t)) return "Final round"
  if (/\bpanel\b|\bonsite\b|\bon-site\b/.test(t)) return "Panel"
  if (/\btake-?home\b|\bassignment\b/.test(t)) return "Take-home"
  if (/\btechnical\b/.test(t)) return "Technical"
  if (/\bscreen\b|\bphone\b|\brecruiter\b/.test(t)) return "Screen"
  return ""
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
  const signed = dkimPass === true || spfPass === true
  const authentic = Boolean(fromDomain) && !consumer && (signed || Boolean(h.get("dkim-signature")))
  let note = "Headers read from the original file."
  if (!fromDomain) note = "No From address in this file."
  else if (consumer) note = "This was sent from a personal mailbox, not a company mail server."
  else if (authentic) note = "Sender domain looks like an employer. Signed headers present."
  else note = "Company domain, but no DKIM/SPF pass on this copy. Forward as attachment, not a normal forward."

  return {
    fromAddr,
    fromDomain,
    subject,
    messageId: (h.get("message-id") || "").replace(/[<>]/g, ""),
    date: h.get("date") || "",
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

export async function readEmlFile(file: File) {
  const raw = await file.text()
  if (!raw.includes(":") || raw.length < 40) {
    throw new Error("That does not look like an original email file.")
  }
  return { raw, parse: parseEml(raw) }
}
