-- Clube Patinhas: pontos ganhos no minigame e trocados por vantagens.
-- Todas as regras de ganho e de troca (limites, valores, vencimento) ficam aqui no banco:
-- o site só pede, e quem decide é o banco. Assim ninguém consegue se dar Patinhas pelo navegador.
-- As regras também estão descritas em docs/clube-patinhas.md e em src/data/patinhas.ts (só para mostrar na tela).

create table public.patinhas_movimentos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('banho', 'sequencia', 'pet', 'assinatura', 'resgate', 'expiracao')),
  -- Positivo ganha, negativo gasta.
  valor integer not null check (valor <> 0),
  -- banho: vazio · sequencia: dias seguidos · pet: id do pet · resgate: id da recompensa
  ref text,
  -- Dia no horário de Brasília, para o limite de um banho por dia.
  dia date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  criado_em timestamptz not null default now()
);
create index patinhas_movimentos_user_idx on public.patinhas_movimentos (user_id, criado_em desc);
create unique index patinhas_banho_por_dia on public.patinhas_movimentos (user_id, dia) where tipo = 'banho';
create unique index patinhas_pet_unico on public.patinhas_movimentos (user_id, ref) where tipo = 'pet';
create unique index patinhas_assinatura_unica on public.patinhas_movimentos (user_id) where tipo = 'assinatura';

create table public.patinhas_resgates (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recompensa text not null check (recompensa in ('mimo', 'desc5', 'desc10', 'frete', 'ong')),
  custo integer not null check (custo > 0),
  -- O que a empresa abre mão ou paga por esse resgate, em centavos (desconto, frete ou doação).
  valor_cents integer not null default 0,
  -- Fica "disponivel" até a cobrança ou o envio que usa o resgate; quem marca "aplicado" é o time, não o site.
  status text not null default 'disponivel' check (status in ('disponivel', 'aplicado')),
  mes date not null default (date_trunc('month', now() at time zone 'America/Sao_Paulo')::date),
  criado_em timestamptz not null default now()
);
create index patinhas_resgates_user_idx on public.patinhas_resgates (user_id, mes);

alter table public.patinhas_movimentos enable row level security;
alter table public.patinhas_resgates enable row level security;

create policy "Donos veem os próprios movimentos" on public.patinhas_movimentos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Donos veem os próprios resgates" on public.patinhas_resgates
  for select to authenticated using ((select auth.uid()) = user_id);

-- Só leitura: gravar é com as funções abaixo.
grant select on public.patinhas_movimentos to authenticated;
grant select on public.patinhas_resgates to authenticated;

-- Saldo. As Patinhas vencem depois de 180 dias sem ganhar nem gastar nenhuma.
create function public.patinhas_saldo()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  total integer;
  ultimo timestamptz;
begin
  if uid is null then raise exception 'nao_autenticado'; end if;
  select coalesce(sum(valor), 0), max(criado_em) into total, ultimo
    from public.patinhas_movimentos where user_id = uid;
  if total > 0 and ultimo < now() - interval '180 days' then
    insert into public.patinhas_movimentos (user_id, tipo, valor) values (uid, 'expiracao', -total);
    return 0;
  end if;
  return total;
end;
$$;

