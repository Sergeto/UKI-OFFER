import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider, useSession } from './lib/session'
import { STEPS } from './lib/supabase'
import Login from './pages/Login'
import Company from './pages/Company'
import Logo from './pages/Logo'
import Brand from './pages/Brand'
import Home from './pages/Home'

/** Trimite omul la pasul potrivit: fără cont -> login, fără firmă -> firma, apoi logo, brand, acasă. */
function nextPath(hasSession: boolean, step: number | null) {
  if (!hasSession) return '/intra'
  if (step === null || step <= STEPS.company) return '/pornire/firma'
  if (step === STEPS.logo) return '/pornire/logo'
  if (step === STEPS.brand) return '/pornire/brand'
  return '/acasa'
}

function Guard({ path, children }: { path: string; children: React.ReactNode }) {
  const { session, org, loading } = useSession()
  if (loading) return <div className="center caption">Se încarcă…</div>
  const target = nextPath(!!session, org?.onboarding_step ?? null)
  // Pașii deja făcuți se pot redeschide (butonul Înapoi); cei din viitor nu.
  const order = ['/intra', '/pornire/firma', '/pornire/logo', '/pornire/brand', '/acasa']
  if (order.indexOf(path) > order.indexOf(target) || (path === '/intra' && session)) {
    return <Navigate to={target} replace />
  }
  if (path !== '/intra' && !session) return <Navigate to="/intra" replace />
  return <>{children}</>
}

function Start() {
  const { session, org, loading } = useSession()
  if (loading) return <div className="center caption">Se încarcă…</div>
  return <Navigate to={nextPath(!!session, org?.onboarding_step ?? null)} replace />
}

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route path="/intra" element={<Guard path="/intra"><Login /></Guard>} />
          <Route path="/pornire/firma" element={<Guard path="/pornire/firma"><Company /></Guard>} />
          <Route path="/pornire/logo" element={<Guard path="/pornire/logo"><Logo /></Guard>} />
          <Route path="/pornire/brand" element={<Guard path="/pornire/brand"><Brand /></Guard>} />
          <Route path="/acasa" element={<Guard path="/acasa"><Home /></Guard>} />
          <Route path="*" element={<Start />} />
        </Routes>
      </HashRouter>
    </SessionProvider>
  )
}
