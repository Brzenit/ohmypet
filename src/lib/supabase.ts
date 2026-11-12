import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabaseReady = Boolean(url && key)

if (!supabaseReady) {
  console.error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.')
}

// A chave publicável pode ir para o navegador: quem protege os dados são as regras do banco.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'sem-chave')