-- Ganhar Patinhas. Devolve { creditado, saldo, motivo }.
--   banho: 60 por dia (um banho por dia), até 900 por mês entre banho e sequência; a cada 7 dias seguidos, +100
--   pet: 50 por pet criado, até 3 pets
--   assinatura: 200 na primeira assinatura
create function public.patinhas_ganhar(p_tipo text, p_ref text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  inicio_mes date := date_trunc('month', now() at time zone 'America/Sao_Paulo')::date;
  limite_mes constant integer := 900;
  usado integer;
  creditado integer := 0;
  extra integer;
  dias_seguidos integer;
  motivo text := 'ok';
begin
  if uid is null then raise exception 'nao_autenticado'; end if;
  -- Uma operação por vez por pessoa: evita ganhar duas vezes com dois cliques ao mesmo tempo.
  perform pg_advisory_xact_lock(hashtext(uid::text));
  perform public.patinhas_saldo();

  if p_tipo = 'banho' then
    if exists (select 1 from public.patinhas_movimentos where user_id = uid and tipo = 'banho' and dia = hoje) then
      return jsonb_build_object('creditado', 0, 'saldo', public.patinhas_saldo(), 'motivo', 'ja_ganhou_hoje');
    end if;
    select coalesce(sum(valor), 0) into usado from public.patinhas_movimentos
      where user_id = uid and tipo in ('banho', 'sequencia') and dia >= inicio_mes;
    creditado := least(60, greatest(limite_mes - usado, 0));
    if creditado = 0 then
      return jsonb_build_object('creditado', 0, 'saldo', public.patinhas_saldo(), 'motivo', 'limite_mensal');
    end if;
    insert into public.patinhas_movimentos (user_id, tipo, valor) values (uid, 'banho', creditado);

    with dias as (
      select distinct dia from public.patinhas_movimentos where user_id = uid and tipo = 'banho' and dia <= hoje
    ), grupos as (
      select dia, dia - (row_number() over (order by dia))::integer as grupo from dias
    )
    select count(*) into dias_seguidos from grupos where grupo = (select grupo from grupos where dia = hoje);
    if dias_seguidos % 7 = 0 then
      extra := least(100, greatest(limite_mes - usado - creditado, 0));
      if extra > 0 then
        insert into public.patinhas_movimentos (user_id, tipo, valor, ref) values (uid, 'sequencia', extra, dias_seguidos::text);
        creditado := creditado + extra;
        motivo := 'sequencia';
      end if;
    end if;

  elsif p_tipo = 'pet' then
    if p_ref is null or p_ref !~ '^\d+$'
       or not exists (select 1 from public.pets where id = p_ref::bigint and user_id = uid) then
      raise exception 'pet_invalido';
    end if;
    if exists (select 1 from public.patinhas_movimentos where user_id = uid and tipo = 'pet' and ref = p_ref) then
      return jsonb_build_object('creditado', 0, 'saldo', public.patinhas_saldo(), 'motivo', 'ja_ganhou');
    end if;
    if (select count(*) from public.patinhas_movimentos where user_id = uid and tipo = 'pet') >= 3 then
      return jsonb_build_object('creditado', 0, 'saldo', public.patinhas_saldo(), 'motivo', 'limite_pets');
    end if;
    creditado := 50;
    insert into public.patinhas_movimentos (user_id, tipo, valor, ref) values (uid, 'pet', creditado, p_ref);

  elsif p_tipo = 'assinatura' then
    if not exists (select 1 from public.subscriptions where user_id = uid and status = 'ativa') then
      raise exception 'sem_assinatura';
    end if;
    if exists (select 1 from public.patinhas_movimentos where user_id = uid and tipo = 'assinatura') then
      return jsonb_build_object('creditado', 0, 'saldo', public.patinhas_saldo(), 'motivo', 'ja_ganhou');
    end if;
    creditado := 200;
    insert into public.patinhas_movimentos (user_id, tipo, valor) values (uid, 'assinatura', creditado);

  else
    raise exception 'tipo_invalido';
  end if;

  return jsonb_build_object('creditado', creditado, 'saldo', public.patinhas_saldo(), 'motivo', motivo);
end;
$$;

-- Trocar Patinhas por uma vantagem. Só para quem tem assinatura ativa.
--   mimo   700  adesivos extras do pet na próxima box       custo estimado para a empresa: R$ 3
--   desc5  1000 R$ 5 de desconto na próxima mensalidade
--   desc10 2000 R$ 10 de desconto na próxima mensalidade
--   frete  3000 frete grátis na próxima box                 custo estimado: R$ 20
--   ong    1000 R$ 5 doados para uma ONG parceira
-- Por mês: 1 vantagem entre desconto e frete, 1 mimo e 1 doação.
create function public.patinhas_resgatar(p_recompensa text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mes_atual date := date_trunc('month', now() at time zone 'America/Sao_Paulo')::date;
  v_custo integer;
  v_valor integer;
  grupo text;
  saldo integer;
begin
  if uid is null then raise exception 'nao_autenticado'; end if;
  perform pg_advisory_xact_lock(hashtext(uid::text));

  select c.custo, c.valor_cents into v_custo, v_valor
    from (values ('mimo', 700, 300), ('desc5', 1000, 500), ('desc10', 2000, 1000), ('frete', 3000, 2000), ('ong', 1000, 500))
      as c (id, custo, valor_cents)
    where c.id = p_recompensa;
  if v_custo is null then raise exception 'recompensa_invalida'; end if;

  if not exists (select 1 from public.subscriptions where user_id = uid and status = 'ativa') then
    raise exception 'sem_assinatura';
  end if;

  grupo := case when p_recompensa in ('desc5', 'desc10', 'frete') then 'beneficio' else p_recompensa end;
  if exists (
    select 1 from public.patinhas_resgates r
    where r.user_id = uid and r.mes = mes_atual
      and case when r.recompensa in ('desc5', 'desc10', 'frete') then 'beneficio' else r.recompensa end = grupo
  ) then
    raise exception 'limite_mensal';
  end if;

  saldo := public.patinhas_saldo();
  if saldo < v_custo then raise exception 'saldo_insuficiente'; end if;

  insert into public.patinhas_movimentos (user_id, tipo, valor, ref) values (uid, 'resgate', -v_custo, p_recompensa);
  insert into public.patinhas_resgates (user_id, recompensa, custo, valor_cents) values (uid, p_recompensa, v_custo, v_valor);

  return jsonb_build_object('saldo', saldo - v_custo, 'recompensa', p_recompensa);
end;
$$;

revoke all on function public.patinhas_saldo() from public, anon;
revoke all on function public.patinhas_ganhar(text, text) from public, anon;
revoke all on function public.patinhas_resgatar(text) from public, anon;
grant execute on function public.patinhas_saldo() to authenticated;
grant execute on function public.patinhas_ganhar(text, text) to authenticated;
grant execute on function public.patinhas_resgatar(text) to authenticated;
