import type { Billing, PlanId } from '../types'
import avatar1 from '../assets/avatar-1.jpg'
import avatar2 from '../assets/avatar-2.jpg'
import avatar3 from '../assets/avatar-3.jpg'
import avatar4 from '../assets/avatar-4.jpg'
import avatar5 from '../assets/avatar-5.jpg'
import beatriz from '../assets/equipe/beatriz.webp'
import hary from '../assets/equipe/hary.webp'
import kaua from '../assets/equipe/kaua.webp'
import maria from '../assets/equipe/maria.webp'
import nicole from '../assets/equipe/nicole.webp'
import sophia from '../assets/equipe/sophia.webp'

export interface Plan {
  id: PlanId
  name: string
  listCents: number
  cents: number
  annualDiscount: number
  items: string[]
  featured?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'mini',
    name: 'Oh My Mini!',
    listCents: 11090,
    cents: 9990,
    annualDiscount: 5,
    items: ['1 brinquedo', '2 petiscos', '1 acessório', '1 mimo', 'Caixa transformável'],
  },
  {
    id: 'wow',
    name: 'Oh My Wow!',
    listCents: 14090,
    cents: 12990,
    annualDiscount: 8,
    items: ['2 brinquedos', '2 petiscos', '1 acessório', '1 item de higiene', '1 mimo', 'Caixa transformável'],
    featured: true,
  },
  {
    id: 'luxe',
    name: 'Oh My Luxe!',
    listCents: 17090,
    cents: 14990,
    annualDiscount: 12,
    items: ['3 brinquedos', '2 petiscos', '2 acessórios', '1 item de higiene', '1 mimo', 'Caixa transformável'],
  },
]

export const findPlan = (id: string | null | undefined) => PLANS.find((p) => p.id === id)

export const parseBilling = (value: string | null): Billing => (value === 'anual' ? 'anual' : 'mensal')

export const monthlyCents = (plan: Plan, billing: Billing) =>
  billing === 'anual' ? Math.round((plan.cents * (100 - plan.annualDiscount)) / 100) : plan.cents

export const formatPrice = (cents: number) =>
  `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const TESTIMONIALS = [
  { user: 'Mariazinha_13', time: '12h', text: 'Meu dog amooou! Assim que abri a caixa, ele ficou doido.', likes: 121, avatar: avatar1 },
  { user: 'kau_kau🏳️‍🌈', time: '6h', text: 'A Mia amou tudoo, um arraso!!! Vou continuar assinando.', likes: 160, avatar: avatar2 },
  { user: 'Beeeaah', time: '4h', text: 'Finalmente uma assinatura que entende que cada pet é único!!!!', likes: 98, avatar: avatar3 },
  { user: 'Gooticaa_Hary', time: '3h', text: 'O Salem ficou muito viciado nos petiscos ainda bem que assinei anual!', likes: 57, avatar: avatar4 },
  { user: 'nickzinhah', time: '15h', text: 'O Theo amou todos os brinquedos! Vale SUPER a pena!!!', likes: 68, avatar: avatar5 },
]

export const FAQ = [
  { q: 'Para quais pets são as boxes?', a: 'Para cães e gatos. Você cria o perfil do seu companheiro e a gente monta a seleção de itens pensando nele.' },
  { q: 'Meu pet tem alergia, e agora?', a: 'Sem problemas! Conte as alergias e restrições no perfil do seu pet e os itens que não servem para ele ficam de fora da box.' },
  { q: 'Onde vocês entregam?', a: 'Entregamos na sua casa. O frete é cobrado à parte da mensalidade.' },
  { q: 'Posso cancelar?', a: 'Pode, sim! Você cancela quando quiser, sem complicação.' },
  { q: 'E a caixa, vai para o lixo?', a: 'De jeito nenhum! Nossa embalagem ganha uma nova função a cada mês, com ideias criativas para você reutilizar.' },
]

export const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
export const LOREM_SHORT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'

/** Equipe da página Quem somos nós; cor é a da sombra recortada atrás da foto. */
export const TEAM = [
  { name: 'Beatriz', role: 'Relações públicas e parcerias', text: 'Cuida da comunicação da marca e desenvolve parcerias com ONGs e projetos ligados à causa animal.', photo: beatriz, color: 'var(--amarelo)' },
  { name: 'Sophia', role: 'Diretora de arte', text: 'Cuida de toda a identidade visual da Oh My Pet!, garantindo que cada detalhe tenha nossa personalidade.', photo: sophia, color: 'var(--roxo)' },
  { name: 'Kauã', role: 'Diretor de marketing e estratégia', text: 'Planeja as estratégias de marketing e trabalha para fortalecer a marca e aproximá-la de cada vez mais tutores.', photo: kaua, color: 'var(--rosa)' },
  { name: 'Nicole', role: 'Fotógrafa e social media', text: 'Registra momentos especiais e cuida das redes sociais, aproximando a marca da nossa comunidade pet.', photo: nicole, color: 'var(--lavanda)' },
  { name: 'Maria', role: 'Planejamento estratégico e CRM', text: 'Planeja a experiência dos tutores e cuida do relacionamento com os clientes, sempre pensando em como tornar cada contato especial.', photo: maria, color: 'var(--amarelo)' },
  { name: 'Hary', role: 'Redatora e planejamento de conteúdo', text: 'Dá voz e cria conteúdos que traduzem a personalidade da marca de forma leve e criativa.', photo: hary, color: 'var(--roxo)' },
]
