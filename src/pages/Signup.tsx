import { useEffect, useState } from "react"
import { cloudConfigured, createAccount, signInAccount } from "../accounts"
import { useRouter, type Role } from "../router"
import Logo from "../brand"
import ResolveCanvas from "../components/ResolveCanvas"
import ResolveRecord from "../components/ResolveRecord"

export default function Signup() {
  const { startSession, intent, showToast, navigate } = useRouter()
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
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.05fr_0.95fr]" style={{ background: "var(--stock)", color: "var(--ink)" }}>
      <div
        className="relative hidden lg:flex items-center justify-center p-8 xl:p-10 border-r"
        style={{ borderColor: "var(--rule)", background: "var(--stock)" }}
      >
        <div className="panel w-full max-w-[440px]">
          <ResolveCanvas />
          <ResolveRecord />
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-10">
        <form
          className="w-full max-w-[360px]"
          onSubmit={e => { e.preventDefault(); void submit() }}
        >
          <button type="button" className="mb-8" onClick={() => navigate("landing")} aria-label="Elestar home">
            <Logo />
          </button>
          <h1 className="type-section">
            {mode === "create" ? "Create an account" : "Sign in"}
          </h1>
          <p className="type-lede">
            {mode === "enter"
              ? "Come back to the work and the proved round. The result stays off the profile."
              : role === "creative"
                ? "Show the work. Prove how far you got with one original email. The result stays private."
                : "Look at the work. Then the company and how far they already got. You do not see the outcome."}
          </p>

          {mode === "create" && (
          <div className="flex p-[3px] border mt-[22px] mb-3" style={{ background: "var(--stock)", borderColor: "var(--rule)" }}>
            {([
              { id: "creative" as const, label: "I'm a candidate" },
              { id: "firm" as const, label: "I'm hiring" },
            ]).map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="flex-1 type-cta py-[9px] transition-colors"
                style={{
                  background: role === r.id ? "var(--ink)" : "transparent",
                  color: role === r.id ? "var(--stock)" : "var(--ink-mid)",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          )}

          <div className={`flex gap-4 mb-[18px] ${mode === "enter" ? "mt-[22px]" : ""}`}>
            <button
              type="button"
              className="type-nav"
              onClick={() => { setMode("create"); setError(null) }}
              style={{ opacity: mode === "create" ? 1 : 0.45 }}
            >
              Create account
            </button>
            <button
              type="button"
              className="type-nav"
              onClick={() => { setMode("enter"); setError(null) }}
              style={{ opacity: mode === "enter" ? 1 : 0.45 }}
            >
              Sign in
            </button>
          </div>

          <div className="mb-[13px]">
            <label className="block type-label mb-1.5">Work email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="w-full border px-[13px] py-3 type-value outline-none"
              style={{ borderColor: "var(--rule)", background: "var(--stock)", color: "var(--ink)" }}
            />
          </div>
          <div className="mb-[13px]">
            <label className="block type-label mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border px-[13px] py-3 type-value outline-none"
              style={{ borderColor: "var(--rule)", background: "var(--stock)", color: "var(--ink)" }}
            />
          </div>

          {error && (
            <p className="type-caption mb-3" style={{ color: "var(--ink)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-fill w-full mt-2 disabled:opacity-60"
          >
            {busy ? "Saving..." : mode === "create" ? "Create account" : "Sign in"}
          </button>
          <p className="type-caption text-center mt-3.5">
            {cloudConfigured()
              ? "Employers see company and farthest round. Not the result. Not the assignment."
              : "No Supabase keys yet, so this account stays on this device. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to save across devices. Employers see company and farthest round. Not the result. Not the assignment."}
          </p>
        </form>
      </div>
    </div>
  )
}
