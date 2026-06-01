-- BLOQUE 3.1: Catálogo Técnico de Secciones
INSERT INTO public.ef_param_portal_secciones
(codigo, descripcion, aplica_evento, aplica_programa, requiere_feature_codigo, orden_default, activo)
VALUES
('RESUMEN', 'Resumen general del portal', true, true, 'CENTRO_INVITADO', 1, true),
('AGENDA', 'Agenda / tramos del evento', true, false, 'CENTRO_INVITADO', 2, true),
('PARTICIPANTES', 'Participantes asociados al acceso', true, true, 'CENTRO_INVITADO', 3, true),
('ACOMPANANTES', 'Acompañantes del invitado', true, false, 'CENTRO_INVITADO', 4, true),
('PAGOS', 'Pagos y saldo de inscripción', false, true, 'PAGOS_PROGRAMA', 5, true),
('QRS_RETIRO', 'QRs autorizados para retiro', false, true, 'RETIRO_SEGURO', 6, true),
('RETIROS', 'Historial de retiros', false, true, 'RETIRO_SEGURO', 7, true),
('SALUD', 'Ficha de salud declarada', false, true, 'SALUD_PROGRAMA', 8, true),
('MESA', 'Mesa asignada / ubicación del invitado', true, false, 'DISTRIBUCION_MESAS', 9, true),
('RESTRICCIONES_ALIMENTARIAS', 'Restricciones alimentarias', true, true, 'RESTRICCIONES_ALIMENTARIAS', 10, true),
('TRANSPORTE', 'Transporte / traslados', true, true, 'TRANSPORTE', 11, true),
('HOSPEDAJES', 'Hospedajes sugeridos', true, false, 'HOSPEDAJES', 12, true),
('REGALOS', 'Regalos / lista / fondo', true, false, 'REGALOS', 13, true),
('MUSICA', 'Música / sugerencias / playlist', true, false, 'MUSICA_SUGERENCIAS', 14, true),
('FOTOS', 'Galería de fotos', true, true, 'ALBUM_EVENTO', 15, true),
('NOVEDADES', 'Novedades y avisos', true, true, 'NOVEDADES_EVENTO', 16, true),
('AUTORIZACIONES', 'Autorizaciones legales aceptadas', false, true, 'AUTORIZACIONES_PROGRAMA', 17, true),
('DOCUMENTOS', 'Documentos asociados', true, true, 'DOCUMENTOS_PORTAL', 18, true),
('CONTACTO', 'Datos de contacto del organizador', true, true, 'CENTRO_INVITADO', 19, true)
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    aplica_evento = EXCLUDED.aplica_evento,
    aplica_programa = EXCLUDED.aplica_programa,
    requiere_feature_codigo = EXCLUDED.requiere_feature_codigo,
    orden_default = EXCLUDED.orden_default,
    activo = EXCLUDED.activo;

-- BLOQUE 3.2: Traducciones a Portugués (id_idioma = 4)
INSERT INTO public.ef_param_traducciones
(entidad, id_item, id_idioma, texto, orden, activo)
SELECT 'PORTAL_SECCION', s.id_portal_seccion, 4,
       CASE s.codigo
           WHEN 'RESUMEN' THEN 'Resumo'
           WHEN 'AGENDA' THEN 'Agenda'
           WHEN 'PARTICIPANTES' THEN 'Participantes'
           WHEN 'ACOMPANANTES' THEN 'Acompanhantes'
           WHEN 'PAGOS' THEN 'Pagamentos'
           WHEN 'QRS_RETIRO' THEN 'QRs de recolha'
           WHEN 'RETIROS' THEN 'Recolhas'
           WHEN 'SALUD' THEN 'Saúde'
           WHEN 'MESA' THEN 'Mesa atribuída'
           WHEN 'RESTRICCIONES_ALIMENTARIAS' THEN 'Restrições alimentares'
           WHEN 'TRANSPORTE' THEN 'Transporte'
           WHEN 'HOSPEDAJES' THEN 'Alojamentos'
           WHEN 'REGALOS' THEN 'Presentes'
           WHEN 'MUSICA' THEN 'Música'
           WHEN 'FOTOS' THEN 'Fotos'
           WHEN 'NOVEDADES' THEN 'Novidades'
           WHEN 'AUTORIZACIONES' THEN 'Autorizações'
           WHEN 'DOCUMENTOS' THEN 'Documentos'
           WHEN 'CONTACTO' THEN 'Contacto'
       END,
       s.orden_default,
       true
