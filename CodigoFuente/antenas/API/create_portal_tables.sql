-- =================================================================================
-- Script de Creación y Migración de Tablas del Portal (Mi Eventia)
-- Ejecutar este script en su base de datos de PostgreSQL (Supabase o Render)
-- =================================================================================

-- 1. Tabla: ef_portal_personas
CREATE TABLE IF NOT EXISTS public.ef_portal_personas (
    id_portal_persona bigint GENERATED ALWAYS AS IDENTITY,
    token_portal uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre character varying(120) NOT NULL,
    email character varying(120) NOT NULL,
    telefono character varying(30) NOT NULL,
    fecha_alta timestamp without time zone NOT NULL DEFAULT now(),
    activo boolean NOT NULL DEFAULT true,
    CONSTRAINT "PK_ef_portal_personas" PRIMARY KEY (id_portal_persona)
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_ef_portal_personas_email" ON public.ef_portal_personas USING btree (email);
CREATE INDEX IF NOT EXISTS "IX_ef_portal_personas_telefono" ON public.ef_portal_personas USING btree (telefono);


-- 2. Tabla: ef_portal_accesos
CREATE TABLE IF NOT EXISTS public.ef_portal_accesos (
    id_portal_acceso bigint GENERATED ALWAYS AS IDENTITY,
    id_portal_persona bigint NOT NULL,
    token_consulta character varying(100) NOT NULL, -- Aumentado a 100 para soportar tokens hex de 64 chars
    tipo text NOT NULL,
    id_evento bigint NOT NULL,
    id_inscripcion bigint NOT NULL,
    id_invitado bigint NULL,
    grupo_id bigint NULL,
    titulo_override character varying(150) NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    fecha_alta timestamp without time zone NOT NULL DEFAULT now(),
    fecha_modif timestamp without time zone NULL,
    CONSTRAINT "PK_ef_portal_accesos" PRIMARY KEY (id_portal_acceso),
    CONSTRAINT "FK_ef_portal_accesos_ef_portal_personas_id_portal_persona" 
        FOREIGN KEY (id_portal_persona) REFERENCES public.ef_portal_personas (id_portal_persona) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_ef_portal_accesos_id_portal_persona" ON public.ef_portal_accesos USING btree (id_portal_persona);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_ef_portal_accesos_token_consulta" ON public.ef_portal_accesos USING btree (token_consulta);


-- 3. Tabla: ef_portal_verificaciones
CREATE TABLE IF NOT EXISTS public.ef_portal_verificaciones (
    id_portal_verificacion bigint GENERATED ALWAYS AS IDENTITY,
    token_consulta character varying(100) NOT NULL, -- Aumentado a 100 para soportar tokens hex de 64 chars
    email_usado character varying(120) NOT NULL,
    fecha_hora timestamp without time zone NOT NULL DEFAULT now(),
    resultado_ok boolean NOT NULL,
    CONSTRAINT "PK_ef_portal_verificaciones" PRIMARY KEY (id_portal_verificacion)
);

CREATE INDEX IF NOT EXISTS "IX_ef_portal_verificaciones_token_consulta" ON public.ef_portal_verificaciones USING btree (token_consulta);


-- 4. Tabla: ef_param_relaciones_persona
CREATE TABLE IF NOT EXISTS public.ef_param_relaciones_persona (
    id_relacion_persona bigint GENERATED ALWAYS AS IDENTITY,
    codigo character varying(50) NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    orden smallint NOT NULL DEFAULT 1,
    permite_responsable_inscripcion boolean NOT NULL DEFAULT false,
    permite_autorizado_retiro boolean NOT NULL DEFAULT false,
    permite_rsvp_grupo boolean NOT NULL DEFAULT false,
    fecha_alta timestamp with time zone NOT NULL DEFAULT now(),
    fecha_modif timestamp with time zone NULL,
    CONSTRAINT "ef_param_relaciones_persona_pkey" PRIMARY KEY (id_relacion_persona)
);

CREATE UNIQUE INDEX IF NOT EXISTS "ux_ef_param_relaciones_persona_codigo" ON public.ef_param_relaciones_persona USING btree (codigo);
CREATE INDEX IF NOT EXISTS "ix_ef_param_relaciones_persona_activo_orden" ON public.ef_param_relaciones_persona USING btree (activo, orden);


-- 5. Tabla: ef_portal_recuperacion_tokens
CREATE TABLE IF NOT EXISTS public.ef_portal_recuperacion_tokens (
    id_portal_recuperacion_token bigint GENERATED ALWAYS AS IDENTITY,
    id_portal_persona bigint NOT NULL,
    token_recuperacion character varying(64) NOT NULL,
    codigo character varying(10) NULL,
    canal character varying(20) NOT NULL,
    destino character varying(200) NOT NULL,
    usado boolean NOT NULL DEFAULT false,
    fecha_expiracion timestamp with time zone NOT NULL,
    fecha_uso timestamp with time zone NULL,
    fecha_alta timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_ef_portal_recuperacion_tokens" PRIMARY KEY (id_portal_recuperacion_token),
    CONSTRAINT "fk_portal_recuperacion_persona" 
        FOREIGN KEY (id_portal_persona) REFERENCES public.ef_portal_personas (id_portal_persona) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ux_portal_recuperacion_token" ON public.ef_portal_recuperacion_tokens USING btree (token_recuperacion);
CREATE INDEX IF NOT EXISTS "IX_ef_portal_recuperacion_tokens_id_portal_persona" ON public.ef_portal_recuperacion_tokens USING btree (id_portal_persona);
CREATE INDEX IF NOT EXISTS "ix_portal_recuperacion_persona" ON public.ef_portal_recuperacion_tokens USING btree (id_portal_persona, usado, fecha_expiracion);


-- 6. Tabla: ef_portal_validaciones
CREATE TABLE IF NOT EXISTS public.ef_portal_validaciones (
    id_portal_validacion bigint GENERATED ALWAYS AS IDENTITY,
    token_consulta character varying(64) NOT NULL,
    codigo character varying(10) NOT NULL,
    canal character varying(20) NOT NULL,
    destino character varying(200) NOT NULL,
    validado boolean NOT NULL DEFAULT false,
    fecha_expiracion timestamp with time zone NOT NULL,
    fecha_validacion timestamp with time zone NULL,
    fecha_alta timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_ef_portal_validaciones" PRIMARY KEY (id_portal_validacion)
);

CREATE INDEX IF NOT EXISTS "ix_portal_validaciones_token" ON public.ef_portal_validaciones USING btree (token_consulta, validado, fecha_expiracion);


-- 7. Modificación segura sobre ef_autorizaciones
DO $$
BEGIN
    -- Agregar id_relacion_persona si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ef_autorizaciones' AND column_name='id_relacion_persona') THEN
        ALTER TABLE public.ef_autorizaciones ADD COLUMN id_relacion_persona bigint NULL;
    END IF;
    
    -- Eliminar la columna vieja 'relacion' si aún existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ef_autorizaciones' AND column_name='relacion') THEN
        ALTER TABLE public.ef_autorizaciones DROP COLUMN relacion;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IX_ef_autorizaciones_id_relacion_persona" ON public.ef_autorizaciones USING btree (id_relacion_persona);

-- Crear FK si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='FK_ef_autorizaciones_ef_param_relaciones_persona_id_relacion_persona' AND table_schema='public') THEN
        ALTER TABLE public.ef_autorizaciones 
        ADD CONSTRAINT "FK_ef_autorizaciones_ef_param_relaciones_persona_id_relacion_persona" 
        FOREIGN KEY (id_relacion_persona) REFERENCES public.ef_param_relaciones_persona (id_relacion_persona);
    END IF;
END $$;


-- 8. Seed inicial básico para ef_param_relaciones_persona
INSERT INTO public.ef_param_relaciones_persona 
(codigo, activo, orden, permite_responsable_inscripcion, permite_autorizado_retiro, permite_rsvp_grupo)
VALUES
('Padre', true, 1, true, true, true),
('Madre', true, 2, true, true, true),
('Tutor', true, 3, true, true, true),
('Participante', true, 4, true, false, false),
('Otro', true, 5, true, true, true)
ON CONFLICT (codigo) DO NOTHING;


-- 9. Aumentar tamaño de columna token_consulta en tablas existentes por si ya se habían creado con límite 50
ALTER TABLE public.ef_portal_accesos ALTER COLUMN token_consulta TYPE character varying(100);
ALTER TABLE public.ef_portal_verificaciones ALTER COLUMN token_consulta TYPE character varying(100);


-- 10. Registrar las migraciones en la tabla de historial para que EF Core no intente aplicarlas de nuevo
CREATE TABLE IF NOT EXISTS public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES
('20260526131720_MiEventiaTables', '7.0.11'),
('20260601172348_UpdateAutorizacionesRelacionPersona', '7.0.11'),
('20260601184658_RenamePortalTablesToEf', '7.0.11'),
('20260601185046_UpdateTokenConsultaLength', '7.0.11')
ON CONFLICT ("MigrationId") DO NOTHING;
