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

export interface PetProfile {
  name: string
  species: Species
  breed: string
  age: string
  size: string
  allergies: string
}

export interface Pet extends PetProfile {
  id: number
  userId: string
  look: PetLook
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
