-- Adiciona colunas para marcar prioridades do processo
-- (Idoso, Hediondo, Violência Doméstica, Meta 2+)
-- Execute no SQL Editor do Supabase

alter table audiencias add column if not exists prio_idoso boolean default false;
alter table audiencias add column if not exists prio_hediondo boolean default false;
alter table audiencias add column if not exists prio_violencia boolean default false;
alter table audiencias add column if not exists prio_meta2 boolean default false;
