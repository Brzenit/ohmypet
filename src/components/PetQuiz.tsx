import { useState, type FormEvent, type ReactNode } from 'react'
import {
  AGES,
  AGE_RANGES,
  ALLERGY_TYPES,
  BREEDS,
  DESTROYS,
  DIETS,
  HEALTH,
  NEUTERED,
  NO_ALLERGY,
  NO_DIET,
  NO_HEALTH,
  PLAY_STYLES,
  SEXES,
  SIZES,
  SIZE_HINTS,
  SOCIAL,
  SPECIES_QUESTIONS,
  TEMPERAMENTS,
  defaultLook,
  suggestAge,
  summarizeAllergies,
} from '../data/petOptions'
import type { PetDetails, PetLook, PetProfile, Species } from '../types'
import { PetAvatar } from './PetAvatar'

const today = () => new Date().toISOString().slice(0, 10)
const lower = (list: string[]) => list.map((v) => v.toLowerCase()).join(', ')

/* ---------- Campos reutilizáveis ---------- */

function Grupo({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="campo grupo">
      <legend>
        {legend}
        {hint && <span className="dica"> {hint}</span>}
      </legend>
      {children}
    </fieldset>
  )
}

/** Várias opções ao mesmo tempo. `exclusive` é a opção do tipo "Nenhum", que limpa as outras. */
function Fichas({
  legend,
  hint,
  options,
  value,
  onChange,
  max,
  exclusive,
}: {
  legend: string
  hint?: string
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  max?: number
  exclusive?: string
}) {
  const toggle = (option: string) => {
    if (value.includes(option)) return onChange(value.filter((v) => v !== option))
    if (exclusive && option === exclusive) return onChange([option])
    const base = exclusive ? value.filter((v) => v !== exclusive) : value
    if (max && base.length >= max) return
    onChange([...base, option])
  }
  const full = !!max && value.length >= max
  return (
    <Grupo legend={legend} hint={hint ?? (max ? `escolha até ${max}` : undefined)}>
      <div className="fichas">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value.includes(o)} disabled={full && !value.includes(o)} onClick={() => toggle(o)}>
            {o}
          </button>
        ))}
      </div>
    </Grupo>
  )
}

/** Uma opção só. Tocar de novo na escolhida desmarca, porque quase tudo aqui é opcional. */
function Escolha({
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string
  hint?: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Grupo legend={legend} hint={hint}>
      <div className="fichas">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(value === o ? '' : o)}>
            {o}
          </button>
        ))}
      </div>
    </Grupo>
  )
}

function Marcar({ checked, onChange, children }: { checked: boolean; onChange: (c: boolean) => void; children: ReactNode }) {
  return (
    <label className="marcar">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  )
}

function Acoes({ onBack, nextLabel = 'PRÓXIMO →' }: { onBack?: () => void; nextLabel?: string }) {
  return (
    <div className={`pet-acoes ${onBack ? '' : 'direita'}`}>
      {onBack && (
        <button type="button" className="btn secundario" onClick={onBack}>← Voltar</button>
      )}
      <button className="btn">{nextLabel}</button>
    </div>
  )
}

/* ---------- Cartão do pet ao lado do formulário ---------- */

export function PetResumo({ profile, look }: { profile: PetProfile; look: PetLook }) {
  const { details, species } = profile
  const care = summarizeAllergies(details)
  const meta = [species === 'dog' ? 'Cão' : 'Gato', profile.size, profile.age].filter(Boolean).join(' · ')
  const tags = [...details.temperament, ...details.playStyles].slice(0, 4)
  const name = profile.name.trim()
  return (
    <aside className="resumo-pet cartao" aria-label="Resumo do seu pet">
      <PetAvatar species={species} look={look} className="resumo-desenho" title={name ? `Seu pet ${name}` : 'Seu pet'} />
      <div className="resumo-texto">
        <strong className="resumo-nome">{name || 'Seu pet'}</strong>
        <span className="resumo-meta">{meta}</span>
      </div>
      {tags.length > 0 && (
        <div className="resumo-tags">
          {tags.map((t) => <span key={t}>{t}</span>)}
        </div>
      )}
      <p className="resumo-box">
        {details.playStyles.length > 0 || care
          ? [
              details.playStyles.length > 0 && `A box vem com brinquedos para ${lower(details.playStyles.slice(0, 2))}.`,
              care && `Cuidado com: ${care.toLowerCase()}.`,
            ].filter(Boolean).join(' ')
          : 'Responda as perguntas e a box vai ficar com a cara dele.'}
      </p>
    </aside>
  )
}

