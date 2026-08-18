import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { useRouter } from "../router"
import Logo from "../brand"
import homeMockup from "../imports/elestarr-home.png"
import profileMockup from "../imports/elestarr-profile.png"
import poster from "../assets/elestarr-poster.png"

const PILLARS = ["Work", "Interviews", "Wall", "Desk", "Profile"]

const TODAY = ["Apply", "Technical", "Panel", "Final", "Gone"]
const KEPT = ["Apply", "Technical", "Panel", "Final", "Kept"]

const SPECIMENS = [
  ["FIGMA", "Product Designer", "FINAL INTERVIEW", "MAY 2026", "E/SIGNAL/002593"],
  ["STRIPE", "Product Engineer", "TECHNICAL INTERVIEW", "APR 2026", "E/SIGNAL/002184"],
  ["VERCEL", "Design Engineer", "PORTFOLIO REVIEW", "MAR 2026", "E/SIGNAL/002741"],
]

const MODES = [
  {
    id: "wall",
    title: "Wall",
    line: "Scroll the work first.",
    detail: "Open a person when something they made is good. Proven interviews sit next to it.",
  },
  {
    id: "pipeline",
    title: "Pipeline",
    line: "People you are considering.",
    detail: "Move them as you go. Your hiring queue, not a scoreboard.",
  },
  {
    id: "desk",
    title: "Desk",
    line: "Describe the job in sentences.",
    detail: "A shortlist of who already matches. Skip interviews they already sat.",
  },
] as const

const HOW_STEPS: [string, string, string][] = [
  ["01", "Name the interview", "Company, job, date, and how far you got. Nothing else."],
  ["02", "Send that email", "Upload the original interview email, or forward it as an attachment. We never ask for the rest of your inbox."],
  ["03", "It goes on your profile", "If the email is real, your profile shows the company and how far you got. Rejections stay private."],
]

const DESK_STEPS: [string, string, string][] = [
  ["01", "Describe the job", "A few sentences, not a form. If it is unclear, we ask. We do not guess."],
  ["02", "Prove interviews", "One original email. How far they got can be public. Rejections stay private."],
  ["03", "Shortlist", "Twenty people or fewer. Who already matches the job, not keyword stuffing."],
  ["04", "Skip what's done", "Don't repeat interviews they already did. You still do the team conversation yourself."],
]

function prefersReduce() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useInView<T extends HTMLElement = HTMLElement>(threshold = 0.32) {
  const ref = useRef<T | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true)
        io.disconnect()
      }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on] as const
}

function useCycle(armed: boolean, length: number, ms: number) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!armed || prefersReduce()) return
    const t = setInterval(() => setI(n => (n + 1) % length), ms)
    return () => clearInterval(t)
  }, [armed, length, ms])
  return { i, live: armed && !prefersReduce() }
}

