-- ============================================================
-- Script de Migración: Agregar columna fecha_evento a ef_eventos
-- ============================================================

-- 1. Agregar la columna si no existe
ALTER TABLE public.ef_eventos 
ADD COLUMN IF NOT EXISTS fecha_evento timestamptz;

-- 2. (Opcional) Nota: La sincronización de esta fecha ocurrirá 
-- automáticamente cuando se cree o actualice el primer tramo del evento
-- desde la aplicación.
