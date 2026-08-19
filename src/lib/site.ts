export function normalizeUrl(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function hostOf(input: string) {
  try {
    return new URL(normalizeUrl(input)).hostname.replace(/^www\./, "")
  } catch {
    return input.replace(/^https?:\/\//i, "").split("/")[0] || input
  }
}

export function validSite(input: string) {
  try {
    const u = new URL(normalizeUrl(input))
    return Boolean(u.hostname.includes("."))
  } catch {
    return false
  }
}
