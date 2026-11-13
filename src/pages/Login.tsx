import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Paw, PawField } from '../components/ui'
import { RESEND_COOLDOWN_S, UnconfirmedError, useAuth } from '../lib/auth'
import './account.css'

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

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
  const { user, login, register, loginWithGoogle, linkError: anyLinkError, clearLinkError } = useAuth()
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
  const [googleBusy, setGoogleBusy] = useState(false)
  // Erros da volta do Google aparecem no formulário; os de link de e-mail têm tela própria.
  const linkError = anyLinkError?.source === 'email' ? anyLinkError : null

  useEffect(() => {
    if (anyLinkError?.source !== 'google') return
    setError(
      anyLinkError.code === 'access_denied'
        ? 'O login com Google foi cancelado. Tente de novo quando quiser.'
        : 'Não conseguimos entrar com o Google. Tente de novo ou use e-mail e senha.',
    )
    setMode('entrar')
    clearLinkError()
  }, [anyLinkError, clearLinkError])

  const google = async () => {
    setError('')
    setGoogleBusy(true)
    try {
      await loginWithGoogle(next)
      // Daqui o navegador vai para o Google; o botão segue em "aguarde" até sair da página.
    } catch (err) {
      setError((err as Error).message)
      setGoogleBusy(false)
    }
  }

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

  const expired = linkError?.code === 'otp_expired'

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
          <div className="ou" aria-hidden="true"><span>ou</span></div>
          <button type="button" className="btn-google" onClick={google} disabled={googleBusy || busy}>
            <GoogleLogo />
            {googleBusy ? 'Abrindo o Google...' : mode === 'entrar' ? 'Entrar com Google' : 'Criar conta com Google'}
          </button>
        </form>
        )}
        {unconfirmed && !sentTo && !linkError && <ResendLink key={unconfirmed} initialEmail={unconfirmed} />}
      </div>
    </section>
  )
}
