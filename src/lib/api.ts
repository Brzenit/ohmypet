import type { Pet, Subscription, User } from '../types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new Error('Não conseguimos falar com o servidor. Ele está rodando?')
  }
  if (!res.ok) throw new Error('Não conseguimos falar com o servidor. Ele está rodando?')
  return res.json() as Promise<T>
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })

export const api = {
  findUserByEmail: async (email: string) =>
    (await request<User[]>(`/users?email=${encodeURIComponent(email)}`))[0],
  getUser: (id: number) => request<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id'>) => post<User>('/users', user),

  listPets: (userId: number) => request<Pet[]>(`/pets?userId=${userId}`),
  getPet: (id: number) => request<Pet>(`/pets/${id}`),
  createPet: (pet: Omit<Pet, 'id'>) => post<Pet>('/pets', pet),
  updatePet: (id: number, pet: Partial<Pet>) => patch<Pet>(`/pets/${id}`, pet),
  deletePet: (id: number) => request<unknown>(`/pets/${id}`, { method: 'DELETE' }),

  listSubscriptions: (userId: number) =>
    request<Subscription[]>(`/subscriptions?userId=${userId}`),
  createSubscription: (sub: Omit<Subscription, 'id'>) =>
    post<Subscription>('/subscriptions', sub),
  updateSubscription: (id: number, sub: Partial<Subscription>) =>
    patch<Subscription>(`/subscriptions/${id}`, sub),

  subscribeNewsletter: (email: string) => post<unknown>('/newsletter', { email }),
}
