import { useEffect, useRef } from "react"
import { drawSpecimen } from "../specimen"

export default function Specimen({
  seed,
  disc,
  width = 440,
  height = 300,
  className = "",
}: {
  seed: number
  disc: string
  width?: number
  height?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ref.current) drawSpecimen(ref.current, seed, disc, width, height)
  }, [seed, disc, width, height])

  return <canvas ref={ref} className={`block w-full ${className}`} />
}
