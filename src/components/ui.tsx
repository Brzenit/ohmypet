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
