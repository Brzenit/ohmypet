import { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PetAvatar } from '../components/PetAvatar'
import { HealthStep, PersonalityStep, ProfileStep, PetResumo } from '../components/PetQuiz'
import { PawConfetti, PawField, useToast } from '../components/ui'
import { ACCESSORIES, BREEDS, FUR_COLORS, PATTERNS, TYPES, completeDetails, defaultLook, emptyProfile, summarizeAllergies, toggleAccessory } from '../data/petOptions'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Pet, PetLook, PetProfile, Species } from '../types'
import './create-pet.css'

const DRAFT_KEY = 'omp.petDraft'
type Step = 1 | 2 | 3 | 4
const STEPS = ['Seu pet', 'Saúde', 'Jeito de ser', 'Avatar']
type Tab = 'pelagem' | 'tipo' | 'acessorios'
const TABS: { id: Tab; label: string }[] = [
  { id: 'pelagem', label: 'Pelagem' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'acessorios', label: 'Acessórios' },
]

interface Draft {
  profile: PetProfile
  look: PetLook
  step: Step
}

function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Draft
    // Rascunhos de antes do questionário não têm `details`.
    const profile = { ...emptyProfile(), ...saved.profile, details: completeDetails(saved.profile.details) }
    return { ...saved, profile, step: (saved.step >= 1 && saved.step <= 4 ? saved.step : 1) as Step }
  } catch {
    return null
  }
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

