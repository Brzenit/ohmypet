-- Blog do Oh My Pet!. Qualquer pessoa lê os posts publicados; só quem está na lista de administradores
-- (blog_admins) cria, edita e apaga posts. As regras ficam aqui no banco, não no site.

-- Quem pode publicar. A tabela não tem regra de leitura: só a função is_blog_admin() enxerga a lista.
create table public.blog_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.blog_admins enable row level security;

create function public.is_blog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.blog_admins where user_id = (select auth.uid()))
$$;
revoke all on function public.is_blog_admin() from public;
grant execute on function public.is_blog_admin() to anon, authenticated;

create table public.blog_posts (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 160),
  summary text not null default '' check (char_length(summary) <= 400),
  category text not null default '' check (char_length(category) <= 40),
  -- Texto em Markdown simples (títulos, listas, negrito, links, citação).
  content text not null default '',
  author_name text not null default '',
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_posts_published_idx on public.blog_posts (published, published_at desc);

-- Marca a data de publicação na primeira vez que o post é publicado e atualiza updated_at.
create function public.blog_posts_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;
create trigger blog_posts_touch before insert or update on public.blog_posts
  for each row execute function public.blog_posts_touch();

alter table public.blog_posts enable row level security;

create policy "Todos leem os posts publicados" on public.blog_posts
  for select to anon, authenticated
  using (published or (select public.is_blog_admin()));
create policy "Admins criam posts" on public.blog_posts
  for insert to authenticated with check ((select public.is_blog_admin()));
create policy "Admins editam posts" on public.blog_posts
  for update to authenticated using ((select public.is_blog_admin())) with check ((select public.is_blog_admin()));
create policy "Admins apagam posts" on public.blog_posts
  for delete to authenticated using ((select public.is_blog_admin()));

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

-- Como dar alguém como administrador (rode no SQL Editor, trocando o e-mail pelo da conta que vai publicar):
--   insert into public.blog_admins (user_id) select id from auth.users where email = 'email@exemplo.com';

-- Post de teste, publicado.
insert into public.blog_posts (slug, title, summary, category, content, author_name, author_id, published, published_at)
values (
  'como-dar-banho-no-seu-cachorro',
  'Como dar banho no seu cachorro: passo a passo sem estresse',
  'Um guia carinhoso para transformar a hora do banho em um momento tranquilo para você e para o seu companheiro.',
  'Cuidados',
  $post$Dar banho no cachorro pode ser um dos momentos mais divertidos da semana ou uma pequena maratona de água, espuma e fuga pela casa. A boa notícia é que um pouco de preparo e muito carinho deixam tudo mais leve para os dois.

Neste guia você encontra o passo a passo, quanto tempo esperar entre um banho e outro e o que fazer quando o seu cão não gosta de água.

## Antes de começar: separe tudo

Deixar tudo ao alcance evita que você precise sair para buscar algo com o cachorro ensaboado. Separe:

- **Shampoo próprio para cães.** O de uso humano tem pH diferente e pode ressecar e irritar a pele deles.
- **Duas toalhas**, uma para a primeira secada e outra para finalizar.
- **Escova ou pente** adequado ao tipo de pelo.
- **Uma jarra ou um chuveirinho** de água morna.
- **Um tapete antiderrapante** no chão do box ou da banheira, para ele se sentir seguro.
- **Petiscos** para premiar a cada etapa.

## Passo a passo

### 1. Escove antes de molhar

Escovar o pelo seco desfaz os nós e tira o excesso de pelos soltos. Com o pelo molhado, os nós apertam e ficam bem mais difíceis de desfazer.

### 2. Teste a temperatura da água

A água deve estar morna, nem quente nem fria. Um bom teste é pingar um pouco no seu pulso: se for agradável para você, está boa para ele.

### 3. Molhe devagar, do pescoço para trás

Comece pelas patas e vá subindo, falando com calma. Evite jogar água direto no rosto e dentro das orelhas. Para limpar a cabeça, use um paninho úmido.

### 4. Ensaboe com massagem

Aplique o shampoo e massageie do pescoço até a cauda, sem esquecer a barriga, as axilas e as patas. Para a maioria dos cães, esse é o momento de relaxar: capriche no carinho.

### 5. Enxágue até acabar a espuma

Resíduos de shampoo podem causar coceira e vermelhidão. Enxágue com calma, até a água sair limpa, principalmente nas dobrinhas, entre as patas e embaixo do rabo.

### 6. Seque com cuidado

Enrole o cachorro em uma toalha e pressione o pelo, sem esfregar. Se for usar secador, deixe em temperatura morna ou fria, mantenha uma boa distância e vá testando com a mão. Seque bem as orelhas e as dobrinhas, porque a umidade guardada ali favorece irritações.

### 7. Comemore

Petisco, elogio e brincadeira no final ensinam que banho é sinônimo de coisa boa.

## Com que frequência dar banho?

Não existe uma regra única. Muitos cães vão bem com um banho a cada três ou quatro semanas, mas isso depende do tamanho, do tipo de pelo, da rotina (cães que brincam na terra se sujam mais) e da saúde da pele. Banhos em excesso podem ressecar a pele, e a falta deles pode acumular sujeira e mau cheiro.

Se o seu cão tem alguma condição de pele ou usa produto prescrito, siga a orientação do veterinário sobre a frequência.

## E se o meu cachorro tem medo de banho?

Isso é mais comum do que parece, e dá para melhorar com paciência:

- Faça **sessões curtas** e pare antes de ele ficar muito estressado.
- Use o **tapete antiderrapante** e uma voz calma o tempo todo.
- Dê **petiscos** em cada etapa, para ele associar o banho a algo bom.
- Deixe ele **conhecer o espaço** antes, sem água, e só depois tente o banho completo.

> Se o seu cão tremer muito, tentar fugir ou ficar muito agitado, pare, acalme e tente de novo outro dia. Um banho tranquilo vale mais do que um banho completo.

## Quando falar com o veterinário

Antes de qualquer produto, converse com o veterinário se você notar:

- pele vermelha, feridas ou descamação;
- coceira intensa ou queda de pelo diferente do normal;
- mau cheiro que não passa com o banho.

Este texto é um guia geral e não substitui a orientação de um médico-veterinário.

## Quer treinar a hora do banho?

Se você quer se divertir antes (ou depois) do banho de verdade, o nosso minigame [Hora do banho](/brincar) deixa você dar banho, secar e pentear o seu pet virtual, e ainda rende Patinhas. E se ainda não criou o seu, é só [criar o seu pet](/crie-seu-pet): a gente monta uma box pensada só para vocês dois.$post$,
  'Equipe Oh My Pet!',
  null,
  true,
  '2026-11-16T12:00:00Z'
)
on conflict (slug) do nothing;
