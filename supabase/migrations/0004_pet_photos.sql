-- Foto do pet real, enviada no fim do cadastro, para criar figurinhas e artes personalizadas.
-- Fica num bucket privado: cada pessoa só vê, envia e troca as fotos da própria pasta (<id da conta>/<id do pet>.jpg).
-- Quem monta as artes (a equipe) acessa pelo painel do Supabase, que enxerga todos os arquivos.

alter table public.pets add column photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Donos veem as fotos dos próprios pets" on storage.objects
  for select to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Donos enviam fotos dos próprios pets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Donos trocam as fotos dos próprios pets" on storage.objects
  for update to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Donos apagam as fotos dos próprios pets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
