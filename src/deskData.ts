import { getCandidate, wallPeople, type Candidate } from "./data"

export function rankLiveWall(role: string, people: Candidate[]): DeskMatch[] {
  const tokens = role.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3)
  const live = people.filter(c => c.id >= 9000)
  const scored = (live.length ? live : people).map(c => {
    const proved = c.interviews.filter(i => i.verified)
    const blob = [
      c.title, c.disc, c.location, c.openTo, c.bio,
      ...c.skills,
      ...proved.map(i => `${i.company} ${i.round} ${i.role}`),
      ...(c.sites ?? []).map(s => s.label),
    ].join(" ").toLowerCase()
    const matched = tokens.filter(t => blob.includes(t))
    const fit = Math.min(96, 48 + matched.length * 8 + (proved.length ? 12 : 0))
    const company = proved[0]?.company
    const round = proved[0]?.round
    const gaps = tokens.filter(t => !blob.includes(t)).slice(0, 2).map(t => `No ${t} on the record`)
    return {
      id: c.id,
      fit,
      matched: matched.slice(0, 4).map(t => t),
      gaps: gaps.length ? gaps : ["Chemistry still sits with you"],
      rationale: company
        ? `${company} · ${round}. Overlap with this req: ${matched.slice(0, 3).join(", ") || "the work and the loop"}. Prestige is not how we sort.`
        : "Work is on the wall. Prove a round before we claim overlap.",
    } satisfies DeskMatch
  }).sort((a, b) => b.fit - a.fit).slice(0, 6)

  if (scored.length) return scored
  return rankForRole(role)
}

export function briefFromPerson(c: Candidate): DeskBrief {
  const proved = c.interviews.filter(i => i.verified)
  const first = proved[0]
  return {
    alreadyAssessed: first
      ? [{ competency: first.round, depth: "assessed", format: `${first.company} · ${first.role}` }]
      : [],
    safeToSkip: first
      ? [{ round: "Portfolio screen", redundantWith: `${first.company} already sampled the work through ${first.round}` }]
      : [],
    probeInstead: ["How this work behaves inside your company", "The room they have not sat"],
    neverSkip: ["Team chemistry", "The decision-maker conversation"],
    outcomeContext: "The result of the last loop stays off the record. Do not infer performance.",
  }
}

export type DeskMatch = {
  id: number
  fit: number
  matched: string[]
  gaps: string[]
  rationale: string
}

export type DeskBrief = {
  alreadyAssessed: { competency: string; depth: "mentioned" | "probed" | "assessed"; format: string }[]
  safeToSkip: { round: string; redundantWith: string }[]
  probeInstead: string[]
  neverSkip: string[]
  outcomeContext: string
}

export type ListingRound = {
  index: number
  type: string
  label: string
  cleared: boolean
}

export type ListingPreview = {
  questions: string[]
  company: string | null
  rounds: ListingRound[]
  outcome: string
  competencies: { name: string; depth: string }[]
  proposedTier: "standard" | "verified" | "elite" | "apex"
  roundsConfidence: number
  ready: boolean
}

export const SAMPLE_ROLE =
  "Staff brand designer. Type-led identity systems. Presentation to a sceptical C-suite. We already have campaign energy; we need someone assessed on a full identity loop, not a moodboard round."

