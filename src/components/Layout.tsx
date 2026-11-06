import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import logo from '../assets/logo.webp'
import logoFooter from '../assets/logo-footer.webp'
import starIcon from '../assets/top-divider.webp'
import userIcon from '../assets/icon-user.webp'
import socials from '../assets/socials.webp'
import payments from '../assets/payments.webp'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useToast } from './ui'
import './layout.css'

const NAV = [
  { to: '/#como-funciona', label: 'Como funciona', section: 'como-funciona' },
  { to: '/crie-seu-pet', label: 'Crie seu pet' },
  { to: '/brincar', label: 'Brincar' },
  { to: '/ongs', label: 'Tudo sobre ONG’s' },
  { to: '/#duvidas', label: 'Dúvidas', section: 'duvidas' },
  { to: '/quem-somos', label: 'Quem somos nós' },
]

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    setActive(null)
    if (!enabled) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
          else setActive((current) => (current === entry.target.id ? null : current))
        }
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    NAV.forEach((n) => {
      const el = n.section && document.getElementById(n.section)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [enabled])
  return active
}

function Header() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(pathname === '/')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`topo ${scrolled ? 'encolhido' : ''}`}>
      <Link className="logo" to="/" aria-label="Oh My Pet! Página inicial" onClick={close}>
        <img src={logo} alt="Oh My Pet!" />
      </Link>

      <nav className={`menu ${open ? 'aberto' : ''}`} id="menu-principal" aria-label="Principal">
        {NAV.map((n, i) =>
          n.section ? (
            <Link
              key={n.to}
              to={n.to}
              onClick={close}
              aria-current={active === n.section ? 'true' : undefined}
              style={{ transitionDelay: open ? `${i * 50}ms` : undefined }}
            >
              {n.label}
            </Link>
          ) : (
            <NavLink key={n.to} to={n.to} onClick={close} style={{ transitionDelay: open ? `${i * 50}ms` : undefined }}>
              {n.label}
            </NavLink>
          ),
        )}
      </nav>

      <Link className="conta-link" to={user ? '/conta' : '/entrar'} onClick={close}>
        <img src={userIcon} alt="" />
        <span>{user ? user.name.split(' ')[0] : 'Entrar'}</span>
      </Link>
      <Link className="btn assine" to="/#planos" onClick={close}>
        ASSINE JÁ!
      </Link>
      <button
        className={`hamburguer ${open ? 'aberto' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-principal"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        <i />
        <i />
        <i />
      </button>
      {open && <div className="menu-fundo" onClick={close} />}
    </header>
  )
}

function Footer() {
  const { soon, toast } = useToast()
  const [email, setEmail] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await api.subscribeNewsletter(email)
      setEmail('')
      toast('Obrigada! Você vai receber nossas dicas 🐾')
    } catch (err) {
      toast((err as Error).message)
    }
  }

  const SoonLink = ({ children }: { children: string }) => (
    <button className="link-rodape" onClick={soon}>
      {children}
    </button>
  )

  return (
    <footer className="rodape">
      <div className="rodape-grade">
        <div className="rodape-marca">
          <img className="rodape-logo" src={logoFooter} alt="Oh My Pet!" />
          <p>Cuidado que chega todo mês para seu cão ou seu gato.</p>
          <div className="sociais">
            <img src={socials} alt="" />
            <div>
              {['Instagram', 'TikTok', 'YouTube', 'WhatsApp'].map((rede) => (
                <button key={rede} onClick={soon} aria-label={rede} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="rodape-colunas">
            <div>
              <h4>ASSINATURA</h4>
              <Link className="link-rodape" to="/#como-funciona">Como funciona</Link>
              <Link className="link-rodape" to="/#planos">Planos e preços</Link>
              <Link className="link-rodape" to="/crie-seu-pet">Crie seu pet</Link>
              <SoonLink>Presentear alguém</SoonLink>
            </div>
            <div>
              <h4>AJUDA</h4>
              <Link className="link-rodape" to="/#duvidas">Perguntas</Link>
              <SoonLink>Fale conosco</SoonLink>
              <SoonLink>Política de entrega</SoonLink>
              <SoonLink>Cancelamento</SoonLink>
            </div>
            <div>
              <h4>INSTITUCIONAL</h4>
              <Link className="link-rodape" to="/quem-somos">Quem somos nós</Link>
              <Link className="link-rodape" to="/ongs">Tudo sobre ONG’s</Link>
              <SoonLink>Blog</SoonLink>
              <SoonLink>Trabalhe conosco</SoonLink>
            </div>
            <div>
              <h4>RECEBA DICAS E OFERTAS</h4>
              <form className="newsletter" onSubmit={submit}>
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  aria-label="Seu e-mail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button>ENVIAR</button>
              </form>
            </div>
          </div>
          <img className="pagamentos" src={payments} alt="Formas de pagamento: Mastercard, Visa, Elo, Pix e American Express" />
        </div>
      </div>
      <div className="copyright">
        <span>© 2026 Oh My Pet! · CNPJ 00.000.000/0001-00</span>
        <span>
          <button onClick={soon}>Termos de uso</button> - <button onClick={soon}>Política de privacidade</button>
        </span>
      </div>
    </footer>
  )
}

function ScrollManager() {
  const { key, pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // Espera a página nova montar antes de rolar até a seção.
      const id = window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView()
      }, 60)
      return () => clearTimeout(id)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [key, pathname, hash])
  return null
}

export function Layout() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollManager />
      <div className="faixa-topo">
        <span>Caixa transformável em todas as boxes</span>
        <img src={starIcon} alt="" />
        <span>3 meses grátis na primeira assinatura</span>
      </div>
      <Header />
      <main className="pagina" key={pathname}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
