-- Banco do Oh My Pet. As contas ficam no Auth do Supabase (auth.users),
-- com o nome em user_metadata. Cada pessoa só enxerga os próprios dados.

create table public.pets (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  species text not null check (species in ('dog', 'cat')),
  breed text not null default '',
  age text not null default '',
  size text not null default '',
  allergies text not null default '',
  look jsonb not null,
  created_at timestamptz not null default now()
);
create index pets_user_id_idx on public.pets (user_id);

create table public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Remover o pet remove junto as assinaturas dele.
  pet_id bigint not null references public.pets (id) on delete cascade,
  plan_id text not null,
  billing text check (billing in ('mensal', 'anual')),
  status text not null default 'ativa' check (status in ('ativa', 'cancelada')),
  created_at timestamptz not null default now()
);
create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_pet_id_idx on public.subscriptions (pet_id);

create table public.newsletter (
  id bigint generated always as identity primary key,
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

alter table public.pets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.newsletter enable row level security;

create policy "Donos veem os próprios pets" on public.pets
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Donos criam os próprios pets" on public.pets
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Donos editam os próprios pets" on public.pets
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Donos removem os próprios pets" on public.pets
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Donos veem as próprias assinaturas" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
-- A assinatura só pode apontar para um pet da mesma pessoa.
create policy "Donos assinam para os próprios pets" on public.subscriptions
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.pets p where p.id = pet_id and p.user_id = (select auth.uid()))
  );
create policy "Donos alteram as próprias assinaturas" on public.subscriptions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Qualquer visitante pode se inscrever, mas ninguém lê a lista pelo site.
create policy "Visitantes se inscrevem na newsletter" on public.newsletter
  for insert to anon, authenticated with check (true);

grant select, insert, update, delete on public.pets to authenticated;
grant select, insert, update on public.subscriptions to authenticated;
grant insert on public.newsletter to anon, authenticated;
