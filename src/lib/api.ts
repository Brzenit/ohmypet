import type { PostgrestError } from '@supabase/supabase-js'
import { completeDetails } from '../data/petOptions'
import type { PatinhasGanho, PatinhasMovimento, PatinhasResgate, Pet, PetDetails, PetLook, RewardId, Subscription } from '../types'
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
  details: Partial<PetDetails> | null
  photo_path?: string | null
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
  details: completeDetails(r.details),
  photoPath: r.photo_path ?? undefined,
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
  if (pet.details !== undefined) row.details = pet.details
  return row
}

// Coluna `details` ainda não criada (migration 0002 não rodou): salva o pet sem o questionário.
const missingDetailsColumn = (error: PostgrestError | null) =>
  !!error && (error.code === 'PGRST204' || error.code === '42703') && error.message.includes('details')

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

async function savePet(
  write: (row: Partial<PetRow>) => PromiseLike<{ data: PetRow | null; error: PostgrestError | null }>,
  row: Partial<PetRow>,
): Promise<Pet> {
  if (!supabaseReady) throw new Error(OFFLINE)
  let first: { data: PetRow | null; error: PostgrestError | null }
  try {
    first = await write(row)
  } catch {
    throw new Error(OFFLINE)
  }
  if (!missingDetailsColumn(first.error)) return toPet(await run(Promise.resolve(first)))
  console.warn('A coluna pets.details não existe: rode supabase/migrations/0002_pet_details.sql.')
  const { details: _details, ...withoutDetails } = row
  return toPet(await run(write(withoutDetails)))
}

// O banco avisa o motivo da recusa com uma palavra; aqui vira frase para a pessoa.
const PATINHAS_ERRORS: Record<string, string> = {
  saldo_insuficiente: 'Você ainda não tem Patinhas suficientes para essa troca.',
  sem_assinatura: 'Só quem tem uma assinatura ativa pode trocar Patinhas.',
  limite_mensal: 'Você já fez essa troca neste mês. Volte no mês que vem!',
  pet_invalido: 'Não encontramos esse pet na sua conta.',
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  if (!supabaseReady) throw new Error(OFFLINE)
  let result: { data: unknown; error: PostgrestError | null }
  try {
    result = await supabase.rpc(fn, args)
  } catch {
    throw new Error(OFFLINE)
  }
  if (result.error) {
    const known = PATINHAS_ERRORS[result.error.message]
    if (known) throw new Error(known)
    console.error(result.error)
    throw new Error(OFFLINE)
  }
  return result.data as T
}

interface MovimentoRow {
  id: number
  tipo: PatinhasMovimento['tipo']
  valor: number
  ref: string | null
  criado_em: string
}

interface ResgateRow {
  id: number
  recompensa: PatinhasResgate['recompensa']
  custo: number
  status: PatinhasResgate['status']
  criado_em: string
}

export const api = {
  /** Envia a foto do pet real para o bucket privado e devolve o caminho dela. */
  uploadPetPhoto: async (userId: string, petId: number, photo: Blob) => {
    if (!supabaseReady) throw new Error(OFFLINE)
    const path = `${userId}/${petId}.jpg`
    const { error } = await supabase.storage.from('pet-photos').upload(path, photo, { upsert: true, contentType: 'image/jpeg' })
    if (error) {
      console.error(error)
      throw new Error(OFFLINE)
    }
    // Se a coluna photo_path ainda não existe (migration 0004), a foto fica guardada do mesmo jeito.
    const { error: linkError } = await supabase.from('pets').update({ photo_path: path }).eq('id', petId)
    if (linkError) console.warn('Não conseguimos ligar a foto ao pet. Rode supabase/migrations/0004_pet_photos.sql.', linkError)
    return path
  },
  petPhotoUrl: async (path: string) => {
    if (!supabaseReady) throw new Error(OFFLINE)
    const { data, error } = await supabase.storage.from('pet-photos').createSignedUrl(path, 3600)
    if (error || !data) throw new Error(OFFLINE)
    return data.signedUrl
  },

  patinhas: {
    balance: () => rpc<number>('patinhas_saldo'),
    earn: (tipo: 'banho' | 'pet' | 'assinatura', ref?: string | number) =>
      rpc<PatinhasGanho>('patinhas_ganhar', { p_tipo: tipo, p_ref: ref === undefined ? null : String(ref) }),
    redeem: (reward: RewardId) => rpc<{ saldo: number }>('patinhas_resgatar', { p_recompensa: reward }),
    history: async (): Promise<PatinhasMovimento[]> =>
      (await run(supabase.from('patinhas_movimentos').select('*').order('id', { ascending: false }).limit(30)) as MovimentoRow[]).map((r) => ({
        id: r.id,
        tipo: r.tipo,
        valor: r.valor,
        ref: r.ref,
        criadoEm: r.criado_em,
      })),
    redemptions: async (): Promise<PatinhasResgate[]> =>
      (await run(supabase.from('patinhas_resgates').select('*').order('id', { ascending: false }).limit(20)) as ResgateRow[]).map((r) => ({
        id: r.id,
        recompensa: r.recompensa,
        custo: r.custo,
        status: r.status,
        criadoEm: r.criado_em,
      })),
  },

  listPets: async (userId: string) =>
    (await run(supabase.from('pets').select('*').eq('user_id', userId).order('id'))).map(toPet),
  getPet: async (id: number) => toPet(await run(supabase.from('pets').select('*').eq('id', id).single())),
  createPet: (pet: Omit<Pet, 'id'>) =>
    savePet((row) => supabase.from('pets').insert(row).select().single(), petColumns(pet)),
  updatePet: (id: number, pet: Partial<Pet>) =>
    savePet((row) => supabase.from('pets').update(row).eq('id', id).select().single(), petColumns(pet)),
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