/* ---------- Etapa 1: seu pet ---------- */

export function ProfileStep({
  profile,
  onChange,
  onNext,
}: {
  profile: PetProfile
  onChange: (p: PetProfile) => void
  onNext: () => void
}) {
  const [nameError, setNameError] = useState('')
  const { details } = profile
  const set = <K extends keyof PetProfile>(key: K, value: PetProfile[K]) => onChange({ ...profile, [key]: value })
  const setDetails = (patch: Partial<PetDetails>) => {
    const next = { ...details, ...patch }
    const agePatch = 'ageYears' in patch || 'ageMonths' in patch || 'ageUnknown' in patch || 'ageRange' in patch
    const age = !next.ageManual && agePatch ? (suggestAge(next) ?? profile.age) : profile.age
    onChange({ ...profile, age, details: next })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!profile.name.trim()) {
      setNameError('Conta pra gente o nome do seu pet.')
      return
    }
    onNext()
  }

  const unknownAge = details.ageUnknown || details.birthdayUnknown

  return (
    <form className="pet-form cartao" onSubmit={submit} noValidate>
      <h2>Conte sobre seu pet</h2>
      <div className="especies" role="group" aria-label="Espécie">
        {(['dog', 'cat'] as Species[]).map((s) => (
          <button key={s} type="button" className="especie" aria-pressed={profile.species === s} onClick={() => set('species', s)}>
            <PetAvatar species={s} look={defaultLook(s)} className="estatico" title="" />
            {s === 'dog' ? 'Cão' : 'Gato'}
          </button>
        ))}
      </div>

      <div className="pet-campos">
        <label className="campo">
          Nome do pet
          <input
            value={profile.name}
            maxLength={24}
            placeholder="Ex.: Salem"
            aria-invalid={!!nameError}
            onChange={(e) => {
              setNameError('')
              set('name', e.target.value)
            }}
          />
          {nameError && <span className="erro">{nameError}</span>}
        </label>
        <label className="campo">
          Raça
          <input list="racas" value={profile.breed} placeholder="Ex.: Vira-lata (SRD)" onChange={(e) => set('breed', e.target.value)} />
          <datalist id="racas">
            {BREEDS[profile.species].map((b) => <option key={b} value={b} />)}
          </datalist>
        </label>

        <Escolha legend="Sexo" options={SEXES} value={details.sex} onChange={(sex) => setDetails({ sex })} />
        <Escolha legend="Castrado?" options={NEUTERED} value={details.neutered} onChange={(neutered) => setDetails({ neutered })} />

        <div className="campo inteiro">
          <span id="rot-porte">Porte</span>
          <div className="segmentado" role="group" aria-labelledby="rot-porte">
            {SIZES.map((s) => (
              <button key={s} type="button" aria-pressed={profile.size === s} onClick={() => set('size', s)}>
                {s}
                <small>{SIZE_HINTS[profile.species][s]}</small>
              </button>
            ))}
          </div>
        </div>

        <Grupo legend="Idade">
          <div className="idade">
            <label>
              <input
                type="number"
                min={0}
                max={30}
                inputMode="numeric"
                aria-label="Anos"
                disabled={details.ageUnknown}
                value={details.ageYears}
                onChange={(e) => setDetails({ ageYears: e.target.value })}
              />
              anos
            </label>
            <label>
              <input
                type="number"
                min={0}
                max={11}
                inputMode="numeric"
                aria-label="Meses"
                disabled={details.ageUnknown}
                value={details.ageMonths}
                onChange={(e) => setDetails({ ageMonths: e.target.value })}
              />
              meses
            </label>
          </div>
          <Marcar checked={details.ageUnknown} onChange={(ageUnknown) => setDetails({ ageUnknown })}>Não sei a idade exata</Marcar>
        </Grupo>
        <Grupo legend="Aniversário">
          <input
            type="date"
            aria-label="Data de aniversário"
            max={today()}
            disabled={details.birthdayUnknown}
            value={details.birthday}
            onChange={(e) => setDetails({ birthday: e.target.value })}
          />
          <Marcar checked={details.birthdayUnknown} onChange={(birthdayUnknown) => setDetails({ birthdayUnknown })}>Não sei a data</Marcar>
        </Grupo>

        {unknownAge && (
          <div className="aprox inteiro">
            <p>Sem problema! A gente se vira com um palpite.</p>
            {details.ageUnknown && (
              <Escolha legend="Mais ou menos quantos anos ele tem?" options={AGE_RANGES} value={details.ageRange} onChange={(ageRange) => setDetails({ ageRange })} />
            )}
            {details.birthdayUnknown && (
              <label className="campo">
                Quer escolher um dia para comemorar o aniversário dele?<span className="dica">opcional</span>
                <input type="date" value={details.celebrate} onChange={(e) => setDetails({ celebrate: e.target.value })} />
              </label>
            )}
          </div>
        )}

        <div className="campo inteiro">
          <span id="rot-fase">
            Fase da vida<span className="dica"> a gente sugere pela idade, mas você pode mudar</span>
          </span>
          <div className="segmentado" role="group" aria-labelledby="rot-fase">
            {AGES.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={profile.age === a}
                onClick={() => onChange({ ...profile, age: a, details: { ...details, ageManual: true } })}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <label className="campo inteiro">
          Quando ele chegou na sua casa?<span className="dica">opcional, a gente comemora essa data também</span>
          <input type="date" max={today()} value={details.adoptedAt} onChange={(e) => setDetails({ adoptedAt: e.target.value })} />
        </label>
      </div>
      <Acoes />
    </form>
  )
}

