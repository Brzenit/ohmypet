import { BODY_PATH, headPath } from '../components/PetAvatar'
import type { Species } from '../types'
import type { ToolId } from './art'
import { ToolSound } from './sound'

export type MessKind = 'lama' | 'aplicar-espuma' | 'tirar-espuma' | 'gotas' | 'nos'

export interface EngineStep {
  mess: MessKind
  tool: ToolId
  /** Abaixo desta altura a banheira cobre o pet, então não há o que limpar. */
  limitY?: number
}

interface EngineOptions {
  stage: HTMLElement
  box: HTMLElement
  hop: HTMLElement
  lean: HTMLElement
  mess: HTMLCanvasElement
  fx: HTMLCanvasElement
  tool: HTMLElement
  species: Species
  tangleColor: string
  onProgress: (percent: number) => void
  onComplete: () => void
  onPress: (pressed: boolean) => void
  onPetTap: () => void
}

type ParticleKind = 'agua' | 'jato' | 'filete' | 'onda' | 'nevoa' | 'vapor' | 'bolha' | 'ar' | 'redemoinho' | 'estrela' | 'coracao' | 'lama' | 'pelo'
type Surface = 'pet' | 'banheira' | 'chao'

interface Particle {
  kind: ParticleKind
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  life: number
  maxLife: number
  size: number
  spin: number
  angle: number
  color: string
  /** Altura, no palco, em que a partícula bate em algo e some. */
  impactY?: number
  surface?: Surface
}

const PET_WIDTH = 420
const PET_HEIGHT = 530
const PET_TOP = -60
const MESS_SCALE = 2
const BRUSH = 46
const CELL = 18
// Não exige limpar cada cantinho: o final da fase não vira caça ao último ponto.
const COMPLETION = 0.9
const MAX_PARTICLES = 360
const TOUCH_LIFT = 44
const STAR_COLORS = ['#ffff7b', '#ff7af6', '#ffffee', '#907aff']
// Largura do viewBox e centro dos desenhos em ToolArt, para achar o bico na tela.
const TOOL_ART_WIDTH = 220
const SHOWER_CENTER = { x: 20, y: -30 }
const DRYER_CENTER = { x: 0, y: 20 }
const TUB_LEFT = 16
const TUB_RIGHT = 404
const TUB_RIM = 358

const random = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared ? clamp(((px - ax) * dx + (py - ay) * dy) / lengthSquared, 0, 1) : 0
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

export class BathEngine {
  private o: EngineOptions
  private mctx: CanvasRenderingContext2D
  private fctx: CanvasRenderingContext2D
  private clip: Path2D
  // Com movimento reduzido, o pet e a ferramenta ficam quietos. Água e ar continuam:
  // são a resposta ao gesto de quem joga e sem eles a fase parece não funcionar.
  private calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private step: EngineStep | null = null
  private cells: { x: number; y: number }[] = []
  private done = new Set<number>()
  private finished = false
  private pressed = false
  private hovering = false
  private auto: { points: [number, number][]; index: number } | null = null
  private last: { x: number; y: number } | null = null
  private target = { x: 0, y: 0 }
  private tool = { x: 0, y: 0, tilt: 0 }
  private lean = 0
  private leanVelocity = 0
  private particles: Particle[] = []
  private fxDirty = false
  private raf = 0
  private previous = 0
  private milestone = 0
  private observer: ResizeObserver
  private eyes = { x: 0, y: 0 }
  private m = { left: 0, top: 0, scale: 1, toolWidth: 110 }
  /** O chuveiro e o secador ficam afastados do ponto de trabalho, para o efeito aparecer. */
  private rig = 0
  private drawn = { x: 0, y: 0 }
  private flow = 0
  private carry = { jato: 0, nevoa: 0, ar: 0, redemoinho: 0, pelo: 0, pingo: 0 }
  private dripping = 0
  private headTurn = 0
  private sound = new ToolSound()

  constructor(options: EngineOptions) {
    this.o = options
    this.mctx = options.mess.getContext('2d')!
    this.fctx = options.fx.getContext('2d')!
    options.mess.width = PET_WIDTH * MESS_SCALE
    options.mess.height = PET_HEIGHT * MESS_SCALE
    this.mctx.setTransform(MESS_SCALE, 0, 0, MESS_SCALE, 0, -PET_TOP * MESS_SCALE)
    this.clip = new Path2D()
    this.clip.addPath(new Path2D(BODY_PATH))
    this.clip.addPath(new Path2D(headPath(options.species)))

    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(options.stage)
    this.resize()
    this.tool = { ...this.restPoint(), tilt: 0 }

    const { stage } = options
    stage.addEventListener('pointerdown', this.onDown)
    stage.addEventListener('pointermove', this.onMove)
    stage.addEventListener('pointerup', this.onUp)
    stage.addEventListener('pointercancel', this.onUp)
    stage.addEventListener('pointerleave', this.onLeave)
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.sound.destroy()
    this.observer.disconnect()
    const { stage } = this.o
    stage.removeEventListener('pointerdown', this.onDown)
    stage.removeEventListener('pointermove', this.onMove)
    stage.removeEventListener('pointerup', this.onUp)
    stage.removeEventListener('pointercancel', this.onUp)
    stage.removeEventListener('pointerleave', this.onLeave)
  }

