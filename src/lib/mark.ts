export type DotR = 0 | 1 | 2
export type Dot = { x: number; y: number; r: DotR }

export const DOT_R: [number, number, number] = [0.32, 0.52, 0.78]

const CX = 48
const CY = 12
const LENS = 9.15
const STEP = 1.28

function hypot(dx: number, dy: number) {
  return Math.sqrt(dx * dx + dy * dy)
}

function inStar(x: number, y: number) {
  const dx = x - CX
  const dy = y - CY
  const d = hypot(dx, dy)
  if (d < 0.2) return true
  const a = Math.atan2(dy, dx)
  const lobe = Math.pow(Math.abs(Math.cos(2 * a)), 1.55)
  const r = 1.65 + 3.55 * lobe
  return d <= r
}

function inHandle(x: number, y: number) {
  const dx = x - (CX + 7.1)
  const dy = y - (CY + 6.35)
  const rot = Math.PI / 4
  const u = dx * Math.cos(rot) + dy * Math.sin(rot)
  const v = -dx * Math.sin(rot) + dy * Math.cos(rot)
  return Math.abs(u) <= 3.4 && Math.abs(v) <= 1.15
}

function trailChance(x: number, y: number) {
  const left = CX - LENS - 0.4
  if (x >= left || x < 2) return 0
  const t = x / left
  const band = Math.exp(-((y - CY) * (y - CY)) / 7.2)
  const rows = Math.abs((y - CY) % 1.28) < 0.55 ? 1 : 0.35
  return t * t * band * rows
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

export function markDots(): Dot[] {
  const dots: Dot[] = []
  for (let y = 1.1; y <= 22.9; y += STEP) {
    for (let x = 1.1; x <= 62; x += STEP) {
      const d = hypot(x - CX, y - CY)
      const lens = d <= LENS
      const handle = inHandle(x, y)
      if (inStar(x, y)) continue
      if (lens || handle) {
        const edge = Math.abs(d - LENS)
        let r: DotR = 0
        if (handle) r = 1
        else if (edge < 1.05) r = 2
        else if (d > LENS - 2.6) r = 1
        dots.push({ x, y, r })
        continue
      }
      const chance = trailChance(x, y)
      if (chance > 0.08 && hash(x, y) < chance) {
        dots.push({ x, y, r: chance > 0.55 ? 1 : 0 })
      }
    }
  }
  return dots
}

export const MARK_DOTS = markDots()
