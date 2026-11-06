import { memo, useId } from 'react'
import { FUR_COLORS } from '../data/petOptions'
import type { PetLook, Species } from '../types'
import './pet.css'

const ROXO = '#5813ad'
const BAUNILHA = '#ffffee'
const ROSA = '#ff7af6'
const AMARELO = '#ffff7b'
const LAVANDA = '#907aff'

export const BODY_PATH = 'M150 225 C118 280 100 350 108 412 C112 434 130 440 150 440 L250 440 C270 440 288 434 292 412 C300 350 282 280 250 225 Z'
const HEAD_CAT = 'M200 62 C272 62 312 105 312 158 C312 216 264 252 200 252 C136 252 88 216 88 158 C88 105 128 62 200 62 Z'
const HEAD_DOG = 'M200 66 C266 66 302 110 302 166 C302 226 258 258 200 258 C142 258 98 226 98 166 C98 110 134 66 200 66 Z'

export const headPath = (species: Species) => (species === 'cat' ? HEAD_CAT : HEAD_DOG)

const TAIL_CAT = 'M278 412 C340 420 382 366 362 306 C354 280 322 286 328 312 C338 352 316 376 272 372 Z'
const TAIL_DOG = 'M280 414 C326 418 366 384 372 330 C350 346 356 322 340 322 C340 352 312 370 276 370 Z'
const TAIL_POODLE = 'M282 410 C312 410 340 390 346 352 L330 348 C324 372 306 384 280 384 Z'

export type PetExpression = 'normal' | 'feliz' | 'fechado'

interface PartProps {
  species: Species
  type: string
}

function Tail({ species, type }: PartProps) {
  const poodle = species === 'dog' && type === 'poodle'
  return (
    <g className="pet-rabo">
      <path d={species === 'cat' ? TAIL_CAT : poodle ? TAIL_POODLE : TAIL_DOG} />
      {poodle && <circle cx="344" cy="330" r="34" />}
    </g>
  )
}

function EarsBehind({ species, type }: PartProps) {
  if (species === 'cat') {
    if (type === 'dobrada') return null
    return (
      <>
        <path d="M100 136 L92 32 C92 22 102 20 110 26 L186 76 Z" />
        <path d="M300 136 L308 32 C308 22 298 20 290 26 L214 76 Z" />
        <path d="M116 112 L110 52 L158 84 Z" fill={ROSA} stroke="none" opacity=".75" />
        <path d="M284 112 L290 52 L242 84 Z" fill={ROSA} stroke="none" opacity=".75" />
        {type === 'peludo' && (
          <>
            <path d="M92 150 L46 164 L82 184 L50 214 L102 218 L84 246 L140 238 Z" />
            <path d="M308 150 L354 164 L318 184 L350 214 L298 218 L316 246 L260 238 Z" />
          </>
        )}
      </>
    )
  }
  if (type === 'empe') {
    return (
      <>
        <path d="M112 128 C92 80 92 36 116 22 C126 18 134 22 142 32 L182 84 Z" />
        <path d="M288 128 C308 80 308 36 284 22 C274 18 266 22 258 32 L218 84 Z" />
        <path d="M124 104 C112 78 114 52 124 44 L158 88 Z" fill={ROSA} stroke="none" opacity=".75" />
        <path d="M276 104 C288 78 286 52 276 44 L242 88 Z" fill={ROSA} stroke="none" opacity=".75" />
      </>
    )
  }
  if (type === 'poodle') {
    return (
      <>
        <circle cx="200" cy="64" r="44" />
        <circle cx="148" cy="78" r="36" />
        <circle cx="252" cy="78" r="36" />
        <circle cx="84" cy="150" r="38" />
        <circle cx="72" cy="202" r="36" />
        <circle cx="316" cy="150" r="38" />
        <circle cx="328" cy="202" r="36" />
      </>
    )
  }
  return null
}

function EarsFront({ species, type }: PartProps) {
  if (species === 'dog' && type === 'caida') {
    return (
      <>
        <path d="M128 84 C84 76 58 118 64 176 C68 222 108 226 118 180 C124 150 132 120 156 92 Z" />
        <path d="M272 84 C316 76 342 118 336 176 C332 222 292 226 282 180 C276 150 268 120 244 92 Z" />
      </>
    )
  }
  if (species === 'cat' && type === 'dobrada') {
    return (
      <>
        <path d="M104 118 C88 78 112 50 166 66 C160 92 138 112 104 118 Z" />
        <path d="M296 118 C312 78 288 50 234 66 C240 92 262 112 296 118 Z" />
      </>
    )
  }
  return null
}

