import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PetAvatar } from '../components/PetAvatar'
import { BillingToggle, PawConfetti, PawField } from '../components/ui'
import { PLANS, findPlan, formatPrice, monthlyCents, parseBilling } from '../data/content'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Billing, Pet, PlanId, Subscription } from '../types'
import './account.css'

export function Subscribe() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [planId, setPlanId] = useState<PlanId>(findPlan(params.get('plano'))?.id ?? 'wow')
  const [billing, setBilling] = useState<Billing>(parseBilling(params.get('cobranca')))
  const [pets, setPets] = useState<Pet[] | null>(null)
  const [subs, setSubs] = useState<Subscription[]>([])
  const [petId, setPetId] = useState<number | null>(Number(params.get('pet')) || null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([api.listPets(user.id), api.listSubscriptions(user.id)])
      .then(([p, s]) => {
        setPets(p)
        setSubs(s)
        setPetId((current) => (p.some((pet) => pet.id === current) ? current : (p[0]?.id ?? null)))
      })
      .catch((err: Error) => setError(err.message))
  }, [user])

  if (!user) return null

  const plan = findPlan(planId)!
  const pet = pets?.find((p) => p.id === petId)
  const alreadyActive = subs.some((s) => s.petId === petId && s.status === 'ativa')

  const confirm = async () => {
    if (!pet || alreadyActive) return
    setBusy(true)
    setError('')
    try {
      await api.createSubscription({
        userId: user.id,
        petId: pet.id,
        planId,
        billing,
        status: 'ativa',
        createdAt: new Date().toISOString(),
      })
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const header = (
    <div className="pagina-topo">
      <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
      <h1>{done ? 'Bem-vindo ao clube!' : 'Quase lá!'}</h1>
      {!done && <p>Confira o plano e para qual pet é a box.</p>}
    </div>
  )

  if (done && pet) {
    return (
      <>
        {header}
        <section className="bloco">
          <PawConfetti />
          <div className="assinado cartao">
            <PetAvatar species={pet.species} look={pet.look} className="pulo" title={`Desenho de ${pet.name}`} />
            <h2>Assinatura confirmada!</h2>
            <p>A box do plano {plan.name} de {pet.name} já está na sua conta. Assinatura simulada: nada foi cobrado.</p>
            <Link className="btn" to="/conta">VER MINHA CONTA</Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {header}
      <section className="bloco assinar">
        <div className="assinar-grade">
          <div>
            <h2>1. Seu plano</h2>
            <BillingToggle value={billing} onChange={setBilling} />
            <div className="escolhas-planos">
              {PLANS.map((p) => (
                <button key={p.id} className="escolha-plano" aria-pressed={planId === p.id} onClick={() => setPlanId(p.id)}>
                  <strong>
                    {p.name}
                    {p.featured && <em>O MAIS ESCOLHIDO</em>}
                  </strong>
                  <span>
                    <s>De {formatPrice(p.listCents)}</s>
                    {formatPrice(monthlyCents(p, billing))}/mês
                  </span>
                </button>
              ))}
            </div>
            <h2>2. Seu pet</h2>
            {pets && pets.length === 0 ? (
              <div className="vazio cartao">
                <p>Crie seu pet para continuar.</p>
                <Link className="btn amarelo" to={`/crie-seu-pet?plano=${planId}&cobranca=${billing}`}>CRIAR MEU PET</Link>
              </div>
            ) : (
              <div className="escolhas-pets">
                {pets?.map((p) => (
                  <button key={p.id} className="escolha-pet" aria-pressed={petId === p.id} onClick={() => setPetId(p.id)}>
                    <PetAvatar species={p.species} look={p.look} title="" />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <aside className="resumo cartao">
            <span className="selo-promo">PROMOÇÃO</span>
            <h2>Resumo</h2>
            <div className="resumo-linha"><span>Plano</span><b>{plan.name}</b></div>
            <div className="resumo-linha"><span>Pet</span><b>{pet?.name ?? '—'}</b></div>
            <div className="resumo-linha"><span>Vem na box</span><b>{plan.items.join(', ')}</b></div>
            <div className="resumo-linha"><span>Cobrança</span><b>{billing === 'anual' ? `Anual (${plan.annualDiscount}% de desconto)` : 'Mensal'}</b></div>
            {billing === 'anual' && (
              <div className="resumo-linha"><span>Por ano</span><b>{formatPrice(monthlyCents(plan, billing) * 12)}</b></div>
            )}
            <div className="resumo-linha"><span>Frete</span><b>Cobrado à parte</b></div>
            <div className="resumo-linha"><span>Valor original</span><b><s>{formatPrice(plan.listCents)}/mês</s></b></div>
            <div className="resumo-linha resumo-desconto">
              <span>Desconto</span>
              <b>- {formatPrice(plan.listCents - monthlyCents(plan, billing))}/mês</b>
            </div>
            <div className="resumo-total"><span>Total</span><span>{formatPrice(monthlyCents(plan, billing))}/mês</span></div>
            {error && <p className="erro-geral" role="alert">{error}</p>}
            {alreadyActive && <p className="erro-geral" role="alert">{pet?.name} já tem uma assinatura ativa.</p>}
            <button className="btn" onClick={confirm} disabled={!pet || alreadyActive || busy}>
              {busy ? 'CONFIRMANDO...' : 'CONFIRMAR ASSINATURA'}
            </button>
            <p className="aviso-prototipo">Protótipo: assinatura simulada, sem pagamento.</p>
          </aside>
        </div>
      </section>
    </>
  )
}
