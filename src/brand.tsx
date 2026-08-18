import mark from "./assets/elestarr-mark.png"

export default function Logo({
  size = "md",
  invert = false,
}: {
  size?: "sm" | "md" | "lg"
  invert?: boolean
}) {
  const h = size === "lg" ? 42 : size === "sm" ? 22 : 32
  const text = size === "lg" ? "text-[22px]" : size === "sm" ? "text-sm" : "text-base"

  return (
    <span className={`inline-flex items-center gap-2 ${text}`} style={{ letterSpacing: "-0.03em" }}>
      <img
        src={mark}
        alt=""
        className={`logo-mark flex-none ${invert ? "logo-mark-on-dark" : ""}`}
        style={{ height: h, width: "auto" }}
      />
      <span className="font-display font-medium tracking-[0.14em] uppercase" style={{ letterSpacing: "0.14em" }}>Elestarr</span>
    </span>
  )
}
