import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Markdown simples para os posts do blog: títulos (## e ###), parágrafos, listas, citação (>),
 * linha (---), imagem (![descrição](endereço)), **negrito**, *itálico* e [links](endereço).
 * O texto vira elementos do React, nunca HTML cru, então um post não consegue injetar código na página.
 */

const SAFE_LINK = /^(https?:\/\/|\/|#|mailto:)/
const SAFE_IMAGE = /^(https:\/\/|\/(?!\/))/

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link) {
      const [, label, href] = link
      if (!SAFE_LINK.test(href)) return <Fragment key={i}>{label}</Fragment>
      if (href.startsWith('/')) return <Link key={i} to={href}>{label}</Link>
      return (
        <a key={i} href={href} target={href.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer">
          {label}
        </a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let quote: string[] = []
  const key = () => blocks.length

  const flush = () => {
    if (paragraph.length) blocks.push(<p key={key()}>{inline(paragraph.join(' '))}</p>)
    if (list) {
      const items = list.items.map((item, i) => <li key={i}>{inline(item)}</li>)
      blocks.push(list.ordered ? <ol key={key()}>{items}</ol> : <ul key={key()}>{items}</ul>)
    }
    if (quote.length) blocks.push(<blockquote key={key()}>{inline(quote.join(' '))}</blockquote>)
    paragraph = []
    list = null
    quote = []
  }

  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    const bullet = /^[-*]\s+(.*)$/.exec(line)
    const numbered = /^\d+\.\s+(.*)$/.exec(line)
    const quoted = /^>\s?(.*)$/.exec(line)
    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line)

    if (!line.trim()) {
      flush()
    } else if (heading) {
      flush()
      // O título do post já é o h1 da página, então "#" e "##" viram h2 e "###" vira h3.
      blocks.push(heading[1].length === 3 ? <h3 key={key()}>{inline(heading[2])}</h3> : <h2 key={key()}>{inline(heading[2])}</h2>)
    } else if (image) {
      flush()
      if (SAFE_IMAGE.test(image[2])) {
        blocks.push(
          <figure key={key()}>
            <img src={image[2]} alt={image[1]} loading="lazy" />
            {image[1] && <figcaption>{image[1]}</figcaption>}
          </figure>,
        )
      }
    } else if (/^-{3,}$/.test(line)) {
      flush()
      blocks.push(<hr key={key()} />)
    } else if (bullet || numbered) {
      const ordered = !!numbered
      if (paragraph.length || quote.length || (list && list.ordered !== ordered)) flush()
      list ??= { ordered, items: [] }
      list.items.push((bullet ?? numbered)![1])
    } else if (quoted) {
      if (paragraph.length || list) flush()
      quote.push(quoted[1])
    } else {
      if (list || quote.length) flush()
      paragraph.push(line.trim())
    }
  }
  flush()
  return <>{blocks}</>
}

/** Tempo de leitura em minutos, a 200 palavras por minuto. */
export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200))
