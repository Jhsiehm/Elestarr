import SiteShell from "../components/SiteShell"
import { useRouter } from "../router"

export default function NotFound() {
  const { navigate } = useRouter()

  return (
    <SiteShell title="Not found · Elestar">
      <section className="hero hero-solo">
        <div className="hero-copy">
          <h1 className="type-hero">That page is not here.</h1>
          <p className="type-lede">The URL does not match a page Elestar ships.</p>
          <div className="cta-row">
            <button type="button" className="btn" onClick={() => navigate("landing")}>
              Back to Elestar
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
