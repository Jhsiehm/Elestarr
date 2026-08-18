const INK = "#141b28"
const PAPER = "#f3eee4"
const ACCENT = "#152238"
const TONE: Record<string, string> = {
  "Brand Design": "#c8c3b6",
  "Product Design": "#aeb4bb",
  Cinematography: "#6f5560",
  "Graphic Design": "#b8ac9a",
}

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function drawSpecimen(
  canvas: HTMLCanvasElement,
  seed: number,
  disc: string,
  W: number,
  H: number,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = "100%"
  canvas.style.height = "auto"
  const x = canvas.getContext("2d")
  if (!x) return
  x.setTransform(dpr, 0, 0, dpr, 0, 0)
  const r = mulberry32((seed * 2654435761) >>> 0)
  const tone = TONE[disc] || "#c0c0c0"
  const lens = disc === "Cinematography" || disc === "Brand Design"

  x.fillStyle = disc === "Cinematography" ? "#141216" : PAPER
  x.fillRect(0, 0, W, H)

  if (lens) {
    const filmic = disc === "Cinematography"
    x.fillStyle = filmic ? "#141216" : PAPER
    x.fillRect(0, 0, W, H)
    const N = filmic ? 70 : 44
    const steps = 46
    const scale = 0.006 + r() * 0.004
    const phase = r() * 6.28
    for (let i = 0; i < N; i++) {
      let px = r() * W
      let py = r() * H
      const useAcc = r() < (filmic ? 0.16 : 0.22)
      const col = useAcc ? ACCENT : filmic ? (r() < 0.5 ? tone : "#d8d2cc") : r() < 0.5 ? INK : tone
      x.strokeStyle = col
      x.globalAlpha = filmic ? 0.20 : 0.42
      x.lineWidth = useAcc ? 1.6 : filmic ? 1.1 : 0.9
      x.beginPath()
      x.moveTo(px, py)
      for (let s = 0; s < steps; s++) {
        const ang = Math.sin(px * scale + phase) * 1.7 + Math.cos(py * scale * 1.3 - phase) * 1.7 + Math.sin((px + py) * scale * 0.6) * 1.1
        px += Math.cos(ang) * 4.2
        py += Math.sin(ang) * 4.2
        if (px < 0 || px > W || py < 0 || py > H) break
        x.lineTo(px, py)
      }
      x.stroke()
    }
    x.globalAlpha = 1
    if (filmic) {
      x.fillStyle = "#0e0c10"
      x.fillRect(0, 0, W, H * 0.09)
      x.fillRect(0, H * 0.91, W, H * 0.09)
      x.strokeStyle = ACCENT
      x.globalAlpha = 0.9
      x.lineWidth = 1.4
      x.beginPath()
      x.moveTo(0, H * 0.5)
      x.lineTo(W, H * 0.5)
      x.stroke()
      x.globalAlpha = 1
    } else {
      x.save()
      x.translate(W * 0.5, H * 0.52)
      x.fillStyle = INK
      x.globalAlpha = 0.9
      const rad = Math.min(W, H) * 0.2
      x.beginPath()
      x.arc(0, 0, rad, 0.5, 5.0)
      x.arc(0, 0, rad * 0.52, 5.0, 0.5, true)
      x.closePath()
      x.fill()
      x.restore()
      x.globalAlpha = 1
    }
  } else {
    const graphic = disc === "Graphic Design"
    const cells: [number, number, number, number][] = []
    ;(function split(cx: number, cy: number, cw: number, ch: number, d: number) {
      if (d <= 0 || (cw < W * 0.24 && r() > 0.35)) {
        cells.push([cx, cy, cw, ch])
        return
      }
      const vert = r() > 0.5
      const t = 0.32 + r() * 0.36
      if (vert) {
        split(cx, cy, cw * t, ch, d - 1)
        split(cx + cw * t, cy, cw * (1 - t), ch, d - 1)
      } else {
        split(cx, cy, cw, ch * t, d - 1)
        split(cx, cy + ch * t, cw, ch * (1 - t), d - 1)
      }
    })(0, 0, W, H, 4)

    cells.forEach(([cx, cy, cw, ch]) => {
      const g = r()
      const pad = 3
      if (g < 0.16) {
        x.fillStyle = ACCENT
        x.fillRect(cx + pad, cy + pad, cw - 2 * pad, ch - 2 * pad)
      } else if (g < 0.34) {
        x.fillStyle = INK
        x.fillRect(cx + pad, cy + pad, cw - 2 * pad, ch - 2 * pad)
      } else if (g < 0.52) {
        x.fillStyle = tone
        x.fillRect(cx + pad, cy + pad, cw - 2 * pad, ch - 2 * pad)
      } else if (g < 0.72) {
        x.strokeStyle = graphic ? INK : "#c3c6ca"
        x.lineWidth = 0.8
        x.globalAlpha = 0.8
        const gap = 5 + r() * 5
        for (let ly = cy + pad; ly < cy + ch - pad; ly += gap) {
          x.beginPath()
          x.moveTo(cx + pad, ly)
          x.lineTo(cx + cw - pad, ly)
          x.stroke()
        }
        x.globalAlpha = 1
      } else if (g < 0.86) {
        x.strokeStyle = r() < 0.4 ? ACCENT : INK
        x.lineWidth = 1
        x.globalAlpha = 0.85
        const ox = cx + cw / 2
        const oy = cy + ch / 2
        const mx = Math.min(cw, ch) / 2 - pad
        for (let rr = mx; rr > 3; rr -= 5) {
          x.beginPath()
          x.arc(ox, oy, rr, 0, 6.283)
          x.stroke()
        }
        x.globalAlpha = 1
      } else {
        x.fillStyle = graphic ? INK : tone
        const gap = 7
        for (let dy = cy + pad + 3; dy < cy + ch - pad; dy += gap) {
          for (let dx = cx + pad + 3; dx < cx + cw - pad; dx += gap) {
            x.beginPath()
            x.arc(dx, dy, 1.1 + r() * 1.2, 0, 6.283)
            x.fill()
          }
        }
      }
      x.strokeStyle = "rgba(25,26,29,0.10)"
      x.lineWidth = 1
      x.strokeRect(cx, cy, cw, ch)
    })
  }
}
