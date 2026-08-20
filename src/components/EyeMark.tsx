import type { CSSProperties } from "react"
import eye from "../assets/eye.png"

export default function EyeMark({
  size,
  className = "",
  style,
}: {
  size?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <img
      src={eye}
      alt=""
      aria-hidden="true"
      className={`eye-mark ${className}`.trim()}
      style={{ width: size, height: size ? "auto" : undefined, ...style }}
      decoding="async"
    />
  )
}
