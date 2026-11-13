import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import type { Billing } from '../types'

export function Paw({ size = 24, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={style} aria-hidden="true" fill="currentColor">
      <ellipse cx="32" cy="43" rx="15" ry="13" />
      <ellipse cx="12" cy="30" rx="6" ry="8.500" />
      <ellipse cx="24" cy="15" rx="6" ry="9" />
      <ellipse cx="40" cy="15" rx="6" ry="9" />
      <ellipse cx="52" cy="30" rx="6" ry="8.500" />
    </svg>
  )
}

/** Patinhas flutuando ao fundo de uma seção; a seção precisa de position: relative. */
export function PawField({ color, spots }: { color: string; spots: [number, number, number, number][] }) {
  return (
    <div className="patas" style={{ color, position: 'absolute' }} aria-hidden="true">
      {spots.map(([left, top, size, rotate], i) => (
        <Paw
          key={i}
          size={size}
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              '--r': `${rotate}deg`,
              animationDelay: `${i * -1.3}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function BillingToggle({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  return (
    <div className="cobranca segmentado" role="group" aria-label="Forma de cobrança">
      <button type="button" aria-pressed={value === 'mensal'} onClick={() => onChange('mensal')}>Mensal</button>
      <button type="button" aria-pressed={value === 'anual'} onClick={() => onChange('anual')}>Anual com desconto</button>
    </div>
  )
}

type RevealKind = 'up' | 'left' | 'right' | 'pop'

export function Reveal({
  as: Tag = 'div',
  kind = 'up',
  delay = 0,
  className = '',
  children,
  ...rest
}: {
  as?: ElementType
  kind?: RevealKind
  delay?: number
  className?: string
  children?: ReactNode
  [key: string]: unknown
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${kind} ${visible ? 'visible' : ''} ${className}`}
      style={{ '--delay': `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface ToastValue {
  toast: (message: string) => void
  soon: () => void
}
const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef<number>(undefined)

  const toast = useCallback((text: string) => {
    setMessage(text)
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setVisible(false), 2600)
  }, [])
  const value = useMemo(() => ({ toast, soon: () => toast('Essa página ainda está em produção 🐾') }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast ${visible ? 'visivel' : ''}`} role="status">
        {message}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider')
  return ctx
}

const CONFETTI_COLORS = ['#5813ad', '#b74ff9', '#ff7af6', '#907aff', '#ffff7b']

export function PawConfetti({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        size: 16 + Math.random() * 26,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 1.8 + Math.random() * 1.6,
        delay: Math.random() * 0.7,
        rotate: 180 + Math.random() * 540,
      })),
    [pieces],
  )
  return (
    <div className="confete" aria-hidden="true">
      {items.map((p, i) => (
        <Paw
          key={i}
          size={p.size}
          style={
            {
              left: `${p.left}%`,
              color: p.color,
              '--t': `${p.duration}s`,
              '--d': `${p.delay}s`,
              '--r': `${p.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

const LEAVE_MS = 520

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

/**
 * Mostra os itens em grupos (3 no computador, 1 no celular), deixa cada grupo
 * parado por alguns segundos e troca com um fade suave. Para quando o mouse
 * ou o foco estão em cima. Com "reduzir movimento" a troca vira só um fade.
 */
export function Rotator({
  items,
  label,
  hold = 6500,
  className = '',
}: {
  items: { key: string; node: ReactNode }[]
  label: string
  hold?: number
  className?: string
}) {
  const narrow = useMediaQuery('(max-width: 720px)')
  const per = narrow ? 1 : 3
  const pages = Math.ceil(items.length / per)
  const [page, setPage] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const current = page % pages
  const go = useCallback((next: number) => {
    window.clearTimeout(timer.current)
    setLeaving(true)
    timer.current = window.setTimeout(() => {
      setPage(next)
      setLeaving(false)
    }, LEAVE_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (paused || pages < 2 || leaving) return
    const id = window.setTimeout(() => go((current + 1) % pages), hold)
    return () => window.clearTimeout(id)
  }, [paused, pages, leaving, current, hold, go])

  const shown = Array.from({ length: Math.min(per, items.length) }, (_, i) => items[(current * per + i) % items.length])

  return (
    <div
      className={`rotator ${className} ${paused || pages < 2 ? 'pausado' : ''}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={`rotator-grupo ${leaving ? 'saindo' : ''}`} key={`${current}-${per}`} aria-live="polite">
        {shown.map((item, i) => (
          <div key={item.key} className="rotator-item" style={{ '--i': i } as CSSProperties}>
            {item.node}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="rotator-pontos" style={{ '--ponto-tempo': `${hold}ms` } as CSSProperties}>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              className="ponto-progresso"
              aria-label={`Mostrar grupo ${i + 1} de ${pages}`}
              aria-current={i === current || undefined}
              onClick={() => i !== current && go(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
