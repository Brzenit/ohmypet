import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PetAvatar, type PetExpression } from '../components/PetAvatar'
import { Paw, PawConfetti, PawField, useToast } from '../components/ui'
import { ACCESSORIES, FUR_COLORS, toggleAccessory } from '../data/petOptions'
import { Scenes, ToolArt, Tub, type SceneId, type ToolId } from '../game/art'
import { isSoundOn, saveSoundOn } from '../game/sound'
import { BathEngine, type EngineStep, type MessKind } from '../game/engine'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Pet, PetLook, Species } from '../types'
import './play.css'

const PATINHAS_KEY = 'omp.patinhas'
const POINTS_PER_STEP = 10
const TUB_TOP = 362

interface Step {
  id: string
  label: string
  hint: string
  done: string
  scene: SceneId
  tool?: ToolId
  mess?: MessKind
  pressedFace?: PetExpression
}

const STEPS: Step[] = [
  { id: 'molhar', label: 'Molhar', hint: 'Passe o chuveirinho e tire toda a sujeira.', done: 'Sujeira foi embora!', scene: 'banho', tool: 'chuveiro', mess: 'lama', pressedFace: 'fechado' },
  { id: 'ensaboar', label: 'Ensaboar', hint: 'Esfregue a esponja até encher de espuma.', done: 'Que espumaço!', scene: 'banho', tool: 'esponja', mess: 'aplicar-espuma', pressedFace: 'feliz' },
  { id: 'enxaguar', label: 'Enxaguar', hint: 'Agora use o chuveirinho para tirar a espuma.', done: 'Limpinho e sacudindo!', scene: 'banho', tool: 'chuveiro', mess: 'tirar-espuma', pressedFace: 'fechado' },
  { id: 'secar', label: 'Secar', hint: 'Passe o secador até não sobrar nenhuma gotinha.', done: 'Sequinho!', scene: 'secar', tool: 'secador', mess: 'gotas', pressedFace: 'feliz' },
  { id: 'pentear', label: 'Pentear', hint: 'Passe o pente para desembaraçar o pelo.', done: 'Olha esse brilho!', scene: 'pentear', tool: 'pente', mess: 'nos', pressedFace: 'feliz' },
  { id: 'visual', label: 'Visual', hint: 'Escolha os acessórios. Toque no pet para fazer carinho!', done: '', scene: 'visual' },
]

const engineStep = (step: Step): EngineStep | null =>
  step.tool && step.mess ? { tool: step.tool, mess: step.mess, limitY: step.scene === 'banho' ? TUB_TOP : undefined } : null

interface GamePet {
  id?: number
  name: string
  species: Species
  look: PetLook
}

const DEMO_PET: GamePet = {
  name: 'Pipoca',
  species: 'dog',
  look: { fur: 'caramelo', pattern: 'mancha', type: 'caida', accessories: [] },
}

const readPatinhas = () => Number(localStorage.getItem(PATINHAS_KEY)) || 0

