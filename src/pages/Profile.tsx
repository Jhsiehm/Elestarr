import { useEffect, useMemo, useState } from "react"
import AppNav from "../components/AppNav"
import Seal from "../components/Seal"
import VerifyRound from "../components/VerifyRound"
import { getCandidate } from "../data"
import { listingsFor } from "../listings"
import { useRouter } from "../router"

function twoSentences(text: string) {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return parts.slice(0, 2).join(" ")
}

export default function Profile() {
  const { navigate, profileId, workIndex, mode, contact, setWallView } = useRouter()
  const candidate = getCandidate(profileId)
  const [verify, setVerify] = useState(false)
  const [selected, setSelected] = useState(workIndex)
  const verified = candidate.interviews.filter(iv => iv.verified)
  const roles = listingsFor(candidate)
  const mine = mode === "creative"

  const works = useMemo(() => candidate.portfolioImages.map((img, i) => ({
    id: i,
    title: candidate.aestheticTags[i] || candidate.skills[i] || `Selected ${i + 1}`,
    year: String(2024 - i),
    img,
  })), [candidate])

  useEffect(() => {
    setSelected(Math.min(workIndex, Math.max(0, works.length - 1)))
  }, [candidate.id, workIndex, works.length])

  const piece = works[selected] ?? works[0]
  const first = candidate.name.split(" ")[0]
  const act = () => {
    if (mode === "firm") {
      contact(candidate.name)
      navigate("board")
    } else {
      setVerify(true)
    }
  }

  return (
    <div style={{ background: "transparent", color: "var(--foreground)", minHeight: "100dvh" }}>
      <AppNav />

      <div className="border-b flex items-center gap-4 px-5 py-2.5 text-xs" style={{ borderColor: "var(--border)" }}>
        {mine ? (
          <>
            <button
              onClick={() => { setWallView("listings"); navigate("board") }}
              className="font-medium"
              style={{ color: "var(--navy)" }}
            >
              Roles
            </button>
            <span style={{ color: "var(--border)" }}>|</span>
            <button
              onClick={() => { setWallView("wall"); navigate("board") }}
              className="font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              How they see you
            </button>
          </>
        ) : (
          <button onClick={() => navigate("board")} className="font-medium" style={{ color: "var(--muted-foreground)" }}>
            Back to the wall
          </button>
        )}
        <span style={{ color: "var(--border)" }}>|</span>
        <span className="font-mono uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          {candidate.disc} · {candidate.location}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-96px)]">
        <div className="w-full lg:w-72 flex-none overflow-y-auto border-r p-5 space-y-5" style={{ borderColor: "var(--border)" }}>
          <div className="relative overflow-hidden" style={{ background: "var(--secondary)" }}>
            <img src={candidate.avatar} alt="" className="w-full object-cover" style={{ maxHeight: 260 }} />
            <Seal tier={candidate.tier} />
          </div>
          <div>
            <h1 className="font-display font-normal text-[28px] leading-[1.05]" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>{candidate.name}</h1>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] mt-1.5" style={{ color: "var(--navy)" }}>{candidate.title}</p>
            <p className="text-[15px] leading-relaxed mt-3" style={{ color: "var(--muted-foreground)" }}>{twoSentences(candidate.bio)}</p>
            {candidate.available && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] mt-3" style={{ color: "var(--navy)" }}>Open to work</p>
            )}
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "var(--muted-foreground)" }}>Selected work</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {works.map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelected(w.id)}
                  className="flex-none overflow-hidden border"
                  style={{ borderColor: selected === w.id ? "var(--navy)" : "transparent" }}
                >
                  <img src={w.img} alt="" className="w-20 h-14 object-cover" />
                  <p className="font-mono text-[8px] px-1 py-1 truncate w-20 uppercase tracking-wide" style={{ color: "var(--navy)" }}>{w.title}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map(s => (
              <span key={s} className="font-mono text-[10px] uppercase tracking-wide px-2 py-1 border" style={{ borderColor: "var(--border)", color: "var(--navy)" }}>{s}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {piece && (
            <div className="border-b p-5 md:p-8" style={{ borderColor: "var(--border)" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--muted-foreground)" }}>Selected work</p>
              <h2 className="font-display font-normal text-[32px] md:text-[40px] leading-none mb-1" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>{piece.title}</h2>
              <p className="font-mono text-[11px] mb-5" style={{ color: "var(--muted-foreground)" }}>{piece.year} · {candidate.disc}</p>
              <div className="overflow-hidden mb-5" style={{ background: "var(--secondary)" }}>
                <img src={piece.img} alt="" className="w-full object-cover" style={{ maxHeight: 420 }} />
              </div>
              <p className="text-[16px] leading-relaxed max-w-[48ch]" style={{ color: "var(--muted-foreground)" }}>
                {twoSentences(candidate.bio)}
              </p>
            </div>
          )}

          <div className="p-5 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--muted-foreground)" }}>Interviews on this profile</p>
            <p className="text-[13px] mb-4 max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
              Company and how far they got. The email is proved. Rejections stay off the public record.
            </p>
            <div className="space-y-3">
              {(mode === "firm" ? verified : candidate.interviews).map((iv, i) => (
                <div key={i} className="border p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-normal text-[16px]">{iv.company}</span>
                        <span className="font-mono text-[10px]" style={{ color: iv.verified ? "var(--navy)" : "var(--ink-3)" }}>
                          {iv.verified ? "email proved" : "listed"}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{iv.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="mb-0.5 font-mono text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Farthest round</p><p>{iv.round}</p></div>
                    <div><p className="mb-0.5 font-mono text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Date</p><p>{iv.date}</p></div>
                  </div>
                </div>
              ))}
              {mode === "creative" && (
                <button
                  onClick={() => setVerify(true)}
                  className="w-full font-mono text-[11px] uppercase tracking-[0.12em] py-3 border border-dashed"
                  style={{ borderColor: "var(--border-2)", color: "var(--muted-foreground)" }}
                >
                  Add an interview
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-64 flex-none overflow-y-auto border-l p-4 space-y-5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={act}
            className="w-full py-[15px] font-mono text-[12px] uppercase tracking-[0.12em] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)", color: "var(--primary-foreground)" }}
          >
            {mode === "firm" ? `Contact ${first}` : "Add an interview"}
          </button>
          <p className="font-mono text-[10px] text-center" style={{ color: "var(--ink-3)" }}>
            {mode === "firm" ? "Direct. No intro brokered." : "One original email. Not the inbox."}
          </p>

          <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--muted-foreground)" }}>Proved interviews</p>
            <div className="space-y-2">
              {verified.map((iv, i) => (
                <div key={i}>
                  <p className="font-display font-normal text-[13px]">{iv.company} · {iv.round}</p>
                  <p className="font-mono text-[10px]" style={{ color: "var(--muted-foreground)" }}>{iv.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>Profile</p>
              <span className="font-mono text-[9px]" style={{ color: "var(--muted-foreground)" }}>E/P/{String(4280 + candidate.id).padStart(6, "0")}</span>
            </div>
            <div className={`grid text-center border ${mine ? "grid-cols-3" : "grid-cols-2"}`} style={{ borderColor: "var(--border)" }}>
              {[
                { n: works.length, l: "Work" },
                { n: verified.length, l: "Proved" },
                ...(mine ? [{ n: roles.length, l: "Roles" }] : []),
              ].map(s => (
                <div key={s.l} className="py-3 border-r last:border-r-0" style={{ borderColor: "var(--border)" }}>
                  <p className="font-display font-normal text-base">{s.n}</p>
                  <p className="font-mono text-[8px] uppercase" style={{ color: "var(--muted-foreground)" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <VerifyRound open={verify} onClose={() => setVerify(false)} />
    </div>
  )
}
