import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { clearSession, getActiveSession, markOnboarded, subscribeAuth, type SessionAccount } from "./accounts"
import { candidates, type Stage } from "./data"
import { hydrateLive, wallId } from "./lib/backend"

export type Page = "landing" | "signup" | "board" | "profile" | "onboard"
export type Role = "firm" | "creative"
export type Mode = Role
export type WallView = "wall" | "pipeline" | "desk" | "listings"

type RouterCtx = {
  ready: boolean
  page: Page
  navigate: (p: Page, id?: number, workIndex?: number) => void
  profileId: number
  ownProfileId: number | null
  workIndex: number
  dark: boolean
  toggleDark: () => void
  mode: Mode
  setMode: (m: Mode) => void
  role: Role
  wallView: WallView
  setWallView: (v: WallView) => void
  refsLeft: number
  vouched: Set<number>
  spendReferral: (id: number) => boolean
  contact: (name: string) => void
  stages: Record<number, Stage>
  setStage: (id: number, stage: Stage) => void
  toast: string | null
  showToast: (html: string) => void
  signedIn: boolean
  accountEmail: string | null
  accountId: string | null
  startSession: () => Promise<void>
  signOut: () => void
  intent: Role
  setIntent: (r: Role) => void
  onboarded: boolean
  finishOnboard: (next?: WallView) => Promise<void>
  browseWall: () => void
  refreshWall: () => Promise<void>
  wallTick: number
}

const Ctx = createContext<RouterCtx>(null!)
export const useRouter = () => useContext(Ctx)

const initialStages = Object.fromEntries(candidates.map(c => [c.id, c.stage])) as Record<number, Stage>

function applyAccount(
  acc: SessionAccount | null,
  set: {
    setSignedIn: (v: boolean) => void
    setOnboarded: (v: boolean) => void
    setRole: (v: Role) => void
    setMode: (v: Mode) => void
    setAccountEmail: (v: string | null) => void
    setAccountId: (v: string | null) => void
    setOwnProfileId: (v: number | null) => void
    setProfileId: (v: number) => void
    setPage: (v: Page) => void
    setWallView: (v: WallView) => void
  },
  opts?: { land?: boolean },
) {
  if (!acc) {
    set.setSignedIn(false)
    set.setOnboarded(false)
    set.setAccountEmail(null)
    set.setAccountId(null)
    set.setOwnProfileId(null)
    if (opts?.land) set.setPage("landing")
    return
  }
  const ownId = wallId(acc.userId)
  set.setSignedIn(true)
  set.setOnboarded(acc.onboarded)
  set.setRole(acc.role)
  if (opts?.land) set.setMode(acc.role)
  set.setAccountEmail(acc.email)
  set.setAccountId(acc.userId)
  set.setOwnProfileId(ownId)
  if (opts?.land && acc.role === "creative") set.setProfileId(ownId)
  if (opts?.land) {
    if (!acc.onboarded) set.setPage("onboard")
    else {
      set.setWallView("wall")
      set.setPage("board")
    }
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState<Page>("landing")
  const [profileId, setProfileId] = useState(1)
  const [ownProfileId, setOwnProfileId] = useState<number | null>(null)
  const [workIndex, setWorkIndex] = useState(0)
  const [dark, setDark] = useState(false)
  const [mode, setMode] = useState<Mode>("firm")
  const [role, setRole] = useState<Role>("firm")
  const [intent, setIntent] = useState<Role>("firm")
  const [wallView, setWallView] = useState<WallView>("wall")
  const [refsLeft, setRefsLeft] = useState(3)
  const [vouched, setVouched] = useState<Set<number>>(new Set())
  const [stages, setStages] = useState<Record<number, Stage>>(initialStages)
  const [toast, setToast] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [onboarded, setOnboarded] = useState(false)
  const [accountEmail, setAccountEmail] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [wallTick, setWallTick] = useState(0)

  const setters = {
    setSignedIn, setOnboarded, setRole, setMode, setAccountEmail,
    setAccountId, setOwnProfileId, setProfileId, setPage, setWallView,
  }

  const hydrate = useCallback(async (land: boolean) => {
    const acc = await getActiveSession()
    applyAccount(acc, setters, { land })
    await hydrateLive(acc ? { userId: acc.userId, role: acc.role } : null)
    setWallTick(n => n + 1)
  }, [])

  useEffect(() => {
    let alive = true
    void (async () => {
      await hydrate(true)
      if (alive) setReady(true)
    })()
    const unsub = subscribeAuth(() => { void hydrate(false) })
    return () => { alive = false; unsub() }
  }, [hydrate])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const showToast = useCallback((html: string) => {
    setToast(html)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const navigate = (p: Page, id?: number, work?: number) => {
    if (id != null) setProfileId(id)
    if (work != null) setWorkIndex(work)
    else if (id != null) setWorkIndex(0)
    setPage(p)
  }

  const spendReferral = (id: number) => {
    if (refsLeft <= 0 || vouched.has(id)) return false
    setRefsLeft(n => n - 1)
    setVouched(s => new Set(s).add(id))
    return true
  }

  const contact = (name: string) => {
    showToast(`Intro sent to <span class="text-[var(--accent-ink)] font-mono text-xs">${name}</span>. This is the event that proves the loop.`)
  }

  const startSession = async () => {
    await hydrate(true)
  }

  const refreshWall = async () => {
    if (!accountId) return
    await hydrateLive({ userId: accountId, role })
    setWallTick(n => n + 1)
  }

  const finishOnboard = async (next: WallView = "wall") => {
    if (accountId) await markOnboarded(accountId)
    setOnboarded(true)
    await refreshWall()
    if (ownProfileId != null) setProfileId(ownProfileId)
    setWallView(next)
    setPage("board")
  }

  const browseWall = () => {
    setWallView("wall")
    setPage("board")
  }

  const signOut = () => {
    void clearSession()
    void hydrateLive(null)
    setSignedIn(false)
    setOnboarded(false)
    setAccountEmail(null)
    setAccountId(null)
    setOwnProfileId(null)
    setWallView("wall")
    setPage("landing")
  }

  return (
    <Ctx.Provider
      value={{
        ready,
        page,
        navigate,
        profileId,
        ownProfileId,
        workIndex,
        dark,
        toggleDark: () => setDark(d => !d),
        mode,
        setMode,
        role,
        wallView,
        setWallView,
        refsLeft,
        vouched,
        spendReferral,
        contact,
        stages,
        setStage: (id, stage) => setStages(s => ({ ...s, [id]: stage })),
        toast,
        showToast,
        signedIn,
        accountEmail,
        accountId,
        startSession,
        signOut,
        intent,
        setIntent,
        onboarded,
        finishOnboard,
        browseWall,
        refreshWall,
        wallTick,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