const MATCHES: Record<number, Omit<DeskMatch, "id">> = {
  1: {
    fit: 94,
    matched: ["Identity systems, assessed", "Editorial type, probed", "Final-round presentation"],
    gaps: ["No C-suite presentation on the record"],
    rationale:
      "Assessed on identity systems and editorial type in a four-round Figma loop — both sit at the centre of this req. No C-suite presentation on the record.",
  },
  7: {
    fit: 88,
    matched: ["Identity, assessed", "Print thinking, probed"],
    gaps: ["No systems documentation round"],
    rationale:
      "Assessed on identity and print at Stripe, ended at final. The loop did not test product systems or a sceptical-room presentation.",
  },
  6: {
    fit: 71,
    matched: ["Systems thinking, assessed", "Five-round loop"],
    gaps: ["Brand identity was not a dedicated round"],
    rationale:
      "Assessed on design systems in a five-round Shopify loop — the wrong shape of systems for a brand req. Identity as craft was not a dedicated round.",
  },
  4: {
    fit: 64,
    matched: ["Visual craft, assessed", "Campaign energy"],
    gaps: ["Identity systems at this scale were not tested"],
    rationale:
      "Visual and poster work, assessed at Pitch. Campaign energy is already covered on your side. Identity systems at this scale were not tested.",
  },
  5: {
    fit: 58,
    matched: ["Brand motion, probed"],
    gaps: ["No identity systems loop", "No presentation round"],
    rationale:
      "Motion as craft, including a brand-motion offer. Nothing on the record is a dedicated identity systems loop or a C-suite presentation.",
  },
  9: {
    fit: 69,
    matched: ["Product systems, assessed", "B2B flows"],
    gaps: ["Brand identity not assessed", "Editorial type not assessed"],
    rationale:
      "Assessed on product systems and complex B2B flows. Adjacent discipline, not this req — brand identity and editorial type were never a round.",
  },
}

const BRIEFS: Record<number, DeskBrief> = {
  1: {
    alreadyAssessed: [
      { competency: "Identity systems", depth: "assessed", format: "Figma · four-round loop, final presentation" },
      { competency: "Editorial type", depth: "probed", format: "Portfolio review plus take-home" },
      { competency: "Motion as support", depth: "mentioned", format: "Screening conversation" },
    ],
    safeToSkip: [
      { round: "Portfolio screen", redundantWith: "Figma final already sampled the identity work" },
      { round: "Moodboard / style-tile round", redundantWith: "Shipped identity, not boards" },
    ],
    probeInstead: [
      "Your C-suite presentation format — not on the record",
      "Domain: how identity behaves inside your company, not Figma's",
    ],
    neverSkip: ["Team chemistry", "The decision-maker conversation"],
    outcomeContext: "The last loop ended in an offer. That is not a competence judgement against them.",
  },
  7: {
    alreadyAssessed: [
      { competency: "Identity", depth: "assessed", format: "Stripe · final round, four of four" },
      { competency: "Print-to-screen type", depth: "probed", format: "Portfolio review" },
    ],
    safeToSkip: [{ round: "First portfolio screen", redundantWith: "Identity already assessed at final" }],
    probeInstead: ["Constraints at your company, not Stripe", "Working with a sceptical commercial room"],
    neverSkip: ["Team chemistry", "The decision-maker conversation"],
    outcomeContext: "The candidate did not state a reason beyond reaching final. Do not infer performance.",
  },
  6: {
    alreadyAssessed: [
      { competency: "Design systems", depth: "assessed", format: "Five-round product loop" },
      { competency: "Documentation", depth: "assessed", format: "Take-home plus panel" },
    ],
    safeToSkip: [{ round: "Systems take-home", redundantWith: "Already assessed on tokens and documentation" }],
    probeInstead: ["Brand identity as craft", "Type-led work, not component work"],
    neverSkip: ["Team chemistry", "The decision-maker conversation"],
    outcomeContext: "Reached final at Shopify and GitHub. Brand identity was not the loop they sat.",
  },
  4: {
    alreadyAssessed: [
      { competency: "Visual campaign", depth: "assessed", format: "Final round" },
      { competency: "Poster thinking", depth: "probed", format: "Portfolio review" },
    ],
    safeToSkip: [],
    probeInstead: ["Identity systems at product scale", "Restraint — the work on record is loud by design"],
    neverSkip: ["Team chemistry", "Portfolio review for this room", "The decision-maker conversation"],
    outcomeContext: "Offer at Pitch. An earlier portfolio screen ended without advancement — that is a different loop.",
  },
  5: {
    alreadyAssessed: [
      { competency: "Brand motion", depth: "assessed", format: "Creative challenge plus final" },
      { competency: "Rhythm and tempo", depth: "probed", format: "Work sample" },
    ],
    safeToSkip: [{ round: "Motion craft screen", redundantWith: "Already assessed in a four-round loop" }],
    probeInstead: ["Still identity, not motion", "Presenting to a non-film room"],
    neverSkip: ["Team chemistry", "The decision-maker conversation"],
    outcomeContext: "Offer at Adobe. A Spotify loop ended at the creative challenge — not stated as performance.",
  },
  9: {
    alreadyAssessed: [
      { competency: "Product systems", depth: "assessed", format: "Final round, Linear" },
      { competency: "B2B flows", depth: "probed", format: "Panel" },
    ],
    safeToSkip: [{ round: "Product craft screen", redundantWith: "Already assessed on systems and flows" }],
    probeInstead: ["Brand identity", "Editorial type as a primary medium"],
    neverSkip: ["Team chemistry", "The decision-maker conversation"],
    outcomeContext: "The last loop ended in an offer. Brand work is the gap, not the outcome.",
  },
}