  /** Troca de fase sem soltar a ferramenta: quem está arrastando continua arrastando. */
  setStep(step: EngineStep | null) {
    this.step = step
    this.finished = false
    this.done.clear()
    this.milestone = 0
    this.auto = null
    this.buildCells()
    this.paint()
    this.o.mess.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' })
    this.o.onProgress(0)
  }

  /** Faz a etapa sozinho, varrendo o pet, para quem não consegue ou não quer arrastar. */
  autoplay() {
    if (!this.step || this.finished) return
    this.sound.unlock()
    const limit = this.step.limitY ?? 450
    const points: [number, number][] = []
    let left = true
    for (let y = 70; y <= limit + 30; y += 40) {
      points.push(left ? [70, y] : [340, y], left ? [340, y] : [70, y])
      left = !left
    }
    this.auto = { points, index: 0 }
    this.last = null
  }

  setSoundOn(on: boolean) {
    this.sound.setOn(on)
    if (on) this.sound.unlock()
  }

  hopPet(kind: 'pulo' | 'sacudir' = 'pulo') {
    if (this.calm) return
    const frames =
      kind === 'sacudir'
        ? [-7, 7, -6, 6, -4, 4, -2, 0].map((deg) => ({ transform: `rotate(${deg}deg)` }))
        : [
            { transform: 'translateY(0) scale(1, 1)' },
            { transform: 'translateY(4%) scale(1.08, .9)', offset: 0.18 },
            { transform: 'translateY(-11%) scale(.95, 1.06)', offset: 0.5 },
            { transform: 'translateY(2%) scale(1.05, .95)', offset: 0.82 },
            { transform: 'translateY(0) scale(1, 1)' },
          ]
    this.o.hop.animate(frames, { duration: kind === 'sacudir' ? 620 : 560, easing: 'ease-out' })
  }

  /** Comemoração da fase: acontece por cima do jogo, sem impedir o próximo gesto. */
  celebrate(shake: boolean) {
    const center = this.toStage(200, 170)
    for (let i = 0; i < 16; i++) {
      const angle = random(0, Math.PI * 2)
      const speed = random(90, 300)
      this.spawn(i % 3 === 0 ? 'coracao' : 'estrela', center.x, center.y, Math.cos(angle) * speed, Math.sin(angle) * speed - 80, {
        gravity: 260,
        life: random(0.6, 1.1),
        size: random(9, 17),
        color: STAR_COLORS[i % STAR_COLORS.length],
      })
    }
    if (shake) {
      for (let i = 0; i < 34; i++) {
        const angle = random(0, Math.PI * 2)
        const speed = random(180, 480)
        this.spawn('agua', center.x, center.y + 60, Math.cos(angle) * speed, Math.sin(angle) * speed - 60, { gravity: 900, life: random(0.4, 0.8), size: random(3, 7) })
      }
    }
    this.hopPet(shake ? 'sacudir' : 'pulo')
  }

  hearts() {
    const center = this.toStage(200, 90)
    for (let i = 0; i < 6; i++) {
      this.spawn('coracao', center.x + random(-50, 50), center.y, random(-30, 30), random(-180, -90), { gravity: -20, life: random(0.8, 1.3), size: random(10, 18), color: '#ff7af6' })
    }
  }

  private resize() {
    const { stage, fx } = this.o
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    fx.width = stage.clientWidth * ratio
    fx.height = stage.clientHeight * ratio
    this.fctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    this.measure()
    if (!this.pressed && !this.hovering) this.target = this.restPoint()
  }

  private measure() {
    const stage = this.o.stage.getBoundingClientRect()
    const box = this.o.box.getBoundingClientRect()
    this.m = { left: box.left - stage.left, top: box.top - stage.top, scale: box.width / PET_WIDTH, toolWidth: this.o.tool.offsetWidth }
  }

  private scale() {
    return this.m.scale
  }

  private restPoint() {
    const { stage } = this.o
    const size = this.o.tool.offsetWidth || 110
    return { x: stage.clientWidth - size * 0.62, y: size * 0.62 }
  }

  private toStage(x: number, y: number) {
    const { left, top, scale } = this.m
    return { x: left + x * scale, y: top + (y - PET_TOP) * scale }
  }

  private toPet(stageX: number, stageY: number) {
    const { left, top, scale } = this.m
    return { x: (stageX - left) / scale, y: (stageY - top) / scale + PET_TOP }
  }

