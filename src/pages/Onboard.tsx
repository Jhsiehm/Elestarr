import { useEffect, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react"
import Logo from "../brand"
import VerifyRound from "../components/VerifyRound"
import { addProvedInterview, replaceWork, saveBasics, type LiveInterview } from "../lib/backend"
import { useRouter } from "../router"

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block mb-4">
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.06em] mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle = {
  borderColor: "var(--border-2)",
  background: "var(--card)",
  color: "var(--foreground)",
} as const

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border rounded-[10px] px-[13px] py-3 text-sm outline-none"
      style={inputStyle}
      onFocus={e => { props.onFocus?.(e); e.currentTarget.style.borderColor = "var(--accent)" }}
      onBlur={e => { props.onBlur?.(e); e.currentTarget.style.borderColor = "var(--border-2)" }}
    />
  )
}

export default function Onboard() {
  const { role, accountId, finishOnboard, browseWall, showToast, refreshWall } = useRouter()
  const hiring = role === "firm"
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [firmName, setFirmName] = useState("")
  const [hiringFor, setHiringFor] = useState("")

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [company, setCompany] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [occurredOn, setOccurredOn] = useState("")
  const [round, setRound] = useState("")
  const [proved, setProved] = useState<LiveInterview[]>([])
  const [verify, setVerify] = useState(false)

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => { urls.forEach(u => URL.revokeObjectURL(u)) }
  }, [files])

  const pickWork = (e: ChangeEvent<HTMLInputElement>) => {
    const next = [...files, ...Array.from(e.target.files ?? [])].slice(0, 6)
    setFiles(next)
    e.target.value = ""
  }

  const fail = (message: string | null) => {
    if (message) setError(message)
    return Boolean(message)
  }

  const saveYou = async () => {
    if (!accountId) return "Session expired. Sign in again."
    if (!displayName.trim()) return "Add your name."
    if (!title.trim()) return "Add the title you want next to your work."
    return saveBasics(accountId, {
      display_name: displayName.trim(),
      title: title.trim(),
      location: location.trim(),
    })
  }

  const saveFirm = async () => {
    if (!accountId) return "Session expired. Sign in again."
    if (!displayName.trim()) return "Add your name."
    if (!firmName.trim()) return "Add the firm."
    if (!hiringFor.trim()) return "Say what you are hiring for."
    return saveBasics(accountId, {
      display_name: displayName.trim(),
      firm_name: firmName.trim(),
      hiring_for: hiringFor.trim(),
    })
  }

  const saveWork = async () => {
    if (!accountId) return "Session expired. Sign in again."
    if (!files.length) return "Publish at least one piece. Skip will not put someone else's work on your profile."
    return replaceWork(accountId, files)
  }

  const run = async (fn: () => Promise<string | null>, then: () => void) => {
    if (busy) return
    setError(null)
    setBusy(true)
    const message = await fn()
    setBusy(false)
    if (fail(message)) return
    then()
  }

  const candidateLast = step === 2
  const hiringDone = hiring

  const next = () => {
    if (hiring) {
      void run(saveFirm, () => { void finishOnboard("wall") })
      return
    }
    if (step === 0) {
      void run(saveYou, () => setStep(1))
      return
    }
    if (step === 1) {
      void run(saveWork, () => setStep(2))
      return
    }
    if (!proved.length) {
      setError("Prove one original interview email before the wall can show how far you got.")
      return
    }
    void run(async () => null, () => { void finishOnboard("wall") })
  }

  const openVerify = () => {
    setError(null)
    if (!company.trim() || !round.trim()) {
      setError("Name the company and the farthest round first.")
      return
    }
    setVerify(true)
  }

  const onProved = async (fact: { company: string; round: string }) => {
    if (!accountId) return
    const row = {
      company: fact.company,
      round: fact.round,
      role_title: roleTitle.trim(),
      occurred_on: occurredOn,
      proved: true as const,
    }
    const message = await addProvedInterview(accountId, row)
    if (message) {
      setError(message)
      return
    }
    setProved(list => [...list, row])
    await refreshWall()
    showToast("Interview added. The result stays private.")
  }

  const kicker = hiring
    ? "Hiring · Onboarding"
    : ["01 · You", "02 · Work", "03 · Interview"][step]
  const heading = hiring
    ? "Who is hiring, and for what."
    : ["Your name next to the work.", "Publish the work they open first.", "Prove the farthest round you sat."][step]
  const body = hiring
    ? "You will see the wall from the work. The proved interview only says how far someone already got. Chemistry stays yours."
    : [
      "This is not Maya's profile. Employers meet you from what you publish here.",
      "One to six pieces. They open a pin. They do not start from a resume.",
      "One original email. If it is real, the company and how far you got stay on your profile. The result stays private. So do the questions and the take-home.",
    ][step]

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "transparent", color: "var(--foreground)" }}>
      <div className="px-5 md:px-8 h-16 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
        <Logo />
        <button
          onClick={browseWall}
          className="font-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[520px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--navy)" }}>
            {kicker}
          </p>
          <h1 className="edn-lg mb-4" style={{ color: "var(--navy)" }}>{heading}</h1>
          <p className="text-[17px] leading-relaxed max-w-[42ch] mb-8" style={{ color: "var(--muted-foreground)" }}>
            {body}
          </p>

          {hiring && (
            <>
              <Field label="Your name">
                <TextInput value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Jordan Hale" autoComplete="name" />
              </Field>
              <Field label="Firm">
                <TextInput value={firmName} onChange={e => setFirmName(e.target.value)} placeholder="Studio or company" />
              </Field>
              <Field label="Hiring for">
                <TextInput value={hiringFor} onChange={e => setHiringFor(e.target.value)} placeholder="Staff brand designer, identity systems" />
              </Field>
            </>
          )}

          {!hiring && step === 0 && (
            <>
              <Field label="Your name">
                <TextInput value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" autoComplete="name" />
              </Field>
              <Field label="Title">
                <TextInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Senior Brand Designer" />
              </Field>
              <Field label="Location">
                <TextInput value={location} onChange={e => setLocation(e.target.value)} placeholder="Berlin, DE" />
              </Field>
            </>
          )}

          {!hiring && step === 1 && (
            <div className="mb-8">
              <label className="block font-mono text-[10.5px] uppercase tracking-[0.06em] mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Selected work · {files.length} of 6
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={pickWork}
                className="block w-full text-[13px] mb-4"
              />
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previews.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setFiles(list => list.filter((_, idx) => idx !== i))}
                      className="overflow-hidden border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <img src={src} alt="" className="w-full h-24 object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <p className="font-mono text-[10px]" style={{ color: "var(--ink-3)" }}>
                Click a piece to remove it. Skip will not copy a demo profile onto yours.
              </p>
            </div>
          )}

          {!hiring && step === 2 && (
            <div className="mb-8">
              {proved.map(iv => (
                <p key={`${iv.company}-${iv.round}`} className="font-display font-normal text-[18px] mb-2" style={{ color: "var(--navy)" }}>
                  {iv.company} · {iv.round}
                </p>
              ))}
              {proved.length > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] mb-6" style={{ color: "var(--verify)" }}>
                  On this profile · email proved
                </p>
              )}
              <Field label="Company">
                <TextInput value={company} onChange={e => setCompany(e.target.value)} placeholder="Stripe" />
              </Field>
              <Field label="Role they interviewed you for">
                <TextInput value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="Staff Brand Designer" />
              </Field>
              <Field label="When">
                <TextInput type="date" value={occurredOn} onChange={e => setOccurredOn(e.target.value)} />
              </Field>
              <Field label="Farthest round">
                <TextInput value={round} onChange={e => setRound(e.target.value)} placeholder="Final round (4/4)" />
              </Field>
              <button
                type="button"
                onClick={openVerify}
                className="font-mono text-[11px] uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--navy)" }}
              >
                Prove this with the original email
              </button>
            </div>
          )}

          {error && (
            <p className="text-[13px] mb-4" style={{ color: "var(--navy)" }}>{error}</p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={next}
              disabled={busy}
              className="font-mono text-[12px] uppercase tracking-[0.12em] px-5 py-3 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99] disabled:opacity-60"
              style={{ background: "var(--navy)" }}
            >
              {busy ? "Saving…" : hiringDone || candidateLast ? "Open the wall" : "Continue"}
            </button>
          </div>
        </div>
      </div>

      <VerifyRound
        open={verify}
        onClose={() => setVerify(false)}
        company={company}
        round={round}
        onProved={onProved}
      />
    </div>
  )
}
