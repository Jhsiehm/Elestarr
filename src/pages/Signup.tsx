import { useEffect, useState } from "react"
import { useRouter, type Role } from "../router"
import Logo from "../brand"
import poster from "../assets/elestarr-poster.png"

export default function Signup() {
  const { signIn, intent } = useRouter()
  const [role, setRole] = useState<Role>(intent)
  useEffect(() => { setRole(intent) }, [intent])

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.05fr_0.95fr]" style={{ background: "transparent", color: "var(--foreground)" }}>
      <div className="relative overflow-hidden hidden lg:block border-r" style={{ borderColor: "var(--border)" }}>
        <img
          src={poster}
          alt="Elestar editorial poster with halftone eye illustration and brand tagline about work and what you look at"
          className="absolute inset-0 w-full h-full object-cover object-[center_42%]"
        />
        <div
          className="absolute inset-x-0 top-0 h-[120px] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--background) 55%, transparent), transparent)" }}
        />
        <div className="absolute top-[34px] left-[34px] z-10">
          <Logo size="lg" />
        </div>
        <div className="absolute left-[34px] bottom-[34px] z-10">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "var(--navy)" }}>
            Demo only. Nothing is stored.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-10">
        <div className="w-full max-w-[360px]">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1 className="edn-lg" style={{ color: "var(--navy)" }}>
            {role === "creative" ? "I'm a candidate" : "I'm hiring"}
          </h1>
          <p className="text-[16px] mt-3" style={{ color: "var(--muted-foreground)" }}>
            {role === "creative"
              ? "Show your work. Keep interviews that didn't become a job. One email. Not your whole inbox."
              : "Look at what they made. Then see how far another company already interviewed them."}
          </p>

          <div className="flex p-[3px] rounded-[10px] border mt-[22px] mb-[18px]" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
            {([
              { id: "creative" as const, label: "I'm a candidate" },
              { id: "firm" as const, label: "I'm hiring" },
            ]).map(r => (
              <button
                key={r.id}
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

          <div className="mb-[13px]">
            <label className="block font-mono text-[10.5px] uppercase tracking-[0.06em] mb-1.5" style={{ color: "var(--muted-foreground)" }}>Work email</label>
            <input
              type="email"
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
              placeholder="••••••••"
              className="w-full border rounded-[10px] px-[13px] py-3 text-sm outline-none"
              style={{ borderColor: "var(--border-2)", background: "var(--card)", color: "var(--foreground)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
            />
          </div>

          <button
            onClick={() => signIn(role)}
            className="w-full mt-2 py-3.5 font-mono text-[13.5px] text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)" }}
          >
            Continue
          </button>
          <p className="font-mono text-[10px] text-center mt-3.5" style={{ color: "var(--ink-3)" }}>
            Prototype only. No account is created.
          </p>
        </div>
      </div>
    </div>
  )
}
