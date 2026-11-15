/**
 * Marcas parceiras da página Quem somos nós (textos de textos-site-fornecedores.md).
 * Ficam em ordem alfabética de propósito, para a ordem não dizer nada sobre a composição da box,
 * e nenhum texto liga uma marca a uma categoria de produto.
 * Antes de publicar de verdade, confirme com cada marca a autorização para citar o nome e usar a logo.
 */

import freeFaro from '../assets/marcas/free-faro.png'
import granado from '../assets/marcas/granado.svg'
import klabin from '../assets/marcas/klabin.png'
import papelSemente from '../assets/marcas/papel-semente.png'
import petz from '../assets/marcas/petz.png'
import woolie from '../assets/marcas/woolie.png'
import zeeDog from '../assets/marcas/zee-dog.png'

export interface Marca {
  id: string
  name: string
  /** Letras do círculo enquanto a marca não autorizar o uso da logo. */
  initials: string
  color: string
  /** Logo da marca (arquivos em src/assets/marcas/), quando autorizada. */
  logo?: string
  /** Cor de fundo atrás da logo, para ela aparecer bem. */
  logoBg?: string
  text: string
  url: string
}

export const MARCAS: Marca[] = [
  {
    id: 'free-faro',
    name: 'Free Faro',
    initials: 'FF',
    color: 'var(--amarelo)',
    logo: freeFaro,
    logoBg: '#000000',
    text: 'Marca sediada em Maringá, no Paraná, que dedica uma coleção à causa animal.',
    url: 'https://www.freefaro.com.br',
  },
  {
    id: 'granado-pet',
    name: 'Granado Pet',
    initials: 'GP',
    color: 'var(--rosa)',
    logo: granado,
    logoBg: '#1d1d1b',
    text: 'Uma marca brasileira com mais de 150 anos de tradição, que leva para o universo pet o cuidado, a qualidade e o respeito que construiu ao longo da sua história.',
    url: 'https://www.granado.com.br',
  },
  {
    id: 'klabin',
    name: 'Klabin',
    initials: 'K',
    color: 'var(--lavanda)',
    logo: klabin,
    logoBg: '#00a751',
    text: 'Uma gigante brasileira com compromisso com o meio ambiente, que cuida de florestas próprias certificadas e preserva áreas de mata nativa.',
    url: 'https://klabin.com.br',
  },
  {
    id: 'papel-semente',
    name: 'Papel Semente',
    initials: 'PS',
    color: 'var(--amarelo)',
    logo: papelSemente,
    logoBg: '#ffffff',
    text: 'Uma empresa brasileira pioneira em produtos plantáveis, reconhecida pelo Sistema B e movida pela economia circular e pelo impacto social nas comunidades onde atua.',
    url: 'https://papelsemente.com.br',
  },
  {
    id: 'petz',
    name: 'Petz',
    initials: 'P',
    color: 'var(--rosa)',
    logo: petz,
    logoBg: '#ffffff',
    text: 'Uma marca conhecida de quem ama animais, que tem a paixão por pets e o prazer em servir entre os seus valores.',
    url: 'https://www.petz.com.br',
  },
  {
    id: 'woolie',
    name: 'Woolie',
    initials: 'W',
    color: 'var(--lavanda)',
    logo: woolie,
    logoBg: '#ffffff',
    text: 'Uma marca brasileira de design que pensa cada produto a partir do bem-estar do animal e da convivência com quem cuida dele.',
    url: 'https://www.woolie.com.br',
  },
  {
    id: 'zee',
    name: 'Zee.Dog e Zee.Cat',
    initials: 'Z',
    color: 'var(--amarelo)',
    logo: zeeDog,
    logoBg: '#ffffff',
    text: 'Nascidas do amor por dois cães adotados, as marcas têm como propósito conectar animais e pessoas por meio de um design pensado em cada detalhe.',
    url: 'https://www.zeedog.com',
  },
]
