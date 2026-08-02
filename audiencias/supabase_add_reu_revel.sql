-- Adiciona suporte a Réu Revel
-- Execute no SQL Editor do Supabase

alter table audiencias add column if not exists reu_revel boolean default false;
alter table audiencias add column if not exists reus_revel boolean[] default '{}';
