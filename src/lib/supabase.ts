import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabaseReady = Boolean(url && key)

if (!supabaseReady) {
  console.error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.')
}

/**
 * Quando o link do e-mail está vencido ou já foi usado, o Supabase volta para o site
 * com o erro no fim do endereço (#error_code=otp_expired...). Lemos isso antes do
 * cliente iniciar e limpamos o endereço, para a tela de entrar explicar o que houve.
 */
function readLinkError(): string | null {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const query = new URLSearchParams(window.location.search)
  const code = hash.get('error_code') ?? query.get('error_code') ?? hash.get('error') ?? query.get('error')
  if (!code) return null
  for (const k of ['error', 'error_code', 'error_description']) query.delete(k)
  const search = query.toString()
  window.history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''))
  return code
}

export const authLinkError = readLinkError()

// A chave publicável pode ir para o navegador: quem protege os dados são as regras do banco.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'sem-chave')
