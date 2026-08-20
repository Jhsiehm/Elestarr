export type SitePage =
  | "landing"
  | "candidates"
  | "hiring"
  | "signup"
  | "board"
  | "profile"
  | "onboard"
  | "verification"
  | "privacy"
  | "terms"
  | "security"
  | "faq"
  | "pricing"
  | "about"
  | "contact"
  | "careers"
  | "nda"
  | "remove"
  | "publish"
  | "access"
  | "walkthrough"
  | "notfound"

const TABLE: Record<SitePage, string> = {
  landing: "/",
  candidates: "/candidates",
  hiring: "/hiring",
  signup: "/signup",
  board: "/board",
  profile: "/profile",
  onboard: "/onboard",
  verification: "/verification",
  privacy: "/privacy",
  terms: "/terms",
  security: "/security",
  faq: "/faq",
  pricing: "/pricing",
  about: "/about",
  contact: "/contact",
  careers: "/careers",
  nda: "/nda",
  remove: "/remove-a-record",
  publish: "/what-we-publish",
  access: "/access",
  walkthrough: "/book-walkthrough",
  notfound: "/404",
}

const ALIAS: Record<string, SitePage> = {
  "/how-verification-works": "verification",
}

const APP_PAGES: SitePage[] = ["board", "profile", "onboard"]

function basePrefix() {
  const raw = import.meta.env.BASE_URL || "/"
  return raw.endsWith("/") ? raw.slice(0, -1) : raw
}

export function hrefFor(page: SitePage, hash?: string) {
  const prefix = basePrefix()
  const path = TABLE[page]
  const url = `${prefix}${path === "/" ? "/" : path}`
  return hash ? `${url}#${hash}` : url
}

export function isPublicPage(page: SitePage) {
  return !APP_PAGES.includes(page)
}

export function pageFromLocation(): SitePage | null {
  if (typeof window === "undefined") return null
  const url = new URL(window.location.href)
  if (url.hash.length > 1) {
    const hashPath = url.hash.replace(/^#/, "")
    const fromHash = matchPath(hashPath.startsWith("/") ? hashPath : `/${hashPath}`)
    if (fromHash && fromHash !== "notfound") return fromHash
  }

  const prefix = basePrefix()
  let path = url.pathname
  if (prefix && path.startsWith(prefix)) path = path.slice(prefix.length) || "/"
  if (!path.startsWith("/")) path = `/${path}`
  return matchPath(path)
}

function matchPath(path: string): SitePage | null {
  const clean = (path.split("?")[0] || "/").replace(/\/+$/, "") || "/"
  if (ALIAS[clean]) return ALIAS[clean]
  const hit = (Object.entries(TABLE) as [SitePage, string][]).find(([, href]) => {
    const n = href.replace(/\/+$/, "") || "/"
    return n === clean
  })
  if (hit) return hit[0]
  if (clean === "/" || clean === "") return "landing"
  return "notfound"
}