function FinishCard({ pet, look, earned, total, onExit }: { pet: GamePet; look: PetLook; earned: number; total: number; onExit: () => void }) {
  const { toast } = useToast()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const saveLook = async () => {
    if (!pet.id) return
    setSaving(true)
    try {
      await api.updatePet(pet.id, { look })
      setSaved(true)
      toast(`Visual de ${pet.name} salvo 🐾`)
    } catch (err) {
      toast((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bloco jogo-fim">
      <PawConfetti />
      <div className="jogo-fim-cartao cartao">
        <span className="jogo-carimbo">DE BANHO TOMADO!</span>
        <div className="jogo-fim-pet"><PetAvatar species={pet.species} look={look} expression="feliz" className="pulo" title={`${pet.name} de banho tomado`} /></div>
        <h1>{pet.name} está brilhando!</h1>
        <p>Você ganhou <strong>{earned} Patinhas</strong> e já soma <strong>{total}</strong> no total.</p>
        <div className="jogo-fim-acoes">
          {pet.id ? (
            <button className="btn" onClick={saveLook} disabled={saving || saved}>
              {saved ? 'VISUAL SALVO!' : saving ? 'SALVANDO...' : 'SALVAR ESSE VISUAL'}
            </button>
          ) : (
            <Link className="btn" to="/crie-seu-pet">CRIAR MEU PET</Link>
          )}
          <button className="btn secundario" onClick={onExit}>Jogar de novo</button>
        </div>
        <Link className="jogo-fim-link" to="/#planos">Conhecer os planos da box</Link>
      </div>
    </section>
  )
}

function Game({ pet, onExit }: { pet: GamePet; onExit: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [earned, setEarned] = useState(0)
  const [total, setTotal] = useState(readPatinhas)
  const [look, setLook] = useState<PetLook>(pet.look)
  const [finished, setFinished] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [petted, setPetted] = useState(false)
  const [cheer, setCheer] = useState<{ key: number; text: string } | null>(null)

  const stageRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const hopRef = useRef<HTMLDivElement>(null)
  const leanRef = useRef<HTMLDivElement>(null)
  const messRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const toolRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<BathEngine | null>(null)
  // A barra é atualizada direto no DOM: arrastar não pode re-renderizar o jogo.
  const barRef = useRef<HTMLElement>(null)
  const meterRef = useRef<HTMLDivElement>(null)
  const pettedTimer = useRef<number>(undefined)
  const stepIndexRef = useRef(0)
  const [soundOn, setSoundOn] = useState(isSoundOn)

  const step = STEPS[stepIndex]
  const fur = FUR_COLORS.find((f) => f.id === pet.look.fur)

  const award = useCallback(() => {
    setEarned((v) => v + POINTS_PER_STEP)
    setTotal((v) => {
      const next = v + POINTS_PER_STEP
      localStorage.setItem(PATINHAS_KEY, String(next))
      return next
    })
  }, [])

  const onComplete = useCallback(() => {
    award()
    setStepIndex((current) => {
      const finishedStep = STEPS[current]
      setCheer({ key: current, text: `${finishedStep.done} +${POINTS_PER_STEP}` })
      engineRef.current?.celebrate(finishedStep.id === 'enxaguar')
      return current + 1
    })
  }, [award])

  useEffect(() => {
    if (finished) return
    const engine = new BathEngine({
      stage: stageRef.current!,
      box: boxRef.current!,
      hop: hopRef.current!,
      lean: leanRef.current!,
      mess: messRef.current!,
      fx: fxRef.current!,
      tool: toolRef.current!,
      species: pet.species,
      tangleColor: fur?.dark ? '#ffffee' : '#5813ad',
      onProgress: (percent) => {
        if (barRef.current) barRef.current.style.width = `${percent}%`
        if (meterRef.current) {
          meterRef.current.style.width = `${percent}%`
          meterRef.current.parentElement?.setAttribute('aria-valuenow', String(percent))
        }
      },
      onComplete,
      onPress: setPressed,
      onPetTap: () => {
        setPetted(true)
        clearTimeout(pettedTimer.current)
        pettedTimer.current = window.setTimeout(() => setPetted(false), 1100)
      },
    })
    engineRef.current = engine
    engine.setStep(engineStep(STEPS[stepIndexRef.current]))
    return () => {
      clearTimeout(pettedTimer.current)
      engine.destroy()
      engineRef.current = null
    }
  }, [pet.species, fur?.dark, onComplete, finished])

  useEffect(() => {
    if (stepIndexRef.current === stepIndex) return
    stepIndexRef.current = stepIndex
    engineRef.current?.setStep(engineStep(STEPS[stepIndex]))
  }, [stepIndex])

  useEffect(() => {
    if (!cheer) return
    const id = window.setTimeout(() => setCheer(null), 1500)
    return () => clearTimeout(id)
  }, [cheer])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    saveSoundOn(next)
    engineRef.current?.setSoundOn(next)
  }

  const finishGame = () => {
    award()
    setFinished(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (finished) return <FinishCard pet={pet} look={look} earned={earned} total={total} onExit={onExit} />

  const expression: PetExpression = petted ? 'feliz' : pressed && step.pressedFace ? step.pressedFace : 'normal'

  return (
    <section className="jogo">
      <header className="jogo-topo">
        <button className="jogo-sair" onClick={onExit}>← Trocar de pet</button>
        <div className="jogo-topo-direita">
          <button className="jogo-som" onClick={toggleSound} aria-pressed={soundOn} aria-label="Som do jogo" title={soundOn ? 'Desligar som' : 'Ligar som'}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9.500 V14.500 H8 L13 19 V5 L8 9.500 Z" fill="currentColor" />
              {soundOn ? <path d="M16.500 9 Q18.500 12 16.500 15 M19 6.500 Q23 12 19 17.500" /> : <path d="M17 9.500 L22 14.500 M22 9.500 L17 14.500" />}
            </svg>
          </button>
          <span className="jogo-placar" aria-label={`${total} Patinhas`}>
            <Paw size={20} /> <b key={total}>{total}</b>
          </span>
        </div>
      </header>

      <ol className="jogo-barra" aria-label="Etapas do jogo">
        {STEPS.map((s, i) => (
          <li key={s.id} className={i < stepIndex ? 'feito' : i === stepIndex ? 'atual' : ''} aria-current={i === stepIndex ? 'step' : undefined}>
            <span>{s.label}</span>
            {i === stepIndex && <i ref={barRef} />}
          </li>
        ))}
      </ol>

      <div className="jogo-grade">
        <div ref={stageRef} className={`jogo-palco ${step.tool ? 'com-ferramenta' : ''}`}>
          <Scenes active={step.scene} />
          <div ref={boxRef} className="jogo-pet">
            <div ref={hopRef} className="jogo-pet-salto">
              <div ref={leanRef} className="jogo-pet-corpo">
                <PetAvatar species={pet.species} look={look} expression={expression} title={`${pet.name} na hora do banho`} />
                <canvas ref={messRef} className="jogo-sujeira" aria-hidden="true" />
              </div>
            </div>
            <Tub visible={step.scene === 'banho'} />
          </div>
          <span className="plaquinha">{pet.name}</span>
          <canvas ref={fxRef} className="jogo-fx" aria-hidden="true" />
          <div ref={toolRef} className={`jogo-ferramenta ${step.tool ? '' : 'guardada'} ferramenta-${step.tool ?? 'nenhuma'}`} aria-hidden="true">
            {step.tool && <ToolArt key={step.tool} id={step.tool} />}
          </div>
          {cheer && <div key={cheer.key} className="jogo-vibra" aria-hidden="true">{cheer.text}</div>}
        </div>

        <div className="jogo-painel cartao">
          <h1 key={step.id}>{step.label}</h1>
          <p aria-live="polite">{step.hint}</p>
          {step.tool ? (
            <>
              <div className="jogo-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} aria-label="Progresso da etapa">
                <i ref={meterRef} />
              </div>
              <button className="jogo-ajuda" onClick={() => engineRef.current?.autoplay()}>
                Fazer essa etapa por mim
              </button>
            </>
          ) : (
            <>
              <div className="opcoes">
                {ACCESSORIES.map((a) => (
                  <button
                    key={a.id}
                    className="opcao"
                    aria-pressed={look.accessories.includes(a.id)}
                    onClick={() => {
                      setLook((current) => ({ ...current, accessories: toggleAccessory(current.accessories, a.id) }))
                      engineRef.current?.hopPet()
                    }}
                  >
                    <PetAvatar species={pet.species} look={{ ...look, accessories: [a.id] }} className="estatico" title="" />
                    {a.label}
                  </button>
                ))}
              </div>
              <button className="btn jogo-concluir" onClick={finishGame}>FICOU LINDO!</button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export function Play() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()
  const { toast } = useToast()
  const [pets, setPets] = useState<Pet[]>([])
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState<GamePet | null>(null)
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setReady(true)
      return
    }
    api
      .listPets(user.id)
      .then((list) => {
        setPets(list)
        const wanted = list.find((p) => p.id === Number(params.get('pet')))
        if (wanted) setPlaying(wanted)
      })
      .catch((err: Error) => toast(err.message))
      .finally(() => setReady(true))
    // A lista só precisa carregar quando a sessão muda; o ?pet= vale para a chegada na página.
  }, [user, loading])

  if (playing) {
    return (
      <Game
        key={round}
        pet={playing}
        onExit={() => {
          setPlaying(null)
          setRound((r) => r + 1)
        }}
      />
    )
  }

  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>Hora do banho!</h1>
        <p>Dê banho, seque, penteie e escolha o visual. Cada etapa vale Patinhas.</p>
      </div>
      <section className="bloco jogo-escolha">
        <h2>Quem vai para o banho?</h2>
        {ready && (
          <div className="escolhas-pets">
            {pets.map((p) => (
              <button key={p.id} className="escolha-pet" onClick={() => setPlaying(p)}>
                <PetAvatar species={p.species} look={p.look} title="" />
                {p.name}
              </button>
            ))}
            <button className="escolha-pet" onClick={() => setPlaying(DEMO_PET)}>
              <PetAvatar species={DEMO_PET.species} look={DEMO_PET.look} title="" />
              {DEMO_PET.name}
              <small>Pet de exemplo</small>
            </button>
          </div>
        )}
        {ready && pets.length === 0 && (
          <p className="jogo-convite">
            Quer jogar com a cara do seu melhor amigo? <Link to="/crie-seu-pet">Crie seu pet</Link>.
          </p>
        )}
      </section>
    </>
  )
}
