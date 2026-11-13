import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import banner1 from '../assets/banner-1.jpg'
import banner3 from '../assets/banner-3.jpg'
import prodBoxes from '../assets/prod-boxes.jpg'
import prodItens from '../assets/prod-itens.jpg'
import prodPersonalizados from '../assets/prod-personalizados.jpg'
import iconComo from '../assets/icon-como.webp'
import step1 from '../assets/step-1.webp'
import step2 from '../assets/step-2.webp'
import step3 from '../assets/step-3.webp'
import step4 from '../assets/step-4.webp'
import planosEsq from '../assets/planos-esq.webp'
import planosDir from '../assets/planos-dir.webp'
import gato from '../assets/gato.webp'
import iconDepo from '../assets/icon-depo.webp'
import gatoCaixa from '../assets/brand-2.webp'
import { PetAvatar } from '../components/PetAvatar'
import { BillingToggle, PawField, Reveal, Rotator } from '../components/ui'
import { FAQ, PLANS, TESTIMONIALS, formatPrice, monthlyCents } from '../data/content'
import type { Billing, PetLook, Species } from '../types'
import './home.css'

const SLIDES = [
  { img: banner1, to: '/#planos', title: 'Feita exclusivamente para o seu melhor amigo!', alt: 'Feita exclusivamente para o seu melhor amigo! Stickers com a cara do seu pet!', cta: 'Quero a minha!' },
  { img: banner3, to: '/crie-seu-pet', title: 'Personalize seu pet!', alt: 'Personalize seu pet! Crie seu pet virtual para personalização de produtos exclusivos.', cta: 'Criar meu pet' },
]

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Carousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)
  const swiped = useRef(false)
  const count = SLIDES.length
  const go = useCallback((i: number) => setIndex((i + count) % count), [count])

  useEffect(() => {
    if (paused || prefersReducedMotion()) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => clearInterval(id)
  }, [paused, count, index])

  const onPointerUp = (e: RPointerEvent) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    startX.current = null
    swiped.current = Math.abs(dx) > 50
    if (swiped.current) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <div
      className="carrossel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="trilho"
        style={{ transform: `translateX(${-100 * index}%)` }}
        onPointerDown={(e) => {
          startX.current = e.clientX
        }}
        onPointerUp={onPointerUp}
      >
        {SLIDES.map((s, i) => (
          <Link
            key={s.img}
            className="slide"
            to={s.to}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            draggable={false}
            onClick={(e) => swiped.current && e.preventDefault()}
          >
            <img src={s.img} alt={s.alt} draggable={false} className={i === index ? 'ativo' : ''} />
            <span className="slide-legenda">
              <strong>{s.title}</strong>
              <span className="btn">{s.cta}</span>
            </span>
          </Link>
        ))}
      </div>
      <button className="seta esq" onClick={() => go(index - 1)} aria-label="Slide anterior">←</button>
      <button className="seta dir" onClick={() => go(index + 1)} aria-label="Próximo slide">→</button>
      <div className="pontos">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Ir para o slide ${i + 1}`} aria-current={i === index} />
        ))}
      </div>
    </div>
  )
}

function Ticker() {
  const phrase = ['O bem-estar do seu pet é nossa prioridade!', 'Surpresa todo mês', 'Caixa transformável', 'Cães e gatos']
  const items = [...phrase, ...phrase, ...phrase, ...phrase]
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-trilho">
        {items.map((text, i) => (
          <span key={i}>{text} <b>✦</b></span>
        ))}
      </div>
    </div>
  )
}

function Produtos() {
  const items = [
    { img: prodBoxes, alt: 'Box amarela Oh My Pet!', label: 'Boxes' },
    { img: prodItens, alt: 'Embalagem de petiscos', label: 'Itens' },
    { img: prodPersonalizados, alt: 'Coleiras e plaquinhas', label: 'Personalizados' },
  ]
  return (
    <section className="bloco" id="produtos">
      <Reveal as="h2" className="titulo">Conheça nossos produtos!</Reveal>
      <div className="produtos">
        {items.map((p, i) => (
          <Reveal key={p.label} kind="pop" delay={i * 120}>
            <Link to="/#como-funciona" className="produto">
              <span className="produto-img"><img src={p.img} alt={p.alt} loading="lazy" /></span>
              {p.label}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Conceito() {
  return (
    <section className="bloco conceito">
      <PawField color="#5813ad" spots={[[1, 3, 44, -18], [90, 4, 42, 20], [46, 88, 40, 12], [94, 76, 58, -12]]} />
      <div className="conceito-grade">
        <Reveal kind="left" className="conceito-texto">
          <p className="conceito-pre">O BEM-ESTAR<br />DO SEU PET</p>
          <h2>É NOSSA PRIORIDADE!</h2>
          <p>
            Um clube de assinatura pet que nasceu para resolver as duas maiores dores dos tutores:
            a <strong>falta de tempo</strong> e a <strong>imprevisibilidade</strong> dos custos.
          </p>
          <Link className="btn amarelo" to="/quem-somos">Conheça a Oh My Pet!</Link>
        </Reveal>
        <Reveal kind="right" className="conceito-foto">
          <img src={gatoCaixa} alt="Gato dentro de uma caixa Oh My Pet!" loading="lazy" />
        </Reveal>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const steps = [
    { img: step1, text: <>CRIE E PERSONALIZE<br />SEU PET</>, to: '/crie-seu-pet' },
    { img: step2, text: <>ESCOLHA O<br />SEU PLANO</>, to: '/#planos' },
    { img: step3, text: <>RECEBA TODOS OS<br />MESES NA SUA CASA</>, to: '/#planos' },
    { img: step4, text: <>AJUDE QUEM<br />PRECISA</>, to: '/ongs' },
  ]
  return (
    <section className="bloco" id="como-funciona">
      <Reveal as="h3" className="como-titulo">
        Como funcionam as caixas da OH MY PET! <img src={iconComo} alt="" />
      </Reveal>
      <Reveal as="p" className="como-lead" delay={100}>
        <strong>A OH MY PET!</strong> Transforma a experiência do seu pet em uma surpresa todos os meses!
        Escolha o perfil do seu companheiro, personalize seu pet e selecione o plano ideal. Receba em casa uma
        seleção especial de brinquedos, petiscos, acessórios e mimos. E tem mais: nossa embalagem ganha uma nova
        função a cada mês, com ideias criativas para você reutilizá-la. Porque cada detalhe é pensado para tornar
        a vida do seu pet ainda mais divertida!
      </Reveal>
      <div className="passos">
        {steps.map((s, i) => (
          <Reveal key={i} kind="pop" delay={i * 130}>
            <Link to={s.to} className="passo cartao">
              <b>{i + 1}</b>
              <img src={s.img} alt="" loading="lazy" />
              <span>{s.text}</span>
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal className="como-cta">
        <Link className="btn bater" to="/#planos">ASSINE JÁ!</Link>
      </Reveal>
    </section>
  )
}

const DEMO_PETS: { species: Species; look: PetLook }[] = [
  { species: 'dog', look: { fur: 'caramelo', pattern: 'lisa', type: 'caida', accessories: ['bandana'] } },
  { species: 'cat', look: { fur: 'baunilha', pattern: 'listras', type: 'pontuda', accessories: ['laco', 'coleira'] } },
  { species: 'dog', look: { fur: 'baunilha', pattern: 'pintas', type: 'empe', accessories: ['festa', 'gravata'] } },
  { species: 'cat', look: { fur: 'lavanda', pattern: 'mancha', type: 'peludo', accessories: ['coroa'] } },
  { species: 'dog', look: { fur: 'chiclete', pattern: 'lisa', type: 'poodle', accessories: ['oculos', 'coleira'] } },
]

function CriePetChamada() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setInterval(() => setI((v) => (v + 1) % DEMO_PETS.length), 2400)
    return () => clearInterval(id)
  }, [])
  const pet = DEMO_PETS[i]
  return (
    <section className="bloco chamada-pet">
      <PawField color="#ff7af6" spots={[[6, 16, 50, -14], [38, 80, 34, 16], [92, 12, 40, 12], [88, 80, 54, -20]]} />
      <div className="chamada-grade">
        <Reveal kind="pop" className="chamada-pet-desenho">
          <div className="chamada-estrela" aria-hidden="true" />
          <PetAvatar key={i} species={pet.species} look={pet.look} className="pulo" title="Exemplo de pet personalizado" />
        </Reveal>
        <Reveal kind="right" className="chamada-texto">
          <h2>PERSONALIZE<br />SEU PET!</h2>
          <p>
            Pelagem, tipo, acessórios: monte um pet virtual com a cara do seu melhor amigo
            para personalizar <strong>produtos exclusivos</strong>.
          </p>
          <div className="chamada-acoes">
            <Link className="btn amarelo bater" to="/crie-seu-pet">CRIAR MEU PET</Link>
            <Link className="btn secundario" to="/brincar">Hora do banho</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Planos() {
  const [billing, setBilling] = useState<Billing>('mensal')
  return (
    <section className="bloco planos" id="planos">
      <Reveal as="h2" className="planos-titulo">
        <img src={planosEsq} alt="" className="estrela" />
        Escolha o plano ideal
        <img src={planosDir} alt="" className="estrela" />
      </Reveal>
      <Reveal as="p" className="planos-sub" delay={80}>MENSALIDADE + FRETE</Reveal>
      <Reveal className="planos-cobranca" delay={120}>
        <BillingToggle value={billing} onChange={setBilling} />
      </Reveal>
      <div className="planos-grade">
        {PLANS.map((p, i) => {
          const [reais, centavos] = formatPrice(monthlyCents(p, billing)).split(',')
          return (
            <Reveal key={p.id} kind="up" delay={i * 130}>
              <article className={`plano ${p.featured ? 'destaque' : ''}`}>
                {p.featured && <span className="plano-tag">O MAIS ESCOLHIDO</span>}
                <h3>{p.name}</h3>
                <small>DE <s>{formatPrice(p.listCents)}</s> POR</small>
                <div className="plano-preco" key={billing}>{reais}<small>,{centavos} /mês</small></div>
                <p className="plano-nota">
                  {billing === 'anual'
                    ? `${p.annualDiscount}% de desconto · ${formatPrice(monthlyCents(p, billing) * 12)} por ano`
                    : `${p.annualDiscount}% de desconto no anual`}
                </p>
                <ul>
                  {p.items.map((item) => (
                    <li key={item}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13l5 5L21 5" fill="none" stroke="currentColor" strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="btn" to={`/assinar?plano=${p.id}&cobranca=${billing}`}>ASSINE AGORA!</Link>
              </article>
            </Reveal>
          )
        })}
      </div>
      <Reveal kind="pop" className="gato-dorme">
        <span className="zzz" aria-hidden="true"><i>z</i><i>z</i><i>z</i></span>
        <img src={gato} alt="Gatinho dormindo" loading="lazy" />
      </Reveal>
    </section>
  )
}

function Depoimentos() {
  const Card = ({ t }: { t: (typeof TESTIMONIALS)[number] }) => (
    <article className="depo">
      <div>
        <img src={t.avatar} alt="" loading="lazy" />
        <strong>{t.user}<em>{t.time}</em></strong>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.900-10-10C.8 7.600 3 4.500 6.300 4.500c2.200 0 4 1.200 5.700 3.200 1.700-2 3.500-3.200 5.700-3.200C21 4.500 23.200 7.600 22 11c-2 5.100-10 10-10 10z" /></svg>
      </div>
      <p>{t.text}</p>
      <small><span>{t.likes} likes</span><span>Reply</span><span>See translation</span></small>
    </article>
  )
  return (
    <section className="depoimentos" id="depo">
      <Reveal as="h2" className="titulo">Quem ama, recomenda! <img src={iconDepo} alt="" /></Reveal>
      <div className="depo-faixa">
        <Rotator label="Depoimentos" hold={6000} items={TESTIMONIALS.map((t) => ({ key: t.user, node: <Card t={t} /> }))} />
      </div>
    </section>
  )
}

function Duvidas() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bloco duvidas" id="duvidas">
      <Reveal as="h2" className="titulo">Dúvidas frequentes</Reveal>
      {FAQ.map((item, i) => (
        <Reveal key={item.q} delay={i * 70} className={`pergunta ${open === i ? 'aberta' : ''}`}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {item.q} <i aria-hidden="true">↓</i>
          </button>
          <div className="resposta"><div><p>{item.a}</p></div></div>
        </Reveal>
      ))}
    </section>
  )
}

export function Home() {
  return (
    <>
      <Carousel />
      <Ticker />
      <Produtos />
      <Conceito />
      <ComoFunciona />
      <CriePetChamada />
      <Planos />
      <Depoimentos />
      <Duvidas />
    </>
  )
}
