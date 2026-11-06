import type { PetLook, PetProfile, Species } from '../types'

export interface Option {
  id: string
  label: string
}
export interface FurColor extends Option {
  color: string
  dark?: boolean
}
export interface Accessory extends Option {
  slot: 'head' | 'face' | 'neck'
}

export const FUR_COLORS: FurColor[] = [
  { id: 'baunilha', label: 'Baunilha', color: '#fff6dd' },
  { id: 'caramelo', label: 'Caramelo', color: '#f4b566' },
  { id: 'chocolate', label: 'Chocolate', color: '#94603f', dark: true },
  { id: 'cinza', label: 'Cinza', color: '#c2c0d2' },
  { id: 'preto', label: 'Preto', color: '#3b2a59', dark: true },
  { id: 'lavanda', label: 'Lavanda', color: '#907aff' },
  { id: 'chiclete', label: 'Chiclete', color: '#ff7af6' },
  { id: 'solar', label: 'Solar', color: '#ffff7b' },
]

export const PATTERNS: Option[] = [
  { id: 'lisa', label: 'Lisa' },
  { id: 'mancha', label: 'Com mancha' },
  { id: 'pintas', label: 'Pintadinha' },
  { id: 'listras', label: 'Listrada' },
]

export const TYPES: Record<Species, Option[]> = {
  dog: [
    { id: 'caida', label: 'Orelha caída' },
    { id: 'empe', label: 'Orelha em pé' },
    { id: 'poodle', label: 'Fofinho' },
  ],
  cat: [
    { id: 'pontuda', label: 'Orelha pontuda' },
    { id: 'dobrada', label: 'Orelha dobrada' },
    { id: 'peludo', label: 'Peludinho' },
  ],
}

export const ACCESSORIES: Accessory[] = [
  { id: 'laco', label: 'Laço', slot: 'head' },
  { id: 'festa', label: 'Chapéu de festa', slot: 'head' },
  { id: 'coroa', label: 'Coroa', slot: 'head' },
  { id: 'oculos', label: 'Óculos', slot: 'face' },
  { id: 'coleira', label: 'Coleira', slot: 'neck' },
  { id: 'bandana', label: 'Bandana', slot: 'neck' },
  { id: 'gravata', label: 'Gravata', slot: 'neck' },
]

export const AGES = ['Filhote', 'Adulto', 'Idoso']
export const SIZES = ['Pequeno', 'Médio', 'Grande']

export const emptyProfile = (): PetProfile => ({
  name: '',
  species: 'dog',
  breed: '',
  age: AGES[1],
  size: SIZES[1],
  allergies: '',
})

export const defaultLook = (species: Species): PetLook => ({
  fur: species === 'dog' ? 'caramelo' : 'baunilha',
  pattern: 'lisa',
  type: TYPES[species][0].id,
  accessories: [],
})

// Só um acessório por lugar do corpo: escolher outro troca o anterior.
export function toggleAccessory(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((a) => a !== id)
  const slot = ACCESSORIES.find((a) => a.id === id)?.slot
  const kept = selected.filter((a) => ACCESSORIES.find((o) => o.id === a)?.slot !== slot)
  return [...kept, id]
}