/* ---------- Etapa 2: saúde e alimentação ---------- */

export function HealthStep({
  profile,
  onChange,
  onNext,
  onBack,
}: {
  profile: PetProfile
  onChange: (p: PetProfile) => void
  onNext: () => void
  onBack: () => void
}) {
  const { details } = profile
  const setDetails = (patch: Partial<PetDetails>) => onChange({ ...profile, details: { ...details, ...patch } })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onNext()
  }
  return (
    <form className="pet-form cartao" onSubmit={submit} noValidate>
      <h2>Saúde e alimentação</h2>
      <p className="etapa-sub">Essas respostas decidem o que não pode entrar na box.</p>
      <div className="pet-campos">
        <div className="inteiro">
          <Fichas legend="Restrição alimentar" options={DIETS} value={details.diet} exclusive={NO_DIET} onChange={(diet) => setDetails({ diet })} />
        </div>
        <div className="inteiro">
          <Fichas legend="Alergias conhecidas" options={ALLERGY_TYPES} value={details.allergyTypes} exclusive={NO_ALLERGY} onChange={(allergyTypes) => setDetails({ allergyTypes })} />
        </div>
        <div className="inteiro">
          <Fichas legend="Problemas de saúde" options={HEALTH} value={details.health} exclusive={NO_HEALTH} onChange={(health) => setDetails({ health })} />
        </div>
        <label className="campo inteiro">
          Quer contar mais alguma coisa?<span className="dica">opcional</span>
          <textarea
            rows={2}
            value={details.healthNotes}
            placeholder="Outra alergia, doença ou cuidado especial"
            onChange={(e) => setDetails({ healthNotes: e.target.value })}
          />
        </label>
        <div className="campo inteiro">
          <span id="rot-remedio">Toma algum medicamento ou usa ração prescrita?</span>
          <div className="segmentado" role="group" aria-labelledby="rot-remedio">
            {['Não', 'Sim'].map((o) => (
              <button key={o} type="button" aria-pressed={details.medication === o} onClick={() => setDetails({ medication: o })}>{o}</button>
            ))}
          </div>
          {details.medication === 'Sim' && (
            <input
              aria-label="Qual medicamento ou ração"
              value={details.medicationName}
              placeholder="Qual?"
              onChange={(e) => setDetails({ medicationName: e.target.value })}
            />
          )}
        </div>
      </div>
      <p className="aviso">
        As respostas ajudam a escolher os itens, mas não substituem a orientação do veterinário.
      </p>
      <Acoes onBack={onBack} />
    </form>
  )
}

