import { useState } from "react"
import { getCandidate } from "../data"
import { listingsFor, type CandidateListing } from "../listings"
import { useRouter } from "../router"

export default function Listings() {
  const { profileId, ownProfileId, showToast, setWallView, navigate, wallTick } = useRouter()
  const person = getCandidate(ownProfileId ?? profileId)
  void wallTick
  const proved = person.interviews.filter(iv => iv.verified)
  const rows = listingsFor(person)
  const [open, setOpen] = useState<string | null>(rows[0]?.id ?? null)
  const active = rows.find(r => r.id === open) ?? null

  const share = (row: CandidateListing) => {
    showToast(`Profile shared with <span class="font-mono text-xs">${row.company}</span>. They see the work and the proved loop. Not the rejection.`)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-7 pt-10 pb-[90px]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end mb-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--navy)" }}>Listings · Candidate</p>
          <h1 className="font-display font-extralight leading-none" style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.8rem)", letterSpacing: "-0.045em", color: "var(--navy)" }}>
            Roles that already overlap.
          </h1>
        </div>
        <p className="text-[16px] leading-relaxed max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
          Matched from interviews on your profile. We name the overlap and the gap. We do not give you a score.
        </p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--ink-3)" }}>
        <span>{proved.length} interviews proved</span>
        <span>{rows.length} roles</span>
        <button onClick={() => { setWallView("wall"); navigate("board") }} className="underline-offset-4 hover:underline" style={{ color: "var(--navy)" }}>
          How employers see you
        </button>
        <button onClick={() => { setWallView("desk"); navigate("board") }} className="underline-offset-4 hover:underline" style={{ color: "var(--navy)" }}>
          Add an interview
        </button>
      </div>

      {!proved.length ? (
        <div className="border border-dashed p-8 max-w-[46ch]" style={{ borderColor: "var(--border-2)" }}>
          <p className="font-display font-normal text-[26px] leading-[1.1] mb-3" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>
            Listings unlock after a proved loop.
          </p>
          <p className="text-[15px] leading-relaxed mb-5" style={{ color: "var(--muted-foreground)" }}>
            One original email. If it is real, roles that already overlap that loop can show up here.
          </p>
          <button
            onClick={() => { setWallView("desk"); navigate("board") }}
            className="font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 text-[var(--primary-foreground)]"
            style={{ background: "var(--navy)" }}
          >
            Add an interview
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12">
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            {rows.map((row, i) => {
              const on = row.id === open
              return (
                <button
                  key={row.id}
                  onClick={() => setOpen(row.id)}
                  className="w-full text-left py-5 border-b"
                  style={{ borderColor: "var(--border)", opacity: on ? 1 : 0.55 }}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--muted-foreground)" }}>
                      {String(i + 1).padStart(2, "0")} · {row.company}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-3)" }}>{row.place}</p>
                  </div>
                  <p className="font-display font-normal text-[22px] leading-none mb-2" style={{ color: "var(--navy)" }}>{row.role}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--navy)" }}>
                    From your record · {row.fromRecord}
                  </p>
                </button>
              )
            })}
          </div>

          <div>
            {!active ? (
              <p className="font-mono text-[11px]" style={{ color: "var(--muted-foreground)" }}>Select a role.</p>
            ) : (
              <div className="border p-6 md:p-8" style={{ borderColor: "var(--navy)", background: "color-mix(in srgb, var(--background) 70%, var(--card))" }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--ink-3)" }}>
                  {active.company} · overlap
                </p>
                <h2 className="font-display font-normal text-[28px] md:text-[32px] leading-none mb-6" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>
                  {active.role}
                </h2>
                <p className="text-[16px] leading-relaxed mb-6" style={{ color: "var(--foreground)" }}>{active.overlap}</p>
                <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>{active.gap}</p>

                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>They can skip</p>
                <ul className="mb-6 space-y-1.5">
                  {active.theyCanSkip.map(s => (
                    <li key={s} className="text-[15px]" style={{ color: "var(--foreground)" }}>{s}</li>
                  ))}
                </ul>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--navy)" }}>They still do</p>
                <ul className="mb-8 space-y-1.5">
                  {active.theyStillDo.map(s => (
                    <li key={s} className="text-[15px]" style={{ color: "var(--foreground)" }}>{s}</li>
                  ))}
                </ul>
                <button
                  onClick={() => share(active)}
                  className="w-full font-mono text-[11px] uppercase tracking-[0.12em] py-3 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
                  style={{ background: "var(--navy)" }}
                >
                  Share your profile · {active.company}
                </button>
                <p className="font-mono text-[10px] text-center mt-3" style={{ color: "var(--ink-3)" }}>
                  They see the work and the proved loop. Not why you left.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
