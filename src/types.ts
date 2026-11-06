export type Species = 'dog' | 'cat'
export type PlanId = 'mini' | 'wow' | 'luxe'
export type Billing = 'mensal' | 'anual'

export interface User {
  id: number
  name: string
  email: string
  password: string
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
  userId: number
  look: PetLook
}

export interface Subscription {
  id: number
  userId: number
  petId: number
  // Assinaturas antigas guardam 'mensal', 'trimestral' ou 'anual' aqui e não têm billing.
  planId: string
  billing?: Billing
  status: 'ativa' | 'cancelada'
  createdAt: string
}
