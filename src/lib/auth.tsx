import type { AuthError, User as AuthUser } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase, supabaseReady } from './supabase'

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  /** Devolve true quando a conta ainda precisa ser confirmada pelo e-mail. */
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const toUser = (u: AuthUser): User => ({
  id: u.id,
  email: u.email ?? '',
  name: typeof u.user_metadata?.name === 'string' && u.user_metadata.name ? u.user_metadata.name : (u.email ?? '').split('@')[0],
})

function friendly(error: AuthError) {
  const message = error.message.toLowerCase()
  if (error.code === 'invalid_credentials' || message.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (error.code === 'user_already_exists' || message.includes('already registered')) return 'Já existe uma conta com esse e-mail.'
  if (error.code === 'email_not_confirmed' || message.includes('not confirmed')) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
  if (error.code === 'weak_password') return 'Escolha uma senha mais forte, com pelo menos 6 caracteres.'
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
  if (error.code === 'validation_failed' || message.includes('invalid')) return 'Confira o e-mail digitado.'
  return 'Não conseguimos falar com o servidor. Tente de novo em instantes.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(supabaseReady)

  useEffect(() => {
    if (!supabaseReady) return
    // Dispara logo de início com a sessão salva e depois a cada login, logout ou renovação.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? toUser(session.user) : null)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) throw new Error(friendly(error))
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/conta` },
    })
    if (error) throw new Error(friendly(error))
    // Com a confirmação ligada, e-mail repetido volta sem erro e sem identidades.
    if (data.user && data.user.identities?.length === 0) throw new Error('Já existe uma conta com esse e-mail.')
    return !data.session
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
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
