import { RouterProvider, useRouter } from "./router"
import Landing from "./pages/Landing"
import Signup from "./pages/Signup"
import Board from "./pages/Board"
import Profile from "./pages/Profile"
import Onboard from "./pages/Onboard"
import Toast from "./components/Toast"
import EyeFade from "./components/EyeFade"
import LandingField from "./components/LandingField"

function Pages() {
  const { page } = useRouter()
  if (page === "landing") return <Landing />
  if (page === "signup") return <Signup />
  if (page === "onboard") return <Onboard />
  if (page === "board") return <Board />
  if (page === "profile") return <Profile />
  return null
}

function AppShell() {
  const { page } = useRouter()
  return (
    <>
      {page === "landing" ? <LandingField /> : <EyeFade tone="site" />}
      <div className="grain" />
      <div className="vignette" />
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
