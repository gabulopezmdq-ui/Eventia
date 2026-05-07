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

export interface RestriccionAlimentariaConfig {
    id: number;
    nombre: string;
}

export interface AutorizacionConfig {
    id: number;
    descripcion: string;
    obligatoria: boolean;
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
    restricciones_alimentarias_config: RestriccionAlimentariaConfig[];
    autorizaciones_configuradas: AutorizacionConfig[];
    configuracion_salud: Record<string, unknown> | null;
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

/** Restricción alimentaria con ID del catálogo del GET */
export interface RestriccionAlimentaria {
    id_restriccion_alimentaria: number;
    severidad: 'Leve' | 'Moderada' | 'Severa';
    observacion: string;
}

/** Contacto de emergencia médica */
export interface ContactoEmergencia {
    nombre: string;
    telefono: string;
    relacion: string;
    orden: number;
}

/** Medicación que toma el participante */
export interface Medicacion {
    nombre: string;
    dosis: string;
    frecuencia: string;
    indicaciones: string;
    requiere_autorizacion: boolean;
}

/** Ficha médica completa — coincide con el modelo V2 del backend */
export interface FichaSalud {
    tiene_problema_medico: boolean;
    problema_medico_detalle?: string;
    tiene_alergias_no_alimentarias: boolean;
    alergias_no_alimentarias_detalle?: string;
    necesidad_especial?: string;
    cobertura_medica?: string;
    observaciones_familia?: string;
    autoriza_emergencia_medica: boolean;
    contactos_emergencia: ContactoEmergencia[];
    medicaciones: Medicacion[];
}

/** Persona autorizada a retirar al participante */
export interface AutorizadoRetiro {
    nombre_autorizado: string;
    telefono_autorizado: string;
    relacion: string;
    observaciones: string;
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
    restricciones_alimentarias: RestriccionAlimentaria[];
    salud: FichaSalud;
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

// ── Respuesta del POST de confirmación ────────────────────────────

export interface QrRetiro {
    nombre_autorizado: string;
    telefono_autorizado: string;
    relacion: string;
    qr_token: string;
    participantes: { id_invitado: number; nombre_completo: string }[];
}

export interface ConfirmacionResponse {
    mensaje: string;
    qrs_retiro: QrRetiro[];
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
    /** Resultado de confirmación devuelto por el backend tras el POST exitoso */
    resultadoConfirmacion: ConfirmacionResponse | null;
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

// ── Valores por defecto para una FichaSalud vacía ─────────────────

export function createFichaSaludVacia(): FichaSalud {
    return {
        tiene_problema_medico: false,
        problema_medico_detalle: '',
        tiene_alergias_no_alimentarias: false,
        alergias_no_alimentarias_detalle: '',
        necesidad_especial: '',
        cobertura_medica: '',
        observaciones_familia: '',
        autoriza_emergencia_medica: false,
        contactos_emergencia: [],
        medicaciones: [],
    };
}
