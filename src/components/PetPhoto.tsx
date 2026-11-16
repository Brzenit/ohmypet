import { useRef, useState } from 'react'

const MAX_SIDE = 1280
const MAX_BYTES = 15 * 1024 * 1024

export interface PhotoValue {
  src: string
  /** Foto escolhida agora (ainda não enviada). Quando falso, é a que já está guardada no pet. */
  isNew: boolean
}

/** Lê a foto escolhida e devolve uma versão menor em JPEG, boa para guardar e para usar nas artes. */
export async function preparePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha uma imagem, em JPG ou PNG.')
  if (file.size > MAX_BYTES) throw new Error('Essa foto é muito grande. Escolha uma de até 15 MB.')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Não conseguimos abrir essa foto. Tente uma em JPG ou PNG.')
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não conseguimos preparar essa foto. Tente outra.')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.86)
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',')
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? 'image/jpeg'
  const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: mime })
}

export function PhotoStep({
  petName,
  photo,
  onChange,
  onBack,
  onSave,
  saving,
  error,
  isEdit,
  loggedIn,
}: {
  petName: string
  photo: PhotoValue | null
  onChange: (p: PhotoValue | null) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
  error: string
  isEdit: boolean
  loggedIn: boolean
}) {
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const choose = async (file: File | undefined) => {
    if (!file) return
    setProblem('')
    setBusy(true)
    try {
      onChange({ src: await preparePhoto(file), isNew: true })
    } catch (err) {
      setProblem((err as Error).message)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const who = petName.trim() || 'seu pet'
  const saveLabel = saving
    ? 'SALVANDO...'
    : isEdit
      ? 'SALVAR ALTERAÇÕES'
      : !loggedIn
        ? 'ENTRAR E SALVAR'
        : photo
          ? 'SALVAR MEU PET'
          : 'PULAR E SALVAR'

  return (
    <div className="pet-foto cartao">
      <h2>Foto para personalização</h2>
      <p className="etapa-sub">
        Coloque a foto do seu pet para podermos personalizá-lo da melhor maneira para você. A gente usa a foto de {who} para criar figurinhas e artes especiais para quem assina um plano.
      </p>

      <div className="foto-area">
        {photo ? (
          <div className="foto-previa">
            <img src={photo.src} alt={`Foto de ${who}`} />
          </div>
        ) : (
          <button type="button" className="foto-vazia" onClick={() => input.current?.click()} disabled={busy}>
            <b>{busy ? 'Preparando a foto...' : 'Toque para escolher uma foto'}</b>
            <small>JPG ou PNG. Uma foto nítida, com o rostinho bem visível, fica perfeita.</small>
          </button>
        )}
        <input
          ref={input}
          id="foto-pet"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => choose(e.target.files?.[0])}
        />
        {photo && (
          <div className="foto-acoes">
            <button type="button" className="btn secundario" onClick={() => input.current?.click()} disabled={busy}>Trocar foto</button>
            {photo.isNew && <button type="button" className="link-acao" onClick={() => onChange(null)}>Remover</button>}
          </div>
        )}
        {problem && <p className="erro-geral" role="alert">{problem}</p>}
      </div>

      <p className="aviso">
        Se aparecerem pessoas na foto, envie só se elas concordarem. A foto fica guardada de forma privada e só a gente a usa para criar as artes do seu pet.
      </p>
      <p className="foto-opcional">Esse passo é opcional: você pode pular agora e enviar a foto depois, editando o pet.</p>

      {error && <p className="erro-geral" role="alert">{error}</p>}
      <div className="pet-acoes">
        <button type="button" className="btn secundario" onClick={onBack}>← Voltar</button>
        <button type="button" className="btn" onClick={onSave} disabled={saving || busy}>{saveLabel}</button>
      </div>
    </div>
  )
}
