import type { ReactNode } from "react"
import { hrefFor, type SitePage } from "../lib/paths"
import { useRouter } from "../router"
import { reduceMotion } from "../lib/motion"

function FootLink({
  page,
  hash,
  children,
}: {
  page: SitePage
  hash?: string
  children: ReactNode
}) {
  const { navigate, page: here } = useRouter()
  const href = hrefFor(page, hash)

  return (
    <a
      className="type-value linkish"
      href={href}
      onClick={e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        if (page === "landing" && hash) {
          const href = hrefFor("landing", hash)
          if (here === "landing") {
            window.history.replaceState({ page: "landing" }, "", href)
            document.getElementById(hash)?.scrollIntoView({
              behavior: reduceMotion() ? "auto" : "smooth",
            })
            return
          }
          navigate("landing")
          window.history.replaceState({ page: "landing" }, "", href)
          window.setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView()
          }, 40)
          return
        }
        navigate(page)
      }}
    >
      {children}
    </a>
  )
}

const COLS: { title: string; links: { label: string; page: SitePage; hash?: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How verification works", page: "verification" },
      { label: "The Wall", page: "landing", hash: "wall" },
      { label: "Manifesto", page: "manifesto" },
      { label: "Pricing", page: "pricing" },
    ],
  },
  {
    title: "Candidates",
    links: [
      { label: "Prove a round", page: "candidates" },
      { label: "What we publish", page: "publish" },
      { label: "Remove a record", page: "remove" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "Skip a round", page: "hiring" },
      { label: "Access", page: "access" },
      { label: "Book a walkthrough", page: "walkthrough" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", page: "about" },
      { label: "Contact", page: "contact" },
      { label: "Careers", page: "careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", page: "privacy" },
      { label: "Terms", page: "terms" },
      { label: "Security", page: "security" },
      { label: "NDA policy", page: "nda" },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="foot-grid">
        {COLS.map(col => (
          <div key={col.title} className="foot-col">
            <p className="type-label">{col.title}</p>
            <ul>
              {col.links.map(link => (
                <li key={link.label}>
                  <FootLink page={link.page} hash={link.hash}>
                    {link.label}
                  </FootLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="foot-bar">
        <span className="type-caption">Elestar</span>
        <span className="type-caption">© 2026</span>
        <span className="type-caption">Company and round. Never the outcome.</span>
      </div>
    </footer>
  )
}
