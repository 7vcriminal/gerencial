-- Adiciona coluna para marcar horário como "Reservado - Réu Preso"
-- Execute no SQL Editor do Supabase

alter table audiencias add column if not exists reservado boolean default false;