function Body() {
  return (
    <>
      <path d={BODY_PATH} />
      <ellipse cx="160" cy="434" rx="34" ry="17" />
      <ellipse cx="240" cy="434" rx="34" ry="17" />
    </>
  )
}

function Head({ species, type, head }: PartProps & { head: string }) {
  return (
    <>
      <EarsBehind species={species} type={type} />
      <path d={head} />
      <EarsFront species={species} type={type} />
    </>
  )
}

function PatternOverlay({ pattern, color }: { pattern: string; color: string }) {
  if (pattern === 'mancha') {
    return (
      <g fill={color}>
        <path d="M240 60 C300 70 330 120 310 190 C290 205 240 200 222 160 C210 125 218 85 240 60 Z" />
        <path d="M100 320 C140 300 176 330 170 380 C166 420 130 448 100 440 Z" />
        <circle cx="262" cy="330" r="26" />
      </g>
    )
  }
  if (pattern === 'pintas') {
    const spots: [number, number, number][] = [
      [126, 120, 11], [200, 96, 13], [272, 112, 10], [118, 210, 9], [284, 214, 9], [160, 84, 7], [240, 84, 7],
      [136, 290, 12], [262, 288, 13], [200, 300, 9], [128, 354, 13], [272, 356, 11], [200, 370, 12], [158, 400, 9], [246, 402, 10],
    ]
    return (
      <g fill={color}>
        {spots.map(([cx, cy, r], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.85} transform={`rotate(${i * 37} ${cx} ${cy})`} />
        ))}
      </g>
    )
  }
  if (pattern === 'listras') {
    return (
      <g fill="none" stroke={color} strokeWidth="9" strokeLinecap="round">
        <path d="M200 66 V108" />
        <path d="M166 70 L174 104" />
        <path d="M234 70 L226 104" />
        <path d="M92 164 L126 170" />
        <path d="M96 200 L126 196" />
        <path d="M308 164 L274 170" />
        <path d="M304 200 L274 196" />
        <path d="M112 330 Q132 330 148 320" />
        <path d="M106 370 Q128 372 148 360" />
        <path d="M288 330 Q268 330 252 320" />
        <path d="M294 370 Q272 372 252 360" />
      </g>
    )
  }
  return null
}

function Eyes({ expression, halo, ink }: { expression: PetExpression; halo: boolean; ink: string }) {
  if (expression !== 'normal') {
    const d =
      expression === 'feliz'
        ? 'M136 164 Q158 130 180 164 M220 164 Q242 130 264 164'
        : 'M136 150 Q158 176 180 150 M220 150 Q242 176 264 150'
    return (
      <g fill="none" strokeLinecap="round">
        {halo && <path d={d} stroke={BAUNILHA} strokeWidth="19" />}
        <path d={d} stroke={halo ? ROXO : ink} strokeWidth="9" />
      </g>
    )
  }
  return (
    <g className="pet-olhos" stroke="none">
      {[158, 242].map((cx) => (
        <g key={cx}>
          {halo && <ellipse cx={cx} cy="156" rx="23" ry="27" fill={BAUNILHA} />}
          <g className="pet-pupila">
            <ellipse cx={cx} cy="156" rx="16" ry="20" fill={ROXO} />
            <circle cx={cx + 6} cy="148" r="6" fill="#fff" />
            <circle cx={cx - 6} cy="164" r="3" fill="#fff" />
          </g>
        </g>
      ))}
    </g>
  )
}

