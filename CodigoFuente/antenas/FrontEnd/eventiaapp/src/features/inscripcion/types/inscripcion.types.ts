// ═══════════════════════════════════════════════════════════════════
// TIPOS — Inscripción Colonias / Casales V2
// ═══════════════════════════════════════════════════════════════════

// ── Datos que vienen del GET /programas/inscripcion/{token} ──────

export interface Idioma {
    idIdioma: number;
    locale: string;
    nombreLargo: string;
    banderaIso2: string;
}

export interface ProgramaPeriodo {
    id_programa_periodo: number;
    id_evento: number;
    codigo: string;
    nombre: string;
    fecha_desde: string;   // "2026-06-22"
    fecha_hasta: string;   // "2026-06-26"
    precio_base: number;
    moneda: string;
    cupo: number;
    orden: number;
    activo: boolean;
}

export interface ProgramaServicio {
    idProgramaServicio: number;
    idEvento: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    tipoCalculo: 'POR_DIA' | 'UNICO' | 'POR_CANTIDAD';
    precio: number;
    moneda: string;
    obligatorio: boolean;
    permiteCantidad: boolean;
    cupo: number | null;
    orden: number;
    activo: boolean;
    requiereSeleccionDias: boolean;
    idServicioBase: number;
    configJson: Record<string, unknown> | null;
}

export interface ProgramaInscripcionData {
    token: string;
    idEvento: number;
    mensaje_bienvenida: string;
    saludo: string;
    fechaInicio: string;
    fechaFin: string;
    info_publica: string;
    periodos: ProgramaPeriodo[];
    servicios: ProgramaServicio[];
    idiomas: Idioma[];
}

// ── Payload que va en el POST /programas/inscripcion/confirmar ───

export type RelacionResponsable = 'Madre' | 'Padre' | 'Tutor/a' | 'Familiar' | 'Otro';

export interface Responsable {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documento: string;
    relacion: RelacionResponsable;
    acepta_comunicaciones: boolean;
    acepta_promociones: boolean;
}

export interface ServicioSeleccionado {
    id_programa_servicio: number;
    id_programa_periodo: number | null;
    fechas: string[];           // ISO dates seleccionadas
    cantidad: number | null;
    campos_extra: Record<string, string> | null;
}

export interface RestriccionAlimentaria {
    tipo: string;               // 'sin_gluten' | 'sin_lactosa' | 'vegetariano' | etc.
    severidad: 'Leve' | 'Moderada' | 'Severa';
    observaciones: string;
}

export interface FichaSalud {
    grupo_sanguineo: string;
    alergias: string;
    medicacion: string;
    observaciones: string;
}

export interface AutorizadoRetiro {
    nombre: string;
    apellido: string;
    documento: string;
    relacion: string;
    telefono: string;
}

export interface AutorizacionFirma {
    id_autorizacion: number;
    acepta: boolean;
}

export interface FirmaResponsable {
    nombre_completo: string;
    fecha: string;             // "2026-05-02"
    autorizaciones: AutorizacionFirma[];
}

/**
 * Participante tal como vive en el estado del frontend.
 * _clientId es un UUID local generado con crypto.randomUUID().
 * Se excluye del POST con Omit<Participante, '_clientId'>.
 */
export interface Participante {
    _clientId: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    documento: string | null;
    observaciones: string;
    periodos: { id_programa_periodo: number }[];
    servicios: ServicioSeleccionado[];
    restricciones: RestriccionAlimentaria[];
    salud: Partial<FichaSalud>;
    autorizados_retiro: AutorizadoRetiro[];
}

/** Payload final que se envía al backend (un único POST al confirmar) */
export interface InscripcionPayload {
    token: string;
    idIdioma: number;
    responsable: Responsable;
    participantes: Omit<Participante, '_clientId'>[];
    firma: FirmaResponsable;
}

// ── Estado global del Context ─────────────────────────────────────

export type FaseActual = 'landing' | 'panel' | 'resumen' | 'success';

export interface InscripcionState {
    /** Datos cargados desde el GET. null mientras carga. */
    programaData: ProgramaInscripcionData | null;
    idIdioma: number;
    /** Fase visual actual del flujo */
    fase: FaseActual;
    /** Controla el drawer/bottom-sheet del responsable */
    drawerResponsableAbierto: boolean;
    responsable: Partial<Responsable>;
    participantes: Participante[];
    firma: Partial<FirmaResponsable>;
    isLoading: boolean;
    error: string | null;
    /** Token de confirmación devuelto por el backend tras el POST exitoso */
    tokenConfirmacion: string | null;
}

// ── Resultado de cálculo de totales ──────────────────────────────

export interface TotalEstimado {
    subtotal: number;
    descuento: number;
    total: number;
    moneda: string;
}

// ── Resultado de validación ───────────────────────────────────────

export interface ValidationResult {
    valida: boolean;
    errores: string[];
}
