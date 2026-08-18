import { useEffect, useState } from "react"
import { useRouter } from "../router"

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-[15px] h-[15px]">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const STEPS = [
  { h: "Email received", p: "The original interview message, headers intact. Not a screenshot. Not a forward." },
  { h: "The mail is authentic", p: "Signed by the company's own mail server. Not rewritten from your address." },
  { h: "Sender is a real employer", p: "Matched to a known company, not a domain you own." },
  { h: "This message only", p: "Highest stage named in the email. Nothing else in your inbox is read." },
]

export default function VerifyRound({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useRouter()
  const [phase, setPhase] = useState<"drop" | "pipe" | "done">("drop")
  const [step, setStep] = useState(0)
  const [hot, setHot] = useState(false)

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setPhase("drop"); setStep(0) }, 320)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (phase !== "pipe") return
    if (step >= STEPS.length) {
      setPhase("done")
      return
    }
    const t = setTimeout(() => setStep(s => s + 1), 820)
    return () => clearTimeout(t)
  }, [phase, step])

  if (!open) return null

  const start = () => { setPhase("pipe"); setStep(0) }

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-[rgba(25,26,29,.44)] backdrop-blur-[3px]" onClick={onClose} />
      <div
        className="fixed z-[90] top-1/2 left-1/2 w-[min(520px,94vw)] max-h-[88vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: "var(--background)", transform: "translate(-50%,-50%)", boxShadow: "0 30px 70px -20px rgba(25,26,29,.5)" }}
        role="dialog"
        aria-labelledby="verify-title"
      >
        <div className="px-[22px] py-5 border-b flex gap-3 items-start" style={{ borderColor: "var(--border)" }}>
          <div>
            <h3 id="verify-title" className="font-display font-extrabold text-xl tracking-tight">Add an interview to this profile</h3>
            <p className="text-[12.5px] mt-1.5 max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
              One original email. If it is real, the interview goes on this profile. We never ask for the rest of your inbox.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex-none w-[30px] h-[30px] rounded-lg border grid place-items-center text-base"
            style={{ borderColor: "var(--border-2)", color: "var(--foreground)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-[22px] overflow-y-auto flex-1">
          {phase === "drop" && (
            <>
              <div
                className="rounded-[13px] p-7 text-center border-[1.5px] border-dashed transition-colors"
                style={{
                  borderColor: hot ? "var(--accent)" : "var(--border-2)",
                  background: hot ? "var(--navy-light)" : "var(--card)",
                }}
                onDragOver={e => { e.preventDefault(); setHot(true) }}
                onDragEnter={e => { e.preventDefault(); setHot(true) }}
                onDragLeave={() => setHot(false)}
                onDrop={e => { e.preventDefault(); setHot(false); start() }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" className="mx-auto mb-2.5">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                <div className="font-display font-bold text-[15px]">Drop the original email here</div>
                <p className="text-xs mt-1.5 max-w-[34ch] mx-auto" style={{ color: "var(--muted-foreground)" }}>
                  In Gmail: open the interview email, click the menu, Show original, Download. Drag that .eml file in.
                </p>
                <button
                  onClick={start}
                  className="mt-3.5 px-[15px] py-[9px] rounded-[9px] font-mono text-xs text-white active:translate-y-px active:scale-[0.98]"
                  style={{ background: "var(--foreground)" }}
                >
                  Use a sample email instead
                </button>
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed rounded-[10px] px-3.5 py-3" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                Prefer forwarding? Forward the email <b style={{ color: "var(--foreground)" }}>as attachment</b> to{" "}
                <span className="font-mono" style={{ color: "var(--accent)" }}>verify+a4f9c2@elestarr.io</span>.
                A normal forward breaks the signature; forward as attachment keeps it intact.
              </p>
            </>
          )}

          {(phase === "pipe" || phase === "done") && (
            <div className="flex flex-col">
              {STEPS.slice(0, phase === "done" ? STEPS.length : step).map((s, i) => (
                <div key={s.h} className="flex gap-3 py-3.5 relative wall-card" style={{ animationDelay: "0ms" }}>
                  {i < STEPS.length - 1 && (
                    <span className="absolute left-[13px] top-[38px] bottom-[-2px] w-[1.5px]" style={{ background: "var(--border-2)" }} />
                  )}
                  <div
                    className="flex-none w-[27px] h-[27px] rounded-full grid place-items-center z-[1] text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {CHECK}
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-semibold">{s.h}</h4>
                    <p className="font-mono text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {s.p.split("PASS")[0]}
                      {s.p.includes("PASS") && <span style={{ color: "var(--accent)" }}>PASS</span>}
                      {s.p.includes("PASS") ? s.p.split("PASS")[1] : ""}
                    </p>
                  </div>
                </div>
              ))}
              {phase === "done" && (
                <div className="mt-1.5 rounded-xl border p-[15px] flex items-center gap-3 wall-card" style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: "80ms" }}>
                  <div className="w-10 h-10 rounded-full grid place-items-center text-white flex-none" style={{ background: "var(--accent)" }}>
                    {CHECK}
                  </div>
                  <div>
                    <b className="font-display text-[15px]">Final round, Stripe</b>
                    <span className="block font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>On this profile · email proved</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {phase === "done" && (
          <div className="px-[22px] pb-5">
            <button
              className="w-full py-3.5 rounded-xl font-mono text-[13px] text-white active:translate-y-px"
              style={{ background: "var(--accent)" }}
              onClick={() => { showToast("Interview added. It lives on this profile."); onClose() }}
            >
              Add to profile
            </button>
          </div>
        )}
      </div>
    </>
  )
}