function Mouth({ species, expression, ink }: { species: Species; expression: PetExpression; ink: string }) {
  const open = expression === 'feliz'
  if (species === 'cat') {
    return (
      <>
        <path d="M188 186 H212 L200 200 Z" fill={ink} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        {open ? (
          <>
            <path d="M176 208 Q200 218 224 208 Q220 240 200 240 Q180 240 176 208 Z" fill={ROXO} stroke={ink} strokeWidth="5" strokeLinejoin="round" />
            <path d="M188 226 Q200 218 212 226 Q210 238 200 238 Q190 238 188 226 Z" fill={ROSA} stroke="none" />
          </>
        ) : (
          <path d="M200 202 V212 M200 212 Q192 224 178 216 M200 212 Q208 224 222 216" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
        )}
        <path d="M136 184 L66 172 M134 202 L62 208 M264 184 L334 172 M266 202 L338 208" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      </>
    )
  }
  return (
    <>
      <ellipse cx="200" cy="202" rx="52" ry="40" fill={BAUNILHA} stroke={ROXO} strokeWidth="6" />
      <ellipse cx="200" cy="184" rx="18" ry="13" fill={ROXO} stroke="none" />
      <ellipse cx="194" cy="180" rx="5" ry="3" fill="#fff" stroke="none" />
      {open ? (
        <>
          <path d="M200 197 V207" fill="none" stroke={ROXO} strokeWidth="6" strokeLinecap="round" />
          <path d="M162 207 Q200 222 238 207 Q232 232 200 232 Q168 232 162 207 Z" fill={ROXO} stroke={ROXO} strokeWidth="5" strokeLinejoin="round" />
          <path d="M183 218 Q200 212 217 218 L215 250 Q200 264 185 250 Z" fill={ROSA} stroke={ROXO} strokeWidth="5" strokeLinejoin="round" />
          <path d="M200 222 V246" fill="none" stroke={ROXO} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M200 197 V210 M200 210 Q186 226 170 212 M200 210 Q214 226 230 212" fill="none" stroke={ROXO} strokeWidth="6" strokeLinecap="round" />
          <path d="M190 220 Q200 214 210 220 L208 234 Q200 244 192 234 Z" fill={ROSA} stroke={ROXO} strokeWidth="5" strokeLinejoin="round" />
        </>
      )}
    </>
  )
}

