import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PetAvatar } from '../components/PetAvatar'
import { PawField, Reveal, useToast } from '../components/ui'
import { findPlan, formatPrice, monthlyCents } from '../data/content'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Pet, Subscription } from '../types'
import './account.css'

export function Account() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [pets, setPets] = useState<Pet[] | null>(null)
  const [subs, setSubs] = useState<Subscription[]>([])
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([api.listPets(user.id), api.listSubscriptions(user.id)])
      .then(([p, s]) => {
        setPets(p)
        setSubs(s)
      })
      .catch((err: Error) => setError(err.message))
  }, [user])

  if (!user) return null

  const activeFor = (petId: number) => subs.some((s) => s.petId === petId && s.status === 'ativa')

  const removePet = async (pet: Pet) => {
    try {
      await api.deletePet(pet.id)
      setPets((list) => list?.filter((p) => p.id !== pet.id) ?? null)
      // O json-server apaga junto as assinaturas ligadas ao pet.
      setSubs((list) => list.filter((s) => s.petId !== pet.id))
      toast(`${pet.name} foi removido.`)
    } catch (err) {
      toast((err as Error).message)
    }
    setConfirming(null)
  }

  const cancelSub = async (sub: Subscription) => {
    try {
      const updated = await api.updateSubscription(sub.id, { status: 'cancelada' })
      setSubs((list) => list.map((s) => (s.id === sub.id ? updated : s)))
      toast('Assinatura cancelada.')
    } catch (err) {
      toast((err as Error).message)
    }
    setConfirming(null)
  }

  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>Oi, {user.name.split(' ')[0]}!</h1>
        <p>{user.email}</p>
      </div>

      {error && <p className="erro-geral conta-erro" role="alert">{error}</p>}

      <section className="bloco conta-bloco">
        <div className="conta-cabecalho">
          <h2>Meus pets</h2>
          <Link className="btn" to="/crie-seu-pet">+ NOVO PET</Link>
        </div>
        {pets && pets.length === 0 && (
          <div className="vazio cartao">
            <p>Você ainda não criou nenhum pet.</p>
            <Link className="btn amarelo" to="/crie-seu-pet">CRIAR MEU PET</Link>
          </div>
        )}
        <div className="pets-grade">
          {pets?.map((pet, i) => (
            <Reveal key={pet.id} kind="pop" delay={i * 90} className="pet-cartao cartao">
              <div className="pet-cartao-desenho">
                <PetAvatar species={pet.species} look={pet.look} title={`Desenho de ${pet.name}`} />
              </div>
              <h3>{pet.name}</h3>
              <p>
                {pet.species === 'dog' ? 'Cão' : 'Gato'}
                {pet.breed && ` · ${pet.breed}`} · {pet.age} · {pet.size}
              </p>
              {pet.allergies && <p className="alergias">Alergias: {pet.allergies}</p>}
              <div className="pet-cartao-acoes">
                {activeFor(pet.id) ? (
                  <span className="selo">Assinatura ativa</span>
                ) : (
                  <Link className="btn" to={`/assinar?pet=${pet.id}`}>ASSINAR</Link>
                )}
                <Link className="link-acao" to={`/brincar?pet=${pet.id}`}>Brincar</Link>
                <Link className="link-acao" to={`/crie-seu-pet?editar=${pet.id}`}>Editar</Link>
                {confirming === `pet-${pet.id}` ? (
                  <button className="link-acao perigo" onClick={() => removePet(pet)}>Confirmar remoção</button>
                ) : (
                  <button className="link-acao" onClick={() => setConfirming(`pet-${pet.id}`)}>Remover</button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bloco conta-bloco conta-assinaturas">
        <h2>Minhas assinaturas</h2>
        {subs.length === 0 && <p className="sem-itens">Nenhuma assinatura por aqui ainda.</p>}
        <ul className="assinaturas">
          {subs.map((sub) => {
            const plan = findPlan(sub.planId)
            const pet = pets?.find((p) => p.id === sub.petId)
            return (
              <li key={sub.id} className={`assinatura cartao ${sub.status}`}>
                <div>
                  <strong>{plan?.name ?? `Plano antigo: ${sub.planId}`}</strong>
                  <span>
                    Para {pet?.name ?? 'seu pet'} ·{' '}
                    {plan && `${formatPrice(monthlyCents(plan, sub.billing ?? 'mensal'))}/mês + frete · `}desde{' '}
                    {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className={`selo ${sub.status}`}>{sub.status === 'ativa' ? 'Ativa' : 'Cancelada'}</span>
                {sub.status === 'ativa' &&
                  (confirming === `sub-${sub.id}` ? (
                    <button className="link-acao perigo" onClick={() => cancelSub(sub)}>Confirmar cancelamento</button>
                  ) : (
                    <button className="link-acao" onClick={() => setConfirming(`sub-${sub.id}`)}>Cancelar</button>
                  ))}
              </li>
            )
          })}
        </ul>
        <button
          className="btn secundario sair"
          onClick={() => {
            logout()
            // Recarrega na home: navegar pelo router perderia para o redirecionamento de RequireAuth.
            window.location.assign('/')
          }}
        >
          Sair da conta
        </button>
      </section>
    </>
  )
}
