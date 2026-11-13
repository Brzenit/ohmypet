import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import caixas from '../assets/caixas-novas.webp'
import petiscos from '../assets/brand-3.webp'
import ajude from '../assets/step-4.webp'
import { PetAvatar } from '../components/PetAvatar'
import { Paw, PawField, Reveal, Rotator } from '../components/ui'
import { LOREM, LOREM_SHORT, TEAM } from '../data/content'
import './content.css'

export function Ongs() {
  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>Tudo sobre ONG’s</h1>
        <p>{LOREM_SHORT}</p>
      </div>
      <section className="bloco texto-imagem">
        <Reveal kind="left" className="texto-imagem-foto selo-redondo">
          <img src={ajude} alt="" />
        </Reveal>
        <Reveal kind="right">
          <h2>Ajude quem precisa</h2>
          <p>{LOREM}</p>
          <p>{LOREM_SHORT}</p>
        </Reveal>
      </section>
      <section className="bloco faixa-lavanda">
        <Reveal as="h2" className="titulo">Lorem ipsum dolor</Reveal>
        <div className="tres-colunas">
          {[1, 2, 3].map((n, i) => (
            <Reveal key={n} kind="pop" delay={i * 130} className="cartao coluna">
              <span className="coluna-numero"><Paw size={26} /></span>
              <h3>ONG parceira {n}</h3>
              <p>{LOREM_SHORT}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bloco chamada-final">
        <Reveal as="h2" className="titulo">Cada box ajuda um pet</Reveal>
        <Reveal as="p" delay={80}>{LOREM_SHORT}</Reveal>
        <Reveal delay={140}><Link className="btn bater" to="/#planos">ASSINE JÁ!</Link></Reveal>
      </section>
    </>
  )
}

export function About() {
  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>Quem somos nós</h1>
        <p>O bem-estar do seu pet é nossa prioridade!</p>
      </div>
      <section className="bloco texto-imagem">
        <Reveal kind="left">
          <h2>Oh My Pet!</h2>
          <p>É um clube de assinatura pet que une varejo multimarcas, compras recorrentes e parcerias com fornecedores.</p>
          <p>Nasceu para resolver as duas maiores dores dos tutores: a <strong>falta de tempo</strong> e a <strong>imprevisibilidade</strong> dos custos.</p>
          <p>Com entregas programadas e curadoria de novos produtos, torna o cuidado com os pets mais simples, acessível e dinâmico, e apoia iniciativas de sustentabilidade e proteção animal.</p>
        </Reveal>
        <Reveal kind="right" className="texto-imagem-foto">
          <img src={caixas} alt="Três caixas Oh My Pet! nas cores violeta, roxo e amarelo" loading="lazy" />
        </Reveal>
      </section>
      <section className="bloco equipe">
        <Reveal as="h2" className="titulo">Nossa equipe completa</Reveal>
        <Reveal as="p" delay={80} className="equipe-sub">As pessoas por trás de cada box</Reveal>
        <Reveal delay={140}>
          <Rotator
            label="Equipe Oh My Pet!"
            className="equipe-rotator"
            items={TEAM.map((m) => ({
              key: m.name,
              node: (
                <article className="membro" style={{ '--cor': m.color } as CSSProperties}>
                  <img src={m.photo} alt={`Foto de ${m.name}`} loading="lazy" />
                  <div>
                    <h3>{m.name}</h3>
                    <span className="membro-cargo">{m.role}</span>
                    <p>{m.text}</p>
                  </div>
                </article>
              ),
            }))}
          />
        </Reveal>
      </section>
      <section className="bloco texto-imagem">
        <Reveal kind="left" className="texto-imagem-foto">
          <img src={petiscos} alt="Petiscos em formato de osso saindo da embalagem" loading="lazy" />
        </Reveal>
        <Reveal kind="right">
          <h2>Lorem ipsum</h2>
          <p>{LOREM}</p>
          <Link className="btn" to="/crie-seu-pet">CRIAR MEU PET</Link>
        </Reveal>
      </section>
    </>
  )
}

export function NotFound() {
  return (
    <section className="bloco chamada-final nao-encontrada">
      <div className="nao-encontrada-pet">
        <PetAvatar
          species="cat"
          look={{ fur: 'baunilha', pattern: 'listras', type: 'dobrada', accessories: ['oculos'] }}
          className="pulo"
          title="Gatinho de óculos"
        />
      </div>
      <h1>Ih, essa página fugiu!</h1>
      <p>Não encontramos o que você procurava.</p>
      <Link className="btn" to="/">VOLTAR PARA O INÍCIO</Link>
    </section>
  )
}