  private stagePoint(e: PointerEvent) {
    const rect = this.o.stage.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top - (e.pointerType === 'touch' ? TOUCH_LIFT : 0) }
  }

  private onDown = (e: PointerEvent) => {
    this.sound.unlock()
    const point = this.stagePoint(e)
    if (!this.step) {
      const pet = this.toPet(e.clientX - this.o.stage.getBoundingClientRect().left, e.clientY - this.o.stage.getBoundingClientRect().top)
      if (this.mctx.isPointInPath(this.clip, pet.x * MESS_SCALE, (pet.y - PET_TOP) * MESS_SCALE)) {
        this.hearts()
        this.hopPet()
        this.o.onPetTap()
      }
      return
    }
    this.auto = null
    this.o.stage.setPointerCapture(e.pointerId)
    this.pressed = true
    this.target = point
    this.last = null
    this.applyAt(point.x, point.y)
    this.o.onPress(true)
  }

  private onMove = (e: PointerEvent) => {
    if (!this.step) return
    const point = this.stagePoint(e)
    if (this.pressed) {
      this.target = point
      const events = e.getCoalescedEvents?.() ?? []
      if (events.length > 1) {
        const rect = this.o.stage.getBoundingClientRect()
        for (const c of events) this.applyAt(c.clientX - rect.left, c.clientY - rect.top - (e.pointerType === 'touch' ? TOUCH_LIFT : 0))
      } else {
        this.applyAt(point.x, point.y)
      }
    } else if (e.pointerType === 'mouse' && !this.auto) {
      this.hovering = true
      this.target = point
    }
  }

  private onUp = () => {
    // No toque, o navegador só considera gesto quando o dedo sai da tela.
    this.sound.unlock()
    if (!this.pressed) return
    this.pressed = false
    this.last = null
    this.target = this.hovering ? this.target : this.restPoint()
    this.o.onPress(false)
  }

  private onLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || this.pressed) return
    this.hovering = false
    this.target = this.restPoint()
  }

  private applyAt(stageX: number, stageY: number) {
    const pet = this.toPet(stageX, stageY)
    const from = this.last ?? pet
    this.scrub(from.x, from.y, pet.x, pet.y)
    this.last = pet
  }

  private buildCells() {
    this.cells = []
    if (!this.step) return
    const limit = this.step.limitY ?? Infinity
    const covered = this.step.mess !== 'nos'
    for (let y = PET_TOP; y < PET_TOP + PET_HEIGHT; y += CELL) {
      for (let x = 0; x < PET_WIDTH; x += CELL) {
        if (y >= limit) continue
        if (!this.mctx.isPointInPath(this.clip, x * MESS_SCALE, (y - PET_TOP) * MESS_SCALE)) continue
        if (covered && this.inFace(x, y)) continue
        this.cells.push({ x, y })
      }
    }
  }

  private inFace(x: number, y: number) {
    return ((x - 200) / 84) ** 2 + ((y - 180) / 58) ** 2 < 1
  }

  private paint() {
    const ctx = this.mctx
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, PET_WIDTH * MESS_SCALE, PET_HEIGHT * MESS_SCALE)
    ctx.restore()
    if (!this.step) return
    ctx.save()
    ctx.clip(this.clip)
    switch (this.step.mess) {
      case 'lama':
        ctx.fillStyle = 'rgba(125, 90, 50, .42)'
        ctx.fillRect(0, PET_TOP, PET_WIDTH, PET_HEIGHT)
        for (let i = 0; i < 46; i++) this.blob(random(90, 310), random(70, 440), random(12, 26))
        break
      case 'tirar-espuma':
        ctx.fillStyle = 'rgba(255, 255, 255, .72)'
        ctx.fillRect(0, PET_TOP, PET_WIDTH, PET_HEIGHT)
        for (let i = 0; i < 90; i++) this.bubble(random(90, 310), random(70, 440), random(10, 22))
        break
      case 'gotas':
        ctx.fillStyle = 'rgba(70, 150, 225, .32)'
        ctx.fillRect(0, PET_TOP, PET_WIDTH, PET_HEIGHT)
        for (let i = 0; i < 34; i++) this.drop(random(90, 310), random(70, 440), random(0.7, 1.2))
        break
      case 'nos':
        ctx.fillStyle = this.o.tangleColor === '#5813ad' ? 'rgba(88, 19, 173, .1)' : 'rgba(255, 255, 238, .12)'
        ctx.fillRect(0, PET_TOP, PET_WIDTH, PET_HEIGHT)
        for (let i = 0; i < 48; i++) this.tangle(random(90, 310), random(70, 440))
        break
      default:
        break
    }
    ctx.restore()
    if (this.step.mess !== 'nos' && this.step.mess !== 'aplicar-espuma') {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.ellipse(200, 180, 84, 58, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  private blob(x: number, y: number, r: number) {
    const ctx = this.mctx
    ctx.fillStyle = '#6f4e2a'
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.74, random(0, 3), 0, Math.PI * 2)
    ctx.ellipse(x + r * 0.8, y - r * 0.5, r * 0.3, r * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private bubble(x: number, y: number, r: number) {
    const ctx = this.mctx
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.lineWidth = 2.500
    ctx.strokeStyle = '#b9a9ff'
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.2, 0, Math.PI * 2)
    ctx.fillStyle = '#d9d0ff'
    ctx.fill()
  }

  private drop(x: number, y: number, s: number) {
    const ctx = this.mctx
    ctx.beginPath()
    ctx.moveTo(x, y - 15 * s)
    ctx.bezierCurveTo(x + 9 * s, y - 3 * s, x + 12 * s, y + 3 * s, x + 12 * s, y + 8 * s)
    ctx.arc(x, y + 8 * s, 12 * s, 0, Math.PI)
    ctx.bezierCurveTo(x - 12 * s, y + 3 * s, x - 9 * s, y - 3 * s, x, y - 15 * s)
    ctx.fillStyle = '#8fdcff'
    ctx.strokeStyle = '#5813ad'
    ctx.lineWidth = 3
    ctx.fill()
    ctx.stroke()
  }

  private tangle(x: number, y: number) {
    const ctx = this.mctx
    ctx.beginPath()
    ctx.moveTo(x - 20, y + 6)
    for (let i = 0; i < 5; i++) ctx.lineTo(x - 12 + i * 9, y + (i % 2 ? 7 : -11) + random(-3, 3))
    ctx.strokeStyle = this.o.tangleColor
    ctx.lineWidth = 5.500
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  private scrub(ax: number, ay: number, bx: number, by: number) {
    if (!this.step || this.finished) return
    const ctx = this.mctx
    if (this.step.mess === 'aplicar-espuma') {
      const distance = Math.hypot(bx - ax, by - ay)
      const stamps = Math.max(1, Math.ceil(distance / 16))
      ctx.save()
      ctx.clip(this.clip)
      for (let i = 0; i <= stamps; i++) {
        const t = i / stamps
        for (let n = 0; n < 2; n++) this.bubble(ax + (bx - ax) * t + random(-30, 30), ay + (by - ay) * t + random(-30, 30), random(10, 21))
      }
      ctx.restore()
    } else {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineCap = 'round'
      ctx.lineWidth = BRUSH * 2
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx + 0.01, by)
      ctx.stroke()
      ctx.restore()
    }
    let changed = false
    this.cells.forEach((cell, i) => {
      if (!this.done.has(i) && segmentDistance(cell.x, cell.y, ax, ay, bx, by) <= BRUSH) {
        this.done.add(i)
        changed = true
      }
    })
    this.scrubParticles(bx, by, changed)
    if (!changed) return
    const percent = Math.min(100, Math.round((this.done.size / Math.max(1, this.cells.length * COMPLETION)) * 100))
    this.o.onProgress(percent)
    if (percent >= this.milestone + 34) {
      this.milestone = percent
      this.hearts()
    }
    if (percent >= 100) {
      this.finished = true
      this.auto = null
      this.o.onComplete()
    }
  }

  private scrubParticles(x: number, y: number, productive: boolean) {
    if (!this.step) return
    const { x: sx, y: sy } = this.toStage(x, y)
    if (this.step.mess === 'gotas' && productive) {
      // As gotas voam com o vento e viram vapor.
      const { dir } = this.dryerAim()
      for (let i = 0; i < 2; i++) {
        this.spawn('agua', sx + random(-30, 30), sy + random(-30, 30), dir.x * random(220, 420), dir.y * 200 + random(-90, 20), { gravity: 420, life: random(0.35, 0.6), size: random(2.5, 5.5) })
      }
      this.spawn('vapor', sx + random(-24, 24), sy + random(-24, 24), dir.x * 40, random(-90, -50), { life: random(0.6, 1), size: random(9, 15) })
    } else if (this.step.mess === 'lama' && productive) {
      for (let i = 0; i < 3; i++) this.spawn('lama', sx, sy, random(-160, 160), random(-180, -30), { gravity: 800, life: random(0.3, 0.6), size: random(2, 5), color: '#6f4e2a' })
    } else if (this.step.mess === 'aplicar-espuma') {
      this.spawn('bolha', sx + random(-20, 20), sy + random(-20, 20), random(-30, 30), random(-110, -40), { gravity: -30, life: random(0.6, 1.2), size: random(4, 11) })
    } else if (this.step.mess === 'nos' && productive) {
      this.spawn('estrela', sx + random(-26, 26), sy + random(-22, 22), random(-30, 30), random(-70, -20), { gravity: 0, life: random(0.45, 0.85), size: random(7, 14), color: STAR_COLORS[Math.floor(random(0, 4))] })
      this.spawn('pelo', sx, sy, random(-120, 120), random(-60, 40), { gravity: 300, life: 0.5, size: random(6, 11), color: this.o.tangleColor })
    }
  }

  private spawn(kind: ParticleKind, x: number, y: number, vx: number, vy: number, extra: { gravity?: number; life?: number; size?: number; color?: string; angle?: number; impactY?: number; surface?: Surface }) {
    if (this.particles.length >= MAX_PARTICLES) return
    const life = extra.life ?? 0.7
    this.particles.push({
      kind, x, y, vx, vy,
      gravity: extra.gravity ?? 0,
      life,
      maxLife: life,
      size: extra.size ?? 5,
      spin: random(-4, 4),
      angle: extra.angle ?? random(0, 6),
      color: extra.color ?? '#7cd8ff',
      impactY: extra.impactY,
      surface: extra.surface,
    })
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.previous) / 1000 || 0.016)
    this.previous = now
    this.measure()
    this.runAutoplay()
    this.updateFlow(dt)
    this.moveTool(now, dt)
    this.moveLean(now, dt)
    this.lookAtTool()
    this.emitFromTool(dt)
    this.drawParticles(now, dt)
    this.raf = requestAnimationFrame(this.tick)
  }

  private runAutoplay() {
    const auto = this.auto
    if (!auto) return
    const [tx, ty] = auto.points[auto.index]
    const here = this.last ?? this.toPet(this.tool.x, this.tool.y)
    const distance = Math.hypot(tx - here.x, ty - here.y)
    const stride = 30
    if (distance <= stride) {
      auto.index += 1
      this.scrub(here.x, here.y, tx, ty)
      this.last = { x: tx, y: ty }
      if (auto.index >= auto.points.length) {
        this.auto = null
        this.last = null
        if (!this.finished) this.fillRemaining()
      }
    } else {
      const nx = here.x + ((tx - here.x) / distance) * stride
      const ny = here.y + ((ty - here.y) / distance) * stride
      this.scrub(here.x, here.y, nx, ny)
      this.last = { x: nx, y: ny }
    }
    if (this.auto && this.last) this.target = this.toStage(this.last.x, this.last.y)
    else if (!this.pressed) this.target = this.restPoint()
  }

  private fillRemaining() {
    this.cells.forEach((_, i) => this.done.add(i))
    this.finished = true
    this.o.onProgress(100)
    this.o.onComplete()
  }

  private moveTool(now: number, dt: number) {
    const engaged = this.pressed || this.hovering || !!this.auto
    const follow = this.calm ? 1 : 1 - Math.exp(-dt * (engaged ? 34 : 7))
    const previousX = this.tool.x
    this.tool.x += (this.target.x - this.tool.x) * follow
    this.tool.y += (this.target.y - this.tool.y) * follow
    const velocity = (this.tool.x - previousX) / Math.max(dt, 0.001)
    const wantTilt = engaged ? clamp(velocity * 0.02, -22, 22) : Math.sin(now / 420) * 7
    this.tool.tilt += (wantTilt - this.tool.tilt) * (this.calm ? 1 : 0.22)
    const bob = engaged || this.calm ? 0 : Math.sin(now / 300) * 6
    const lift = this.pressed ? 1.08 : 1
    const tool = this.step?.tool
    const wantRig = engaged && (tool === 'chuveiro' || tool === 'secador') ? 1 : 0
    this.rig += (wantRig - this.rig) * (this.calm ? 1 : 1 - Math.exp(-dt * 14))
    const unit = this.m.toolWidth / TOOL_ART_WIDTH
    const offset = tool === 'secador' ? { x: 160 * unit, y: 20 * unit } : tool === 'chuveiro' ? { x: 0, y: -128 * unit } : { x: 0, y: 0 }
    // A ferramenta ligada treme um pouco, como a de verdade.
    const buzz = this.calm ? 0 : this.flow * (tool === 'secador' ? 1.3 : 0.6)
    this.drawn = {
      x: this.tool.x + offset.x * this.rig,
      y: this.tool.y + offset.y * this.rig + bob,
    }
    this.o.tool.style.transform = `translate3d(${this.drawn.x + random(-buzz, buzz)}px, ${this.drawn.y + random(-buzz, buzz)}px, 0) translate(-50%, -50%) rotate(${this.tool.tilt}deg) scale(${lift})`
  }

  private updateFlow(dt: number) {
    const tool = this.step?.tool
    const running = (this.pressed || !!this.auto) && (tool === 'chuveiro' || tool === 'secador')
    const wasOn = this.flow > 0.5
    this.flow += ((running ? 1 : 0) - this.flow) * (1 - Math.exp(-dt * (running ? 14 : 9)))
    if (wasOn && !running && tool === 'chuveiro') this.dripping = 0.8
    this.o.tool.classList.toggle('ligada', this.flow > 0.1)
    this.sound.play(running ? (tool as 'chuveiro' | 'secador') : null)
  }

  /** Converte um ponto do desenho da ferramenta para o palco, contando a inclinação. */
  private toolPoint(artX: number, artY: number, center: { x: number; y: number }) {
    const unit = (this.m.toolWidth / TOOL_ART_WIDTH) * (this.pressed ? 1.08 : 1)
    const dx = (artX - center.x) * unit
    const dy = (artY - center.y) * unit
    const angle = (this.tool.tilt * Math.PI) / 180
    return { x: this.drawn.x + dx * Math.cos(angle) - dy * Math.sin(angle), y: this.drawn.y + dx * Math.sin(angle) + dy * Math.cos(angle) }
  }

  private dryerAim() {
    const mouth = this.toolPoint(-90, 0, DRYER_CENTER)
    const dx = this.tool.x - mouth.x
    const dy = this.tool.y - mouth.y
    const length = Math.hypot(dx, dy)
    return { mouth, dir: length > 8 ? { x: dx / length, y: dy / length } : { x: -1, y: 0 } }
  }

  private solid(petX: number, petY: number) {
    return this.mctx.isPointInPath(this.clip, petX * MESS_SCALE, (petY - PET_TOP) * MESS_SCALE)
  }

  private floorY() {
    const { stage } = this.o
    // Os cenários têm 800 unidades, com o chão nas últimas 100, e são ancorados embaixo.
    return stage.clientHeight - (100 * Math.max(stage.clientWidth, stage.clientHeight)) / 800
  }

  /** Procura, descendo do ponto dado, onde a água encosta: no pet, na banheira ou no chão. */
  private findImpact(stageX: number, stageY: number): { y: number; surface: Surface } {
    const pet = this.toPet(stageX, stageY)
    const limit = this.step?.limitY
    const inTub = limit !== undefined && pet.x > TUB_LEFT && pet.x < TUB_RIGHT
    const bottom = inTub ? TUB_RIM : PET_TOP + PET_HEIGHT
    for (let y = pet.y; y < bottom; y += 14) {
      if (this.solid(pet.x, y)) return { y: this.toStage(pet.x, y).y, surface: 'pet' }
    }
    if (inTub) return { y: this.toStage(pet.x, TUB_RIM).y, surface: 'banheira' }
    return { y: Math.max(stageY, this.floorY() + random(0, 26)), surface: 'chao' }
  }

  private moveLean(now: number, dt: number) {
    if (this.calm) return
    let push = 0
    if ((this.pressed || this.auto) && this.step && this.overPet()) {
      push = clamp((this.target.x - this.tool.x) * 0.5, -5, 5)
      // O vento do secador empurra o pet para o lado de onde ele sopra.
      if (this.step.tool === 'secador') push += this.dryerAim().dir.x * 3.2 * this.flow
    }
    // Mola simples: o pet acompanha o gesto e volta balançando.
    const stiffness = 90
    const damping = 11
    this.leanVelocity += (stiffness * (push - this.lean) - damping * this.leanVelocity) * dt
    this.lean += this.leanVelocity * dt
    const blowing = this.step?.tool === 'secador' && this.flow > 0.05 && this.overPet()
    this.moveHead(now, blowing)
    if (Math.abs(this.lean) < 0.02 && !push) return
    const flutter = blowing ? Math.sin(now / 38) * 0.5 * this.flow : 0
    this.o.lean.style.transform = `rotate(${(this.lean + flutter).toFixed(2)}deg)`
  }

  private moveHead(now: number, blowing: boolean) {
    const turn = blowing ? (this.dryerAim().dir.x * 2 + Math.sin(now / 55) * 1.2) * this.flow : 0
    if (Math.abs(turn) < 0.01 && this.headTurn === 0) return
    this.headTurn = Math.abs(turn) < 0.01 ? 0 : turn
    this.o.lean.querySelector<SVGElement>('.pet')?.style.setProperty('--cabeca-giro', `${this.headTurn.toFixed(2)}deg`)
  }

  private overPet() {
    const pet = this.toPet(this.tool.x, this.tool.y)
    return pet.x > 60 && pet.x < 350 && pet.y > 30 && pet.y < 460
  }

  private lookAtTool() {
    const eye = this.toStage(200, 156)
    const dx = this.tool.x - eye.x
    const dy = this.tool.y - eye.y
    const length = Math.hypot(dx, dy) || 1
    const reach = Math.min(1, length / 80) * 7
    const x = (dx / length) * reach
    const y = (dy / length) * reach
    if (Math.abs(x - this.eyes.x) < 0.25 && Math.abs(y - this.eyes.y) < 0.25) return
    this.eyes = { x, y }
    const pet = this.o.lean.querySelector<SVGElement>('.pet')
    pet?.style.setProperty('--olho-x', `${x.toFixed(1)}px`)
    pet?.style.setProperty('--olho-y', `${y.toFixed(1)}px`)
  }

  /** Quantas partículas cabem neste quadro, sem depender da taxa de atualização da tela. */
  private due(key: keyof BathEngine['carry'], rate: number, dt: number) {
    this.carry[key] += rate * dt
    const count = Math.floor(this.carry[key])
    this.carry[key] -= count
    return count
  }

  private emitFromTool(dt: number) {
    if (!this.step) return
    const tool = this.step.tool
    if (tool === 'chuveiro') {
      if (this.flow > 0.05) this.emitShower(dt)
      else if (this.dripping > 0) this.emitDrips(dt)
      this.dripping = Math.max(0, this.dripping - dt)
    } else if (tool === 'secador' && this.flow > 0.05) {
      this.emitDryer(dt)
    }
  }

  private emitShower(dt: number) {
    const scale = this.scale()
    const reach = BRUSH * scale
    for (let i = this.due('jato', 170 * this.flow, dt); i > 0; i--) {
      const spread = random(-1, 1)
      const nozzle = this.toolPoint(spread * 44, 28, SHOWER_CENTER)
      const landX = this.tool.x + spread * reach * 0.85 + random(-5, 5)
      const impact = this.findImpact(landX, this.tool.y + random(-0.5, 0.6) * reach)
      const y = Math.max(impact.y, nozzle.y + 8)
      const speed = random(560, 780)
      const time = (y - nozzle.y) / speed
      this.spawn('jato', nozzle.x, nozzle.y, (landX - nozzle.x) / time, speed, { life: time + 0.06, size: random(2, 3.6), impactY: y, surface: impact.surface })
    }
    for (let i = this.due('nevoa', 8 * this.flow, dt); i > 0; i--) {
      this.spawn('nevoa', this.tool.x + random(-reach, reach), this.tool.y + random(-reach, reach) * 0.6, random(-14, 14), random(-46, -18), { life: random(0.6, 1.1), size: random(12, 24) })
    }
  }

  /** O chuveiro desligado ainda pinga um pouquinho. */
  private emitDrips(dt: number) {
    for (let i = this.due('pingo', 12, dt); i > 0; i--) {
      const nozzle = this.toolPoint(random(-44, 44), 30, SHOWER_CENTER)
      this.spawn('agua', nozzle.x, nozzle.y, 0, 30, { gravity: 900, life: random(0.35, 0.6), size: random(2, 3.5) })
    }
  }

  private splash(p: Particle) {
    const x = p.x
    const y = p.impactY ?? p.y
    const up = () => this.spawn('agua', x, y, random(-150, 150), random(-230, -80), { gravity: 900, life: random(0.25, 0.45), size: random(1.6, 3.4) })
    const mess = this.step?.mess
    if (p.surface === 'pet') {
      if (mess === 'lama' && Math.random() < 0.45) {
        this.spawn('lama', x, y, random(-170, 170), random(-210, -60), { gravity: 850, life: random(0.3, 0.55), size: random(1.8, 3.8), color: '#7d5a32' })
      } else if (mess === 'tirar-espuma' && Math.random() < 0.3) {
        this.spawn('bolha', x, y, random(-70, 70), random(-120, -40), { gravity: -20, life: random(0.45, 0.9), size: random(3, 9) })
      } else if (Math.random() < 0.55) {
        up()
      }
      if (Math.random() < 0.1) {
        const color = mess === 'lama' ? '#7d5a32' : mess === 'tirar-espuma' ? '#ffffff' : '#bfefff'
        this.spawn('filete', x, y, random(-5, 5), random(55, 100) * this.scale(), { gravity: 110, life: random(0.5, 0.95), size: random(2.5, 4), color })
      }
    } else if (p.surface === 'banheira') {
      if (Math.random() < 0.6) up()
      if (Math.random() < 0.2) this.spawn('bolha', x, y - 4, random(-24, 24), random(-70, -26), { gravity: -10, life: random(0.45, 0.85), size: random(3, 8) })
      if (Math.random() < 0.14) this.spawn('onda', x, y, 0, 0, { life: 0.42, size: random(9, 15), color: '#7cd8ff' })
    } else {
      if (Math.random() < 0.6) up()
      if (Math.random() < 0.28) this.spawn('onda', x, y, 0, 0, { life: 0.5, size: random(10, 20), color: '#ffffff' })
    }
  }

  private emitDryer(dt: number) {
    const { mouth, dir } = this.dryerAim()
    const perp = { x: -dir.y, y: dir.x }
    const unit = this.m.toolWidth / TOOL_ART_WIDTH
    const heading = Math.atan2(dir.y, dir.x)
    const from = (spread: number) => ({ x: mouth.x + perp.x * spread * unit, y: mouth.y + perp.y * spread * unit })
    for (let i = this.due('ar', 42 * this.flow, dt); i > 0; i--) {
      const start = from(random(-24, 24))
      const speed = random(430, 720)
      const drift = random(-75, 75)
      const vx = dir.x * speed + perp.x * drift
      const vy = dir.y * speed + perp.y * drift
      this.spawn('ar', start.x, start.y, vx, vy, { life: random(0.26, 0.48), size: random(16, 40), angle: Math.atan2(vy, vx) })
    }
    for (let i = this.due('redemoinho', 5 * this.flow, dt); i > 0; i--) {
      const start = from(random(-20, 20))
      this.spawn('redemoinho', start.x, start.y, dir.x * 270 + perp.x * random(-40, 40), dir.y * 270 + perp.y * random(-40, 40), { life: random(0.5, 0.8), size: random(8, 14), angle: heading })
    }
    if (!this.overPet()) return
    const reach = BRUSH * this.scale()
    for (let i = this.due('pelo', 7 * this.flow, dt); i > 0; i--) {
      this.spawn('pelo', this.tool.x + random(-reach, reach), this.tool.y + random(-reach, reach), dir.x * random(180, 340), random(-60, 40), { gravity: 90, life: random(0.35, 0.65), size: random(6, 11), color: this.o.tangleColor })
    }
  }

  private drawShowerBeam(ctx: CanvasRenderingContext2D, now: number) {
    const reach = BRUSH * this.scale()
    const left = this.toolPoint(-46, 28, SHOWER_CENTER)
    const right = this.toolPoint(46, 28, SHOWER_CENTER)
    const end = Math.max(this.findImpact(this.tool.x, this.tool.y + reach * 0.3).y, left.y + 8)
    const wobble = Math.sin(now / 70) * 3
    const gradient = ctx.createLinearGradient(0, left.y, 0, end)
    gradient.addColorStop(0, `rgba(214, 245, 255, ${0.62 * this.flow})`)
    gradient.addColorStop(1, `rgba(214, 245, 255, ${0.14 * this.flow})`)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(right.x, right.y)
    ctx.lineTo(this.tool.x + reach * 0.9 + wobble, end)
    ctx.lineTo(this.tool.x - reach * 0.9 + wobble, end)
    ctx.closePath()
    ctx.fill()
  }

  private drawDryerCone(ctx: CanvasRenderingContext2D, now: number) {
    const { mouth, dir } = this.dryerAim()
    const perp = { x: -dir.y, y: dir.x }
    const unit = this.m.toolWidth / TOOL_ART_WIDTH
    const reach = BRUSH * this.scale()
    const distance = Math.hypot(this.tool.x - mouth.x, this.tool.y - mouth.y) + reach * 1.5
    const cone = (length: number, width: number, color: string, alpha: number) => {
      const farX = mouth.x + dir.x * length
      const farY = mouth.y + dir.y * length
      const gradient = ctx.createLinearGradient(mouth.x, mouth.y, farX, farY)
      gradient.addColorStop(0, `rgba(${color}, ${alpha * this.flow})`)
      gradient.addColorStop(1, `rgba(${color}, 0)`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(mouth.x + perp.x * 26 * unit, mouth.y + perp.y * 26 * unit)
      ctx.lineTo(mouth.x - perp.x * 26 * unit, mouth.y - perp.y * 26 * unit)
      ctx.lineTo(farX - perp.x * width, farY - perp.y * width)
      ctx.lineTo(farX + perp.x * width, farY + perp.y * width)
      ctx.closePath()
      ctx.fill()
    }
    const breath = 1 + Math.sin(now / 60) * 0.06
    cone(distance, reach * 1.15 * breath, '255, 122, 246', 0.5)
    cone(distance * 0.6, reach * 0.55 * breath, '255, 255, 255', 0.65)
  }

  /** Mostra onde o efeito vai cair antes de apertar, já que a ferramenta fica afastada. */
  private drawAim(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalAlpha = this.rig * 0.9
    ctx.setLineDash([7, 7])
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#5813ad'
    ctx.beginPath()
    ctx.arc(this.tool.x, this.tool.y, BRUSH * this.scale() * 0.7, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  private drawParticles(now: number, dt: number) {
    const ctx = this.fctx
    const { stage } = this.o
    const tool = this.step?.tool
    const flowing = this.flow > 0.03 && (tool === 'chuveiro' || tool === 'secador')
    const aiming = this.hovering && !this.pressed && !this.auto && this.rig > 0.05
    if (!this.particles.length && !this.fxDirty && !flowing && !aiming) return
    ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight)
    this.fxDirty = this.particles.length > 0 || flowing || aiming
    if (flowing) {
      if (tool === 'chuveiro') this.drawShowerBeam(ctx, now)
      else this.drawDryerCone(ctx, now)
    }
    if (aiming) this.drawAim(ctx)
    const alive: Particle[] = []
    const hits: Particle[] = []
    for (const p of this.particles) {
      p.life -= dt
      if (p.life <= 0) continue
      p.vy += p.gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.angle += p.spin * dt
      if (p.impactY !== undefined && p.y >= p.impactY) {
        hits.push(p)
        continue
      }
      if (p.kind === 'filete') {
        const pet = this.toPet(p.x, p.y)
        const limit = this.step?.limitY ?? Infinity
        if (pet.y >= limit || !this.solid(pet.x, pet.y)) continue
      }
      ctx.globalAlpha = Math.min(1, p.life / (p.maxLife * 0.4))
      this.drawParticle(ctx, p)
      alive.push(p)
    }
    ctx.globalAlpha = 1
    this.particles = alive
    for (const hit of hits) this.splash(hit)
  }

  private drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save()
    ctx.translate(p.x, p.y)
    const age = 1 - p.life / p.maxLife
    switch (p.kind) {
      case 'jato': {
        // Um risco na direção da queda: lido como água correndo, não como bolinhas.
        const tailX = -p.vx * 0.05
        const tailY = -p.vy * 0.05
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = '#2f8fd0'
        ctx.lineWidth = p.size + 2
        ctx.stroke()
        ctx.strokeStyle = '#c8f2ff'
        ctx.lineWidth = p.size
        ctx.stroke()
        break
      }
      case 'filete':
        ctx.lineCap = 'round'
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -p.size * 4)
        ctx.stroke()
        break
      case 'onda':
        ctx.strokeStyle = p.color
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * (1 + age * 2.4), p.size * (1 + age * 2.4) * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()
        break
      case 'nevoa':
        ctx.globalAlpha *= 0.3
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(0, 0, p.size * (1 + age), 0, Math.PI * 2)
        ctx.fill()
        break
      case 'vapor': {
        const r = p.size * (0.7 + age * 0.7)
        ctx.globalAlpha *= 0.85
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#907aff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(-r * 0.7, 0, r * 0.7, 0, Math.PI * 2)
        ctx.moveTo(r * 1.4, 0)
        ctx.arc(r * 0.7, 0, r * 0.7, 0, Math.PI * 2)
        ctx.moveTo(r * 0.9, -r * 0.5)
        ctx.arc(0, -r * 0.5, r * 0.9, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fill()
        break
      }
      case 'redemoinho':
        ctx.rotate(p.angle + age * 8)
        ctx.lineCap = 'round'
        ctx.beginPath()
        for (let i = 0; i <= 22; i++) {
          const turn = (i / 22) * Math.PI * 3.4
          const r = (p.size * i) / 22
          ctx.lineTo(Math.cos(turn) * r, Math.sin(turn) * r)
        }
        ctx.strokeStyle = '#5813ad'
        ctx.lineWidth = 4.5
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
        break
      case 'agua':
        ctx.fillStyle = p.color
        ctx.strokeStyle = '#2f8fd0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 0.7, p.size * 1.3, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        break
      case 'bolha':
        ctx.fillStyle = 'rgba(255, 255, 255, .85)'
        ctx.strokeStyle = '#907aff'
        ctx.lineWidth = 1.500
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        break
      case 'ar':
        // Contorno roxo para o vento aparecer sobre a parede amarela e sobre o pelo claro.
        ctx.rotate(p.angle)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(-p.size / 2, Math.sin(p.life * 34) * 7, -p.size, 0)
        ctx.strokeStyle = '#5813ad'
        ctx.lineWidth = 4.5
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2.2
        ctx.stroke()
        break
      case 'estrela':
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.strokeStyle = '#5813ad'
        ctx.lineWidth = 1.500
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const radius = i % 2 ? p.size * 0.32 : p.size
          const angle = (i * Math.PI) / 4
          ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break
      case 'coracao': {
        const s = p.size / 10
        ctx.scale(s, s)
        ctx.fillStyle = p.color
        ctx.strokeStyle = '#5813ad'
        ctx.lineWidth = 1.800
        ctx.beginPath()
        ctx.moveTo(0, 8)
        ctx.bezierCurveTo(-12, 0, -8, -9, 0, -3)
        ctx.bezierCurveTo(8, -9, 12, 0, 0, 8)
        ctx.fill()
        ctx.stroke()
        break
      }
      case 'pelo':
        ctx.rotate(p.angle)
        ctx.strokeStyle = p.color
        ctx.lineWidth = 2.500
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(-p.size / 2, 0)
        ctx.quadraticCurveTo(0, 4, p.size / 2, 0)
        ctx.stroke()
        break
      default:
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
    }
    ctx.restore()
  }
}
