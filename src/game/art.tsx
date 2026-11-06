const ROXO = '#5813ad'
const VIOLETA = '#b74ff9'
const LAVANDA = '#907aff'
const ROSA = '#ff7af6'
const AMARELO = '#ffff7b'
const BAUNILHA = '#ffffee'

export type SceneId = 'banho' | 'secar' | 'pentear' | 'visual'
export type ToolId = 'chuveiro' | 'esponja' | 'secador' | 'pente'

const line = { stroke: ROXO, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function BathScene() {
  return (
    <>
      <defs>
        <pattern id="azulejo" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#c9eefc" />
          <path d="M0 0 H80 M0 0 V80" stroke="#fff" strokeWidth="5" />
        </pattern>
      </defs>
      <rect width="800" height="800" fill="url(#azulejo)" />
      <g {...line}>
        <g transform="translate(0 210)">
          <rect x="30" y="80" width="150" height="180" rx="75" fill="#fffbd6" />
          <path d="M105 80 V260 M30 170 H180" fill="none" />
          <path d="M620 250 H790" fill="none" strokeWidth="14" />
          <rect x="632" y="160" width="46" height="84" rx="12" fill={ROSA} />
          <rect x="642" y="136" width="26" height="24" rx="6" fill={BAUNILHA} />
          <rect x="690" y="180" width="42" height="64" rx="12" fill={LAVANDA} />
          <path d="M744 240 q-4 -30 18 -30 q18 0 14 16 q14 2 12 14 Z" fill={AMARELO} />
        </g>
        <rect x="0" y="700" width="800" height="100" fill={LAVANDA} />
        <path d="M0 700 H800" fill="none" />
      </g>
    </>
  )
}

function DryScene() {
  return (
    <>
      <rect width="800" height="800" fill={AMARELO} />
      <g fill="#fff" opacity=".55">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 110 + 16} width="54" height="800" />)}
      </g>
      <g {...line}>
        <g transform="translate(-30 220)">
          <path d="M50 170 H240" fill="none" strokeWidth="12" />
          <path d="M70 170 H140 V320 Q105 300 70 320 Z" fill={ROSA} />
          <path d="M156 170 H226 V290 Q191 272 156 290 Z" fill={LAVANDA} />
        </g>
        <circle cx="710" cy="370" r="60" fill="#fff" />
        <path d="M710 326 V370 L742 388" fill="none" />
        <rect x="0" y="706" width="800" height="94" fill={VIOLETA} />
        <ellipse cx="400" cy="716" rx="290" ry="42" fill={BAUNILHA} />
      </g>
    </>
  )
}

function CombScene() {
  return (
    <>
      <rect width="800" height="800" fill={ROSA} />
      <g fill="#ffa3f8">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <circle key={i} cx={i * 100} cy="250" r="70" />)}
        <rect width="800" height="250" />
      </g>
      <g {...line}>
        <circle cx="100" cy="470" r="86" fill="#d8f4ff" />
        <path d="M64 450 L112 410 M78 510 L146 456" fill="none" stroke="#fff" strokeWidth="11" />
        <path d="M630 520 H790" fill="none" strokeWidth="14" />
        <rect x="644" y="434" width="40" height="84" rx="12" fill={AMARELO} />
        <rect x="700" y="460" width="56" height="58" rx="14" fill={LAVANDA} />
        <rect x="0" y="706" width="800" height="94" fill={VIOLETA} />
      </g>
    </>
  )
}

function StyleScene() {
  return (
    <>
      <rect width="800" height="800" fill={LAVANDA} />
      <path d="M150 0 L20 700 H380 Z M650 0 L420 700 H780 Z" fill={AMARELO} opacity=".35" />
      <g fill={AMARELO} {...line} strokeWidth={5}>
        <path d="M70 330 l14 34 l36 4 l-28 22 l10 36 l-32 -20 l-32 20 l10 -36 l-28 -22 l36 -4 Z" />
        <path d="M730 370 l11 26 l28 3 l-22 17 l8 28 l-25 -15 l-25 15 l8 -28 l-22 -17 l28 -3 Z" />
      </g>
      <g {...line}>
        <rect x="0" y="706" width="800" height="94" fill={ROXO} />
        <ellipse cx="400" cy="716" rx="310" ry="46" fill={ROSA} />
      </g>
    </>
  )
}

export function Scenes({ active }: { active: SceneId }) {
  const scenes: [SceneId, () => React.JSX.Element][] = [
    ['banho', BathScene],
    ['secar', DryScene],
    ['pentear', CombScene],
    ['visual', StyleScene],
  ]
  return (
    <>
      {scenes.map(([id, Scene]) => (
        <svg
          key={id}
          className={`jogo-cena ${active === id ? 'ativa' : ''}`}
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <Scene />
        </svg>
      ))}
    </>
  )
}

