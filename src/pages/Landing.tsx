import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "../router"
import Logo from "../brand"
import homeMockup from "../imports/elestarr-home.png"
import profileMockup from "../imports/elestarr-profile.png"
import poster from "../assets/elestarr-poster.png"

const PILLARS = ["Work", "Signals", "Search", "Record"]

const TODAY = ["Apply", "Technical", "Panel", "Final", "Nothing"]
const KEPT = ["Apply", "Technical", "Panel", "Final", "Three Signals"]

const SPECIMENS = [
  ["FIGMA", "Product Designer", "FINAL INTERVIEW", "MAIL VERIFIED", "MAY 2026", "E/SIGNAL/002593"],
  ["STRIPE", "Product Engineer", "TECHNICAL INTERVIEW", "MAIL VERIFIED", "APR 2026", "E/SIGNAL/002184"],
  ["VERCEL", "Design Engineer", "PORTFOLIO REVIEW", "MAIL VERIFIED", "MAR 2026", "E/SIGNAL/002741"],
]

const MODES = [
  {
    id: "explore",
    title: "Explore",
    line: "I like this. Then: who made it.",
    detail: "Work first. Signals sit under the pin.",
  },
  {
    id: "review",
    title: "Review",
    line: "One person. Pass or save.",
    detail: "A fast queue. Not a dating deck.",
  },
  {
    id: "index",
    title: "Index",
    line: "Work, person, signals, market.",
    detail: "Same graph. Denser when you need it.",
  },
] as const

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

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, on] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={className}
      style={{
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
              {String((i % 4) + 1).padStart(2, "0")}
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
  const lost = current === "Nothing"
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
            color: lost ? "var(--ink-3)" : "var(--navy)",
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
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!on || prefersReduce()) return
    const t = setInterval(() => setI(n => (n + 1) % TODAY.length), 1400)
    return () => clearInterval(t)
  }, [on])
  const idx = on && !prefersReduce() ? i : TODAY.length - 1
  return (
    <section ref={ref} id="signals" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-end mb-12">
          <h2 className="font-display font-medium leading-[0.95] max-w-[12ch]" style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            Keep what you earned.
          </h2>
          <p className="text-[18px] leading-relaxed max-w-[40ch]" style={{ color: "var(--muted-foreground)" }}>
            A final round that ends without an offer still happened. Elestarr makes that hiring event travel with you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
          <FilmGate label="Today" steps={TODAY} index={idx} />
          <FilmGate label="With Elestarr" steps={KEPT} index={idx} />
        </div>
      </div>
    </section>
  )
}

