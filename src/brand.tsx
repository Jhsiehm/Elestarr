import lockup from "./assets/elestar-logo.svg?raw"

const HEIGHT = { sm: 28, md: 32, lg: 40 } as const

export default function Logo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg"
  invert?: boolean
}) {
  const h = HEIGHT[size]
  return (
    <span
      className={`logo logo-${size}`}
      style={{ height: h }}
      dangerouslySetInnerHTML={{ __html: lockup }}
    />
  )
}
