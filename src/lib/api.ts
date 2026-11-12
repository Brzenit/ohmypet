import type { PostgrestError } from '@supabase/supabase-js'
import type { Pet, PetLook, Subscription } from '../types'
import { supabase, supabaseReady } from './supabase'

const OFFLINE = 'Não conseguimos falar com o servidor. Tente de novo em instantes.'

interface PetRow {
  id: number
  user_id: string
  name: string
  species: Pet['species']
  breed: string
  age: string
  size: string
  allergies: string
  look: PetLook
}

interface SubscriptionRow {
  id: number
  user_id: string
  pet_id: number
  plan_id: string
  billing: Subscription['billing'] | null
  status: Subscription['status']
  created_at: string
}

const toPet = (r: PetRow): Pet => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  species: r.species,
  breed: r.breed,
  age: r.age,
  size: r.size,
  allergies: r.allergies,
  look: r.look,
})

const toSubscription = (r: SubscriptionRow): Subscription => ({
  id: r.id,
  userId: r.user_id,
  petId: r.pet_id,
  planId: r.plan_id,
  billing: r.billing ?? undefined,
  status: r.status,
  createdAt: r.created_at,
})

function petColumns(pet: Partial<Pet>) {
  const row: Partial<PetRow> = {}
  if (pet.userId !== undefined) row.user_id = pet.userId
  if (pet.name !== undefined) row.name = pet.name
  if (pet.species !== undefined) row.species = pet.species
  if (pet.breed !== undefined) row.breed = pet.breed
  if (pet.age !== undefined) row.age = pet.age
  if (pet.size !== undefined) row.size = pet.size
  if (pet.allergies !== undefined) row.allergies = pet.allergies
  if (pet.look !== undefined) row.look = pet.look
  return row
}

async function run<T>(query: PromiseLike<{ data: T | null; error: PostgrestError | null }>): Promise<T> {
  if (!supabaseReady) throw new Error(OFFLINE)
  let result: { data: T | null; error: PostgrestError | null }
  try {
    result = await query
  } catch {
    throw new Error(OFFLINE)
  }
  if (result.error) {
    console.error(result.error)
    throw new Error(result.error.code === 'PGRST116' ? 'Não encontramos esse item.' : OFFLINE)
  }
  return result.data as T
}

export const api = {
  listPets: async (userId: string) =>
    (await run(supabase.from('pets').select('*').eq('user_id', userId).order('id'))).map(toPet),
  getPet: async (id: number) => toPet(await run(supabase.from('pets').select('*').eq('id', id).single())),
  createPet: async (pet: Omit<Pet, 'id'>) =>
    toPet(await run(supabase.from('pets').insert(petColumns(pet)).select().single())),
  updatePet: async (id: number, pet: Partial<Pet>) =>
    toPet(await run(supabase.from('pets').update(petColumns(pet)).eq('id', id).select().single())),
  deletePet: async (id: number) => {
    await run(supabase.from('pets').delete().eq('id', id))
  },

  listSubscriptions: async (userId: string) =>
    (await run(supabase.from('subscriptions').select('*').eq('user_id', userId).order('id'))).map(toSubscription),
  createSubscription: async (sub: Omit<Subscription, 'id'>) =>
    toSubscription(
      await run(
        supabase
          .from('subscriptions')
          .insert({ user_id: sub.userId, pet_id: sub.petId, plan_id: sub.planId, billing: sub.billing ?? null, status: sub.status, created_at: sub.createdAt })
          .select()
          .single(),
      ),
    ),
  updateSubscription: async (id: number, sub: Partial<Subscription>) =>
    toSubscription(await run(supabase.from('subscriptions').update({ status: sub.status }).eq('id', id).select().single())),

  subscribeNewsletter: async (email: string) => {
    if (!supabaseReady) throw new Error(OFFLINE)
    const { error } = await supabase.from('newsletter').insert({ email: email.trim().toLowerCase() })
    // E-mail já inscrito conta como sucesso: a pessoa já recebe as novidades.
    if (error && error.code !== '23505') {
      console.error(error)
      throw new Error(OFFLINE)
    }
  },
}
