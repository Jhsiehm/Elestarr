import { RouterProvider, useRouter, type Page } from "./router"
import Landing from "./pages/Landing"
import Candidates from "./pages/Candidates"
import Hiring from "./pages/Hiring"
import Manifesto from "./pages/Manifesto"
import Signup from "./pages/Signup"
import Board from "./pages/Board"
import Profile from "./pages/Profile"
import Onboard from "./pages/Onboard"
import Info from "./pages/Info"
import NotFound from "./pages/NotFound"
import Toast from "./components/Toast"

const INFO: Page[] = [
  "verification",
  "privacy",
  "terms",
  "security",
  "faq",
  "pricing",
  "about",
  "contact",
  "careers",
  "nda",
  "remove",
  "publish",
  "access",
  "walkthrough",
]

function Pages() {
  const { page, ready } = useRouter()
  if (!ready) return null
  if (page === "landing") return <Landing />
  if (page === "candidates") return <Candidates />
  if (page === "hiring") return <Hiring />
  if (page === "manifesto") return <Manifesto />
  if (page === "signup") return <Signup />
  if (page === "onboard") return <Onboard />
  if (page === "board") return <Board />
  if (page === "profile") return <Profile />
  if (page === "notfound") return <NotFound />
  if (INFO.includes(page)) return <Info />
  return <NotFound />
}

function AppShell() {
  return (
    <>
      <div className="relative z-[1]">
        <Pages />
      </div>
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <AppShell />
    </RouterProvider>
  )
}