const line = { stroke: ROXO, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function NeckAccessory({ id }: { id: string }) {
  if (id === 'coleira') {
    return (
      <g className="pet-acessorio" {...line}>
        <path d="M128 232 Q200 288 272 232 L280 262 Q200 318 120 262 Z" fill={ROSA} />
        <circle cx="200" cy="312" r="19" fill={AMARELO} />
        <circle cx="200" cy="312" r="7" fill={ROXO} stroke="none" />
      </g>
    )
  }
  if (id === 'bandana') {
    return (
      <g className="pet-acessorio" {...line}>
        <path d="M122 240 Q200 296 278 240 L206 366 Q200 374 194 366 Z" fill={LAVANDA} />
        <g fill={BAUNILHA} stroke="none">
          <circle cx="170" cy="290" r="6" />
          <circle cx="230" cy="290" r="6" />
          <circle cx="200" cy="318" r="6" />
        </g>
      </g>
    )
  }
  if (id === 'gravata') {
    return (
      <g className="pet-acessorio" {...line}>
        <path d="M194 280 L132 248 Q122 280 132 316 Z" fill="#b74ff9" />
        <path d="M206 280 L268 248 Q278 280 268 316 Z" fill="#b74ff9" />
        <rect x="186" y="264" width="28" height="34" rx="9" fill={AMARELO} />
      </g>
    )
  }
  return null
}

function HeadAccessory({ id }: { id: string }) {
  if (id === 'laco') {
    return (
      <g className="pet-acessorio" {...line} transform="translate(256 74) rotate(14)">
        <path d="M-6 0 L-58 -32 Q-70 0 -58 32 Z" fill={ROSA} />
        <path d="M6 0 L58 -32 Q70 0 58 32 Z" fill={ROSA} />
        <circle r="14" fill={AMARELO} />
      </g>
    )
  }
  if (id === 'festa') {
    return (
      <g className="pet-acessorio" {...line} transform="rotate(8 200 80)">
        <path d="M150 84 L202 -26 L254 84 Q202 106 150 84 Z" fill={AMARELO} />
        <path d="M178 26 L226 34 M162 62 L242 70" fill="none" stroke={ROSA} strokeWidth="10" />
        <path d="M150 84 L202 -26 L254 84 Q202 106 150 84 Z" fill="none" />
        <circle cx="202" cy="-30" r="17" fill={ROSA} />
      </g>
    )
  }
  if (id === 'coroa') {
    return (
      <g className="pet-acessorio" {...line}>
        <path d="M138 86 L126 10 L170 44 L200 -6 L230 44 L274 10 L262 86 Q200 106 138 86 Z" fill={AMARELO} />
        <circle cx="200" cy="66" r="9" fill={ROSA} />
        <circle cx="160" cy="70" r="6" fill={LAVANDA} />
        <circle cx="240" cy="70" r="6" fill={LAVANDA} />
      </g>
    )
  }
  return null
}

function Glasses() {
  return (
    <g className="pet-acessorio" {...line}>
      <rect x="112" y="128" width="84" height="58" rx="24" fill="#2b0d59" />
      <rect x="204" y="128" width="84" height="58" rx="24" fill="#2b0d59" />
      <path d="M196 148 H204" fill="none" />
      <path d="M132 146 L150 168 M224 146 L242 168" fill="none" stroke={ROSA} strokeWidth="7" />
    </g>
  )
}

function PetAvatarBase({
  species,
  look,
  title,
  className = '',
  expression = 'normal',
}: {
  species: Species
  look: PetLook
  title?: string
  className?: string
  expression?: PetExpression
}) {
  const clipId = useId().replace(/:/g, '')
  const fur = FUR_COLORS.find((f) => f.id === look.fur) ?? FUR_COLORS[0]
  const head = headPath(species)
  const ink = fur.dark ? BAUNILHA : ROXO
  const patternColor = fur.dark ? BAUNILHA : ROXO
  const accessories = look.accessories
  const halo = fur.dark || look.pattern === 'mancha'
  const hasGlasses = accessories.includes('oculos')

  return (
    <svg
      className={`pet ${className}`}
      viewBox="0 -60 420 530"
      role="img"
      aria-label={title ?? `Desenho do pet: ${species === 'dog' ? 'cão' : 'gato'}`}
    >
      <defs>
        <clipPath id={`${clipId}-corpo`}>
          <path d={BODY_PATH} />
        </clipPath>
        <clipPath id={`${clipId}-cabeca`}>
          <path d={head} />
        </clipPath>
      </defs>
      <ellipse cx="205" cy="458" rx="150" ry="13" fill={ROXO} opacity=".2" />
      {/* Borda de sticker */}
      <g fill={BAUNILHA} stroke={BAUNILHA} strokeWidth="34" strokeLinejoin="round" strokeLinecap="round">
        <Tail species={species} type={look.type} />
        <Body />
        <g className="pet-cabeca">
          <Head species={species} type={look.type} head={head} />
        </g>
      </g>
      <g fill={fur.color} stroke={ROXO} strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
        <Tail species={species} type={look.type} />
        <Body />
        <g clipPath={`url(#${clipId}-corpo)`} stroke="none">
          <ellipse cx="200" cy="360" rx="52" ry="78" fill="#fff" opacity=".28" />
          <PatternOverlay pattern={look.pattern} color={patternColor} />
        </g>
        <path d={BODY_PATH} fill="none" />
        <path
          d="M172 340 L168 424 M228 340 L232 424 M146 436 V446 M160 438 V448 M174 436 V446 M226 436 V446 M240 438 V448 M254 436 V446"
          fill="none"
          stroke={ink}
          strokeWidth="6"
        />
        <g fill="none">{accessories.map((id) => <NeckAccessory key={id} id={id} />)}</g>
        <g className="pet-cabeca">
          <EarsBehind species={species} type={look.type} />
          <path d={head} />
          <g clipPath={`url(#${clipId}-cabeca)`} stroke="none">
            <PatternOverlay pattern={look.pattern} color={patternColor} />
          </g>
          <path d={head} fill="none" />
          <EarsFront species={species} type={look.type} />
          <circle cx="126" cy="196" r="17" fill={ROSA} stroke="none" opacity=".55" />
          <circle cx="274" cy="196" r="17" fill={ROSA} stroke="none" opacity=".55" />
          {!hasGlasses && <Eyes expression={expression} halo={halo} ink={ink} />}
          <Mouth species={species} expression={expression} ink={ink} />
          {hasGlasses && <Glasses />}
          {accessories.map((id) => <HeadAccessory key={id} id={id} />)}
        </g>
      </g>
    </svg>
  )
}

export const PetAvatar = memo(PetAvatarBase)
