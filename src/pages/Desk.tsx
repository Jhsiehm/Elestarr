import { useEffect, useState } from "react"
import { getCandidate, wallPeople } from "../data"
import { briefFor, briefFromPerson, rankForRole, rankLiveWall, SAMPLE_ROLE, simulateParse, type DeskMatch, type ListingPreview } from "../deskData"
import { loadProfile } from "../lib/backend"
import { useRouter } from "../router"

function FitMark({ n }: { n: number }) {
  return (
    <span className="font-mono text-[12px] tabular-nums" style={{ color: "var(--navy)" }}>
      {n}
    </span>
  )
}

function HiringDesk() {
  const { navigate, contact, accountId, role, wallTick } = useRouter()
  const [req, setReq] = useState(SAMPLE_ROLE)
  const [phase, setPhase] = useState<"compose" | "reading" | "list">("compose")
  const [matches, setMatches] = useState<DeskMatch[]>([])
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (role !== "firm" || !accountId) return
    void loadProfile(accountId).then(p => {
      if (p?.hiring_for.trim()) setReq(p.hiring_for)
    })
  }, [accountId, role])

  const run = () => {
    if (!req.trim()) return
    setPhase("reading")
    setActive(null)
    window.setTimeout(() => {
      void wallTick
      const live = rankLiveWall(req, wallPeople())
      const next = live.length ? live : rankForRole(req)
      setMatches(next)
      setActive(next[0]?.id ?? null)
      setPhase("list")
    }, 420)
  }

  const person = active != null ? getCandidate(active) : null
  const brief = person ? (briefFor(person.id) ?? briefFromPerson(person)) : null
  const row = matches.find(m => m.id === active)

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-7 pt-10 pb-[90px]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end mb-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--navy)" }}>Desk · Hiring</p>
          <h1 className="font-display font-extralight leading-none" style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.8rem)", letterSpacing: "-0.045em", color: "var(--navy)" }}>
            A role in sentences.
          </h1>
        </div>
        <p className="text-[16px] leading-relaxed max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
          The desk ranks what was already assessed. The company stays on the row. Prestige is not how we sort. Every row names a gap.
        </p>
      </div>

      <div className="border p-4 md:p-5 mb-8" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <label className="block font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--muted-foreground)" }}>
          The req
        </label>
        <textarea
          value={req}
          onChange={e => setReq(e.target.value)}
          rows={4}
          className="w-full bg-transparent outline-none text-[16px] leading-relaxed resize-none"
          style={{ color: "var(--foreground)" }}
        />
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--ink-3)" }}>
            Floor applied in the index · FINALIST · verified
          </span>
          <button
            onClick={run}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)" }}
          >
            {phase === "reading" ? "Reading the wall" : "Read the wall"}
          </button>
        </div>
      </div>

      {phase === "reading" && (
        <p className="font-mono text-[11px] mb-8" style={{ color: "var(--muted-foreground)" }}>
          Filters first. Then overlap. The company listed is on every row.
        </p>
      )}

      {phase === "list" && (
        <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--muted-foreground)" }}>
              Proposed {matches.length} · gaps required
            </p>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {matches.map((m, i) => {
                const c = getCandidate(m.id)
                const on = active === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setActive(m.id)}
                    className="w-full text-left py-4 flex gap-3 items-start"
                    style={{
                      opacity: on ? 1 : 0.55,
                      borderColor: "var(--border)",
                    }}
                  >
                    <img src={c.avatar} alt="" className="w-11 h-11 object-cover flex-none" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display font-normal text-[18px] leading-none" style={{ color: "var(--navy)" }}>{c.name}</p>
                        <FitMark n={m.fit} />
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                        {String(i + 1).padStart(2, "0")} · {c.title}
                        {c.interviews[0] ? ` · ${c.interviews[0].company}` : ""}
                      </p>
                      <p className="text-[14px] leading-relaxed mt-2" style={{ color: "var(--muted-foreground)" }}>{m.rationale}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border p-6 md:p-8 relative overflow-hidden" style={{ borderColor: "var(--navy)", background: "color-mix(in srgb, var(--background) 70%, var(--card))" }}>
            {!person || !brief || !row ? (
              <p className="font-mono text-[11px]" style={{ color: "var(--muted-foreground)" }}>Select a row for the brief. Briefs generate only after an intro is approved — this is a preview.</p>
            ) : (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: "var(--ink-3)" }}>
                  Interview brief · after approval
                </p>
                <h2 className="font-display font-normal text-[28px] md:text-[32px] leading-none mb-2" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>{person.name}</h2>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-8" style={{ color: "var(--muted-foreground)" }}>
                  {person.title}
                  {person.interviews[0] ? ` · ${person.interviews[0].company}` : ""} · start later in the loop
                </p>

                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>Already assessed</p>
                <ul className="mb-6 space-y-1.5">
                  {brief.alreadyAssessed.map(a => (
                    <li key={a.competency} className="text-[15px]" style={{ color: "var(--foreground)" }}>
                      {a.competency}
                      <span className="font-mono text-[10px] uppercase tracking-wide ml-2" style={{ color: "var(--muted-foreground)" }}>{a.depth} · {a.format}</span>
                    </li>
                  ))}
                </ul>

                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>Safe to skip</p>
                {brief.safeToSkip.length ? (
                  <ul className="mb-6 space-y-1.5">
                    {brief.safeToSkip.map(s => (
                      <li key={s.round} className="text-[15px]" style={{ color: "var(--foreground)" }}>
                        {s.round}
                        <span className="block text-[13px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.redundantWith}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[15px] mb-6" style={{ color: "var(--muted-foreground)" }}>Nothing is safe to skip. Do not over-claim.</p>
                )}

                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>Probe instead</p>
                <ul className="mb-6 space-y-1.5">
                  {brief.probeInstead.map(p => (
                    <li key={p} className="text-[15px]" style={{ color: "var(--foreground)" }}>{p}</li>
                  ))}
                </ul>

                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>Never skip</p>
                <p className="text-[15px] mb-6" style={{ color: "var(--foreground)" }}>{brief.neverSkip.join(" · ")}</p>

                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>Outcome</p>
                <p className="text-[15px] leading-relaxed max-w-[44ch] mb-8" style={{ color: "var(--muted-foreground)" }}>{brief.outcomeContext}</p>

                <p className="text-[14px] leading-relaxed max-w-[44ch] mb-6 pb-6 border-b" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
                  Gap on this req: {row.gaps.join(" ")}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => contact(person.name)}
                    className="font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
                    style={{ background: "var(--navy)" }}
                  >
                    Request intro
                  </button>
                  <button
                    onClick={() => navigate("profile", person.id)}
                    className="font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 border active:translate-y-px"
                    style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
                  >
                    Open the work
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "compose" && (
        <p className="font-mono text-[11px] max-w-[62ch] leading-relaxed" style={{ color: "var(--ink-3)" }}>
          Hard floors run before any ranking. The wall stays the place you fall for the work. The desk is the shortlist you can defend.
        </p>
      )}
    </div>
  )
}

function ListingDesk() {
  const { showToast } = useRouter()
  const [text, setText] = useState("")
  const [answers, setAnswers] = useState(["", "", ""])
  const [phase, setPhase] = useState<"write" | "reading" | "questions" | "preview">("write")
  const [preview, setPreview] = useState<ListingPreview | null>(null)

  const parse = (withAnswers?: string[]) => {
    setPhase("reading")
    window.setTimeout(() => {
      const next = simulateParse(text, withAnswers)
      setPreview(next)
      setPhase(next.questions.length ? "questions" : "preview")
    }, 640)
  }

  const publish = () => {
    if (!preview?.ready || !preview.company) return
    showToast(`${preview.company} is on your profile. Add the original email when you have it.`)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-7 pt-10 pb-[90px]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end mb-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--navy)" }}>Desk · Candidate</p>
          <h1 className="font-display font-extralight leading-none" style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.8rem)", letterSpacing: "-0.045em", color: "var(--navy)" }}>
            Two paragraphs. Not a form.
          </h1>
        </div>
        <p className="text-[16px] leading-relaxed max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
          Describe interviews you sat, including the company. We will not invent a round. The company can be public. The rejection is not. Neither is what they asked.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12">
        <div>
          <div className="border p-4 md:p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <label className="block font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--muted-foreground)" }}>
              The loop
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={9}
              placeholder="Four rounds at Figma. Portfolio, a paid identity exercise, presentation to the brand lead. They went with someone already on the team."
              className="w-full bg-transparent outline-none text-[16px] leading-relaxed resize-none placeholder:opacity-50"
              style={{ color: "var(--foreground)" }}
            />
            <div className="flex justify-end mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => parse()}
                disabled={!text.trim() || phase === "reading"}
                className="font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 text-[var(--primary-foreground)] disabled:opacity-40 active:translate-y-px active:scale-[0.99]"
                style={{ background: "var(--navy)" }}
              >
                {phase === "reading" ? "Reading" : "Parse the loop"}
              </button>
            </div>
          </div>
          <p className="font-mono text-[10px] mt-3 leading-relaxed" style={{ color: "var(--ink-3)" }}>
            Name the company. Do not put a personal email in this box. Evidence only moves up from a signed message, never from a sentence.
          </p>

          {phase === "questions" && preview && (
            <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--border)" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--navy)" }}>Clarify — at most two</p>
              {preview.questions.map((q, i) => (
                <div key={q} className="mb-4">
                  <p className="text-[15px] mb-2" style={{ color: "var(--foreground)" }}>{q}</p>
                  <input
                    value={answers[i] ?? ""}
                    onChange={e => setAnswers(a => a.map((v, j) => (j === i ? e.target.value : v)))}
                    className="w-full border px-3 py-2 text-[14px] outline-none"
                    style={{ borderColor: "var(--border-2)", background: "var(--card)", color: "var(--foreground)" }}
                  />
                </div>
              ))}
              <button
                onClick={() => parse(answers)}
                className="font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 border"
                style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
              >
                Continue
              </button>
            </div>
          )}
        </div>

        <div>
          {(!preview || phase === "write" || phase === "reading") && (
            <div className="border border-dashed p-6 md:p-8 min-h-[280px]" style={{ borderColor: "var(--border-2)" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--ink-3)" }}>Proposed record</p>
              <p className="font-display font-normal text-[26px] leading-[1.1] mb-3" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>
                Nothing is issued until the parse is specific.
              </p>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Ambiguity returns a question. A guess would be our inflation, and that is worse than yours.
              </p>
            </div>
          )}

          {preview && phase === "preview" && preview.ready && (
            <div className="border p-6 md:p-8" style={{ borderColor: "var(--navy)", background: "color-mix(in srgb, var(--background) 70%, var(--card))" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--ink-3)" }}>
                Issued record · proposed
              </p>
              <p className="font-display font-normal leading-none mb-3" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
                {preview.company}
              </p>
              <p className="font-display font-normal text-[22px] leading-none mb-2" style={{ color: "var(--navy)" }}>
                {preview.rounds[preview.rounds.length - 1]?.label ?? "Loop"}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-8" style={{ color: "var(--verify)" }}>
                Listed · verify by email when you have the original
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--ink-3)" }}>
                {preview.proposedTier} · confidence {preview.roundsConfidence.toFixed(2)}
              </p>
              <div className="space-y-3 mb-8">
                {preview.rounds.map(r => (
                  <div key={r.index} className="flex items-baseline justify-between gap-3 border-b pb-2" style={{ borderColor: "var(--border)" }}>
                    <p className="font-display font-normal text-[20px] leading-none" style={{ color: "var(--navy)" }}>{r.label}</p>
                    <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                      {String(r.index).padStart(2, "0")} · {r.type}
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>Tested</p>
              <p className="text-[15px] mb-8" style={{ color: "var(--foreground)" }}>
                {preview.competencies.map(c => `${c.name} (${c.depth})`).join(" · ")}
              </p>
              <button
                onClick={publish}
                className="w-full font-mono text-[11px] uppercase tracking-[0.12em] py-3 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
                style={{ background: "var(--navy)" }}
              >
                Add to profile · {preview.company}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Desk() {
  const { mode, setMode } = useRouter()
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-5 md:px-7 pt-6">
        <div className="flex border w-fit" style={{ borderColor: "var(--navy)" }}>
          {([
            { id: "firm" as const, label: "Hiring" },
            { id: "creative" as const, label: "Candidate" },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className="font-mono text-[11px] uppercase tracking-[0.12em] px-3.5 py-1.5"
              style={{
                background: mode === t.id ? "var(--navy)" : "transparent",
                color: mode === t.id ? "var(--primary-foreground)" : "var(--navy)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {mode === "firm" ? <HiringDesk /> : <ListingDesk />}
    </>
  )
}
