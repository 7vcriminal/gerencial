-- Tabela de audiências
create table if not exists audiencias (
  id bigint primary key,
  ano integer not null default 2026,
  mes text,
  data date,
  hora text,
  processo text,
  reu text,
  magistrado text,
  promotor text,
  status text,
  pendencias text,
  observacoes text,
  reu_preso boolean default false,
  reus_preso jsonb default '[]'::jsonb,
  projudi boolean default false,
  intimacoes boolean default false,
  termo boolean default false,
  criado_em date,
  updated_at timestamptz default now()
);

-- Tabela de magistrados
create table if not exists magistrados (
  id bigserial primary key,
  nome text not null,
  ativo boolean default true
);

-- Tabela de promotores
create table if not exists promotores (
  id bigserial primary key,
  nome text not null,
  ativo boolean default true
);

-- Habilita Row Level Security
alter table audiencias enable row level security;
alter table magistrados enable row level security;
alter table promotores enable row level security;

-- Permite acesso público (leitura e escrita) — sem sistema de login no app
create policy "public access" on audiencias for all using (true) with check (true);
create policy "public access" on magistrados for all using (true) with check (true);
create policy "public access" on promotores for all using (true) with check (true);

-- Habilita sincronização em tempo real entre dispositivos
alter publication supabase_realtime add table audiencias;
alter publication supabase_realtime add table magistrados;
alter publication supabase_realtime add table promotores;
