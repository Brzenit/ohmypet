import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Paw, PawField } from '../components/ui'
import { RESEND_COOLDOWN_S, UnconfirmedError, useAuth } from '../lib/auth'
import './account.css'

const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/conta')

/** Botão de reenviar o link de confirmação, com a espera do Supabase entre envios. */
function ResendLink({ initialEmail, askEmail, startCooling }: { initialEmail: string; askEmail?: boolean; startCooling?: boolean }) {
  const { resendConfirmation } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [left, setLeft] = useState(startCooling ? RESEND_COOLDOWN_S : 0)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (left <= 0) return
    timer.current = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer.current)
  }, [left])

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!email.trim() || busy || left > 0) return
    setBusy(true)
    setStatus(null)
    try {
      await resendConfirmation(email)
      setStatus({ ok: true, text: `Pronto! Mandamos um link novo para ${email.trim().toLowerCase()}. Ele vale por 1 hora; olhe também no spam.` })
      setLeft(RESEND_COOLDOWN_S)
    } catch (err) {
      setStatus({ ok: false, text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const label = busy ? 'ENVIANDO...' : left > 0 ? `REENVIAR EM ${left}s` : 'REENVIAR LINK'
  return (
    <form className="reenviar" onSubmit={send}>
      {askEmail && (
        <label className="campo">
          E-mail do cadastro
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      )}
      <button className="btn secundario" disabled={busy || left > 0}>{label}</button>
      {status && (
        <p className={status.ok ? 'reenviar-ok' : 'erro-geral'} role={status.ok ? 'status' : 'alert'}>{status.text}</p>
      )}
    </form>
  )
}

export function Login() {
  const { user, login, register, linkError, clearLinkError } = useAuth()
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
  const [unconfirmed, setUnconfirmed] = useState('')

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, next, navigate])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setUnconfirmed('')
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
      if (err instanceof UnconfirmedError) setUnconfirmed(email.trim().toLowerCase())
    } finally {
      setBusy(false)
    }
  }

  const expired = linkError === 'otp_expired'

  return (
    <section className="bloco acesso">
      <PawField color="#ff7af6" spots={[[6, 14, 54, -16], [88, 18, 44, 18], [10, 74, 36, 12], [84, 70, 58, -14]]} />
      <div className="acesso-cartao cartao">
        {!linkError && (
          <div className="abas-acesso" role="tablist">
            <button role="tab" aria-selected={mode === 'entrar'} onClick={() => { setMode('entrar'); setError(''); setUnconfirmed('') }}>Entrar</button>
            <button role="tab" aria-selected={mode === 'cadastrar'} onClick={() => { setMode('cadastrar'); setError(''); setUnconfirmed('') }}>Criar conta</button>
          </div>
        )}
        <h1 key={linkError ? 'link' : mode}>
          <Paw size={30} /> {linkError ? 'Vamos de novo?' : mode === 'entrar' ? 'Que bom te ver!' : 'Bem-vindo ao clube!'}
        </h1>
        {linkError ? (
          <div className="acesso-enviado">
            <p role="alert">
              {expired
                ? 'Esse link de confirmação expirou ou já foi usado. Sem problema: sua conta continua guardada, é só pedir um link novo.'
                : 'Não conseguimos abrir esse link de confirmação. Peça um link novo abaixo.'}
            </p>
            <ResendLink initialEmail={email} askEmail />
            <button type="button" className="link-voltar" onClick={() => { clearLinkError(); setMode('entrar') }}>
              Já confirmei, quero entrar
            </button>
          </div>
        ) : sentTo ? (
          <div className="acesso-enviado" role="status">
            <p>
              Enviamos um link de confirmação para <b>{sentTo}</b>. Abra o e-mail, clique no link e depois entre com sua senha.
            </p>
            <button className="btn" onClick={() => { setSentTo(''); setMode('entrar') }}>JÁ CONFIRMEI</button>
            <p className="reenviar-dica">Não chegou? Olhe no spam ou peça outro:</p>
            <ResendLink initialEmail={sentTo} startCooling />
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
        {unconfirmed && !sentTo && !linkError && <ResendLink key={unconfirmed} initialEmail={unconfirmed} />}
      </div>
    </section>
  )
}
