import { useEffect, useRef, useState } from "react"
import { loadProfile, proofAddress, proveWithEml } from "../lib/backend"
import { type EmlParse } from "../lib/eml"
import { useRouter } from "../router"

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-[15px] h-[15px]">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export default function VerifyRound({
  open,
  onClose,
  onStored,
  company,
  round,
  roleTitle,
  occurredOn,
}: {
  open: boolean
  onClose: () => void
  onStored?: (fact: { company: string; round: string; proved: boolean }) => void | Promise<void>
  company?: string
  round?: string
  roleTitle?: string
  occurredOn?: string
}) {
  const { showToast, accountId } = useRouter()
  const [phase, setPhase] = useState<"drop" | "reading" | "done">("drop")
  const [hot, setHot] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parse, setParse] = useState<EmlParse | null>(null)
  const [stored, setStored] = useState<{ company: string; round: string; proved: boolean } | null>(null)
  const [address, setAddress] = useState(`prove@elestarr.io`)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setPhase("drop")
        setParse(null)
        setStored(null)
        setError(null)
      }, 320)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open || !accountId) return
    void loadProfile(accountId).then(p => {
      if (p?.proof_token) setAddress(proofAddress(p.proof_token))
    })
  }, [open, accountId])

  if (!open) return null

  const take = async (file: File | undefined) => {
    if (!file || !accountId) {
      setError("Drop the original .eml file.")
      return
    }
    setError(null)
    setPhase("reading")
    const result = await proveWithEml(accountId, file, {
      company: company ?? "",
      round: round ?? "",
      role_title: roleTitle ?? "",
      occurred_on: occurredOn ?? "",
    })
  if (result.error || !result.parse || !result.fact) {
      setError(result.error || "Could not read that file.")
      setPhase("drop")
      return
    }
    setParse(result.parse)
    setStored({ company: result.fact.company, round: result.fact.round, proved: result.fact.proved })
    setPhase("done")
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      showToast("Address copied. Forward the original as an attachment.")
    } catch {
      showToast(address)
    }
  }

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
            <h3 id="verify-title" className="font-display font-normal text-xl tracking-tight">Add an interview to this profile</h3>
            <p className="text-[12.5px] mt-1.5 max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
              One original interview email. We store that file privately and read the headers. We never ask for the rest of your inbox.
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
                onDrop={e => {
                  e.preventDefault()
                  setHot(false)
                  void take(e.dataTransfer.files[0])
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" className="mx-auto mb-2.5">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                <div className="font-display font-normal text-[15px]">Drop the original email here</div>
                <p className="text-xs mt-1.5 max-w-[34ch] mx-auto" style={{ color: "var(--muted-foreground)" }}>
                  In Gmail: open the interview email, click the menu, Show original, Download. Drag that .eml file in. It stays private.
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".eml,.emlx,message/rfc822"
                  className="hidden"
                  onChange={e => { void take(e.target.files?.[0]); e.target.value = "" }}
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-3.5 px-[15px] py-[9px] rounded-[9px] font-mono text-xs text-white active:translate-y-px active:scale-[0.98]"
                  style={{ background: "var(--foreground)" }}
                >
                  Choose .eml file
                </button>
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed rounded-[10px] px-3.5 py-3" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                Prefer forwarding? Forward the email <b style={{ color: "var(--foreground)" }}>as attachment</b> to{" "}
                <button type="button" onClick={() => { void copy() }} className="font-mono" style={{ color: "var(--accent)" }}>
                  {address}
                </button>
                . A normal forward breaks the signature. Do not send take-home files or NDA work.
              </p>
              {error && <p className="mt-3 text-[13px]" style={{ color: "var(--navy)" }}>{error}</p>}
            </>
          )}

          {phase === "reading" && (
            <p className="font-mono text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              Storing the file privately and reading headers.
            </p>
          )}

          {phase === "done" && stored && parse && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 py-2">
                <div className="flex-none w-[27px] h-[27px] rounded-full grid place-items-center text-white" style={{ background: "var(--accent)" }}>{CHECK}</div>
                <div>
                  <h4 className="text-[13.5px] font-medium">File stored privately</h4>
                  <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Hiring cannot download it. The profile only gets a fact.</p>
                </div>
              </div>
              <div className="flex gap-3 py-2">
                <div className="flex-none w-[27px] h-[27px] rounded-full grid place-items-center text-white" style={{ background: parse.authentic ? "var(--accent)" : "var(--navy)" }}>{CHECK}</div>
                <div>
                  <h4 className="text-[13.5px] font-medium">{parse.authentic ? "Headers look authentic" : "Stored, not yet proved"}</h4>
                  <p className="font-mono text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{parse.note}</p>
                  {parse.fromAddr && (
                    <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>From {parse.fromAddr}</p>
                  )}
                </div>
              </div>
              <div className="mt-1.5 rounded-xl border p-[15px]" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <b className="edn-stamp text-[22px]">{stored.round}, {stored.company}</b>
                <span className="block font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {stored.proved ? "On this profile · email proved" : "On this profile · listed until the signature checks"}
                </span>
              </div>
            </div>
          )}
        </div>

        {phase === "done" && stored && (
          <div className="px-[22px] pb-5">
            <button
              className="w-full py-3.5 rounded-xl font-mono text-[13px] text-white active:translate-y-px"
              style={{ background: "var(--accent)" }}
              onClick={() => {
                void onStored?.(stored)
                onClose()
              }}
            >
              {stored.proved ? "Add to profile" : "Keep listed on profile"}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
