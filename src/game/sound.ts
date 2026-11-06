const SOUND_KEY = 'omp.som'
const SHOWER_LEVEL = 0.2
const DRYER_LEVEL = 0.26
const MOTOR_HZ = 118
const MOTOR_IDLE_HZ = 50

export type SoundKind = 'chuveiro' | 'secador' | null

export function isSoundOn() {
  return localStorage.getItem(SOUND_KEY) !== 'off'
}

export function saveSoundOn(on: boolean) {
  localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
}

interface Graph {
  ctx: AudioContext
  master: GainNode
  shower: GainNode
  dryer: GainNode
  motor: OscillatorNode
}

/** Sons sintetizados na hora a partir de ruído, sem nenhum arquivo para baixar. */
export class ToolSound {
  private graph: Graph | null = null
  private wanted: SoundKind = null
  private playing: SoundKind = null
  private on = isSoundOn()

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  /** Navegadores só liberam áudio depois de um gesto, então isto roda a cada toque. */
  unlock() {
    if (!this.graph) {
      this.graph = this.build()
      this.apply()
    }
    if (this.graph.ctx.state === 'suspended') void this.graph.ctx.resume()
  }

  play(kind: SoundKind) {
    this.wanted = kind
    this.apply()
  }

  setOn(on: boolean) {
    this.on = on
    if (this.graph) this.graph.master.gain.setTargetAtTime(on ? 1 : 0, this.graph.ctx.currentTime, 0.02)
  }

  destroy() {
    document.removeEventListener('visibilitychange', this.onVisibility)
    void this.graph?.ctx.close()
    this.graph = null
  }

  /** Com a aba escondida o jogo para de atualizar, e o som não pode ficar ligado sozinho. */
  private onVisibility = () => {
    if (!this.graph) return
    if (document.hidden) void this.graph.ctx.suspend()
    else void this.graph.ctx.resume()
  }

  private apply() {
    const graph = this.graph
    if (!graph || this.playing === this.wanted) return
    const now = graph.ctx.currentTime
    const previous = this.playing
    this.playing = this.wanted
    graph.shower.gain.setTargetAtTime(this.wanted === 'chuveiro' ? SHOWER_LEVEL : 0, now, this.wanted === 'chuveiro' ? 0.04 : 0.1)
    graph.dryer.gain.setTargetAtTime(this.wanted === 'secador' ? DRYER_LEVEL : 0, now, this.wanted === 'secador' ? 0.05 : 0.14)
    // O motor do secador acelera ao ligar e perde força ao desligar.
    if (this.wanted === 'secador') {
      graph.motor.frequency.setValueAtTime(MOTOR_IDLE_HZ, now)
      graph.motor.frequency.setTargetAtTime(MOTOR_HZ, now, 0.12)
    } else if (previous === 'secador') {
      graph.motor.frequency.setTargetAtTime(MOTOR_IDLE_HZ, now, 0.16)
    }
  }

  private build(): Graph {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = this.on ? 1 : 0
    master.connect(ctx.destination)

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const samples = buffer.getChannelData(0)
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    noise.start()

    const filter = (type: BiquadFilterType, frequency: number, q = 0.7) => {
      const node = ctx.createBiquadFilter()
      node.type = type
      node.frequency.value = frequency
      node.Q.value = q
      return node
    }
    const silent = () => {
      const node = ctx.createGain()
      node.gain.value = 0
      node.connect(master)
      return node
    }

    // Chuveiro: ruído agudo, com uma oscilação rápida que lembra água batendo.
    const shower = silent()
    const splatter = ctx.createGain()
    splatter.gain.value = 0.85
    noise.connect(filter('highpass', 900)).connect(filter('lowpass', 7500)).connect(splatter).connect(shower)
    const ripple = ctx.createOscillator()
    ripple.frequency.value = 11
    const rippleDepth = ctx.createGain()
    rippleDepth.gain.value = 0.15
    ripple.connect(rippleDepth).connect(splatter.gain)
    ripple.start()

    // Secador: sopro grave somado ao zumbido do motor.
    const dryer = silent()
    noise.connect(filter('bandpass', 1000, 0.5)).connect(dryer)
    const motor = ctx.createOscillator()
    motor.type = 'sawtooth'
    motor.frequency.value = MOTOR_IDLE_HZ
    const motorLevel = ctx.createGain()
    motorLevel.gain.value = 0.16
    motor.connect(filter('lowpass', 650)).connect(motorLevel).connect(dryer)
    motor.start()

    return { ctx, master, shower, dryer, motor }
  }
}
