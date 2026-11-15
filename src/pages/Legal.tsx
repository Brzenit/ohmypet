import { Link } from 'react-router-dom'
import { PawField } from '../components/ui'
import { LEGAL_UPDATED, PRIVACY, TERMS, type Block, type LegalDoc } from '../data/legal'
import './legal.css'

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        typeof b === 'string' ? (
          <p key={i}>{b}</p>
        ) : (
          <ul key={i}>
            {b.list.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ),
      )}
    </>
  )
}

function LegalPage({ doc, other }: { doc: LegalDoc; other: { to: string; label: string } }) {
  return (
    <>
      <div className="pagina-topo">
        <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
        <h1>{doc.title}</h1>
        <p>{doc.intro}</p>
      </div>
      <section className="bloco legal">
        <nav className="legal-indice cartao" aria-label="Neste documento">
          <strong>Neste documento</strong>
          <ol>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title.replace(/^\d+\.\s*/, '')}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="legal-texto">
          <p className="legal-data">Atualizado em {LEGAL_UPDATED}</p>
          <aside className="legal-resumo cartao">
            <h2>Resumo rápido</h2>
            <ul>
              {doc.summary.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p>O texto completo vem logo abaixo, e é ele que vale.</p>
          </aside>
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="legal-secao">
              <h2>{s.title}</h2>
              <Blocks blocks={s.body} />
            </section>
          ))}
          <p className="legal-outro">
            Leia também: <Link to={other.to}>{other.label}</Link>
          </p>
        </article>
      </section>
    </>
  )
}

export const Terms = () => <LegalPage doc={TERMS} other={{ to: '/privacidade', label: 'Política de privacidade' }} />
export const Privacy = () => <LegalPage doc={PRIVACY} other={{ to: '/termos', label: 'Termos de uso' }} />