function Reveal({ children, className = "", delay = 0, style }: { children: ReactNode; className?: string; delay?: number; style?: CSSProperties }) {
  const [ref, on] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function MockupPlate({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <figure
      className={`overflow-hidden border ${className}`}
      style={{ borderColor: "var(--border-2)", background: "var(--card)", boxShadow: "var(--paper-shadow)" }}
    >
      <img src={src} alt={alt} className="block w-full h-auto" loading="lazy" decoding="async" />
    </figure>
  )
}

function ProcessSteps({
  steps,
  cols,
  interval = 1700,
}: {
  steps: [string, string, string][]
  cols: 3 | 4
  interval?: number
}) {
  const [ref, on] = useInView<HTMLDivElement>(0.28)
  const { i, live } = useCycle(on, steps.length, interval)
  const progress = live ? (i + 1) / steps.length : 1

  return (
    <div ref={ref}>
      <div className="relative h-px mb-10 md:mb-12 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "var(--border)" }} />
        <div
          className="absolute inset-y-0 left-0 origin-left"
          style={{
            width: "100%",
            background: "var(--navy)",
            transform: `scaleX(${progress})`,
            transition: live ? "transform 0.55s cubic-bezier(0.16,1,0.3,1)" : "none",
          }}
        />
      </div>
      <div className={`grid gap-10 md:gap-12 ${cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {steps.map(([n, t, d], idx) => {
          const active = !live || i === idx
          return (
            <div
              key={n}
              style={{
                opacity: active ? 1 : 0.55,
                transform: active ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <p className="font-mono text-[11px] mb-3" style={{ color: "var(--navy)" }}>{n}</p>
              <h3 className="font-display text-[24px] md:text-[26px] leading-none mb-3" style={{ color: "var(--navy)" }}>{t}</h3>
              <p className="text-[15px] md:text-[16px] leading-relaxed max-w-[32ch]" style={{ color: "var(--muted-foreground)" }}>{d}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProveIt() {
  return (
    <section id="how" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-5" style={{ color: "var(--navy)" }}>How you add an interview</p>
          <h2 className="font-display font-medium leading-[0.95] max-w-[16ch] mb-4" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            One interview email. Never the rest of your inbox.
          </h2>
          <p className="text-[18px] leading-relaxed max-w-[42ch] mb-14" style={{ color: "var(--muted-foreground)" }}>
            Send the interview email you already have. If it is real, your profile shows how far you got. We do not grade you. We do not read anything else.
          </p>
        </Reveal>
        <ProcessSteps steps={HOW_STEPS} cols={3} />
      </div>
    </section>
  )
}

function TwoPaths() {
  const [ref, on] = useInView<HTMLElement>(0.32)
  const { i, live } = useCycle(on, 2, 2800)
  const sides = [
    {
      kicker: "If you are a candidate",
      title: "Your interviews should still count.",
      points: [
        "If the email is real, the company and how far you got stay on your profile, even if you were not hired.",
        "Rejections stay private. The next company only sees you already made it that far.",
        "This follows you. It does not reset every time you apply.",
      ],
    },
    {
      kicker: "If you are an employer",
      title: "Don't start from a resume.",
      points: [
        "Shortlist people who already match the job, not keyword stuffing.",
        "Skip the rounds they already did. You still do the team conversation yourself.",
      ],
    },
  ] as const

  return (
    <section id="you" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div ref={ref} className="max-w-[1440px] mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
          {sides.map((s, idx) => {
            const active = !live || i === idx
            return (
              <div
                key={s.kicker}
                className="p-7 md:p-9"
                style={{
                  background: "var(--background)",
                  opacity: active ? 1 : 0.55,
                  transform: active ? "translateY(0)" : "translateY(4px)",
                  transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-3)" }}>{s.kicker}</p>
                <h2 className="font-display text-[26px] md:text-[30px] leading-[1.1] mb-6" style={{ color: "var(--navy)" }}>{s.title}</h2>
                <ul className="space-y-3">
                  {s.points.map(p => (
                    <li key={p} className="text-[16px] leading-relaxed max-w-[36ch]" style={{ color: "var(--muted-foreground)" }}>{p}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PosterPlate() {
  const [ref, on] = useInView<HTMLDivElement>(0.28)
  return (
    <section className="border-t" style={{ borderColor: "var(--border)" }}>
      <div ref={ref} className="max-w-[1440px] mx-auto px-5 md:px-8 py-16 md:py-24">
        <figure
          className="mx-auto max-w-[640px] overflow-hidden border"
          style={{
            borderColor: "var(--border-2)",
            background: "var(--card)",
            boxShadow: "var(--paper-shadow)",
            opacity: on ? 1 : 0,
            transform: on ? "translateY(0) scale(1)" : "translateY(22px) scale(0.985)",
            transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <img
            src={poster}
            alt="Elestar editorial poster with halftone eye and tagline about work deserving something good to look at"
            className="block w-full h-auto"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  )
}

function WorkMockups() {
  return (
    <div className="mb-16 md:mb-20">
      <Reveal delay={90}>
        <MockupPlate src={homeMockup} alt="Elestarr work board with featured projects" />
      </Reveal>
      <Reveal delay={180} className="mt-6 md:mt-0 md:-mt-[18%] md:ml-[42%] md:max-w-[58%]">
        <MockupPlate src={profileMockup} alt="Candidate profile with work and verified signals" />
      </Reveal>
    </div>
  )
}

function PillarMarquee() {
  const row = [...PILLARS, ...PILLARS, ...PILLARS, ...PILLARS]
  return (
    <div className="marquee border-y py-5 md:py-7" style={{ borderColor: "var(--border)" }}>
      <div className="marquee-track">
        {row.map((w, i) => (
          <span key={`${w}-${i}`} className="flex items-baseline gap-8 md:gap-12 pr-8 md:pr-12">
            <span
              className="font-display font-medium leading-none whitespace-nowrap"
              style={{ fontSize: "clamp(2.4rem, 6vw, 5.2rem)", color: "var(--navy)", letterSpacing: "-0.04em" }}
            >
              {w}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--ink-3)" }}>
              {String((i % 5) + 1).padStart(2, "0")}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function FilmGate({ label, steps, index }: { label: string; steps: string[]; index: number }) {
  const prev = steps[(index - 1 + steps.length) % steps.length]
  const current = steps[index]
  const next = steps[(index + 1) % steps.length]
  const lost = current === "Gone"
  const kept = current === "Kept"
  return (
    <div className="film-gate px-10 py-8 min-h-[240px] flex flex-col justify-center" style={{ background: "color-mix(in srgb, var(--navy) 4%, transparent)" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: "var(--ink-3)" }}>{label}</p>
      <p className="font-display text-[22px] md:text-[26px] leading-none mb-3" style={{ color: "var(--ink-3)", opacity: 0.45 }}>{prev}</p>
      <div className="relative py-3">
        <div className="absolute left-0 right-0 top-0 h-px rule-draw" style={{ background: "var(--navy)" }} />
        <p
          key={`${label}-${current}`}
          className="stamp font-display font-medium leading-none"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.4rem)",
            color: kept ? "var(--verify)" : lost ? "var(--ink-3)" : "var(--navy)",
            textDecoration: lost ? "line-through" : "none",
          }}
        >
          {current}
        </p>
        <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: "var(--navy)" }} />
      </div>
      <p className="font-display text-[22px] md:text-[26px] leading-none mt-3" style={{ color: "var(--ink-3)", opacity: 0.45 }}>{next}</p>
    </div>
  )
}

function DualLedger() {
  const [ref, on] = useInView<HTMLElement>(0.4)
  const { i, live } = useCycle(on, TODAY.length, 1400)
  const idx = live ? i : TODAY.length - 1
  return (
    <section ref={ref} id="signals" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-end mb-12">
          <h2 className="font-display font-medium leading-[0.95] max-w-[14ch]" style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            If you don't get the job, those interviews disappear.
          </h2>
          <p className="text-[18px] leading-relaxed max-w-[40ch]" style={{ color: "var(--muted-foreground)" }}>
            Four interviews. No job. LinkedIn shows none of it. If the original email is real, your profile keeps how far you got.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
          <FilmGate label="Today" steps={TODAY} index={idx} />
          <FilmGate label="On Elestarr" steps={KEPT} index={idx} />
        </div>
      </div>
    </section>
  )
}

function SignalPrinter() {
  const [ref, on] = useInView<HTMLDivElement>(0.2)
  const [spec, setSpec] = useState(0)
  const [shown, setShown] = useState(SPECIMENS[0].length)
  const lines = SPECIMENS[spec]
  const done = shown >= lines.length

  useEffect(() => {
    if (!on) return
    if (prefersReduce()) {
      setShown(lines.length)
      return
    }
    setShown(1)
    let n = 1
    const tick = setInterval(() => {
      n += 1
      if (n <= lines.length) setShown(n)
      else clearInterval(tick)
    }, 220)
    const next = setTimeout(() => {
      setSpec(s => (s + 1) % SPECIMENS.length)
    }, 220 * lines.length + 2000)
    return () => {
      clearInterval(tick)
      clearTimeout(next)
    }
  }, [on, spec, lines.length])

  return (
    <section id="issued" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div ref={ref} className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-20 items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--navy)" }}>What goes on the profile</p>
          <h2 className="font-display font-medium leading-[0.95] mb-5 max-w-[16ch]" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            Not a score. Proof of an interview.
          </h2>
          <p className="text-[17px] leading-relaxed max-w-[38ch]" style={{ color: "var(--muted-foreground)" }}>
            Company, how far you got, and that the email checked out. Employers see that next to your work. That is all we claim.
          </p>
        </div>
        <div className="relative overflow-hidden border px-7 py-8 min-h-[320px]" style={{ borderColor: "var(--navy)", background: "color-mix(in srgb, var(--background) 70%, var(--card))" }}>
          {on && <div className="scan-line" />}
          {done && (
            <p
              key={`seal-${spec}`}
              className="seal-in absolute bottom-7 right-5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 border"
              style={{ color: "var(--verify)", borderColor: "var(--verify)" }}
            >
              Mail verified
            </p>
          )}
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] mb-8" style={{ color: "var(--ink-3)" }}>Issued record</p>
          <div className="space-y-3 pr-4 md:pr-28">
            {lines.map((line, i) => (
              <p
                key={`${spec}-${line}`}
                className={i === 0 || i === 2 ? "font-display font-medium leading-none" : "font-mono text-[12px] uppercase tracking-[0.14em]"}
                style={{
                  fontSize: i === 0 || i === 2 ? "clamp(1.6rem, 3vw, 2.4rem)" : undefined,
                  color: "var(--navy)",
                  opacity: i < shown ? 1 : 0,
                  transform: i < shown ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {line}
                {i === shown - 1 && shown < lines.length && <span className="caret" />}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ModeStage() {
  const [active, setActive] = useState(0)
  const [ref, on] = useInView<HTMLDivElement>(0.3)
  useEffect(() => {
    if (!on || prefersReduce()) return
    const t = setInterval(() => setActive(n => (n + 1) % MODES.length), 3200)
    return () => clearInterval(t)
  }, [on])

  return (
    <section id="search" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div ref={ref} className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--navy)" }}>If you are hiring</p>
            <h2 className="font-display font-medium leading-[0.95] max-w-[16ch]" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
              The wall, then your queue, then the desk.
            </h2>
          </div>
          <p className="text-[17px] max-w-[34ch]" style={{ color: "var(--muted-foreground)" }}>
            Same people. You decide from the work. Proven interviews only tell you how far another company already took them.
          </p>
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {MODES.map((m, i) => {
              const onMode = active === i
              return (
                <button
                  key={m.id}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="text-left py-8 md:py-10 md:px-8 border-t md:border-t-0 md:border-l first:md:border-l-0 first:border-t-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--navy)", opacity: onMode ? 1 : 0.45 }}>
                    {String(i + 1).padStart(2, "0")} / {m.title}
                  </p>
                  <p
                    className="font-display leading-[1.1] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
                      color: "var(--navy)",
                      opacity: onMode ? 1 : 0.58,
                      transform: onMode ? "translateX(0)" : "translateX(0)",
                      transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {m.line}
                  </p>
                  <p
                    className="text-[15px] max-w-[30ch]"
                    style={{
                      color: "var(--muted-foreground)",
                      opacity: onMode ? 1 : 0.62,
                      transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {m.detail}
                  </p>
                </button>
              )
            })}
          </div>
          <div
            className="hidden md:block absolute bottom-0 h-px origin-left pointer-events-none"
            style={{
              background: "var(--navy)",
              width: "33.333%",
              transform: `translateX(${active * 100}%)`,
              transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      </div>
    </section>
  )
}

function BriefWrite() {
  const blocks = [
    ["Safe to skip", "Portfolio screen", "Redundant with the Figma final. Identity was already sampled."],
    ["Probe instead", "Your C-suite format", "Not on the record. Domain still is."],
    ["Never skip", "Team chemistry", "The decision-maker conversation. The desk does not touch this."],
  ] as const
  const [ref, on] = useInView<HTMLDivElement>(0.32)
  const [shown, setShown] = useState(blocks.length)

  useEffect(() => {
    if (!on) return
    if (prefersReduce()) {
      setShown(blocks.length)
      return
    }
    setShown(1)
    let n = 1
    const t = setInterval(() => {
      n += 1
      setShown(n)
      if (n >= blocks.length) clearInterval(t)
    }, 480)
    return () => clearInterval(t)
  }, [on, blocks.length])

  return (
    <div ref={ref} className="relative overflow-hidden p-7 md:p-10" style={{ background: "color-mix(in srgb, var(--navy) 4%, var(--card))" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-6" style={{ color: "var(--ink-3)" }}>Interview brief · after they say yes</p>
      <div className="space-y-6">
        {blocks.map(([k, t, d], i) => (
          <div
            key={k}
            style={{
              opacity: i < shown ? 1 : 0,
              transform: i < shown ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--navy)" }}>{k}</p>
            <p className="font-display text-[22px] md:text-[26px] leading-[1.1] mb-1" style={{ color: "var(--navy)" }}>{t}</p>
            <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DeskPitch({ onOpen }: { onOpen: () => void }) {
  return (
    <section id="desk" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-20 items-end mb-14">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-5" style={{ color: "var(--navy)" }}>For hiring teams</p>
            <h2 className="font-display font-medium leading-[0.95] max-w-[14ch]" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.9rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
              Skip interviews they already did.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[18px] leading-relaxed max-w-[44ch]" style={{ color: "var(--muted-foreground)" }}>
              Describe the job in a few sentences. You get a short list: what already matches, and what is still missing. After you say yes to an intro, you get a note of which interviews you can skip.
            </p>
            <p className="text-[16px] leading-relaxed max-w-[44ch] mt-5" style={{ color: "var(--muted-foreground)" }}>
              It never invents an interview they did not do. It suggests. You decide.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-px mb-16" style={{ background: "var(--border)" }}>
          <Reveal className="p-7 md:p-10" style={{ background: "var(--background)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-6" style={{ color: "var(--ink-3)" }}>Why this person</p>
            <p className="font-display text-[28px] md:text-[34px] leading-none mb-3" style={{ color: "var(--navy)" }}>Maya Okonkwo</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-6" style={{ color: "var(--muted-foreground)" }}>Figma · final · identity already sampled</p>
            <p className="text-[16px] leading-relaxed max-w-[42ch] mb-6" style={{ color: "var(--foreground)" }}>
              Assessed on identity systems and editorial type in a four-round Figma loop. Both sit at the centre of this role.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--navy)" }}>
              Still missing · no C-suite presentation on the record
            </p>
          </Reveal>
          <BriefWrite />
        </div>

        <div className="mb-12">
          <ProcessSteps steps={DESK_STEPS} cols={4} interval={1600} />
        </div>

        <button
          onClick={onOpen}
          className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
          style={{ background: "var(--navy)" }}
        >
          Open the desk
        </button>
      </div>
    </section>
  )
}

function Bridge() {
  const [ref, on] = useInView<HTMLElement>(0.38)
  return (
    <section ref={ref} id="record" className="scroll-mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-5" style={{ color: "var(--navy)" }}>Who it is for</p>
          <h2 className="font-display font-medium leading-[0.95] max-w-[18ch] mb-6" style={{ fontSize: "clamp(2.2rem, 4.4vw, 4rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            The next company can start later.
          </h2>
          <p className="text-[18px] leading-relaxed max-w-[44ch]" style={{ color: "var(--muted-foreground)" }}>
            A startup may never hire someone away from Stripe. It can still find the person Stripe independently took to final.
          </p>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-6 items-center">
          <div className="border p-7 md:p-9" style={{ borderColor: "var(--border-2)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-3)" }}>If you are a candidate</p>
            <p className="font-display text-[26px] md:text-[30px] leading-[1.1] mb-3" style={{ color: "var(--navy)" }}>Those weeks still count.</p>
            <p className="text-[16px]" style={{ color: "var(--muted-foreground)" }}>The interviews live on your profile. The next company can see how far you already got.</p>
          </div>
          <div className="hidden md:flex flex-col items-center w-28 px-3" aria-hidden="true">
            <div
              className="w-full h-px origin-left"
              style={{
                background: "var(--navy)",
                transform: on ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] py-3"
              style={{
                color: "var(--navy)",
                opacity: on ? 1 : 0,
                transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1) 0.28s",
              }}
            >
              match
            </p>
            <div
              className="w-full h-px origin-right"
              style={{
                background: "var(--navy)",
                transform: on ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.12s",
              }}
            />
          </div>
          <div className="border p-7 md:p-9" style={{ borderColor: "var(--border-2)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-3)" }}>If you are an employer</p>
            <p className="font-display text-[26px] md:text-[30px] leading-[1.1] mb-3" style={{ color: "var(--navy)" }}>Someone already pressure-tested.</p>
            <p className="text-[16px]" style={{ color: "var(--muted-foreground)" }}>You are not poaching a Stripe employee. You are finding the person they already interviewed to a final, from the work on their profile.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const { navigate, signedIn, setWallView, setIntent } = useRouter()
  const goHire = () => {
    setIntent("firm")
    navigate(signedIn ? "board" : "signup")
  }
  const goList = () => {
    setIntent("creative")
    navigate(signedIn ? "profile" : "signup")
  }
  const goDesk = () => {
    setIntent("firm")
    setWallView("desk")
    navigate(signedIn ? "board" : "signup")
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: "transparent", color: "var(--foreground)" }}>
      <nav className="sticky top-0 z-40 border-b backdrop-blur-[14px]" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--background) 78%, transparent)" }}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 h-16 flex items-center gap-8">
          <Logo />
          <div className="hidden md:flex flex-1 justify-center gap-8 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--navy)" }}>
            <a href="#you" className="hover:opacity-70">For you</a>
            <a href="#work" className="hover:opacity-70">Work</a>
            <a href="#signals" className="hover:opacity-70">Interviews</a>
            <a href="#desk" className="hover:opacity-70">Hiring</a>
          </div>
          <button
            onClick={goHire}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)" }}
          >
            {signedIn ? "Open the wall" : "Request access"}
          </button>
        </div>
      </nav>

      <section id="enter" className="max-w-[1440px] mx-auto px-5 md:px-8 pt-24 md:pt-36 pb-24 md:pb-32 text-center">
        <p className="fade-up font-mono text-[11px] uppercase tracking-[0.2em] mb-7" style={{ color: "var(--navy)" }}>
          For candidates and employers
        </p>
        <h1
          className="fade-up font-display font-medium leading-[0.94] text-balance mx-auto max-w-[18ch] md:max-w-[20ch]"
          style={{ fontSize: "clamp(2.4rem, 5.2vw, 5rem)", letterSpacing: "-0.04em", color: "var(--navy)" }}
        >
          Show the work. Keep the interviews that didn't become a job.
        </h1>
        <div
          className="fade-up mt-12 md:mt-16 mx-auto grid md:grid-cols-2 gap-8 md:gap-x-16 max-w-[36rem] text-left"
          style={{ animationDelay: "0.08s" }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2.5" style={{ color: "var(--ink-3)" }}>
              Candidate
            </p>
            <p className="text-[16px] md:text-[17px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Post the work. Prove how far a company already interviewed you with one email, not your inbox.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2.5" style={{ color: "var(--ink-3)" }}>
              Employer
            </p>
            <p className="text-[16px] md:text-[17px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Look at the work first. Then see those interviews so you don't start from zero.
            </p>
          </div>
        </div>
        <div className="fade-up mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-4 md:gap-5" style={{ animationDelay: "0.16s" }}>
          <button
            onClick={goList}
            className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)" }}
          >
            I'm a candidate
          </button>
          <button
            onClick={goHire}
            className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 border active:translate-y-px active:scale-[0.99]"
            style={{ borderColor: "var(--navy)", color: "var(--navy)", background: "transparent" }}
          >
            I'm hiring
          </button>
        </div>
        <p className="fade-up mt-8 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)", animationDelay: "0.24s" }}>
          Maya Okonkwo · reached a Figma final · email proved
        </p>
      </section>

      <TwoPaths />
      <PillarMarquee />

      <section id="work" className="scroll-mt-24 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <Reveal>
            <h2 className="font-display font-medium leading-[0.95] mb-6 max-w-[22ch]" style={{ fontSize: "clamp(1.8rem, 3.4vw, 3rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
              LinkedIn is a resume. Here you show the work, and the interviews that didn't become a job.
            </h2>
            <p className="text-[18px] leading-relaxed max-w-[46ch] mb-12 md:mb-14" style={{ color: "var(--muted-foreground)" }}>
              Those interviews usually vanish. On Elestarr they stay on your profile, if the email is real. Employers start there.
            </p>
          </Reveal>
          <WorkMockups />
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              ["The work", "What you made. That is the first thing people see."],
              ["The interviews", "How far a company already interviewed you. Proven from one email. Rejections stay private."],
              ["For employers", "Look at the work, then skip interviews they already did."],
              ["Your profile", "This follows you to the next company. It does not reset every time you apply."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 70} className="border-t pt-6">
                <h3 className="font-display text-[28px] leading-none mb-3" style={{ color: "var(--navy)" }}>{t}</h3>
                <p className="text-[16px] leading-relaxed max-w-[36ch]" style={{ color: "var(--muted-foreground)" }}>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <DualLedger />
      <ProveIt />
      <PosterPlate />
      <SignalPrinter />
      <ModeStage />
      <DeskPitch onOpen={goDesk} />
      <Bridge />

      <section className="border-t" style={{ borderColor: "var(--navy)", background: "var(--navy)", color: "var(--primary-foreground)" }}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="font-display font-medium leading-[0.95] max-w-[16ch]" style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.2rem)", letterSpacing: "-0.03em" }}>
              Bring one interview email.
            </h2>
            <p className="mt-4 text-[16px] max-w-[40ch]" style={{ opacity: 0.78 }}>
              Candidates: it goes on your profile. Employers: you see it next to the work.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto">
            <button
              onClick={goList}
              className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 active:translate-y-px active:scale-[0.99]"
              style={{ background: "var(--background)", color: "var(--navy)" }}
            >
              I'm a candidate
            </button>
            <button
              onClick={goHire}
              className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 border active:translate-y-px active:scale-[0.99]"
              style={{ borderColor: "var(--primary-foreground)", color: "var(--primary-foreground)", background: "transparent" }}
            >
              I'm hiring
            </button>
          </div>
        </div>
      </section>

      <footer className="px-5 md:px-8 py-8 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: "var(--navy)" }}>
          <Logo size="sm" />
          <p>Your interviews belong to you.</p>
          <p>Elestarr · 2026</p>
        </div>
      </footer>
    </div>
  )
}
