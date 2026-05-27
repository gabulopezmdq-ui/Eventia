// ═══════════════════════════════════════════════════════════════════
// TYPES — Captación y Audiencias
// Módulo: Mini CRM de audiencias para eventos públicos B2B
// ═══════════════════════════════════════════════════════════════════

// ─── Paramétrica genérica (intereses, perfiles, preferencias, etc.) ───
export interface Parametrica {
    id: number;
    codigo: string;
    texto: string;
    orden: number;
}

// ─── Tipo de Beneficio (combo en el formulario de campaña) ───
export interface TipoBeneficio {
    id: number;
    codigo: string;
    texto: string;
    orden: number;
}

// ═══════════════════════════════════════════════════════════════════
// CAMPAÑAS / CAPTACIÓN LINKS
// ═══════════════════════════════════════════════════════════════════

/** Campaña de captación asociada a un evento público */
export interface CaptacionLink {
    id_acceso_link: number;
    id_evento: number;
    id_acceso: number;
    acceso_nombre: string;
    titulo: string;
    leyenda_publica: string | null;
    token: string;
    es_captacion_publica: boolean;
    requiere_registro: boolean;
    max_personas_total: number;
    max_adultos: number | null;
    requiere_nombres_acompanantes: boolean;
    cupo_beneficio: number | null;
    id_tipo_beneficio_registro: number | null;
    tipo_beneficio_codigo: string | null;
    beneficio_titulo: string | null;
    beneficio_descripcion: string | null;
    beneficio_hasta: string | null;
    mostrar_disponibles: boolean;
    mensaje_post_registro: string | null;
    origen_default: string | null;
    permite_reutilizar_audiencia: boolean;
    fecha_expiracion: string | null;
    activo: boolean;
    registrados: number;
    beneficios_otorgados: number;
    beneficios_canjeados: number;
}

