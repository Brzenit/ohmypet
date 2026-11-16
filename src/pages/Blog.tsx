import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Markdown, readingMinutes } from '../components/Markdown'
import { Paw, PawField, Reveal, useToast } from '../components/ui'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { BlogDraft, BlogPost } from '../types'
import './blog.css'

const CORES = ['var(--amarelo)', 'var(--rosa)', 'var(--lavanda)']

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Rascunho'

/** Transforma o título em endereço: sem acento, minúsculo, com hífens. */
export const slugify = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)

/** Quem é administrador do blog. `null` enquanto ainda não sabemos. */
function useBlogAdmin(): boolean | null {
  const { user, loading } = useAuth()
  const [admin, setAdmin] = useState<boolean | null>(null)
  useEffect(() => {
    if (loading) return
    if (!user) {
      setAdmin(false)
      return
    }
    let alive = true
    api.blog
      .isAdmin()
      .then((ok) => alive && setAdmin(ok))
      .catch(() => alive && setAdmin(false))
    return () => {
      alive = false
    }
  }, [user, loading])
  return admin
}

function Topo({ titulo, texto, extra, classe = '' }: { titulo: string; texto?: string; extra?: ReactNode; classe?: string }) {
  return (
    <div className={`pagina-topo blog-topo ${classe}`}>
      <PawField color="#5813ad" spots={[[6, 18, 50, -16], [88, 20, 44, 18], [80, 66, 32, -8], [16, 66, 30, 10]]} />
      {extra}
      <h1>{titulo}</h1>
      {texto && <p>{texto}</p>}
    </div>
  )
}

/* ---------- Lista ---------- */

