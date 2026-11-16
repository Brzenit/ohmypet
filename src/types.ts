export type Species = 'dog' | 'cat'
export type PlanId = 'mini' | 'wow' | 'luxe'
export type Billing = 'mensal' | 'anual'

export interface User {
  /** Id da conta no Auth do Supabase. */
  id: string
  name: string
  email: string
}

export interface PetLook {
  fur: string
  pattern: string
  type: string
  accessories: string[]
}

/** Respostas do questionário do pet. Texto vazio e lista vazia significam "não respondeu". */
export interface PetDetails {
  sex: string
  neutered: string
  ageYears: string
  ageMonths: string
  ageUnknown: boolean
  ageRange: string
  /** Quando a pessoa escolhe a fase da vida na mão, a sugestão pela idade para de mexer nela. */
  ageManual: boolean
  birthday: string
  birthdayUnknown: boolean
  celebrate: string
  adoptedAt: string
  diet: string[]
  allergyTypes: string[]
  health: string[]
  healthNotes: string
  medication: string
  medicationName: string
  temperament: string[]
  energy: number
  destroys: string
  playStyles: string[]
  social: string
  treatsLove: string
  treatsNever: string
  toysAvoid: string
  neck: string
  /** Respostas das perguntas só de cão ou só de gato, por id da pergunta. */
  extra: Record<string, string[]>
}

export interface PetProfile {
  name: string
  species: Species
  breed: string
  /** Fase da vida: Filhote, Adulto ou Idoso. */
  age: string
  size: string
  /** Resumo de restrições e alergias, usado na conta e na montagem da box. */
  allergies: string
  details: PetDetails
}

export interface Pet extends PetProfile {
  id: number
  userId: string
  look: PetLook
  /** Caminho da foto do pet real no bucket pet-photos, quando a pessoa enviou. */
  photoPath?: string
}

export interface BlogPost {
  id: number
  slug: string
  title: string
  summary: string
  category: string
  /** Markdown simples (ver components/Markdown.tsx). */
  content: string
  authorName: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  /** Post de exemplo mostrado quando o site está sem banco (só no computador de quem desenvolve). */
  demo?: boolean
}

/** Os campos que quem publica preenche. */
export interface BlogDraft {
  slug: string
  title: string
  summary: string
  category: string
  content: string
  authorName: string
  published: boolean
}

export type PatinhasTipo = 'banho' | 'sequencia' | 'pet' | 'assinatura' | 'resgate' | 'expiracao'
export type RewardId = 'mimo' | 'desc5' | 'desc10' | 'frete' | 'ong'

export interface PatinhasMovimento {
  id: number
  tipo: PatinhasTipo
  /** Positivo ganha, negativo gasta. */
  valor: number
  ref: string | null
  criadoEm: string
}

export interface PatinhasResgate {
  id: number
  recompensa: RewardId
  custo: number
  status: 'disponivel' | 'aplicado'
  criadoEm: string
}

/** O que o banco respondeu ao tentar creditar Patinhas. */
export interface PatinhasGanho {
  creditado: number
  saldo: number
  /** ok · sequencia · ja_ganhou_hoje · ja_ganhou · limite_mensal · limite_pets */
  motivo: string
}

export interface Subscription {
  id: number
  userId: string
  petId: number
  // Assinaturas antigas guardam 'mensal', 'trimestral' ou 'anual' aqui e não têm billing.
  planId: string
  billing?: Billing
  status: 'ativa' | 'cancelada'
  createdAt: string
}
