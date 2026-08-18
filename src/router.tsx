import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { candidates, type Stage } from "./data"

export type Page = "landing" | "signup" | "board" | "profile"
export type Mode = "firm" | "vetter"
export type Role = "firm" | "creative"
export type WallView = "wall" | "pipeline"

type RouterCtx = {
  page: Page
  navigate: (p: Page, id?: number, workIndex?: number) => void
  profileId: number
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
  signIn: (role: Role) => void
  signOut: () => void
}

const Ctx = createContext<RouterCtx>(null!)
export const useRouter = () => useContext(Ctx)

const initialStages = Object.fromEntries(candidates.map(c => [c.id, c.stage])) as Record<number, Stage>

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("landing")
  const [profileId, setProfileId] = useState(1)
  const [workIndex, setWorkIndex] = useState(0)
  const [dark, setDark] = useState(false)
  const [mode, setMode] = useState<Mode>("firm")
  const [role, setRole] = useState<Role>("firm")
  const [wallView, setWallView] = useState<WallView>("wall")
  const [refsLeft, setRefsLeft] = useState(3)
  const [vouched, setVouched] = useState<Set<number>>(new Set())
  const [stages, setStages] = useState<Record<number, Stage>>(initialStages)
  const [toast, setToast] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)

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

  const signIn = (r: Role) => {
    setRole(r)
    setMode(r === "creative" ? "vetter" : "firm")
    setSignedIn(true)
    setPage("board")
  }

  const signOut = () => {
    setSignedIn(false)
    setPage("landing")
  }

  return (
    <Ctx.Provider
      value={{
        page,
        navigate,
        profileId,
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
        signIn,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
