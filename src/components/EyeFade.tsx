import eye from "../assets/eye.png"

export default function EyeFade({
  tone = "site",
}: {
  tone?: "site" | "hero"
}) {
  return (
    <div className={`eye-field eye-field-${tone}`} aria-hidden="true">
      <img src={eye} alt="" width={1024} height={1024} decoding="async" />
    </div>
  )
}
