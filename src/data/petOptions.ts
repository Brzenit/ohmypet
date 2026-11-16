import type { PetDetails, PetLook, PetProfile, Species } from '../types'

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
export const SIZE_HINTS: Record<Species, Record<string, string>> = {
  dog: { Pequeno: 'até 10 kg', Médio: '10 a 25 kg', Grande: 'acima de 25 kg' },
  cat: { Pequeno: 'até 3,5 kg', Médio: '3,5 a 5,5 kg', Grande: 'acima de 5,5 kg' },
}

export const BREEDS: Record<Species, string[]> = {
  dog: ['Vira-lata (SRD)', 'Shih Tzu', 'Poodle', 'Lhasa Apso', 'Yorkshire', 'Spitz Alemão', 'Pinscher', 'Maltês', 'Pug', 'Bulldog Francês', 'Golden Retriever', 'Labrador', 'Border Collie'],
  cat: ['Vira-lata (SRD)', 'Siamês', 'Persa', 'Angorá', 'Maine Coon', 'Bengal', 'Ragdoll'],
}

export const SEXES = ['Macho', 'Fêmea']
export const NEUTERED = ['Sim', 'Não', 'Não sei']
export const AGE_RANGES = ['Menos de 1 ano', '1 a 3 anos', '4 a 7 anos', 'Mais de 7 anos']

// Opção que limpa as outras quando escolhida (e some quando outra é escolhida).
export const NO_DIET = 'Sem restrição'
export const NO_ALLERGY = 'Nenhuma'
export const NO_HEALTH = 'Nenhum'
export const DIETS = [NO_DIET, 'Alergia a frango', 'Alergia a carne bovina', 'Alergia a grãos', 'Intolerância à lactose', 'Dieta natural', 'Ração terapêutica', 'Outra']
export const ALLERGY_TYPES = [NO_ALLERGY, 'Alimentares', 'De pele', 'A perfume ou produtos de limpeza', 'A materiais (látex, tecido sintético)', 'Outra']
export const HEALTH = [NO_HEALTH, 'Articulações', 'Pele', 'Digestivo', 'Dentes', 'Obesidade', 'Coração', 'Rins', 'Diabetes', 'Visão ou audição reduzida', 'Em tratamento agora', 'Outro']

export const TEMPERAMENTS = ['Calmo', 'Brincalhão', 'Enérgico', 'Tímido', 'Carinhoso', 'Independente', 'Curioso', 'Ansioso']
export const DESTROYS = ['Sim', 'Às vezes', 'Não']
export const PLAY_STYLES = ['Morder', 'Correr atrás', 'Farejar', 'Puxar corda', 'Quebra-cabeça com petisco', 'Pelúcia', 'Abraçar', 'Caçar']
export const SOCIAL = ['Sociável', 'Seletivo', 'Prefere ficar sozinho']

export interface Question {
  id: string
  label: string
  options: string[]
  multi?: boolean
}
const YES_NO = ['Sim', 'Não']
export const SPECIES_QUESTIONS: Record<Species, Question[]> = {
  dog: [
    { id: 'passeio', label: 'Com que frequência passeia?', options: ['Todo dia', 'Às vezes', 'Só no quintal ou na varanda'] },
    { id: 'bola', label: 'Devolve a bolinha quando brinca de buscar?', options: ['Sim', 'Às vezes', 'Não'] },
    { id: 'mordedor', label: 'Mordedor preferido', options: ['Borracha dura', 'Borracha macia', 'Nylon', 'Corda'] },
    { id: 'fogos', label: 'Tem medo de fogos ou barulhos altos?', options: YES_NO },
    { id: 'faro', label: 'Gosta de farejar e procurar petiscos?', options: YES_NO },
    { id: 'mordida', label: 'Força da mordida', options: ['Pequena', 'Média', 'Forte'] },
  ],
  cat: [
    { id: 'ambiente', label: 'Onde ele vive?', options: ['Só dentro de casa', 'Às vezes na rua', 'Livre na rua'] },
    { id: 'arranha', label: 'Onde gosta de arranhar?', options: ['Papelão', 'Sisal', 'Carpete', 'Madeira', 'Não arranha'], multi: true },
    { id: 'catnip', label: 'Gosta de erva-de-gato (catnip)?', options: ['Sim', 'Não', 'Não sei'] },
    { id: 'brincadeira', label: 'Qual brincadeira faz mais sucesso?', options: ['Varinha', 'Bolinha', 'Laser', 'Ratinho de pelúcia', 'Túnel ou caixas'], multi: true },
    { id: 'caca', label: 'Costuma caçar e trazer o brinquedo?', options: YES_NO },
    { id: 'altos', label: 'Gosta de lugares altos?', options: YES_NO },
    { id: 'coleira', label: 'Usa coleira ou peitoral?', options: ['Coleira', 'Peitoral', 'Nenhum'] },
  ],
}

export const emptyDetails = (): PetDetails => ({
  sex: '',
  neutered: '',
  ageYears: '',
  ageMonths: '',
  ageUnknown: false,
  ageRange: '',
  ageManual: false,
  birthday: '',
  birthdayUnknown: false,
  celebrate: '',
  adoptedAt: '',
  diet: [],
  allergyTypes: [],
  health: [],
  healthNotes: '',
  medication: '',
  medicationName: '',
  temperament: [],
  energy: 3,
  destroys: '',
  playStyles: [],
  social: '',
  treatsLove: '',
  treatsNever: '',
  toysAvoid: '',
  neck: '',
  extra: {},
})

export const emptyProfile = (): PetProfile => ({
  name: '',
  species: 'dog',
  breed: '',
  age: AGES[1],
  size: SIZES[1],
  allergies: '',
  details: emptyDetails(),
})

/** Fase da vida sugerida pela idade (ou pela faixa, quando a pessoa não sabe a idade exata). */
export function suggestAge(d: PetDetails): string | null {
  let months: number | null = null
  if (d.ageUnknown) {
    if (d.ageRange) months = d.ageRange === AGE_RANGES[0] ? 6 : d.ageRange === AGE_RANGES[3] ? 100 : 48
  } else if (d.ageYears !== '' || d.ageMonths !== '') {
    months = (Number(d.ageYears) || 0) * 12 + (Number(d.ageMonths) || 0)
  }
  if (months === null) return null
  return months < 12 ? AGES[0] : months >= 84 ? AGES[2] : AGES[1]
}

/** Restrições e alergias escolhidas, no formato curto que a conta mostra. */
export function summarizeAllergies(d: PetDetails): string {
  const picked = [...d.diet.filter((v) => v !== NO_DIET), ...d.allergyTypes.filter((v) => v !== NO_ALLERGY)]
  return picked.join(', ')
}

/** Garante todos os campos, mesmo em pets antigos ou rascunhos de versões anteriores. */
export const completeDetails = (d?: Partial<PetDetails> | null): PetDetails => ({ ...emptyDetails(), ...d })

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