/** Banheira desenhada nas mesmas coordenadas do pet, por cima das patinhas. */
export function Tub({ visible }: { visible: boolean }) {
  return (
    <svg className={`jogo-banheira ${visible ? '' : 'fora'}`} viewBox="0 -60 420 530" aria-hidden="true">
      <g {...line}>
        <g fill="#fff">
          <circle cx="44" cy="356" r="24" />
          <circle cx="78" cy="344" r="18" />
          <circle cx="344" cy="346" r="20" />
          <circle cx="378" cy="358" r="24" />
        </g>
        <path d="M34 372 H386 Q378 462 306 472 H114 Q42 462 34 372 Z" fill="#fff" />
        <rect x="16" y="358" width="388" height="34" rx="17" fill={BAUNILHA} />
        <path d="M112 474 L96 494 M308 474 L324 494" fill="none" strokeWidth="14" />
      </g>
      <g fill={VIOLETA}>
        <ellipse cx="210" cy="432" rx="18" ry="16" />
        <ellipse cx="184" cy="412" rx="7" ry="10" />
        <ellipse cx="200" cy="402" rx="7" ry="10" />
        <ellipse cx="220" cy="402" rx="7" ry="10" />
        <ellipse cx="236" cy="412" rx="7" ry="10" />
      </g>
    </svg>
  )
}

/** O ponto de trabalho de cada ferramenta fica em (0, 0). */
export function ToolArt({ id }: { id: ToolId }) {
  if (id === 'esponja') {
    return (
      <svg viewBox="-80 -80 160 160" aria-hidden="true">
        <g {...line}>
          <rect x="-60" y="-34" width="120" height="74" rx="24" fill={AMARELO} />
          <path d="M-52 -14 Q0 -30 52 -14" fill="none" stroke="#fff" strokeWidth="8" />
        </g>
        <g fill="#e2d94f">
          <circle cx="-30" cy="6" r="9" />
          <circle cx="2" cy="20" r="7" />
          <circle cx="30" cy="2" r="10" />
          <circle cx="-8" cy="-6" r="5" />
        </g>
        <g fill="#fff" {...line} strokeWidth={4}>
          <circle cx="-46" cy="-46" r="11" />
          <circle cx="44" cy="-50" r="14" />
        </g>
      </svg>
    )
  }
  if (id === 'secador') {
    return (
      <svg viewBox="-110 -80 220 200" aria-hidden="true">
        <g {...line}>
          <path d="M30 22 L50 104 Q54 116 66 112 L78 108 Q88 104 84 94 L68 22 Z" fill={LAVANDA} />
          <path d="M-90 -28 L-50 -38 H44 A38 38 0 0 1 44 38 H-50 L-90 28 Z" fill={VIOLETA} />
          <path d="M-50 -38 V38" fill="none" />
          <path className="secador-bico" d="M-90 -28 L-72 -32.500 V32.500 L-90 28 Z" fill={ROSA} />
          <circle cx="44" cy="0" r="20" fill={BAUNILHA} />
          <g className="secador-helice" fill={ROXO} stroke="none">
            <ellipse cx="44" cy="-8" rx="4.500" ry="8" />
            <ellipse cx="44" cy="8" rx="4.500" ry="8" />
            <ellipse cx="36" cy="0" rx="8" ry="4.500" />
            <ellipse cx="52" cy="0" rx="8" ry="4.500" />
          </g>
          <path d="M-36 -22 H26" fill="none" stroke="#fff" strokeWidth="7" />
        </g>
      </svg>
    )
  }
  if (id === 'pente') {
    return (
      <svg viewBox="-90 -80 180 160" aria-hidden="true">
        <g {...line}>
          <path d="M-66 -44 H66 Q76 -44 76 -32 V-12 H-76 V-32 Q-76 -44 -66 -44 Z" fill={ROSA} />
          <path d="M-54 -28 H50" fill="none" stroke="#fff" strokeWidth="7" />
          <path d="M-62 -12 V38 M-41 -12 V38 M-20 -12 V38 M1 -12 V38 M22 -12 V38 M43 -12 V38 M62 -12 V38" fill="none" strokeWidth="9" />
        </g>
      </svg>
    )
  }
  return (
    <svg viewBox="-90 -130 220 200" aria-hidden="true">
      <path d="M34 -30 C60 -66 84 -60 104 -112" fill="none" stroke={ROXO} strokeWidth="24" strokeLinecap="round" />
      <path d="M34 -30 C60 -66 84 -60 104 -112" fill="none" stroke={LAVANDA} strokeWidth="11" strokeLinecap="round" />
      <g {...line}>
        <path d="M-64 18 Q-58 -46 0 -46 Q58 -46 64 18 Z" fill={AMARELO} />
        <rect x="-70" y="14" width="140" height="18" rx="9" fill={BAUNILHA} />
        <path d="M-34 -28 Q-18 -38 2 -36" fill="none" stroke="#fff" strokeWidth="7" />
      </g>
      <g className="chuveiro-furos" fill={ROXO}>
        <circle cx="-44" cy="23" r="4" />
        <circle cx="-22" cy="23" r="4" />
        <circle cx="0" cy="23" r="4" />
        <circle cx="22" cy="23" r="4" />
        <circle cx="44" cy="23" r="4" />
      </g>
    </svg>
  )
}
