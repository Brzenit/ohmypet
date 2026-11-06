import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Layout } from './components/Layout'
import { useAuth } from './lib/auth'
import { Account } from './pages/Account'
import { About, NotFound, Ongs } from './pages/Content'
import { CreatePet } from './pages/CreatePet'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Play } from './pages/Play'
import { Subscribe } from './pages/Subscribe'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { pathname, search } = useLocation()
  if (loading) return null
  if (!user) return <Navigate to={`/entrar?next=${encodeURIComponent(pathname + search)}`} replace />
  return children
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="crie-seu-pet" element={<CreatePet />} />
        <Route path="brincar" element={<Play />} />
        <Route path="ongs" element={<Ongs />} />
        <Route path="quem-somos" element={<About />} />
        <Route path="entrar" element={<Login />} />
        <Route path="conta" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="assinar" element={<RequireAuth><Subscribe /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
