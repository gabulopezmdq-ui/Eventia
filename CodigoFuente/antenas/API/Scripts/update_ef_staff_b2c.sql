-- ==============================================================================
-- Script de actualización para soportar el flujo de Staff en Eventos Personales (B2C)
-- ==============================================================================

-- 1. Modificar id_cuenta para que permita valores nulos. 
-- Esto es necesario porque el staff de eventos personales no pertenece a ninguna cuenta (Pool).
ALTER TABLE ef_staff 
ALTER COLUMN id_cuenta DROP NOT NULL;

-- 2. Agregar la columna id_evento para relacionar directamente al empleado con un único evento.
-- Usamos BIGINT para coincidir con el tipo de datos de id_evento en la tabla ef_eventos.
ALTER TABLE ef_staff 
ADD COLUMN IF NOT EXISTS id_evento BIGINT NULL;

-- 3. Crear la restricción de Foreign Key hacia la tabla ef_eventos.
-- Utilizamos ON DELETE CASCADE para que si se elimina el evento, 
-- automáticamente se elimine el staff exclusivo de dicho evento.
ALTER TABLE ef_staff 
ADD CONSTRAINT fk_ef_staff_evento 
FOREIGN KEY (id_evento) 
REFERENCES ef_eventos(id_evento) 
ON DELETE CASCADE;

-- (Opcional) Crear un índice para búsquedas rápidas si se filtra staff por evento
CREATE INDEX IF NOT EXISTS ix_ef_staff_id_evento ON ef_staff (id_evento);
