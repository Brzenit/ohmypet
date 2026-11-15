import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Paw, PawField, Reveal, useToast } from '../components/ui'
import { MOVEMENT_LABELS, PATINHAS_RULES as R, REWARDS, findReward, formatPatinhas } from '../data/patinhas'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { PatinhasMovimento, PatinhasResgate, RewardId } from '../types'
import './patinhas.css'

const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })
const dayKey = (iso: string) => fmtDay.format(new Date(iso))
const monthKey = (iso: string) => dayKey(iso).slice(0, 7)
// Descontos e frete contam como uma vantagem só por mês; as demais, uma de cada.
const group = (id: RewardId) => (id === 'desc5' || id === 'desc10' || id === 'frete' ? 'beneficio' : id)

const EARN = [
  { title: 'Dê banho no seu pet', value: `+${R.perBath}`, text: 'Complete as etapas do minigame. Rende uma vez por dia.' },
  { title: `${R.streakDays} dias seguidos`, value: `+${R.streakBonus}`, text: 'Bônus extra a cada sequência completa de banhos.' },
  { title: 'Crie seu pet', value: `+${R.perPet}`, text: `Para cada pet novo, até ${R.maxPets} pets.` },
  { title: 'Assine uma box', value: `+${R.firstSubscription}`, text: 'Presente de boas-vindas na primeira assinatura.' },
]

