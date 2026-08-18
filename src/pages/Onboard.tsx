import { useState } from "react"
import Logo from "../brand"
import { getCandidate } from "../data"
import { listingsFor } from "../listings"
import { useRouter } from "../router"

const STEPS = [
  {
    kicker: "01 · Work",
    title: "Your work is already on the wall.",
    body: "That is how employers meet you first. They open a pin. They do not start from a resume.",
  },
  {
    kicker: "02 · Interviews",
    title: "Keep the loops that did not become a job.",
    body: "One original email. If it is real, the company and how far you got stay on your profile. Rejections stay private.",
  },
  {
    kicker: "03 · Roles",
    title: "Listings appear from what was already assessed.",
    body: "We do not rank you. We name the overlap with a job, and the gap. Prestige is not how we sort.",
  },
]

export default function Onboard() {
  const { finishOnboard, profileId } = useRouter()
  const [step, setStep] = useState(0)
  const person = getCandidate(profileId)
  const proved = person.interviews.filter(iv => iv.verified)
  const roles = listingsFor(person)
  const last = step === STEPS.length - 1
  const copy = STEPS[step]

  const next = () => {
    if (last) {
      finishOnboard()
      return
    }
    setStep(s => s + 1)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "transparent", color: "var(--foreground)" }}>
      <div className="px-5 md:px-8 h-16 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
        <Logo />
        <button
          onClick={finishOnboard}
          className="font-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[520px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--navy)" }}>
            {copy.kicker}
          </p>
          <h1 className="edn-lg mb-4" style={{ color: "var(--navy)" }}>{copy.title}</h1>
          <p className="text-[17px] leading-relaxed max-w-[42ch] mb-8" style={{ color: "var(--muted-foreground)" }}>
            {copy.body}
          </p>

          {step === 0 && (
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-8" style={{ color: "var(--ink-3)" }}>
              {person.portfolioImages.length} pieces live · {person.name}
            </p>
          )}
          {step === 1 && (
            <div className="mb-8 space-y-2">
              {proved.map(iv => (
                <p key={iv.company} className="font-display font-normal text-[18px]" style={{ color: "var(--navy)" }}>
                  {iv.company} · {iv.round}
                </p>
              ))}
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] pt-2" style={{ color: "var(--verify)" }}>
                Already on this profile · email proved
              </p>
            </div>
          )}
          {step === 2 && (
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-8" style={{ color: "var(--ink-3)" }}>
              {roles.length} roles overlap the loops on your profile
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={next}
              className="font-mono text-[12px] uppercase tracking-[0.12em] px-5 py-3 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
              style={{ background: "var(--navy)" }}
            >
              {last ? "Open listings" : "Continue"}
            </button>
            {step === 1 && (
              <button
                onClick={() => finishOnboard("desk")}
                className="font-mono text-[11px] uppercase tracking-[0.12em]"
                style={{ color: "var(--navy)" }}
              >
                Add another
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