function SignalPrinter() {
  const [ref, on] = useInView<HTMLDivElement>(0.35)
  const [spec, setSpec] = useState(0)
  const [shown, setShown] = useState(0)
  const lines = SPECIMENS[spec]

  useEffect(() => {
    if (!on) return
    if (prefersReduce()) {
      setShown(lines.length)
      return
    }
    setShown(0)
    let n = 0
    const tick = setInterval(() => {
      n += 1
      if (n <= lines.length) setShown(n)
      else clearInterval(tick)
    }, 220)
    const next = setTimeout(() => {
      setSpec(s => (s + 1) % SPECIMENS.length)
    }, 220 * lines.length + 1800)
    return () => {
      clearInterval(tick)
      clearTimeout(next)
    }
  }, [on, spec, lines.length])

  return (
    <section className="border-t" style={{ borderColor: "var(--border)" }}>
      <div ref={ref} className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-20 items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--navy)" }}>Signals</p>
          <h2 className="font-display font-medium leading-[0.95] mb-5 max-w-[14ch]" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            A credential. Not a badge.
          </h2>
          <p className="text-[17px] leading-relaxed max-w-[38ch]" style={{ color: "var(--muted-foreground)" }}>
            One original email. No inbox. Cryptography authenticates; the record only claims the stage that was reached.
          </p>
        </div>
        <div className="relative overflow-hidden border px-7 py-8 min-h-[320px]" style={{ borderColor: "var(--navy)", background: "color-mix(in srgb, var(--background) 70%, var(--card))" }}>
          {on && <div className="scan-line" />}
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] mb-8" style={{ color: "var(--ink-3)" }}>Issued record</p>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <p
                key={`${spec}-${line}`}
                className={i === 0 || i === 2 ? "font-display font-medium leading-none" : "font-mono text-[12px] uppercase tracking-[0.14em]"}
                style={{
                  fontSize: i === 0 || i === 2 ? "clamp(1.6rem, 3vw, 2.4rem)" : undefined,
                  color: i === 3 ? "var(--verify)" : "var(--navy)",
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
    <section id="search" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div ref={ref} className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h2 className="font-display font-medium leading-[0.95] max-w-[16ch]" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            Taste on one side. Proof on the other.
          </h2>
          <p className="text-[17px] max-w-[32ch]" style={{ color: "var(--muted-foreground)" }}>
            Three views of the same people. Signals filter. Work persuades.
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
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--navy)", opacity: onMode ? 1 : 0.4 }}>
                    {String(i + 1).padStart(2, "0")} / {m.title}
                  </p>
                  <p
                    className="font-display leading-[1.1] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
                      color: "var(--navy)",
                      opacity: onMode ? 1 : 0.38,
                      transform: onMode ? "translateX(0)" : "translateX(-6px)",
                      transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {m.line}
                  </p>
                  <p
                    className="text-[15px] max-w-[28ch]"
                    style={{
                      color: "var(--muted-foreground)",
                      opacity: onMode ? 1 : 0,
                      transform: onMode ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {m.detail}
                  </p>
                </button>
              )
            })}
          </div>
          <div
            className="hidden md:block absolute bottom-0 h-px origin-left"
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