function randomLook(species: Species): PetLook {
  const accessories = ACCESSORIES.filter(() => Math.random() < 0.35).reduce<string[]>(
    (selected, a) => toggleAccessory(selected, a.id),
    [],
  )
  return { fur: pick(FUR_COLORS).id, pattern: pick(PATTERNS).id, type: pick(TYPES[species]).id, accessories }
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="passos-pet" aria-label="Etapas">
      {STEPS.map((label, i) => {
        const n = i + 1
        return (
          <Fragment key={label}>
            {i > 0 && (
              <li className="linha" aria-hidden="true">
                <i style={{ width: step >= n ? '100%' : '0%' }} />
              </li>
            )}
            <li className={n === step ? 'atual' : n < step ? 'feito' : ''} aria-current={n === step ? 'step' : undefined}>
              <b>{n < step ? '✓' : n}</b> <span>{label}</span>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}

function CustomizeStep({
  profile,
  look,
  onChange,
  onBack,
  onSave,
  saving,
  error,
  isEdit,
  loggedIn,
}: {
  profile: PetProfile
  look: PetLook
  onChange: (l: PetLook) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
  error: string
  isEdit: boolean
  loggedIn: boolean
}) {
  const [tab, setTab] = useState<Tab>('pelagem')
  const [bounce, setBounce] = useState(0)
  const { species } = profile
  const update = (next: PetLook) => {
    onChange(next)
    setBounce((b) => b + 1)
  }

  return (
    <div className="personalizar cartao">
      <div className="palco">
        <PawField color="#ffff7b" spots={[[6, 10, 40, -16], [84, 18, 32, 14], [10, 72, 30, 18], [82, 68, 44, -10]]} />
        <PetAvatar key={bounce} species={species} look={look} className="pulo" title={`Seu pet ${profile.name}`} />
        <span className="plaquinha">{profile.name}</span>
      </div>

      <div className="cores" role="group" aria-label="Cor da pelagem">
        {FUR_COLORS.map((f) => (
          <button
            key={f.id}
            className="cor"
            style={{ background: f.color }}
            title={f.label}
            aria-label={f.label}
            aria-pressed={look.fur === f.id}
            onClick={() => update({ ...look, fur: f.id })}
          />
        ))}
      </div>

      <div className="abas" role="tablist" aria-label="Categorias">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <button className="surpresa" onClick={() => update(randomLook(species))}>🎲 Surpresa</button>
      </div>

      <div className="opcoes" role="tabpanel" key={tab}>
        {tab === 'pelagem' &&
          PATTERNS.map((p) => (
            <button key={p.id} className="opcao" aria-pressed={look.pattern === p.id} onClick={() => update({ ...look, pattern: p.id })}>
              <PetAvatar species={species} look={{ ...look, pattern: p.id, accessories: [] }} className="estatico" title="" />
              {p.label}
            </button>
          ))}
        {tab === 'tipo' &&
          TYPES[species].map((t) => (
            <button key={t.id} className="opcao" aria-pressed={look.type === t.id} onClick={() => update({ ...look, type: t.id })}>
              <PetAvatar species={species} look={{ ...look, type: t.id, accessories: [] }} className="estatico" title="" />
              {t.label}
            </button>
          ))}
        {tab === 'acessorios' &&
          ACCESSORIES.map((a) => (
            <button
              key={a.id}
              className="opcao"
              aria-pressed={look.accessories.includes(a.id)}
              onClick={() => update({ ...look, accessories: toggleAccessory(look.accessories, a.id) })}
            >
              <PetAvatar species={species} look={{ ...look, accessories: [a.id] }} className="estatico" title="" />
              {a.label}
            </button>
          ))}
      </div>

      {error && <p className="erro-geral" role="alert">{error}</p>}
      <div className="pet-acoes">
        <button className="btn secundario" onClick={onBack}>← Voltar</button>
        <button className="btn" onClick={onSave} disabled={saving}>
          {saving ? 'SALVANDO...' : isEdit ? 'SALVAR ALTERAÇÕES' : loggedIn ? 'SALVAR MEU PET' : 'ENTRAR E SALVAR'}
        </button>
      </div>
    </div>
  )
}

function Success({ pet, planQuery, bonus }: { pet: Pet; planQuery: string; bonus: number }) {
  return (
    <div className="pet-sucesso cartao">
      <PawConfetti />
      <div className="sucesso-desenho">
        <PetAvatar species={pet.species} look={pet.look} className="pulo" title={`Seu pet ${pet.name}`} />
      </div>
      <h2>{pet.name} ficou demais!</h2>
      {bonus > 0 && <p className="pet-bonus">+{bonus} Patinhas pelo seu novo pet!</p>}
      <p>Agora é só escolher o plano para receber a primeira box.</p>
      <div className="pet-acoes centro">
        <Link className="btn" to={`/assinar?pet=${pet.id}${planQuery && `&${planQuery}`}`}>ESCOLHER PLANO</Link>
        <Link className="btn secundario" to={`/brincar?pet=${pet.id}`}>Dar um banho</Link>
        <Link className="btn secundario" to="/conta">Ver minha conta</Link>
      </div>
    </div>
  )
}

export function CreatePet() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = Number(params.get('editar')) || null
  const plan = params.get('plano')
  const planQuery = plan ? `plano=${plan}&cobranca=${params.get('cobranca') ?? 'mensal'}` : ''

  const [draft] = useState(() => (editId ? null : loadDraft()))
  const [profile, setProfile] = useState<PetProfile>(draft?.profile ?? emptyProfile())
  const [look, setLook] = useState<PetLook>(draft?.look ?? defaultLook(draft?.profile.species ?? 'dog'))
  const [step, setStep] = useState<Step>(draft?.step ?? 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<Pet | null>(null)
  const [bonus, setBonus] = useState(0)

  useEffect(() => {
    if (!editId || authLoading) return
    if (!user) {
      navigate('/entrar', { replace: true })
      return
    }
    api
      .getPet(editId)
      .then((pet) => {
        if (pet.userId !== user.id) throw new Error('Pet não encontrado.')
        const { id: _id, userId: _userId, look: petLook, ...petProfile } = pet
        setProfile({ ...petProfile, details: completeDetails(petProfile.details) })
        setLook(petLook)
      })
      .catch(() => navigate('/conta', { replace: true }))
  }, [editId, user, authLoading, navigate])

  useEffect(() => {
    if (editId || saved) return
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ profile, look, step } satisfies Draft))
  }, [profile, look, step, editId, saved])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step, saved])

  const changeProfile = (next: PetProfile) => {
    if (next.species !== profile.species) {
      setLook((l) => ({ ...l, type: TYPES[next.species][0].id }))
      // Raça e perguntas específicas da outra espécie não valem mais.
      const breed = BREEDS[profile.species].includes(next.breed) ? '' : next.breed
      next = { ...next, breed, details: { ...next.details, extra: {} } }
    }
    setProfile(next)
  }

  const save = async () => {
    if (!user) {
      toast('Crie sua conta para salvar seu pet 🐾')
      const here = `/crie-seu-pet${planQuery && `?${planQuery}`}`
      navigate(`/entrar?next=${encodeURIComponent(here)}`)
      return
    }
    setSaving(true)
    setError('')
    try {
      const data = {
        ...profile,
        name: profile.name.trim(),
        allergies: summarizeAllergies(profile.details),
        userId: user.id,
        look,
      }
      const pet = editId ? await api.updatePet(editId, data) : await api.createPet(data)
      sessionStorage.removeItem(DRAFT_KEY)
      if (!editId) {
        // Pet novo rende Patinhas. Se o banco recusar, o pet já está salvo e fica tudo certo.
        setBonus(await api.patinhas.earn('pet', pet.id).then((r) => r.creditado, () => 0))
      }
      setSaved(pet)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[5, 20, 52, -18], [90, 16, 44, 16], [80, 62, 34, -10], [14, 64, 30, 14]]} />
        <h1>{editId ? `Editar ${profile.name}` : 'Crie seu pet'}</h1>
        <p>Um pet virtual com a cara do seu melhor amigo.</p>
      </div>
      <section className={`bloco criar-pet ${step < 4 && !saved ? 'larga' : ''}`}>
        {saved ? (
          <Success pet={saved} planQuery={planQuery} bonus={bonus} />
        ) : (
          <>
            <Stepper step={step} />
            <div key={step} className={`etapa ${step < 4 ? 'com-resumo' : ''}`}>
              {step === 1 && <ProfileStep profile={profile} onChange={changeProfile} onNext={() => setStep(2)} />}
              {step === 2 && <HealthStep profile={profile} onChange={changeProfile} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
              {step === 3 && <PersonalityStep profile={profile} onChange={changeProfile} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
              {step < 4 && <PetResumo profile={profile} look={look} />}
              {step === 4 && (
                <CustomizeStep
                  profile={profile}
                  look={look}
                  onChange={setLook}
                  onBack={() => setStep(3)}
                  onSave={save}
                  saving={saving}
                  error={error}
                  isEdit={!!editId}
                  loggedIn={!!user}
                />
              )}
            </div>
          </>
        )}
      </section>
    </>
  )
}
