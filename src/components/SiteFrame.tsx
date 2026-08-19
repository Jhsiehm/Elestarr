import { hostOf, normalizeUrl } from "../lib/site"

export default function SiteFrame({
  url,
  label,
  tall = false,
}: {
  url: string
  label?: string
  tall?: boolean
}) {
  const href = normalizeUrl(url)
  const host = hostOf(url)

  return (
    <figure className="overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
      >
        <span className="flex gap-1.5" aria-hidden>
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--border-2)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--border-2)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--border-2)" }} />
        </span>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate font-mono text-[11px]"
          style={{ color: "var(--navy)" }}
        >
          {host}
        </a>
        {label ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: "var(--muted-foreground)" }}>
            {label}
          </span>
        ) : null}
      </div>
      <iframe
        title={label || host}
        src={href}
        className="block w-full bg-white"
        style={{ height: tall ? "min(78vh, 820px)" : "min(56vh, 560px)", border: 0 }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        referrerPolicy="no-referrer"
      />
      <figcaption className="px-3 py-2 font-mono text-[10px]" style={{ color: "var(--ink-3)" }}>
        Live site. If the studio blocked embedding, open {host} in a new tab.
      </figcaption>
    </figure>
  )
}
