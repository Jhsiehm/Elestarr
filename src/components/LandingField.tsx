import { useEffect, useState } from "react"
import eye from "../assets/eye.png"
import portrait from "../assets/hero-portrait.png"
import { useRouter } from "../router"

export default function LandingField() {
  const { ready, page } = useRouter()
  const [stage, setStage] = useState<"hero" | "page">("hero")

  useEffect(() => {
    if (!ready || page !== "landing") return
    let cancelled = false
    let onMove: (() => void) | null = null

    const attach = () => {
      const hero = document.getElementById("enter")
      if (!hero) {
        if (!cancelled) requestAnimationFrame(attach)
        return
      }
      onMove = () => {
        const r = hero.getBoundingClientRect()
        setStage(r.bottom > 160 ? "hero" : "page")
      }
      onMove()
      window.addEventListener("scroll", onMove, { passive: true })
      window.addEventListener("resize", onMove)
    }
    attach()

    return () => {
      cancelled = true
      if (onMove) {
        window.removeEventListener("scroll", onMove)
        window.removeEventListener("resize", onMove)
      }
    }
  }, [ready, page])

  return (
    <div className="land-field" data-stage={stage} aria-hidden="true">
      <img className="land-eye" src={eye} alt="" decoding="async" />
      <img className="land-eye land-eye-scan" src={eye} alt="" decoding="async" />
      <img className="land-face" src={portrait} alt="" decoding="async" />
      <img className="land-face eye-lit" src={portrait} alt="" decoding="async" />
    </div>
  )
}
