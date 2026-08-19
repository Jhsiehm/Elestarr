import { useEffect, useState } from "react"
import { cloudConfigured, createAccount, signInAccount } from "../accounts"
import { useRouter, type Role } from "../router"
import Logo from "../brand"
import wallMockup from "../assets/elestarr-wall-mockup.jpg"

export default function Signup() {
  const { startSession, intent, showToast } = useRouter()
  const [role, setRole] = useState<Role>(intent)
  const [mode, setMode] = useState<"create" | "enter">("create")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { setRole(intent) }, [intent])

  const submit = async () => {
    if (busy) return
    setError(null)
    setBusy(true)
    const fail = mode === "create"
      ? await createAccount(email, password, role)
      : await signInAccount(email, password)
    setBusy(false)
    if (fail) {
      setError(fail)
      return
    }
    showToast(mode === "create" ? "Account created." : "Signed in.")
    await startSession()
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.05fr_0.95fr]" style={{ background: "transparent", color: "var(--foreground)" }}>
      <div
        className="relative hidden lg:flex items-center justify-center p-8 xl:p-10 border-r"
        style={{ borderColor: "var(--border)", background: "var(--background)" }}
      >
        <figure className="overflow-hidden max-w-full" style={{ background: "var(--card)", boxShadow: "var(--paper-shadow)" }}>
          <img
            src={wallMockup}
            alt="The Elestarr wall. Work first, then the company and farthest proved interview."
            className="block w-full h-auto"
            decoding="async"
          />
        </figure>
      </div>

      <div className="flex items-center justify-center p-8 md:p-10">
        <form
          className="w-full max-w-[360px]"
          onSubmit={e => { e.preventDefault(); void submit() }}
        >
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1 className="edn-lg" style={{ color: "var(--navy)" }}>
            {mode === "create" ? "Create an account" : "Sign in"}
          </h1>
          <p className="text-[16px] mt-3" style={{ color: "var(--muted-foreground)" }}>
            {mode === "enter"
              ? "Come back to the work and the proved round. The result stays private. So does the process."
              : role === "creative"
                ? "Show your work. Prove how far you got with one original email. The result stays private. So does the process."
                : "Look at the work. Then the company and how far they already got. You do not see the rejection, or what they were asked."}
          </p>

          {mode === "create" && (
          <div className="flex p-[3px] rounded-[10px] border mt-[22px] mb-3" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
            {([
              { id: "creative" as const, label: "I'm a candidate" },
              { id: "firm" as const, label: "I'm hiring" },
            ]).map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="flex-1 font-mono text-xs py-[9px] rounded-lg transition-colors"
                style={{
                  background: role === r.id ? "var(--foreground)" : "transparent",
                  color: role === r.id ? "var(--background)" : "var(--muted-foreground)",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          )}

          <div className={`flex gap-4 mb-[18px] font-mono text-[11px] uppercase tracking-[0.12em] ${mode === "enter" ? "mt-[22px]" : ""}`}>
            <button
              type="button"
              onClick={() => { setMode("create"); setError(null) }}
              style={{ color: "var(--navy)", opacity: mode === "create" ? 1 : 0.45 }}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => { setMode("enter"); setError(null) }}
              style={{ color: "var(--navy)", opacity: mode === "enter" ? 1 : 0.45 }}
            >
              Sign in
            </button>
          </div>

          <div className="mb-[13px]">
            <label className="block font-mono text-[10.5px] uppercase tracking-[0.06em] mb-1.5" style={{ color: "var(--muted-foreground)" }}>Work email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="w-full border rounded-[10px] px-[13px] py-3 text-sm outline-none"
              style={{ borderColor: "var(--border-2)", background: "var(--card)", color: "var(--foreground)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
            />
          </div>
          <div className="mb-[13px]">
            <label className="block font-mono text-[10.5px] uppercase tracking-[0.06em] mb-1.5" style={{ color: "var(--muted-foreground)" }}>Password</label>
            <input
              type="password"
              name="password"
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border rounded-[10px] px-[13px] py-3 text-sm outline-none"
              style={{ borderColor: "var(--border-2)", background: "var(--card)", color: "var(--foreground)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
            />
          </div>

          {error && (
            <p className="text-[13px] mb-3" style={{ color: "var(--navy)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-3.5 font-mono text-[13.5px] text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99] disabled:opacity-60"
            style={{ background: "var(--navy)" }}
          >
            {busy ? "Saving…" : mode === "create" ? "Create account" : "Sign in"}
          </button>
          <p className="font-mono text-[10px] text-center mt-3.5 leading-relaxed" style={{ color: "var(--ink-3)" }}>
            {cloudConfigured()
              ? "Employers see company and farthest round. Not the result. Not the assignment."
              : "No Supabase keys yet, so this account stays on this device. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to save across devices. Employers see company and farthest round. Not the result. Not the assignment."}
          </p>
        </form>
      </div>
    </div>
  )
}
