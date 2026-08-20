import markSvg from "../assets/elestar-mark.svg?raw"

export default function Mark({
  className = "",
  title = "Elestar mark",
}: {
  className?: string
  title?: string
}) {
  const svg = title ? markSvg.replace(">Elestar mark<", `>${title}<`) : markSvg.replace(/<title[^>]*>[^<]*<\/title>/, "")
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}
