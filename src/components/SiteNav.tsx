import { useEffect, useState } from "react"
import Logo from "../brand"
import { useRouter, type Page } from "../router"
import DotIcon from "./DotIcon"

const LINKS: { label: string; page: Page }[] = [
  { label: "Candidates", page: "candidates" },
  { label: "Hiring", page: "hiring" },
]

export default function SiteNav() {
  const { page, navigate, signedIn } = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [page])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <header className="site-nav">
      <div className="site-nav-bar">
        <button type="button" className="logo-btn" onClick={() => navigate("landing")} aria-label="Elestar home">
          <Logo size="sm" />
        </button>

        <nav className="site-nav-desk" aria-label="Primary">
          {LINKS.map(link => (
            <button
              key={link.page}
              type="button"
              className="type-nav"
              data-active={page === link.page ? "" : undefined}
              onClick={() => navigate(link.page)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="site-nav-end">
          <button
            type="button"
            className="type-nav site-nav-account"
            onClick={() => navigate(signedIn ? "board" : "signup")}
          >
            {signedIn ? "Desk" : "Sign in"}
          </button>
          <button
            type="button"
            className="site-nav-menu"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(v => !v)}
          >
            <span className="type-label">{open ? "Close" : "Menu"}</span>
            <DotIcon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {open ? (
        <nav id="site-menu" className="site-nav-mobile" aria-label="Menu">
          <dl className="record">
            {LINKS.map(link => (
              <div key={link.page} className="record-row">
                <dt className="type-label">Go</dt>
                <dd>
                  <button type="button" className="type-value linkish" onClick={() => navigate(link.page)}>
                    {link.label}
                  </button>
                </dd>
              </div>
            ))}
            <div className="record-row">
              <dt className="type-label">Account</dt>
              <dd>
                <button
                  type="button"
                  className="type-value linkish"
                  onClick={() => navigate(signedIn ? "board" : "signup")}
                >
                  {signedIn ? "Open the desk" : "Sign in"}
                </button>
              </dd>
            </div>
          </dl>
        </nav>
      ) : null}
    </header>
  )
}