FROM public.ef_param_portal_secciones s
WHERE NOT EXISTS (
    SELECT 1
    FROM public.ef_param_traducciones t
    WHERE t.entidad = 'PORTAL_SECCION'
      AND t.id_item = s.id_portal_seccion
      AND t.id_idioma = 4
);

-- BLOQUE 3.3: Traducciones a Checo (id_idioma = 5)
INSERT INTO public.ef_param_traducciones
(entidad, id_item, id_idioma, texto, orden, activo)
SELECT 'PORTAL_SECCION', s.id_portal_seccion, 5,
       CASE s.codigo
           WHEN 'RESUMEN' THEN 'Souhrn'
           WHEN 'AGENDA' THEN 'Program'
           WHEN 'PARTICIPANTES' THEN 'Účastníci'
           WHEN 'ACOMPANANTES' THEN 'Doprovod'
           WHEN 'PAGOS' THEN 'Platby'
           WHEN 'QRS_RETIRO' THEN 'QR kódy pro vyzvednutí'
           WHEN 'RETIROS' THEN 'Vyzvednutí'
           WHEN 'SALUD' THEN 'Zdraví'
           WHEN 'MESA' THEN 'Přiřazený stůl'
           WHEN 'RESTRICCIONES_ALIMENTARIAS' THEN 'Dietní omezení'
           WHEN 'TRANSPORTE' THEN 'Doprava'
           WHEN 'HOSPEDAJES' THEN 'Ubytování'
           WHEN 'REGALOS' THEN 'Dárky'
           WHEN 'MUSICA' THEN 'Hudba'
           WHEN 'FOTOS' THEN 'Fotky'
           WHEN 'NOVEDADES' THEN 'Novinky'
           WHEN 'AUTORIZACIONES' THEN 'Souhlasy'
           WHEN 'DOCUMENTOS' THEN 'Dokumenty'
           WHEN 'CONTACTO' THEN 'Kontakt'
       END,
       s.orden_default,
       true
FROM public.ef_param_portal_secciones s
WHERE NOT EXISTS (
    SELECT 1
    FROM public.ef_param_traducciones t
    WHERE t.entidad = 'PORTAL_SECCION'
      AND t.id_item = s.id_portal_seccion
      AND t.id_idioma = 5
);

-- DDL POR SI NO USAS EF MIGRATIONS (SIEMPRE ES RECOMENDADO USAR MIGRATIONS)
CREATE TABLE IF NOT EXISTS public.ef_portal_recuperacion_tokens (
    id_portal_recuperacion_token bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_portal_persona bigint NOT NULL,
    token_recuperacion varchar(64) NOT NULL,
    codigo varchar(10) NULL,
    canal varchar(20) NOT NULL,
    destino varchar(200) NOT NULL,
    usado boolean NOT NULL DEFAULT false,
    fecha_expiracion timestamptz NOT NULL,
    fecha_uso timestamptz NULL,
    fecha_alta timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_portal_recuperacion_persona
        FOREIGN KEY (id_portal_persona)
        REFERENCES public.ef_portal_personas(id_portal_persona)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_portal_recuperacion_token
ON public.ef_portal_recuperacion_tokens(token_recuperacion);

CREATE INDEX IF NOT EXISTS ix_portal_recuperacion_persona
ON public.ef_portal_recuperacion_tokens(id_portal_persona, usado, fecha_expiracion);

CREATE TABLE IF NOT EXISTS public.ef_portal_validaciones (
    id_portal_validacion bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token_consulta varchar(64) NOT NULL,
    codigo varchar(10) NOT NULL,
    canal varchar(20) NOT NULL,
    destino varchar(200) NOT NULL,
    validado boolean NOT NULL DEFAULT false,
    fecha_expiracion timestamptz NOT NULL,
    fecha_validacion timestamptz NULL,
    fecha_alta timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_portal_validaciones_token
ON public.ef_portal_validaciones(token_consulta, validado, fecha_expiracion);