/** Payload para crear o editar una campaña (POST Upsert) */
export interface CaptacionLinkPayload {
    id_acceso_link: number | null;
    id_acceso: number;
    titulo: string;
    leyenda_publica?: string | null;
    max_personas_total: number;
    max_adultos?: number | null;
    fecha_expiracion?: string | null;
    requiere_nombres_acompanantes: boolean;
    es_captacion_publica: boolean;
    requiere_registro: boolean;
    cupo_beneficio?: number | null;
    id_tipo_beneficio_registro?: number | null;
    beneficio_titulo?: string | null;
    beneficio_descripcion?: string | null;
    beneficio_hasta?: string | null;
    mostrar_disponibles: boolean;
    mensaje_post_registro?: string | null;
    origen_default?: string | null;
    permite_reutilizar_audiencia: boolean;
    activo: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// LANDING PÚBLICA
// ═══════════════════════════════════════════════════════════════════

/** Respuesta del GET /evento_captacion_links/Landing?token= */
export interface LandingData {
    id_evento: number;
    id_acceso_link: number;
    id_acceso: number;
    acceso_nombre: string;
    titulo: string;
    leyenda_publica: string | null;
    anfitriones_texto: string | null;
    mensaje_bienvenida: string | null;
    max_personas_total: number;
    max_adultos: number | null;
    requiere_nombres_acompanantes: boolean;
    cupo_beneficio: number | null;
    beneficio_titulo: string | null;
    beneficio_descripcion: string | null;
    beneficio_hasta: string | null;
    mostrar_disponibles: boolean;
    mensaje_post_registro: string | null;
    origen_default: string | null;
    fecha_expiracion: string | null;
    expirado: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// REGISTRO DE AUDIENCIA (formulario público)
// ═══════════════════════════════════════════════════════════════════

/** Payload para POST /audiencias/Registrar?token= */
export interface RegistroAudienciaPayload {
    nombre: string;
    apellido: string;
    email?: string | null;
    celular?: string | null;
    fecha_nacimiento?: string | null;
    instagram?: string | null;
    zona?: string | null;
    ciudad?: string | null;
    id_perfil_asistencia?: number | null;
    acepta_terminos: boolean;
    acepta_comunicaciones: boolean;
    acepta_promociones: boolean;
    // Tracking (campos ocultos)
    origen_registro?: string | null;
    campania_fuente?: string | null;
    campania_medio?: string | null;
    campania_nombre?: string | null;
    campania_contenido?: string | null;
    campania_termino?: string | null;
    pagina_origen?: string | null;
    referer?: string | null;
    // Multi-select
    id_intereses_evento?: number[];
    id_preferencias_musicales?: number[];
}

/** Respuesta del POST /audiencias/Registrar */
export interface RegistroAudienciaResponse {
    ok: boolean;
    id_invitado: number;
    id_audiencia_persona: number;
    beneficio_otorgado: boolean;
    id_beneficio_registro: number | null;
    codigo_canje: string | null;
    rsvp_token: string | null;
    qr_token: string | null;
    mensaje_post_registro: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// PERSONAS REGISTRADAS AL EVENTO
// ═══════════════════════════════════════════════════════════════════

/** Fila de la grilla GET /audiencias/GetRegistrosEvento */
export interface PersonaRegistrada {
    id_invitado: number;
    id_audiencia_persona: number;
    nombre: string;
    apellido: string;
    email: string | null;
    celular: string | null;
    fecha_alta: string;
    rsvp_estado: string | null;
    id_acceso: number;
    acceso_nombre: string;
    id_acceso_link: number;
    origen_registro: string | null;
    id_perfil_asistencia: number | null;
    intereses: string[];
    preferencias_musicales: string[];
    acepta_comunicaciones: boolean;
    acepta_promociones: boolean;
    beneficio_otorgado: boolean;
    beneficio_canjeado: boolean;
    asistio: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// QR ENTRADA
// ═══════════════════════════════════════════════════════════════════

/** Respuesta GET /audiencias/ResolverQrEntrada y ResolverEntradaManual */
export interface QrEntradaResult {
    id_evento: number;
    id_invitado: number;
    nombre: string;
    apellido: string;
    email: string | null;
    celular: string | null;
    id_acceso: number;
    acceso_nombre: string;
    id_acceso_link: number;
    campania: string | null;
    origen_registro: string | null;
    ya_ingreso: boolean;
    ultimo_movimiento_tipo: string | null;
    ultimo_movimiento_fecha: string | null;
    accion_sugerida: 'INGRESO' | 'REINGRESO';
    beneficio_otorgado: boolean;
    beneficio_canjeado: boolean;
    beneficio_pendiente: boolean;
    id_beneficio_registro: number | null;
    beneficio_titulo: string | null;
    beneficio_descripcion: string | null;
    qr_token: string | null;
    mostrar_qr_para_canje: boolean;
}

/** Resultado de búsqueda manual de persona */
export interface BusquedaRegistrado {
    id_invitado: number;
    nombre: string;
    apellido: string;
    email: string | null;
    celular: string | null;
    id_acceso: number;
    acceso_nombre: string;
    id_acceso_link: number;
    origen_registro: string | null;
    asistio: boolean;
    beneficio_otorgado: boolean;
    beneficio_canjeado: boolean;
}

/** Payload para POST /evento_checkins */
export interface CheckinPayload {
    id_evento: number;
    id_invitado: number;
    id_acceso: number;
    id_acceso_link: number;
    tipo: 'INGRESO' | 'REINGRESO';
    observaciones?: string | null;
}

/** Respuesta del POST /evento_checkins */
export interface CheckinResponse {
    ok: boolean;
    id_checkin: number;
}

// ═══════════════════════════════════════════════════════════════════
// QR BENEFICIO
// ═══════════════════════════════════════════════════════════════════

export type EstadoBeneficio = 'PENDIENTE' | 'CANJEADO' | 'NO_APLICA' | 'VENCIDO';

/** Respuesta GET /audiencias/ResolverQrBeneficio */
export interface QrBeneficioResult {
    id_evento: number;
    id_invitado: number;
    nombre: string;
    apellido: string;
    id_acceso_link: number;
    campania: string | null;
    tiene_beneficio: boolean;
    id_beneficio_registro: number | null;
    tipo_beneficio_codigo: string | null;
    beneficio_titulo: string | null;
    beneficio_descripcion: string | null;
    estado_beneficio: EstadoBeneficio;
    fecha_vencimiento: string | null;
    puede_canjear: boolean;
    mensaje: string | null;
}

/** Beneficio pendiente para asistentes marcados manualmente */
export interface PendienteManualBeneficio {
    id_invitado: number;
    id_beneficio_registro: number;
    nombre: string;
    apellido: string;
    celular: string | null;
    campania: string | null;
    beneficio_titulo: string | null;
    fecha_hora: string;
    observaciones: string | null;
    estado_beneficio: string;
}

// ═══════════════════════════════════════════════════════════════════
// ASISTENCIA (check-ins)
// ═══════════════════════════════════════════════════════════════════

/** Fila de la grilla GET /evento_checkins/GetByEvento */
export interface CheckinEvento {
    id_checkin: number;
    id_invitado: number;
    nombre: string;
    apellido: string;
    id_acceso: number;
    acceso_nombre: string;
    id_acceso_link: number | null;
    campania: string | null;
    tipo: 'INGRESO' | 'REINGRESO';
    fecha_hora: string;
    fecha?: string;
    observaciones: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// MÉTRICAS DEL EVENTO
// ═══════════════════════════════════════════════════════════════════

export interface ResumenMetricas {
    registrados: number;
    asistieron: number;
    no_show: number;
    conversion_asistencia_pct: number;
    beneficios_otorgados: number;
    beneficios_canjeados: number;
}

export interface MetricasCampania {
    id_acceso_link: number;
    campania: string;
    registrados: number;
    asistieron: number;
    beneficios_otorgados: number;
    beneficios_canjeados: number;
}

export interface MetricasOrigen {
    origen_registro: string;
    registrados: number;
    asistieron: number;
    beneficios_otorgados: number;
    beneficios_canjeados: number;
}

export interface MetricasPerfilAsistencia {
    id_perfil_asistencia: number;
    perfil_texto: string;
    cantidad: number;
}

export interface MetricasTopItem {
    codigo: string;
    texto: string;
    cantidad: number;
}

/** Respuesta completa de GET /audiencias/GetMetricasEvento */
export interface MetricasEvento {
    resumen: ResumenMetricas;
    por_campania: MetricasCampania[];
    por_origen: MetricasOrigen[];
    por_perfil_asistencia: MetricasPerfilAsistencia[];
    top_intereses: MetricasTopItem[];
    top_preferencias_musicales: MetricasTopItem[];
}

// ═══════════════════════════════════════════════════════════════════
// AUDIENCIA DE CUENTA (mini CRM)
// ═══════════════════════════════════════════════════════════════════

export interface AudienciaTag {
    id_audiencia_persona_tag: number;
    tag_tipo: string;
    tag_valor: string;
    nombre_mostrar: string;
    origen: 'MANUAL' | 'AUTO';
    activo: boolean;
}

/** Fila del listado GET /audiencias/GetAll */
export interface AudienciaPersona {
    id_audiencia_persona: number;
    nombre: string;
    apellido: string;
    email: string | null;
    celular: string | null;
    fecha_nacimiento: string | null;
    instagram: string | null;
    zona: string | null;
    ciudad: string | null;
    acepta_comunicaciones: boolean;
    acepta_promociones: boolean;
    activo: boolean;
    fecha_alta: string;
    eventos_registrados: number;
    eventos_asistidos: number;
    ultima_participacion: string | null;
    tags: AudienciaTag[];
}

export interface HistorialEvento {
    id_evento: number;
    evento_nombre: string;
    unidad: string | null;
    fecha_registro: string;
    asistio: boolean;
    origen_registro: string | null;
    beneficio_otorgado: boolean;
    beneficio_canjeado: boolean;
}

/** Detalle completo GET /audiencias/GetById */
export interface AudienciaPersonaDetalle extends AudienciaPersona {
    id_cuenta: number;
    historial: HistorialEvento[];
}

// ─── Tags sugeridos (paramétrica) ───
export interface TagSugerido {
    id_param_audiencia_tag: number;
    tag_tipo: string;
    tag_valor: string;
    nombre_mostrar: string;
    descripcion: string | null;
    origen: 'MANUAL' | 'AUTO';
    permite_asignacion_manual: boolean;
    orden: number;
    activo: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// PANEL AUDIENCIAS CRM — Nuevo modelo segmentado
// Endpoint: GET /audiencia_crm/listar  |  GET /audiencia_crm/{id}/detalle
// ═══════════════════════════════════════════════════════════════════

export type TipoPersonaCRM =
    | 'TODOS'
    | 'RESPONSABLE_PROGRAMA'
    | 'PARTICIPANTE_PROGRAMA'
    | 'EVENTO_PUBLICO'
    | 'EVENTO_PRIVADO'
    | 'STAFF'
    | 'SIN_CLASIFICAR';

export type AlertaCRM = 'COMEDOR' | 'RESTRICCION_ALIMENTARIA' | 'SALUD';

// ─── Filtros disponibles (GET /audiencia_crm/filtros) ─────────────

export interface FiltroTipoCRM {
    codigo: TipoPersonaCRM;
    texto: string;
}

export interface FiltroAlertaCRM {
    codigo: AlertaCRM;
    texto: string;
}

export interface FiltrosCRM {
    tipos: FiltroTipoCRM[];
    alertas: FiltroAlertaCRM[];
}

// ─── Listado CRM segmentado (GET /audiencia_crm/listar) ───────────

/** Fila del listado segmentado */
export interface AudienciaCRMPersona {
    id_audiencia_persona: number;
    nombre: string;
    apellido: string;
    email: string | null;
    celular: string | null;
    tipo_persona: TipoPersonaCRM;
    tipo_label: string;
    contexto: string | null;
    id_evento_contexto: number | null;
    ultima_participacion: string | null;
    eventos_registrados: number;
    eventos_asistidos: number;
    alertas: AlertaCRM[];
    tags: string[];
}

// ─── Detalle CRM enriquecido (GET /audiencia_crm/{id}/detalle) ────

export interface CRMResponsable {
    idAudienciaPersona: number;
    nombreCompleto: string;
    email: string | null;
    telefono: string | null;
    relacion: string | null;
}

export interface CRMParticipanteGrupo {
    idAudienciaPersona: number;
    idInvitado: number;
    idRsvpGrupoIntegrante: number;
    nombreCompleto: string;
    edad: number | null;
}

export interface CRMPeriodo {
    nombre: string;
    fechaDesde: string;
    fechaHasta: string;
    precioBase: number;
    moneda: string;
}

export interface CRMServicio {
    nombre: string;
    codigo: string;
    tipoCalculo: string;
    precio: number;
    subtotal: number;
    moneda: string;
    fechas: string[];
}

export interface CRMRestriccion {
    idRestriccionAlim: number;
    codigo: string;
    categoria: string;
    iconKey: string;
    requiereAlertaVisual: boolean;
    requiereConfirmacionOrganizador: boolean;
    esAlergeno: boolean;
    observaciones: string | null;
    severidad: string | null;
}

export interface CRMSalud {
    tieneProblemaMedico: boolean;
    problemaMedicoDetalle: string | null;
    tieneAlergiasNoAlimentarias: boolean;
    alergiasNoAlimentariasDetalle: string | null;
    necesidadEspecial: string | null;
    coberturaMedica: string | null;
    observacionesFamilia: string | null;
    autorizaEmergenciaMedica: boolean;
}

export interface CRMAutorizadoRetiro {
    nombreAutorizado: string;
    telefonoAutorizado: string | null;
    relacion: string | null;
    observaciones: string | null;
}

export interface CRMProgramaDetalle {
    id_evento: number;
    evento: string;
    id_inscripcion: number;
    id_rsvp_grupo: number;
    nombre_grupo: string;
    responsable: CRMResponsable;
    participantes_grupo: CRMParticipanteGrupo[];
    periodos: CRMPeriodo[];
    servicios: CRMServicio[];
    restricciones: CRMRestriccion[];
    salud: CRMSalud | null;
    autorizados_retiro: CRMAutorizadoRetiro[];
}

export interface CRMHistorialItem {
    id_evento: number;
    evento: string;
    tipo_operacion: string;
    origen_registro: string;
    fecha_registro: string;
    asistio: boolean;
    beneficio_otorgado: boolean;
    beneficio_canjeado: boolean;
}

/** Detalle completo GET /audiencia_crm/{id}/detalle */
export interface AudienciaCRMDetalle {
    id_audiencia_persona: number;
    nombre: string;
    apellido: string;
    email: string | null;
    celular: string | null;
    fecha_nacimiento: string | null;
    edad: number | null;
    tipo_persona: TipoPersonaCRM;
    tipo_label: string;
    alertas: AlertaCRM[];
    tags: string[];
    historial: CRMHistorialItem[];
    programa: CRMProgramaDetalle | null;
}
