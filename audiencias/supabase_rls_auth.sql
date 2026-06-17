-- Restringe acesso às tabelas apenas a usuários autenticados (logados)
-- Execute no SQL Editor do Supabase

drop policy if exists "public access" on audiencias;
drop policy if exists "public access" on magistrados;
drop policy if exists "public access" on promotores;

create policy "authenticated access" on audiencias
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated access" on magistrados
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated access" on promotores
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
