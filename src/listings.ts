import { type Candidate } from "./data"

export type CandidateListing = {
  id: string
  company: string
  role: string
  place: string
  fromRecord: string
  overlap: string
  gap: string
  theyCanSkip: string[]
  theyStillDo: string[]
  needsFinal: boolean
  needsIdentity: boolean
}

const LISTINGS: CandidateListing[] = [
  {
    id: "stripe-brand",
    company: "Stripe",
    role: "Staff Brand Designer",
    place: "Remote · Dublin or NYC",
    fromRecord: "Figma · Final Round (4/4)",
    overlap: "They need identity systems already taken to a final. Your Figma loop did that. The company stays on the row.",
    gap: "Their sceptical commercial room is not on your record.",
    theyCanSkip: ["Portfolio screen", "Moodboard round"],
    theyStillDo: ["Team chemistry", "The decision-maker conversation"],
    needsFinal: true,
    needsIdentity: true,
  },
  {
    id: "nyt-design",
    company: "The New York Times",
    role: "Editorial Designer",
    place: "New York",
    fromRecord: "Figma · Final Round (4/4)",
    overlap: "Type-led identity and print thinking were probed in your Figma loop. That is the shape of this desk.",
    gap: "Newsroom pace and daily edition constraints were never a round.",
    theyCanSkip: ["First portfolio screen"],
    theyStillDo: ["Team chemistry", "A trial on a live section"],
    needsFinal: true,
    needsIdentity: true,
  },
  {
    id: "manual-studio",
    company: "Manual",
    role: "Senior Identity Designer",
    place: "Portland",
    fromRecord: "Figma · Final Round (4/4)",
    overlap: "A studio of this size will not rerun a four-round identity loop. They can start from the final you already sat.",
    gap: "Presenting to their founding partners is not on the record.",
    theyCanSkip: ["Style-tile exercise", "Unpaid take-home"],
    theyStillDo: ["Team chemistry", "The partner conversation"],
    needsFinal: true,
    needsIdentity: true,
  },
  {
    id: "linear-product",
    company: "Pitch",
    role: "Product Designer, Brand-adjacent",
    place: "Berlin or remote",
    fromRecord: "Linear · Take-home (2/4)",
    overlap: "You sat a product take-home at Linear. That is adjacent, not a full identity final for this req.",
    gap: "Brand identity as the primary loop was not tested there. A Figma final still helps the overlap.",
    theyCanSkip: ["Early craft screen"],
    theyStillDo: ["Team chemistry", "Identity as a dedicated round"],
    needsFinal: false,
    needsIdentity: false,
  },
]

function hasFinal(c: Candidate) {
  return c.interviews.some(iv => iv.verified && /final/i.test(iv.round))
}

function hasIdentity(c: Candidate) {
  return c.interviews.some(iv =>
    iv.verified && /brand|identity|visual|editorial/i.test(`${iv.role} ${iv.round}`)
  )
}

export function listingsFor(candidate: Candidate): CandidateListing[] {
  const proved = candidate.interviews.filter(iv => iv.verified)
  if (!proved.length) return []
  const final = hasFinal(candidate)
  const identity = hasIdentity(candidate)
  return LISTINGS.filter(row => {
    if (row.needsFinal && !final) return false
    if (row.needsIdentity && !identity) return false
    return true
  })
}