export function BlogList() {
  const admin = useBlogAdmin()
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.blog.list().then(setPosts).catch((err: Error) => setError(err.message))
  }, [admin])

  return (
    <>
      <Topo titulo="Blog" texto="Dicas, histórias e cuidados para deixar a rotina com o seu pet mais leve." />
      <section className="bloco blog-lista">
        {admin && (
          <div className="blog-barra">
            <span>Você é administrador do blog.</span>
            <Link className="btn amarelo" to="/blog/novo">+ NOVO POST</Link>
          </div>
        )}
        {error && <p className="erro-geral" role="alert">{error}</p>}
        {posts?.[0]?.demo && (
          <p className="blog-demo">Modo demonstração: o blog lê os posts do Supabase, e aqui só aparece o post de exemplo.</p>
        )}
        {posts && posts.length === 0 && (
          <div className="blog-vazio cartao">
            <Paw size={40} />
            <p>Ainda não temos posts por aqui. Volte em breve!</p>
          </div>
        )}
        <div className="blog-grade">
          {posts?.map((post, i) => (
            <Reveal key={post.id} kind="pop" delay={i * 90} className="blog-cartao cartao">
              <Link to={`/blog/${post.slug}`} className="blog-capa" style={{ '--cor': CORES[i % CORES.length] } as CSSProperties} aria-hidden="true" tabIndex={-1}>
                <Paw size={64} />
                {post.category && <span>{post.category}</span>}
              </Link>
              <div className="blog-corpo">
                {!post.published && <span className="selo cancelada">Rascunho</span>}
                <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
                <p>{post.summary}</p>
                <small>{formatDate(post.publishedAt)} · {readingMinutes(post.content)} min de leitura</small>
                <Link className="blog-ler" to={`/blog/${post.slug}`}>Ler o post →</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}

/* ---------- Post ---------- */

export function BlogPostPage() {
  const { slug = '' } = useParams()
  const admin = useBlogAdmin()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    setPost(undefined)
    api.blog
      .getBySlug(slug)
      .then(setPost)
      .catch((err: Error) => {
        setError(err.message)
        setPost(null)
      })
  }, [slug])

  if (post === undefined) return <section className="bloco blog-carregando">Carregando o post...</section>

  if (!post) {
    return (
      <section className="bloco chamada-final nao-encontrada">
        <h1>Esse post não foi encontrado</h1>
        <p>{error || 'Ele pode ter sido removido ou ainda não foi publicado.'}</p>
        <Link className="btn" to="/blog">VOLTAR PARA O BLOG</Link>
      </section>
    )
  }

  return (
    <>
      <Topo
        classe="blog-topo-post"
        titulo={post.title}
        extra={post.category ? <span className="blog-categoria">{post.category}</span> : undefined}
        texto={`${formatDate(post.publishedAt)} · ${readingMinutes(post.content)} min de leitura · por ${post.authorName || 'Oh My Pet!'}`}
      />
      <section className="bloco blog-artigo">
        <div className="blog-artigo-barra">
          <Link className="link-acao" to="/blog">← Voltar ao blog</Link>
          {admin && !post.demo && <Link className="btn secundario" to={`/blog/editar/${post.id}`}>Editar post</Link>}
          {!post.published && <span className="selo cancelada">Rascunho: só administradores veem</span>}
        </div>
        <article className="artigo">
          <Markdown text={post.content} />
        </article>
        <aside className="blog-chamada cartao">
          <h2>Gostou? Agora é a vez do seu pet</h2>
          <p>Conte quem ele é e a gente monta uma box pensada só para vocês dois.</p>
          <div className="blog-chamada-botoes">
            <Link className="btn" to="/crie-seu-pet">CRIAR MEU PET</Link>
            <Link className="btn secundario" to="/blog">Mais posts</Link>
          </div>
        </aside>
      </section>
    </>
  )
}

/* ---------- Editor (só administradores) ---------- */

const emptyDraft = (authorName: string): BlogDraft => ({
  slug: '',
  title: '',
  summary: '',
  category: '',
  content: '',
  authorName,
  published: false,
})

export function BlogEditor() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const { user, loading } = useAuth()
  const admin = useBlogAdmin()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [draft, setDraft] = useState<BlogDraft>(() => emptyDraft(''))
  const [slugTouched, setSlugTouched] = useState(!!editId)
  const [ready, setReady] = useState(!editId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user || editId || draft.authorName) return
    setDraft((d) => ({ ...d, authorName: user.name }))
  }, [user, editId, draft.authorName])

  useEffect(() => {
    if (!editId || !admin) return
    api.blog
      .getById(editId)
      .then((post) => {
        if (!post) {
          navigate('/blog', { replace: true })
          return
        }
        setDraft({ slug: post.slug, title: post.title, summary: post.summary, category: post.category, content: post.content, authorName: post.authorName, published: post.published })
        setReady(true)
      })
      .catch((err: Error) => setError(err.message))
  }, [editId, admin, navigate])

  const set = <K extends keyof BlogDraft>(key: K, value: BlogDraft[K]) =>
    setDraft((d) => {
      const next = { ...d, [key]: value }
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value))
      return next
    })

  const preview = useMemo(() => <Markdown text={draft.content || '*A prévia do texto aparece aqui.*'} />, [draft.content])

  if (loading || admin === null) return <section className="bloco blog-carregando">Carregando...</section>
  if (!user) return <Navigate to={`/entrar?next=${encodeURIComponent(editId ? `/blog/editar/${editId}` : '/blog/novo')}`} replace />
  if (!admin) {
    return (
      <section className="bloco chamada-final nao-encontrada">
        <h1>Só administradores publicam aqui</h1>
        <p>Sua conta não tem permissão para criar ou editar posts do blog.</p>
        <Link className="btn" to="/blog">VOLTAR PARA O BLOG</Link>
      </section>
    )
  }
  if (!ready) return <section className="bloco blog-carregando">{error || 'Carregando o post...'}</section>

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.slug.trim() || !draft.content.trim()) {
      setError('Preencha o título, o endereço e o texto do post.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const saved = await api.blog.save({ ...draft, title: draft.title.trim(), slug: draft.slug.trim() }, editId ?? undefined)
      toast(saved.published ? 'Post publicado 🐾' : 'Rascunho salvo 🐾')
      navigate(`/blog/${saved.slug}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!editId) return
    try {
      await api.blog.remove(editId)
      toast('Post apagado.')
      navigate('/blog')
    } catch (err) {
      setError((err as Error).message)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <Topo titulo={editId ? 'Editar post' : 'Novo post'} texto="Só administradores veem esta página. O post aparece no blog quando você marca “Publicar”." />
      <section className="bloco blog-editor">
        <form className="cartao blog-form" onSubmit={submit} noValidate>
          <div className="blog-form-grade">
            <label className="campo inteiro">
              Título
              <input value={draft.title} maxLength={160} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Como dar banho no seu cachorro" />
            </label>
            <label className="campo">
              Endereço do post
              <input
                value={draft.slug}
                maxLength={120}
                onChange={(e) => {
                  setSlugTouched(true)
                  set('slug', slugify(e.target.value))
                }}
              />
              <span className="dica">Fica assim: /blog/{draft.slug || 'endereco-do-post'}</span>
            </label>
            <label className="campo">
              Categoria
              <input value={draft.category} maxLength={40} onChange={(e) => set('category', e.target.value)} placeholder="Ex.: Cuidados" />
            </label>
            <label className="campo inteiro">
              Resumo
              <textarea rows={2} value={draft.summary} maxLength={400} onChange={(e) => set('summary', e.target.value)} placeholder="Uma ou duas frases que aparecem na lista de posts" />
            </label>
            <label className="campo">
              Autoria
              <input value={draft.authorName} maxLength={80} onChange={(e) => set('authorName', e.target.value)} />
            </label>
          </div>

          <div className="blog-texto">
            <label className="campo">
              Texto do post
              <textarea rows={18} value={draft.content} onChange={(e) => set('content', e.target.value)} className="blog-markdown" spellCheck />
              <span className="dica">
                ## Título de seção · ### Subtítulo · - item de lista · 1. lista numerada · **negrito** · *itálico* · [texto](endereço) · &gt; citação
              </span>
            </label>
            <div className="campo">
              <span>Prévia</span>
              <div className="artigo blog-previa">{preview}</div>
            </div>
          </div>

          <label className="marcar">
            <input type="checkbox" checked={draft.published} onChange={(e) => set('published', e.target.checked)} />
            Publicar (o post fica visível para todo mundo)
          </label>

          {error && <p className="erro-geral" role="alert">{error}</p>}
          <div className="pet-acoes">
            <Link className="btn secundario" to="/blog">Cancelar</Link>
            <button className="btn" disabled={saving}>{saving ? 'SALVANDO...' : draft.published ? 'SALVAR E PUBLICAR' : 'SALVAR RASCUNHO'}</button>
          </div>
          {editId && (
            <div className="blog-perigo">
              {confirmDelete ? (
                <button type="button" className="link-acao perigo" onClick={remove}>Confirmar: apagar este post</button>
              ) : (
                <button type="button" className="link-acao" onClick={() => setConfirmDelete(true)}>Apagar post</button>
              )}
            </div>
          )}
        </form>
      </section>
    </>
  )
}
