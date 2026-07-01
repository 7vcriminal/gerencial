-- Adiciona suporte a Salas Virtuais de audiências
-- Execute no SQL Editor do Supabase

-- 1. Coluna sala_link na tabela audiencias
alter table audiencias add column if not exists sala_link text;

-- 2. Nova tabela salas
create table if not exists salas (
    id serial primary key,
    nome text not null,
    link text not null,
    horas text[] default '{}',
    ativo boolean default true
);

-- 3. RLS para salas
alter table salas enable row level security;

drop policy if exists "authenticated access" on salas;
create policy "authenticated access" on salas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
