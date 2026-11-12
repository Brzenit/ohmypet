import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Paw, PawField } from '../components/ui'
import { useAuth } from '../lib/auth'
import './account.css'

const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/conta')

export function Login() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [mode, setMode] = useState<'entrar' | 'cadastrar'>(params.get('next') ? 'cadastrar' : 'entrar')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, next, navigate])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'cadastrar' && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'entrar') await login(email, password)
      else if (await register(name, email, password)) setSentTo(email.trim().toLowerCase())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="bloco acesso">
      <PawField color="#ff7af6" spots={[[6, 14, 54, -16], [88, 18, 44, 18], [10, 74, 36, 12], [84, 70, 58, -14]]} />
      <div className="acesso-cartao cartao">
        <div className="abas-acesso" role="tablist">
          <button role="tab" aria-selected={mode === 'entrar'} onClick={() => { setMode('entrar'); setError('') }}>Entrar</button>
          <button role="tab" aria-selected={mode === 'cadastrar'} onClick={() => { setMode('cadastrar'); setError('') }}>Criar conta</button>
        </div>
        <h1 key={mode}>
          <Paw size={30} /> {mode === 'entrar' ? 'Que bom te ver!' : 'Bem-vindo ao clube!'}
        </h1>
        {sentTo ? (
          <div className="acesso-enviado" role="status">
            <p>
              Enviamos um link de confirmação para <b>{sentTo}</b>. Abra o e-mail, clique no link e depois entre com sua senha.
            </p>
            <button className="btn" onClick={() => { setSentTo(''); setMode('entrar') }}>JÁ CONFIRMEI</button>
          </div>
        ) : (
        <form onSubmit={submit}>
          {mode === 'cadastrar' && (
            <label className="campo">
              Seu nome
              <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label className="campo">
            E-mail
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="campo">
            Senha
            <input
              type="password"
              required
              autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="erro-geral" role="alert">{error}</p>}
          <button className="btn" disabled={busy}>
            {busy ? 'AGUARDE...' : mode === 'entrar' ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </form>
        )}
      </div>
    </section>
  )
}
