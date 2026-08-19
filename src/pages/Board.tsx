import { useEffect, useState } from "react"
import AppNav from "../components/AppNav"
import Seal from "../components/Seal"
import VerifyRound from "../components/VerifyRound"
import { AESTHETIC_FILTERS, STAGES, publicInterview, wallPeople, type Candidate, type Stage } from "../data"
import { useRouter } from "../router"
import Desk from "./Desk"
import Listings from "./Listings"

function InterviewModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(21, 34, 56, 0.42)" }} />
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto"
        style={{ background: "var(--card)", color: "var(--card-foreground)", boxShadow: "var(--paper-shadow)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 border-b px-6 py-4 flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-0.5" style={{ color: "var(--muted-foreground)" }}>Interviews on this profile</p>
            <h3 className="font-display font-normal text-xl">{candidate.name}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center font-mono text-sm" style={{ color: "var(--muted-foreground)" }}>
            Close
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {candidate.interviews.filter(i => i.verified).map((iv, i) => (
            <div key={i} className="border p-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-normal text-[15px]">{iv.company}</span>
                    <span className="font-mono text-[10px]" style={{ color: iv.verified ? "var(--navy)" : "var(--ink-3)" }}>
                          {iv.verified ? "email proved" : "listed"}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{iv.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><p className="mb-0.5 font-mono text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Type</p><p>{iv.type}</p></div>
                <div><p className="mb-0.5 font-mono text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Stage</p><p>{iv.round}</p></div>
                <div><p className="mb-0.5 font-mono text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Date</p><p>{iv.date}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PinCard({
  candidate, imageIndex, onViewHistory, onSave, saved, onViewProfile,
}: {
  candidate: Candidate
  imageIndex: number
  onViewHistory: () => void
  onSave: () => void
  saved: boolean
  onViewProfile: () => void
}) {
  const src = candidate.portfolioImages[imageIndex % Math.max(1, candidate.portfolioImages.length)]
  const proof = publicInterview(candidate)
  const site = candidate.sites?.[0]

  return (
    <article className="relative mb-3 break-inside-avoid group">
      <div className="relative overflow-hidden" style={{ background: "var(--secondary)" }}>
        {src ? (
          <img
            src={src}
            alt=""
            className="w-full block object-cover cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            onClick={onViewProfile}
          />
        ) : (
          <button
            type="button"
            onClick={onViewProfile}
            className="w-full min-h-[220px] grid place-items-center px-4 text-left"
            style={{ background: "var(--navy)", color: "var(--primary-foreground)" }}
          >
            <span>
              <span className="block font-display text-[22px] leading-none">{site?.label || candidate.name}</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.12em] mt-2 opacity-70">Live site on profile</span>
            </span>
          </button>
        )}
        <div className="absolute inset-0 bg-[#152238]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        <Seal tier={candidate.tier} size={40} side="left" />
        <div className="absolute top-3 right-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <button
            onClick={e => { e.stopPropagation(); onSave() }}
            className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{
              background: saved ? "var(--background)" : "var(--navy)",
              color: saved ? "var(--navy)" : "var(--primary-foreground)",
            }}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <div className="flex flex-wrap gap-1">
            {candidate.aestheticTags.map(tag => (
              <span key={tag} className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 text-white border border-white/30 bg-white/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <img
            src={candidate.avatar}
            alt=""
            className="w-6 h-6 rounded-full object-cover flex-none cursor-pointer"
            onClick={onViewProfile}
          />
          <button className="min-w-0 flex-1 text-left" onClick={onViewProfile}>
            <p className="font-display font-normal text-[15px] truncate leading-tight" style={{ color: "var(--navy)" }}>{candidate.name}</p>
            <p className="font-mono text-[10px] truncate uppercase tracking-[0.08em]" style={{ color: "var(--muted-foreground)" }}>{candidate.title}</p>
          </button>
          <button
            onClick={onViewHistory}
            className="flex-none font-mono text-[10px] whitespace-nowrap"
            style={{ color: "var(--muted-foreground)" }}
          >
            {candidate.interviews.filter(i => i.verified).length} proved
          </button>
        </div>
        {proof && (
          <p className="font-mono text-[10px] mt-1.5 truncate" style={{ color: "var(--ink-3)" }}>
            {proof.company} · {proof.round}
          </p>
        )}
      </div>
    </article>
  )
}

function Pipeline() {
  const { stages, setStage, showToast, navigate } = useRouter()
  const [dragId, setDragId] = useState<number | null>(null)
  const [hot, setHot] = useState<Stage | null>(null)
  const people = wallPeople()

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-7 mt-[22px] mb-[90px]">
      <div className="mb-[18px]">
        <h2 className="font-display font-normal text-[32px] leading-none" style={{ color: "var(--navy)", letterSpacing: "-0.03em" }}>Pipeline</h2>
        <p className="text-[16px] mt-3 max-w-[42ch]" style={{ color: "var(--muted-foreground)" }}>
          Your hiring queue. Open anyone to see the work. This is not a ranking.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map(stage => {
          const inCol = people.filter(c => (stages[c.id] ?? c.stage) === stage)
          return (
            <div
              key={stage}
              className="p-3 min-h-[200px] transition-colors"
              style={{
                background: hot === stage ? "var(--navy-light)" : "transparent",
                border: `1px solid ${hot === stage ? "var(--navy)" : "var(--border)"}`,
              }}
              onDragOver={e => { e.preventDefault(); setHot(stage) }}
              onDragLeave={() => setHot(null)}
              onDrop={e => {
                e.preventDefault()
                setHot(null)
                if (dragId == null) return
                const c = people.find(x => x.id === dragId)
                if (c && stages[c.id] !== stage) {
                  setStage(c.id, stage)
                  showToast(`${c.name.split(" ")[0]} moved to <span class="font-mono text-xs" style="color:var(--accent-ink)">${stage}</span>`)
                }
              }}
            >
              <div className="flex items-center justify-between px-1.5 pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{stage}</span>
                <span className="font-mono text-[11px]" style={{ color: "var(--muted-foreground)" }}>{inCol.length}</span>
              </div>
              {inCol.map(c => {
                const proof = publicInterview(c)
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => navigate("profile", c.id)}
                    className="border p-3 mb-2.5 cursor-grab active:cursor-grabbing"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      opacity: dragId === c.id ? 0.4 : 1,
                    }}
                  >
                    <div className="font-display font-normal text-[15px]">{c.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--muted-foreground)" }}>{c.disc}</div>
                    {proof && (
                      <div className="font-mono text-[11px] mt-2.5" style={{ color: "var(--navy)" }}>
                        {proof.company} · {proof.round}
                      </div>
                    )}
                  </div>
                )
              })}
              {!inCol.length && (
                <div className="font-mono text-[10.5px] text-center py-6 px-2 border border-dashed" style={{ color: "var(--ink-3)", borderColor: "var(--border-2)" }}>
                  drop here
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Board() {
  const { navigate, wallView, mode, accountId, role, refreshWall, showToast, wallTick } = useRouter()
  const [query, setQuery] = useState("")
  const [committed, setCommitted] = useState("")
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(false)
  const [verify, setVerify] = useState(false)
  const [saved, setSaved] = useState<number[]>([])
  const [modal, setModal] = useState<Candidate | null>(null)

  const match = (c: Candidate) => {
    if (filter !== "All" && !c.aestheticTags.some(t => t.toLowerCase().includes(filter.toLowerCase())) && !c.tags.includes(filter)) return false
    const words = (committed.toLowerCase().match(/[a-z]+/g) || [])
    if (!words.length) return true
    const hay = `${c.tags.join(" ")} ${c.aestheticTags.join(" ")} ${c.disc} ${c.bio} ${c.name} ${(c.sites ?? []).map(s => s.label).join(" ")}`.toLowerCase()
    return words.some(w => hay.includes(w))
  }

  const list = wallPeople().filter(match)
  void wallTick

  const pins: { candidate: Candidate; imageIndex: number; key: string }[] = []
  list.forEach(c => {
    if (c.portfolioImages.length) {
      c.portfolioImages.forEach((_, idx) => pins.push({ candidate: c, imageIndex: idx, key: `${c.id}-${idx}` }))
    } else {
      pins.push({ candidate: c, imageIndex: 0, key: `${c.id}-site` })
    }
  })

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(t)
  }, [committed, filter])

  return (
    <div style={{ background: "transparent", color: "var(--foreground)", minHeight: "100dvh" }}>
      <AppNav />

      {wallView === "pipeline" ? (
        <Pipeline />
      ) : wallView === "desk" ? (
        <Desk />
      ) : wallView === "listings" ? (
        <Listings />
      ) : (
        <>
          <section className="max-w-[1440px] mx-auto px-5 md:px-7 pt-10 pb-6">
            <h1 className="font-display font-extralight leading-none" style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.8rem)", letterSpacing: "-0.045em", color: "var(--navy)" }}>
              The wall.
            </h1>
            <p className="mt-4 text-[17px] max-w-[40ch]" style={{ color: "var(--muted-foreground)" }}>
              {mode === "creative"
                ? "This is how employers meet you. Your work sits here with everyone else."
                : "Open anyone from the work they published. Proven interviews sit next to it."}
            </p>
          </section>

          <div className="sticky z-30 border-y" style={{ top: 58, background: "color-mix(in srgb, var(--background) 88%, transparent)", borderColor: "var(--border)" }}>
            <div className="max-w-[1440px] mx-auto px-5 md:px-7 py-2.5 flex items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-2 border px-3 py-1.5 min-w-[220px] flex-1 max-w-[420px]" style={{ borderColor: "var(--border)" }}>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") setCommitted(query.trim()) }}
                  placeholder="Editorial. Cinematic. Systems."
                  className="flex-1 bg-transparent outline-none text-[14px] py-0.5"
                  style={{ color: "var(--foreground)" }}
                />
                <button
                  onClick={() => setCommitted(query.trim())}
                  className="font-mono text-[11px] uppercase tracking-[0.1em]"
                  style={{ color: "var(--navy)" }}
                >
                  Search
                </button>
              </div>
              {AESTHETIC_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="flex-none font-mono text-[11px] uppercase tracking-[0.1em] px-3 py-1.5"
                  style={{
                    background: filter === f ? "var(--navy)" : "transparent",
                    color: filter === f ? "var(--primary-foreground)" : "var(--navy)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-[1440px] mx-auto px-5 md:px-7 pt-4">
            <p className="font-mono text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {loading ? "Reading the wall." : `${pins.length} pieces · ${list.length} people`}
            </p>
            {role === "creative" && (
              <button
                onClick={() => setVerify(true)}
                className="mt-3 inline-flex font-mono text-[11px] uppercase tracking-[0.1em]"
                style={{ color: "var(--navy)" }}
              >
                Add an interview
              </button>
            )}
          </div>

          <main className="max-w-[1440px] mx-auto px-3 sm:px-5 md:px-7 mt-4 mb-[90px] columns-2 sm:columns-3 md:columns-4 xl:columns-5 gap-3">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="break-inside-avoid mb-3 overflow-hidden" style={{ background: "var(--secondary)", height: 180 + ((i * 47) % 140) }} />
                ))
              : pins.map(({ candidate, imageIndex, key }) => (
                  <PinCard
                    key={key}
                    candidate={candidate}
                    imageIndex={imageIndex}
                    onViewHistory={() => setModal(candidate)}
                    onSave={() => setSaved(m => m.includes(candidate.id) ? m.filter(x => x !== candidate.id) : [...m, candidate.id])}
                    saved={saved.includes(candidate.id)}
                    onViewProfile={() => navigate("profile", candidate.id, imageIndex)}
                  />
                ))}
          </main>
        </>
      )}

      <VerifyRound
        open={verify}
        onClose={() => setVerify(false)}
        onStored={async fact => {
          if (!accountId || role !== "creative") return
          showToast(fact.proved ? "Interview proved. The result stays private." : "Email stored privately.")
          await refreshWall()
        }}
      />
      {modal && <InterviewModal candidate={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