/* ---------- Etapa 3: jeito de ser ---------- */

export function PersonalityStep({
  profile,
  onChange,
  onNext,
  onBack,
}: {
  profile: PetProfile
  onChange: (p: PetProfile) => void
  onNext: () => void
  onBack: () => void
}) {
  const { details, species } = profile
  const setDetails = (patch: Partial<PetDetails>) => onChange({ ...profile, details: { ...details, ...patch } })
  const setExtra = (id: string, value: string[]) => setDetails({ extra: { ...details.extra, [id]: value } })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onNext()
  }
  return (
    <form className="pet-form cartao" onSubmit={submit} noValidate>
      <h2>Jeito de ser</h2>
      <p className="etapa-sub">Temperamento e brincadeiras favoritas. É aqui que a box fica a cara dele.</p>
      <div className="pet-campos">
        <div className="inteiro">
          <Fichas legend="Temperamento" options={TEMPERAMENTS} value={details.temperament} max={2} onChange={(temperament) => setDetails({ temperament })} />
        </div>
        <div className="campo inteiro">
          <span id="rot-energia">Nível de energia</span>
          <div className="segmentado" role="group" aria-labelledby="rot-energia">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-pressed={details.energy === n} onClick={() => setDetails({ energy: n })}>{n}</button>
            ))}
          </div>
          <span className="extremos"><span>Tranquilo</span><span>Muito agitado</span></span>
        </div>
        <Escolha legend="Destrói brinquedos com facilidade?" options={DESTROYS} value={details.destroys} onChange={(destroys) => setDetails({ destroys })} />
        <Escolha legend="Convive bem com outros animais e pessoas?" hint="opcional" options={SOCIAL} value={details.social} onChange={(social) => setDetails({ social })} />
        <div className="inteiro">
          <Fichas legend="Estilo de brinquedo favorito" options={PLAY_STYLES} value={details.playStyles} max={3} onChange={(playStyles) => setDetails({ playStyles })} />
        </div>

        <div className="bloco-especie inteiro">
          <h3>{species === 'dog' ? 'Só para cães' : 'Só para gatos'}</h3>
          {SPECIES_QUESTIONS[species].map((q) =>
            q.multi ? (
              <Fichas key={q.id} legend={q.label} options={q.options} value={details.extra[q.id] ?? []} onChange={(v) => setExtra(q.id, v)} />
            ) : (
              <Escolha
                key={q.id}
                legend={q.label}
                options={q.options}
                value={details.extra[q.id]?.[0] ?? ''}
                onChange={(v) => setExtra(q.id, v ? [v] : [])}
              />
            ),
          )}
          <label className="campo">
            Medida do pescoço<span className="dica">opcional, para a bandana e a coleira servirem direitinho</span>
            <span className="com-unidade">
              <input type="number" min={10} max={80} inputMode="numeric" value={details.neck} onChange={(e) => setDetails({ neck: e.target.value })} />
              cm
            </span>
          </label>
        </div>

        <label className="campo">
          Petiscos que ele ama<span className="dica">opcional</span>
          <input value={details.treatsLove} placeholder="Ex.: ossinho de frango" onChange={(e) => setDetails({ treatsLove: e.target.value })} />
        </label>
        <label className="campo">
          Petiscos que nunca devem vir<span className="dica">opcional</span>
          <input value={details.treatsNever} placeholder="Ex.: qualquer um com milho" onChange={(e) => setDetails({ treatsNever: e.target.value })} />
        </label>
        <label className="campo inteiro">
          Brinquedos que ele não curte ou que são perigosos<span className="dica">opcional</span>
          <input value={details.toysAvoid} placeholder="Ex.: engole pedacinhos de borracha" onChange={(e) => setDetails({ toysAvoid: e.target.value })} />
        </label>
      </div>
      <Acoes onBack={onBack} nextLabel="CRIAR O AVATAR →" />
    </form>
  )
}
