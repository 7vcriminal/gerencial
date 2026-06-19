-- Tabela de Processos Idosos
create table if not exists processos_idosos (
  id bigint primary key,
  processo text not null,
  data_distribuicao date,
  denuncia date,
  primeira_sentenca boolean default false,
  julgado boolean default false,
  fase_processual text,
  localizacao text,
  mp_origem text,
  defesa text,
  pendencias text,
  updated_at timestamptz default now()
);

-- Tabela de Cartas Precatórias
create table if not exists cartas_precatorias (
  id bigint primary key,
  processo text not null,
  recebimento date,
  finalidade text,
  primeira_sentenca boolean default false,
  localizador text,
  responsaveis jsonb default '[]'::jsonb,
  prioridade boolean default false,
  pendencias text,
  updated_at timestamptz default now()
);

-- Habilita Row Level Security
alter table processos_idosos enable row level security;
alter table cartas_precatorias enable row level security;

-- Permite acesso público (leitura e escrita) — sem sistema de login no app
create policy "public access" on processos_idosos for all using (true) with check (true);
create policy "public access" on cartas_precatorias for all using (true) with check (true);

-- Habilita sincronização em tempo real entre dispositivos
alter publication supabase_realtime add table processos_idosos;
alter publication supabase_realtime add table cartas_precatorias;
