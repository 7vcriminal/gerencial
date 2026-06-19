-- Restringe acesso às tabelas apenas a usuários autenticados (logados)
-- Execute no SQL Editor do Supabase

drop policy if exists "public access" on processos_idosos;
drop policy if exists "public access" on cartas_precatorias;

create policy "authenticated access" on processos_idosos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated access" on cartas_precatorias
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
