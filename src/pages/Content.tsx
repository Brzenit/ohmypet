import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import caixas from '../assets/caixas-novas.webp'
import petiscos from '../assets/brand-3.webp'
import ajude from '../assets/step-4.webp'
import { PetAvatar } from '../components/PetAvatar'
import { PawField, Reveal, Rotator } from '../components/ui'
import { TEAM } from '../data/content'
import { ADOPTION_STEPS, ONGS, ONG_FAQ } from '../data/ongs'
import './content.css'

function OngFaq() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bloco duvidas">
      <Reveal as="h2" className="titulo">Respostas para as dúvidas mais comuns</Reveal>
      {ONG_FAQ.map((item, i) => (
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

export function Ongs() {
  return (
    <>
      <div className="pagina-topo ongs-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>Todo pet merece um lar. Todo lar merece um pet que chegou com cuidado.</h1>
        <p>Adotar por uma ONG é um gesto de amor que começa antes da chegada em casa. Conheça quem trabalha todos os dias para que cada animal encontre uma família, e saiba por que dá para confiar nesse caminho.</p>
        <a className="btn amarelo ongs-topo-botao" href="#ongs">Quero conhecer as ONGs</a>
      </div>

      <section className="bloco texto-imagem">
        <Reveal kind="left" className="texto-imagem-foto selo-redondo">
          <img src={ajude} alt="" />
        </Reveal>
        <Reveal kind="right">
          <h2>Quando você adota, a história muda para os dois lados</h2>
          <p>Todo animal que chega a uma ONG tem uma história. Muitos foram abandonados, outros foram resgatados de situações difíceis, e todos foram cuidados por pessoas que se dedicam a eles muito antes de você aparecer. Quando você adota, deixa de ser só um tutor: passa a fazer parte dessa história.</p>
          <p>E existe um motivo muito bom para confiar. As ONGs conhecem de perto cada animal que cuidam. Elas sabem se aquele cachorro é mais calmo ou mais agitado, se aquela gatinha gosta de colo ou prefere observar de longe, e usam esse conhecimento para ajudar você a encontrar o companheiro que combina com a sua rotina. Não é só entregar um animal, é fazer um encontro dar certo.</p>
          <p>Adotar também é um jeito de abrir espaço. Cada animal que encontra um lar libera uma vaga para outro ser resgatado. Seu “sim” ajuda mais de uma vida.</p>
        </Reveal>
      </section>

      <section className="bloco faixa-lavanda ongs-duvida">
        <Reveal as="h2" className="titulo">Sentir insegurança faz parte, e está tudo bem</Reveal>
        <Reveal kind="pop" delay={100} className="cartao ongs-duvida-cartao">
          <p>Se você já pensou “será que eu vou dar conta?”, saiba que é uma das perguntas mais comuns de quem quer adotar. Ela não é um sinal de que você não está pronto. Pelo contrário: quem se pergunta isso já está pensando com carinho no bem-estar do animal.</p>
          <p>Você não precisa saber tudo antes de começar. As ONGs conversam com quem quer adotar, tiram dúvidas e orientam sobre os cuidados. A Oh My Pet! caminha ao seu lado desde o primeiro dia: com a box mensal e o guia de cuidados passo a passo, a rotina com o seu pet fica mais leve e cabe no seu orçamento. Você cuida de quem ama, e a gente ajuda a organizar o resto.</p>
        </Reveal>
      </section>

      <section className="bloco ongs-lista" id="ongs">
        <Reveal as="h2" className="titulo">Quem cuida de perto, para você adotar com confiança</Reveal>
        <Reveal as="p" delay={80} className="ongs-abertura">
          Reunimos organizações de São Paulo e região que dedicam o dia a dia aos animais. Cada uma tem o seu jeito de ajudar, e todas compartilham o mesmo desejo: que cada bichinho encontre um lar de verdade.
        </Reveal>
        <div className="ongs-grade">
          {ONGS.map((ong, i) => (
            <Reveal key={ong.id} kind="pop" delay={i * 110} className="cartao ong-cartao">
              <div className={`ong-logo ${ong.logo ? 'com-logo' : ''}`} style={{ '--cor': ong.logoBg ?? ong.color } as CSSProperties}>
                {ong.logo ? <img src={ong.logo} alt={`Logo da ${ong.name}`} /> : <span aria-hidden="true">{ong.initials}</span>}
              </div>
              <h3>{ong.name}</h3>
              <strong className="ong-chamada">{ong.tagline}</strong>
              <p>{ong.text}</p>
              <a className="btn" href={ong.url} target="_blank" rel="noopener noreferrer">{ong.button}</a>
            </Reveal>
          ))}
        </div>
        <p className="ongs-aviso">As informações sobre cada ONG foram retiradas dos canais oficiais das organizações. Para adotar, entre em contato diretamente com elas.</p>
      </section>

      <section className="bloco faixa-amarela ongs-passos">
        <Reveal as="h2" className="titulo">O caminho até o seu novo amigo</Reveal>
        <ol className="tres-colunas ongs-passos-lista">
          {ADOPTION_STEPS.map((step, i) => (
            <Reveal key={step.title} as="li" kind="pop" delay={i * 110} className="cartao coluna">
              <span className="coluna-numero">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </ol>
        <p className="ongs-aviso">Cada ONG tem o seu próprio processo de adoção, então confirme os detalhes diretamente com ela.</p>
      </section>

      <OngFaq />

      <section className="bloco chamada-final">
        <Reveal as="h2" className="titulo">Seu novo melhor amigo pode estar esperando por você</Reveal>
        <Reveal as="p" delay={80}>
          Dar um lar a um animal é uma das decisões mais bonitas que alguém pode tomar, e você não precisa fazer isso sozinho. As ONGs cuidam, a Oh My Pet! acompanha, e você ganha um companheiro para a vida.
        </Reveal>
        <Reveal delay={140} className="ongs-botoes">
          <a className="btn bater" href="#ongs">Quero adotar</a>
          <Link className="btn secundario" to="/#planos">Conhecer a box</Link>
        </Reveal>
        <p className="ongs-frase">Adotar é um ato de amor. A gente caminha com você.</p>
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
          <h2>Agora é a vez do seu pet</h2>
          <p>Você já conhece quem somos e por que estamos aqui: para tirar o peso da rotina e deixar mais espaço para o que importa, a companhia do seu pet. Conte quem ele é e a gente monta uma box pensada só para vocês dois.</p>
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
