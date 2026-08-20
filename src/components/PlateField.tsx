import { useEffect, useState } from "react"

export default function PlateField({
  eye,
  face,
  bottomId = "fork",
}: {
  eye: string
  face: string
  bottomId?: string
}) {
  const [faceAmt, setFaceAmt] = useState(0)

  useEffect(() => {
    const update = () => {
      const bottom = document.getElementById(bottomId)
      if (!bottom) return
      const vh = window.innerHeight || 1
      const y = window.scrollY
      const forkY = bottom.getBoundingClientRect().top + y
      const start = vh * 0.4
      const end = Math.max(start + 1, forkY - vh * 0.2)
      const t = Math.max(0, Math.min(1, (y - start) / (end - start)))
      setFaceAmt(t)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [bottomId])

  return (
    <div className="plate-field" aria-hidden="true">
      <div className="plate-field-layer" style={{ opacity: 1 - faceAmt }}>
        <img src={eye} alt="" />
      </div>
      <div className="plate-field-layer" style={{ opacity: faceAmt }}>
        <img src={face} alt="" />
      </div>
      <div className="plate-field-wash" />
    </div>
  )
}
