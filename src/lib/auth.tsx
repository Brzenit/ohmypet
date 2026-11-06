import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'
import type { User } from '../types'

const KEY = 'omp.userId'

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

// Protótipo: a senha fica em texto puro no db.json e a sessão é só o id no localStorage.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = Number(localStorage.getItem(KEY))
    if (!id) {
      setLoading(false)
      return
    }
    api
      .getUser(id)
      .then(setUser)
      .catch(() => localStorage.removeItem(KEY))
      .finally(() => setLoading(false))
  }, [])

  const enter = useCallback((u: User) => {
    localStorage.setItem(KEY, String(u.id))
    setUser(u)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const found = await api.findUserByEmail(email.trim().toLowerCase())
      if (!found || found.password !== password) throw new Error('E-mail ou senha incorretos.')
      enter(found)
    },
    [enter],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const normalized = email.trim().toLowerCase()
      if (await api.findUserByEmail(normalized)) throw new Error('Já existe uma conta com esse e-mail.')
      enter(await api.createUser({ name: name.trim(), email: normalized, password }))
    },
    [enter],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
