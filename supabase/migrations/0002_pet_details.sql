-- Respostas do questionário do pet (saúde, jeito de ser, aniversário, perguntas de cão ou gato).
-- As colunas age, size e allergies continuam existindo e guardam o resumo.
alter table public.pets add column details jsonb not null default '{}'::jsonb;
