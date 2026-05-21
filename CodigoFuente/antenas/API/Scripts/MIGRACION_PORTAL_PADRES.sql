-- 1. Tabla de secciones del portal soportadas por el sistema
CREATE TABLE IF NOT EXISTS public.ef_param_portal_secciones (
    id_portal_seccion smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo varchar(60) NOT NULL,
    descripcion varchar(200) NULL,
    aplica_evento boolean NOT NULL DEFAULT true,
    aplica_programa boolean NOT NULL DEFAULT true,
    requiere_feature_codigo varchar(80) NULL,
    orden_default smallint NOT NULL DEFAULT 1,
    activo boolean NOT NULL DEFAULT true,
    fecha_alta timestamptz NOT NULL DEFAULT now(),
    fecha_modif timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_param_portal_secciones_codigo 
ON public.ef_param_portal_secciones(codigo);

-- 2. Configuración de secciones por cada evento/programa
CREATE TABLE IF NOT EXISTS public.ef_evento_portal_config (
    id_evento_portal_config bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento bigint NOT NULL,
    id_portal_seccion smallint NOT NULL,
    visible boolean NOT NULL DEFAULT true,
    orden smallint NOT NULL DEFAULT 1,
    titulo_override varchar(120) NULL,
    config_json jsonb NULL,
    activo boolean NOT NULL DEFAULT true,
    fecha_alta timestamptz NOT NULL DEFAULT now(),
    fecha_modif timestamptz NULL,

    CONSTRAINT fk_evento_portal_config_evento 
        FOREIGN KEY (id_evento) REFERENCES public.ef_eventos(id_evento) ON DELETE CASCADE,
    CONSTRAINT fk_evento_portal_config_seccion 
        FOREIGN KEY (id_portal_seccion) REFERENCES public.ef_param_portal_secciones(id_portal_seccion) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_evento_portal_config_evento_seccion 
ON public.ef_evento_portal_config(id_evento, id_portal_seccion);

-- 3. Tabla para fotos operativas publicadas por el organizador / staff
CREATE TABLE IF NOT EXISTS public.ef_evento_portal_fotos (
    id_portal_foto bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento bigint NOT NULL,
    titulo varchar(120) NULL,
    descripcion varchar(300) NULL,
    url_foto varchar(600) NOT NULL,
    fecha_foto date NULL,
    visible_portal boolean NOT NULL DEFAULT true,
    activo boolean NOT NULL DEFAULT true,
    id_usuario_carga bigint NULL,
    fecha_alta timestamptz NOT NULL DEFAULT now(),
    fecha_modif timestamptz NULL,

    CONSTRAINT fk_evento_portal_fotos_evento 
        FOREIGN KEY (id_evento) REFERENCES public.ef_eventos(id_evento) ON DELETE CASCADE,
    CONSTRAINT fk_evento_portal_fotos_usuario 
        FOREIGN KEY (id_usuario_carga) REFERENCES public.ef_usuarios(id_usuario) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_evento_portal_fotos_evento 
ON public.ef_evento_portal_fotos(id_evento, visible_portal, activo, fecha_foto);

-- 4. Datos Iniciales de Carga (Secciones Paramétricas)
INSERT INTO public.ef_param_portal_secciones 
(codigo, descripcion, aplica_evento, aplica_programa, requiere_feature_codigo, orden_default)
VALUES 
('RESUMEN', 'Resumen general del evento', true, true, null, 1),
('AGENDA', 'Agenda y cronograma', true, false, null, 2),
('PARTICIPANTES', 'Integrantes / Hijos inscriptos', true, true, null, 3),
('PAGOS', 'Detalle financiero y estado de cuenta', false, true, null, 4),
('QRS_RETIRO', 'QRs y pases de retiros autorizados', false, true, null, 5),
('RETIROS', 'Historial operativo de salidas', false, true, null, 6),
('SALUD', 'Ficha y alertas de salud', false, true, null, 7),
('SALUD_ACCIONES', 'Reportes médicos diarios', false, true, null, 8),
('AUTORIZACIONES', 'Control de firmas de consentimientos', false, true, null, 9),
('FOTOS', 'Galería de fotos oficial del staff', true, true, null, 10),
('NOVEDADES', 'Novedades y comunicados', true, true, 'NOVEDADES_EVENTO', 11)
ON CONFLICT (codigo) DO NOTHING;