function Bridge() {
  return (
    <section id="record" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-5" style={{ color: "var(--navy)" }}>The bridge</p>
          <h2 className="font-display font-medium leading-[0.95] max-w-[18ch] mb-6" style={{ fontSize: "clamp(2.2rem, 4.4vw, 4rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
            Progress at the large company. Opportunity at the next one.
          </h2>
          <p className="text-[18px] leading-relaxed max-w-[44ch]" style={{ color: "var(--muted-foreground)" }}>
            A startup may never recruit a former Stripe hire. It can still find someone Stripe independently took to final.
          </p>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-6 items-center">
          <Reveal className="border p-7 md:p-9" delay={80}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-3)" }}>Candidate keeps</p>
            <p className="font-display text-[26px] md:text-[30px] leading-[1.1] mb-3" style={{ color: "var(--navy)" }}>Residual value from the process.</p>
            <p className="text-[16px]" style={{ color: "var(--muted-foreground)" }}>New opportunities. A Record that compounds.</p>
          </Reveal>
          <div className="hidden md:flex flex-col items-center gap-2" aria-hidden="true">
            <span className="gate-needle w-px h-10" style={{ background: "var(--navy)" }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--navy)" }}>match</span>
            <span className="gate-needle w-px h-10" style={{ background: "var(--navy)" }} />
          </div>
          <Reveal className="border p-7 md:p-9" delay={160}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-3)" }}>Startup gets</p>
            <p className="font-display text-[26px] md:text-[30px] leading-[1.1] mb-3" style={{ color: "var(--navy)" }}>People already being evaluated elsewhere.</p>
            <p className="text-[16px]" style={{ color: "var(--muted-foreground)" }}>Judge the work yourself. Contact them directly.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const { navigate, signedIn } = useRouter()
  const go = () => navigate(signedIn ? "board" : "signup")

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: "transparent", color: "var(--foreground)" }}>
      <nav className="sticky top-0 z-40 border-b backdrop-blur-[14px]" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--background) 78%, transparent)" }}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 h-16 flex items-center gap-8">
          <Logo />
          <div className="hidden md:flex flex-1 justify-center gap-8 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--navy)" }}>
            <a href="#work" className="hover:opacity-70">Work</a>
            <a href="#signals" className="hover:opacity-70">Signals</a>
            <a href="#search" className="hover:opacity-70">Search</a>
            <a href="#record" className="hover:opacity-70">Record</a>
          </div>
          <button
            onClick={go}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)" }}
          >
            {signedIn ? "Open the wall" : "Request access"}
          </button>
        </div>
      </nav>

      <section className="max-w-[1440px] mx-auto px-5 md:px-8 pt-24 md:pt-36 pb-24 md:pb-32 text-center">
        <p className="fade-up font-mono text-[11px] uppercase tracking-[0.2em] mb-7" style={{ color: "var(--navy)" }}>
          Your interviews belong to you
        </p>
        <h1
          className="fade-up font-display font-medium leading-[0.94] text-balance mx-auto max-w-[20ch] md:max-w-5xl"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 5.4rem)", letterSpacing: "-0.04em", color: "var(--navy)" }}
        >
          Find people by what they make.
        </h1>
        <p className="fade-up mt-8 mx-auto max-w-[34ch] text-[18px] md:text-[20px] leading-[1.45]" style={{ color: "var(--navy)", animationDelay: "0.08s" }}>
          Work persuades. Signals verify.
        </p>
        <div className="fade-up mt-10 flex items-center justify-center gap-7" style={{ animationDelay: "0.16s" }}>
          <button
            onClick={go}
            className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 text-[var(--primary-foreground)] active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--navy)" }}
          >
            Request access
          </button>
          <a href="#signals" className="font-mono text-[12px] uppercase tracking-[0.12em]" style={{ color: "var(--navy)" }}>
            Keep the Signal
          </a>
        </div>
      </section>

      <PillarMarquee />

      <section id="work" className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <Reveal>
            <h2 className="font-display font-medium leading-[0.95] mb-6 max-w-[22ch]" style={{ fontSize: "clamp(1.8rem, 3.4vw, 3rem)", color: "var(--navy)", letterSpacing: "-0.03em" }}>
              LinkedIn tells you where someone has been. Portfolios show what they made.
            </h2>
            <p className="text-[18px] leading-relaxed max-w-[46ch] mb-12 md:mb-14" style={{ color: "var(--muted-foreground)" }}>
              Interviews show who took them seriously. Elestarr makes work and evidence primary.
            </p>
          </Reveal>
          <WorkMockups />
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              ["Work", "What a person has made. Visual first."],
              ["Signals", "Verified hiring events. Highest stage reached, not the rejection."],
              ["Search", "Reach, Target, Safety — a recommendation that shows its work."],
              ["Record", "Evidence that compounds. Named vouches. No score."],
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
      <PosterPlate />
      <SignalPrinter />
      <ModeStage />
      <Bridge />

      <section className="border-t" style={{ borderColor: "var(--navy)", background: "var(--navy)", color: "var(--primary-foreground)" }}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-20 md:py-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2 className="font-display font-medium leading-[0.95] max-w-[14ch]" style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.2rem)", letterSpacing: "-0.03em" }}>
            Turn hiring progress into opportunity.
          </h2>
          <button
            onClick={go}
            className="font-mono text-[12px] uppercase tracking-[0.14em] px-6 py-3.5 self-start md:self-auto active:translate-y-px active:scale-[0.99]"
            style={{ background: "var(--background)", color: "var(--navy)" }}
          >
            Request access
          </button>
        </div>
      </section>

      <footer className="px-5 md:px-8 py-8 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: "var(--navy)" }}>
          <Logo size="sm" />
          <p>Work first. Evidence attached.</p>
          <p>Elestarr · 2026</p>
        </div>
      </footer>
    </div>
  )
}