export function rankForRole(role: string): DeskMatch[] {
  const r = role.toLowerCase()
  let order = [1, 7, 6, 4]
  if (/\bmotion\b|\bfilm\b|\bcinema/.test(r)) order = [5, 1, 7]
  else if (/\bsystem\b|\bproduct\b|\bb2b\b/.test(r)) order = [6, 9, 1, 7]
  else if (/\bbrutal\b|\bposter\b|\bloud\b/.test(r)) order = [4, 1, 7, 6]

  return order
    .filter(id => MATCHES[id] && getCandidate(id))
    .slice(0, 4)
    .map(id => ({ id, ...MATCHES[id] }))
}

export function briefFor(id: number): DeskBrief | null {
  return BRIEFS[id] ?? null
}

const DEFAULT_ROUNDS: ListingRound[] = [
  { index: 1, type: "screen", label: "Recruiter screen", cleared: true },
  { index: 2, type: "portfolio_review", label: "Portfolio review", cleared: true },
  { index: 3, type: "take_home", label: "Paid identity exercise", cleared: true },
  { index: 4, type: "presentation", label: "Final presentation", cleared: true },
]

function extractCompany(text: string, answers: string[]): string | null {
  const blob = [text, ...answers].join(" ")
  const known = blob.match(/\b(Figma|Stripe|Linear|Vercel|Notion|Pentagram|Adobe|Shopify|Pitch|Apple|Spotify|GitHub)\b/i)
  if (known) return known[0]
  const leftover = [...answers].reverse().find(a => {
    const s = a.trim()
    if (!s || s.split(/\s+/).length > 4) return false
    if (/^(two|three|four|2|3|4|yes|no)$/i.test(s)) return false
    if (/\b(round|follow-up|graded|take-home|call)\b/i.test(s)) return false
    return true
  })
  return leftover?.trim() ?? null
}

export function simulateParse(text: string, answers: string[] = []): ListingPreview {
  const t = text.trim()
  const fromAnswers = answers.map(a => a.trim()).filter(Boolean)
  const named = extractCompany(t, fromAnswers)
  const vague = t.length < 120 || /\b(a few|several|some rounds|a couple)\b/i.test(t)
  const questions: string[] = []
  if (vague && fromAnswers.length === 0) {
    questions.push("How many rounds were there in total — two, three, or four?")
    questions.push("Was the take-home reviewed in a follow-up, or only graded?")
  }
  if (!named) questions.push("Which company was this loop with?")

  if (questions.length) {
    return {
      questions: questions.slice(0, 3),
      company: named,
      rounds: [],
      outcome: "unstated",
      competencies: [],
      proposedTier: "standard",
      roundsConfidence: 0.4,
      ready: false,
    }
  }

  const rounds = DEFAULT_ROUNDS.map(r => ({ ...r }))
  if (/\b(three|3)\b/.test(answers[0] || t)) rounds.splice(3, 1)

  return {
    questions: [],
    company: named,
    rounds,
    outcome: /\boffer\b/i.test(t) ? "competitive_loss" : "unstated",
    competencies: [
      { name: "Identity systems", depth: "assessed" },
      { name: "Editorial type", depth: "probed" },
      { name: "Presentation", depth: rounds.length >= 4 ? "assessed" : "mentioned" },
    ],
    proposedTier: rounds.length >= 4 ? "elite" : "verified",
    roundsConfidence: fromAnswers.length ? 0.82 : 0.74,
    ready: true,
  }
}
