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
export interface LinkError {
  code: string
  /** 'google' quando o erro veio da volta do login com Google; 'email' para links de e-mail. */
  source: 'google' | 'email'
}

/** Marca, antes de ir para o Google, que a próxima volta ao site é desse login. */
export const GOOGLE_FLAG = 'omp.google'

function readLinkError(): LinkError | null {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const query = new URLSearchParams(window.location.search)
  let fromGoogle = false
  try {
    fromGoogle = sessionStorage.getItem(GOOGLE_FLAG) === '1'
    // Só limpamos se a volta tiver tokens ou erro; o cliente cuida dos tokens.
    if (hash.has('access_token') || hash.has('error') || query.has('error') || query.has('code')) sessionStorage.removeItem(GOOGLE_FLAG)
  } catch {
    // Navegação privada pode bloquear o sessionStorage; seguimos sem a marca.
  }
  const code = hash.get('error_code') ?? query.get('error_code') ?? hash.get('error') ?? query.get('error')
  if (!code) return null
  for (const k of ['error', 'error_code', 'error_description']) query.delete(k)
  const search = query.toString()
  window.history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''))
  return { code, source: fromGoogle ? 'google' : 'email' }
}

export const authLinkError = readLinkError()

// A chave publicável pode ir para o navegador: quem protege os dados são as regras do banco.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'sem-chave')
