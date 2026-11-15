/**
 * Textos da página de ONGs (vieram de textos-site-ongs.md).
 * As informações de cada ONG foram conferidas nos canais oficiais; números e regiões mudam com o tempo,
 * então vale revisar antes de publicar de verdade.
 */

import adoteUmGatinho from '../assets/ongs/adote-um-gatinho.jpg'
import amparaAnimal from '../assets/ongs/ampara-animal.png'
import caoSemDono from '../assets/ongs/cao-sem-dono.png'
import entreLares from '../assets/ongs/entre-lares.png'

export interface Ong {
  id: string
  name: string
  /** Letras do círculo enquanto a ONG não autorizar o uso da logo. */
  initials: string
  color: string
  /** Logo da ONG (arquivos em src/assets/ongs/). Sem logo, aparece o círculo com as iniciais. */
  logo?: string
  /** Cor de fundo atrás da logo: a mesma da imagem ou uma que a faça aparecer. */
  logoBg?: string
  tagline: string
  text: string
  button: string
  url: string
}

export const ONGS: Ong[] = [
  {
    id: 'cao-sem-dono',
    name: 'Cão Sem Dono',
    initials: 'CSD',
    color: 'var(--amarelo)',
    logo: caoSemDono,
    logoBg: '#ffffff',
    tagline: 'De abandono a esperança',
    text: 'Desde 2005, a Cão Sem Dono dedica-se a resgatar, tratar e encontrar famílias para animais abandonados e maltratados. Com dois abrigos e sede em Itapecerica da Serra, cuida de mais de 500 animais, sempre com a ideia de transformar abandono em esperança. Quem quer adotar recebe orientação e pode também apadrinhar um animal, ajudando a cuidar de quem ainda espera por um lar.',
    button: 'Conhecer a Cão Sem Dono',
    url: 'https://caosemdono.com.br',
  },
  {
    id: 'adote-um-gatinho',
    name: 'Adote um Gatinho',
    initials: 'AG',
    color: 'var(--rosa)',
    logo: adoteUmGatinho,
    logoBg: '#eafe07',
    tagline: 'Gatinhos a caminho de lares seguros',
    text: 'A Adote um Gatinho resgata, trata, castra e doa gatinhos para lares seguros em São Paulo e no ABC. Além de cuidar de cada gato, a ONG conversa com a comunidade sobre a importância da castração e da posse responsável, e mostra com transparência como suas atividades acontecem. Para quem quer um companheiro de ronronados, é um ótimo ponto de partida.',
    button: 'Conhecer a Adote um Gatinho',
    url: 'https://adoteumgatinho.org.br/',
  },
  {
    id: 'ampara-animal',
    name: 'Instituto Ampara Animal',
    initials: 'IAA',
    color: 'var(--lavanda)',
    logo: amparaAnimal,
    logoBg: '#5813ad',
    tagline: 'Educação e castração',
    text: 'Fundado em 2010 por mulheres, o Instituto Ampara Animal defende os direitos dos animais com educação, conscientização e campanhas de castração e adoção. Ele não mantém abrigo nem resgata animais: o foco é educar, castrar e organizar campanhas de adoção. Como organização reconhecida como OSCIP e com relatórios anuais de atividades, mostra com clareza o que faz. É um bom lugar para aprender a ser um tutor mais consciente antes mesmo de adotar.',
    button: 'Conhecer o Ampara Animal',
    url: 'https://institutoamparanimal.org.br/',
  },
  {
    id: 'entre-lares',
    name: 'Entre Lares',
    initials: 'EL',
    color: 'var(--amarelo)',
    logo: entreLares,
    logoBg: '#ffffff',
    tagline: 'Um projeto pequeno com um coração enorme',
    text: 'A Entre Lares é um projeto independente de adoção responsável de São Paulo. Já são mais de 600 gatos salvos, cada um com a chance de começar uma vida nova. É a prova de que gente comum, movida por afeto e dedicação, consegue mudar muitas histórias.',
    button: 'Conhecer a Entre Lares',
    url: 'https://www.instagram.com/entrelaress',
  },
]

export const ADOPTION_STEPS = [
  { title: 'Conheça os animais', text: 'Veja quem está esperando por um lar nas redes e nos sites das ONGs.' },
  { title: 'Converse com a ONG', text: 'Conte sobre a sua rotina, a sua casa e o que você procura. É assim que a ONG ajuda a encontrar o companheiro certo.' },
  { title: 'Prepare a chegada', text: 'Separe um cantinho tranquilo e receba orientações sobre os primeiros dias.' },
  { title: 'Aproveite a companhia', text: 'E conte com a Oh My Pet! para deixar a rotina de cuidados mais simples.' },
]

export const ONG_FAQ = [
  {
    q: 'Preciso ter muito dinheiro para adotar?',
    a: 'Não. O que mais importa é ter carinho, tempo e disposição para cuidar. Os gastos com um pet existem, e é justamente por isso que a nossa assinatura transforma compras imprevisíveis em um valor mensal planejado.',
  },
  {
    q: 'Não tenho tempo livre sobrando. Posso adotar mesmo assim?',
    a: 'Pode, desde que haja espaço na rotina para dar atenção ao animal. A box chega à sua casa todo mês, para você gastar menos tempo com compras e mais tempo com o seu pet.',
  },
  {
    q: 'E se eu nunca tive um animal?',
    a: 'Todo tutor já foi iniciante um dia. As ONGs orientam quem está adotando pela primeira vez, e o guia que vai na box ensina os cuidados passo a passo.',
  },
  {
    q: 'Adotar é mesmo melhor do que comprar?',
    a: 'Cada animal tem o direito a uma família, e adotar dá a um bichinho que já existe a chance de ter uma. Muitos tutores no Brasil já preferem esse caminho, e é ele que a Oh My Pet! escolhe apoiar.',
  },
]
