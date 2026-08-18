import { useRouter } from "../router"
import Logo from "../brand"

export default function AppNav() {
  const {
    page, navigate, dark, toggleDark, mode, setMode, wallView, setWallView,
    refsLeft, signOut, signedIn,
  } = useRouter()

  const tabs = [
    { label: "Index", onClick: () => navigate("landing"), active: page === "landing" },
    { label: "Board", onClick: () => { setWallView("wall"); navigate("board") }, active: page === "board" && wallView === "wall" },
    { label: "Signals", onClick: () => { setWallView("pipeline"); navigate("board") }, active: page === "board" && wallView === "pipeline" },
    { label: "Record", onClick: () => navigate("profile"), active: page === "profile" },
    { label: "Search", onClick: () => { setWallView("wall"); navigate("board") }, active: false },
  ]

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-[14px]"
      style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--border)" }}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-7 h-[58px] flex items-center gap-4">
        <button onClick={() => navigate("landing")} className="flex-shrink-0">
          <Logo size="md" />
        </button>

        <div className="hidden md:flex items-stretch h-full gap-1 ml-4">
          {tabs.map(t => (
            <button
              key={t.label}
              onClick={t.onClick}
              className="px-3 text-[11px] font-mono uppercase tracking-[0.14em] border-b-2 h-full flex items-center"
              style={{
                borderBottomColor: t.active ? "var(--navy)" : "transparent",
                color: "var(--navy)",
                opacity: t.active ? 1 : 0.5,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {signedIn && (
          <>
            <div className="flex border" style={{ borderColor: "var(--navy)" }}>
              {(["firm", "vetter"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="font-mono text-[11px] uppercase tracking-[0.12em] px-3.5 py-1.5"
                  style={{
                    background: mode === m ? "var(--navy)" : "transparent",
                    color: mode === m ? "var(--primary-foreground)" : "var(--navy)",
                  }}
                >
                  {m === "firm" ? "Hiring" : "Vetter"}
                </button>
              ))}
            </div>
            {mode === "vetter" && (
              <div className="hidden md:flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--navy)" }}>
                <span
                  className="min-w-[22px] h-[22px] px-1.5 grid place-items-center text-[11px] font-medium"
                  style={{ background: "var(--navy)", color: "var(--primary-foreground)" }}
                >
                  {refsLeft}
                </span>
                referrals left
              </div>
            )}
          </>
        )}

        <button
          onClick={toggleDark}
          className="w-8 h-8 grid place-items-center border"
          style={{ borderColor: "var(--border-2)", color: "var(--navy)" }}
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? (
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {signedIn ? (
          <button
            onClick={signOut}
            className="font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-2 border"
            style={{ color: "var(--navy)", borderColor: "var(--navy)" }}
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => navigate("signup")}
            className="font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2 text-[var(--primary-foreground)]"
            style={{ background: "var(--navy)" }}
          >
            Request access
          </button>
        )}
      </div>
    </header>
  )
}