export function Patinhas() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [history, setHistory] = useState<PatinhasMovimento[]>([])
  const [redemptions, setRedemptions] = useState<PatinhasResgate[]>([])
  const [hasSubscription, setHasSubscription] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState<RewardId | null>(null)
  const [busy, setBusy] = useState<RewardId | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [b, h, r, subs] = await Promise.all([
        api.patinhas.balance(),
        api.patinhas.history(),
        api.patinhas.redemptions(),
        api.listSubscriptions(user.id),
      ])
      setBalance(b)
      setHistory(h)
      setRedemptions(r)
      setHasSubscription(subs.some((s) => s.status === 'ativa'))
      setError('')
    } catch (err) {
      setError((err as Error).message)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const redeem = async (id: RewardId) => {
    setBusy(id)
    try {
      await api.patinhas.redeem(id)
      toast(`Troca feita: ${findReward(id)?.name} 🐾`)
      setConfirming(null)
      await load()
    } catch (err) {
      toast((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const thisMonth = monthKey(new Date().toISOString())
  const usedThisMonth = (id: RewardId) => redemptions.some((x) => monthKey(x.criadoEm) === thisMonth && group(x.recompensa) === group(id))
  const playedToday = history.some((m) => m.tipo === 'banho' && dayKey(m.criadoEm) === dayKey(new Date().toISOString()))
  // A próxima meta ignora o que já foi trocado neste mês.
  const next = balance === null ? undefined : REWARDS.find((r) => r.cost > balance && !usedThisMonth(r.id))

  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>Clube Patinhas</h1>
        <p>Brinque com o seu pet, junte Patinhas e troque por vantagens na sua assinatura.</p>
      </div>

      <section className="bloco patinhas-saldo-bloco">
        {!loading && !user && (
          <div className="patinhas-saldo cartao">
            <span className="patinhas-pata"><Paw size={44} /></span>
            <div>
              <h2>Entre para guardar suas Patinhas</h2>
              <p>Com uma conta suas Patinhas ficam salvas e você pode trocá-las quando assinar.</p>
            </div>
            <Link className="btn" to="/entrar?next=/patinhas">ENTRAR OU CRIAR CONTA</Link>
          </div>
        )}
        {user && error && <p className="erro-geral patinhas-erro" role="alert">{error}</p>}
        {user && !error && balance !== null && (
          <div className="patinhas-saldo cartao">
            <span className="patinhas-pata"><Paw size={44} /></span>
            <div>
              <p className="patinhas-rotulo">Você tem</p>
              <b className="patinhas-numero">{formatPatinhas(balance)}</b>
              <span className="patinhas-unidade"> Patinhas</span>
              {next ? (
                <div className="patinhas-meta">
                  <div className="patinhas-barra" role="progressbar" aria-valuemin={0} aria-valuemax={next.cost} aria-valuenow={balance} aria-label={`Caminho até ${next.name}`}>
                    <i style={{ width: `${Math.min(100, (balance / next.cost) * 100)}%` }} />
                  </div>
                  <p>Faltam <b>{formatPatinhas(next.cost - balance)}</b> para <b>{next.name}</b>.</p>
                </div>
              ) : (
                <p className="patinhas-meta">Você já pode trocar por qualquer vantagem!</p>
              )}
            </div>
            <div className="patinhas-acoes">
              <Link className="btn" to="/brincar">{playedToday ? 'JOGAR DE NOVO' : 'JOGAR E GANHAR'}</Link>
              <small>{playedToday ? 'Hoje você já ganhou as Patinhas do banho.' : `O banho de hoje rende ${R.perBath} Patinhas.`}</small>
            </div>
          </div>
        )}
      </section>

      <section className="bloco patinhas-ganhar">
        <Reveal as="h2" className="titulo">Como ganhar</Reveal>
        <div className="patinhas-grade">
          {EARN.map((e, i) => (
            <Reveal key={e.title} kind="pop" delay={i * 90} className="cartao patinhas-ganho">
              <b className="patinhas-valor"><Paw size={20} /> {e.value}</b>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="patinhas-nota">Você pode juntar até {formatPatinhas(R.monthlyCap)} Patinhas por mês jogando.</p>
      </section>

      <section className="bloco patinhas-trocar">
        <Reveal as="h2" className="titulo">Troque suas Patinhas</Reveal>
        <p className="patinhas-nota">
          As trocas são para quem tem assinatura ativa. {user && !hasSubscription && <Link to="/#planos">Conheça os planos</Link>}
        </p>
        <div className="patinhas-grade patinhas-premios">
          {REWARDS.map((r, i) => {
            const used = usedThisMonth(r.id)
            const missing = balance === null ? r.cost : Math.max(0, r.cost - balance)
            let state: string | null = null
            if (!user) state = 'Entre para trocar'
            else if (!hasSubscription) state = 'Só para assinantes'
            else if (used) state = 'Você já trocou esse mês'
            else if (missing > 0) state = `Faltam ${formatPatinhas(missing)}`
            return (
              <Reveal key={r.id} kind="pop" delay={i * 80} className="cartao patinhas-premio">
                <h3>{r.name}</h3>
                <p>{r.text}</p>
                <b className="patinhas-custo"><Paw size={18} /> {formatPatinhas(r.cost)}</b>
                {state ? (
                  <span className="patinhas-estado">{state}</span>
                ) : confirming === r.id ? (
                  <button className="btn amarelo" onClick={() => redeem(r.id)} disabled={busy === r.id}>
                    {busy === r.id ? 'TROCANDO...' : 'CONFIRMAR TROCA'}
                  </button>
                ) : (
                  <button className="btn" onClick={() => setConfirming(r.id)}>TROCAR</button>
                )}
              </Reveal>
            )
          })}
        </div>
      </section>

      {user && (redemptions.length > 0 || history.length > 0) && (
        <section className="bloco patinhas-historico">
          {redemptions.length > 0 && (
            <div>
              <h2>Minhas trocas</h2>
              <ul>
                {redemptions.map((r) => (
                  <li key={r.id} className="cartao">
                    <span>
                      <b>{findReward(r.recompensa)?.name}</b>
                      <small>{new Date(r.criadoEm).toLocaleDateString('pt-BR')}</small>
                    </span>
                    <span className={`selo ${r.status === 'disponivel' ? 'ativa' : 'cancelada'}`}>
                      {r.status === 'disponivel' ? 'Vale na próxima box' : 'Já usada'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {history.length > 0 && (
            <div>
              <h2>Últimos movimentos</h2>
              <ul>
                {history.map((m) => (
                  <li key={m.id} className="cartao">
                    <span>
                      <b>{MOVEMENT_LABELS[m.tipo]}</b>
                      <small>{new Date(m.criadoEm).toLocaleDateString('pt-BR')}</small>
                    </span>
                    <b className={m.valor > 0 ? 'ganho' : 'gasto'}>{m.valor > 0 ? '+' : ''}{formatPatinhas(m.valor)}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="bloco patinhas-regras">
        <h2>Regras</h2>
        <ul>
          <li>As Patinhas não valem dinheiro, não podem ser transferidas e não podem ser vendidas.</li>
          <li>Elas vencem se você ficar {R.expiryDays} dias sem ganhar nem trocar nenhuma.</li>
          <li>Descontos e frete grátis entram na próxima cobrança ou envio. Vale uma vantagem de desconto ou frete por mês, mais um mimo e uma doação.</li>
          <li>Um banho rende Patinhas por dia, e o minigame feito com ajuda do botão “Fazer essa etapa por mim” não conta.</li>
          <li>Podemos ajustar as regras, avisando você antes. Uso indevido, como tentar burlar os limites, cancela as Patinhas.</li>
        </ul>
        <p>Leia o texto completo nos <Link to="/termos#patinhas">Termos de uso</Link>.</p>
      </section>
    </>
  )
}
