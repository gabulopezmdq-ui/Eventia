import { Event } from '../events/types';

export interface Programa extends Event {
    tipo_operacion: 'PROGRAMA';
    fecha_inicio: string;
    fecha_fin: string;
    mensaje_bienvenida?: string;
}

export interface CrearProgramaPayload {
    id_tipo_evento: number;
    id_idioma: number;
    id_cuenta: number;
    id_unidad: number;
    id_cliente: number | null;
    modalidad: string;
    anfitriones_texto: string;
    saludo: string;
    mensaje_bienvenida: string;
    notas: string;
    fecha_inicio: string;
    fecha_fin: string;
    codigo_plan: string;
}

export interface ProgramaPeriodo {
    id_programa_periodo?: number;
    id_evento: number;
    codigo: string;
    nombre: string;
    fecha_desde: string;
    fecha_hasta: string;
    precio_base: number;
    moneda: string;
    cupo: number | null;
    orden: number;
    activo: boolean;
}

export interface CampoExtra {
    codigo: string;
    label: string;
    tipo: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE' | 'BOOLEAN';
    obligatorio: boolean;
    opciones?: string[];
}

export interface ServicioBase {
    id_servicio_base: number;
    codigo: string;
    nombre: string;
    descripcion: string;
}

export interface ProgramaServicioConfig {
    campos_extra?: CampoExtra[];
}

export interface ProgramaServicio {
    id_programa_servicio?: number;
    id_evento: number;
    id_servicio_base: number | null;
    servicio_base_codigo?: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    tipo_calculo: string;
    precio: number;
    moneda: string;
    obligatorio: boolean;
    permite_cantidad: boolean;
    requiere_seleccion_dias: boolean;
    cupo: number | null;
    orden: number;
    activo: boolean;
    config_json?: string | null;
}

export interface AutorizacionBase {
    id_autorizacion_base: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
}

export interface AutorizacionConfig {
    id_programa_autorizacion_config?: number;
    id_evento: number;
    id_autorizacion_base: number | null;
    codigo: string;
    titulo?: string;
    texto?: string;
    obligatoria: boolean;
    requiere_aceptacion: boolean;
    requiere_datos_responsable: boolean;
    orden: number;
    activo: boolean;
}

export interface TraduccionAutorizacion {
    id_idioma: number;
    titulo: string;
    texto: string;
    activo: boolean;
}

export interface SaludConfig {
    id_salud_config?: number;
    id_evento: number;
    pedir_problema_medico: boolean;
    problema_medico_obligatorio: boolean;
    pedir_alergias_no_alimentarias: boolean;
    alergias_no_alimentarias_obligatorio: boolean;
    pedir_necesidad_especial: boolean;
    necesidad_especial_obligatorio: boolean;
    pedir_cobertura_medica: boolean;
    cobertura_medica_obligatorio: boolean;
    pedir_contacto_emergencia: boolean;
    contacto_emergencia_obligatorio: boolean;
    pedir_autoriza_emergencia_medica: boolean;
    autoriza_emergencia_medica_obligatorio: boolean;
    pedir_observaciones_familia: boolean;
    observaciones_familia_obligatorio: boolean;
    pedir_medicaciones: boolean;
    medicaciones_obligatorio: boolean;
    activo: boolean;
}

export interface StaffPrograma {
    id_evento: number;
    id_usuario?: number;
    email?: string;
    id_rol: string;
    activo: boolean;
}

// ── Retiros QR ──────────────────────────────────────────────────

/** Payload para validar un QR de retiro */
export interface ValidarQRPayload {
    qrToken: string;
    fechaOperativa: string; // YYYY-MM-DD
}

/** Un participante dentro de la respuesta de validar-qr */
export interface ParticipanteAutorizado {
    idInvitado: number;
    idAutorizacion: number;
    nombreCompleto: string;
    yaRetiradoHoy: boolean;
    fechaRetiro: string | null;
}

/** Respuesta del endpoint POST /programas/retiros/validar-qr */
export interface ValidarQRResponse {
    valido: boolean;
    mensaje: string;
    idEvento: number;
    nombreAutorizado: string;
    telefonoAutorizado: string | null;
    relacion: string | null;
    qrToken: string;
    participantesAutorizados: ParticipanteAutorizado[];
}

/** Payload para registrar el retiro */
export interface RegistrarRetiroPayload {
    qrToken: string;
    fechaOperativa: string; // YYYY-MM-DD
    idsInvitadosNinos: number[];
    observaciones?: string;
}

/** Un retiro dentro de la respuesta de registrar */
export interface RetiroRegistrado {
    idRetiro: number;
    idInvitado: number;
    participante: string;
    nombreRetirador: string;
    fechaRetiro: string;
}

/** Respuesta del endpoint POST /programas/retiros/registrar */
export interface RegistrarRetiroResponse {
    ok: boolean;
    mensaje: string;
    fechaOperativa: string;
    retiros: RetiroRegistrado[];
}

/** Un ítem de la grilla del día (GET /programas/{idEvento}/retiros/dia) */
export interface RetiroDiaItem {
    idRetiro: number;
    idInvitado: number;
    participante: string;
    nombreRetirador: string;
    telefonoRetirador: string;
    /** A = QR Autorizado | M = Manual | O = Otro */
    metodoValidacion: 'A' | 'M' | 'O';
    observaciones: string;
    fechaRetiro: string;
}

/** Respuesta del endpoint GET /programas/{idEvento}/retiros/dia?fecha=YYYY-MM-DD */
export interface RetirosDiaResponse {
    idEvento: number;
    fecha: string;
    totalRetiros: number;
    items: RetiroDiaItem[];
}

// ── Transporte ────────────────────────────────────────────────

/** Valores válidos para el filtro de servicio de transporte */
export type TransporteServicioCodigo = 'TODOS' | 'ACOGIDA' | 'TRANSPORTE';

/** Un ítem de la grilla diaria de transporte */
export interface TransporteDiaItem {
    idInvitado: number;
    idRsvpGrupoIntegrante: number;
    participante: string;
    responsable: string;
    telefonoResponsable: string;
    servicio: string;
    servicioCodigo: TransporteServicioCodigo;
    direccion: string | null;
    observacionesServicio: string | null;
    tieneAlertaSalud: boolean;
    observacionesSalud: string | null;
}

/** Resumen de contadores del día */
export interface TransporteDiaResumen {
    total: number;
    conObservaciones: number;
    conAlertasSalud: number;
}

/** Respuesta completa del endpoint GET /programas/{idEvento}/transporte/dia */
export interface TransporteDiaResponse {
    idEvento: number;
    programa: string;
    fecha: string;
    resumen: TransporteDiaResumen;
    items: TransporteDiaItem[];
}

// ── Autorizaciones de Inscripción ─────────────────────────────

/** Un ítem de autorización (tanto grupo como participante) */
export interface AutorizacionInscripcionItem {
    id_inscripcion_autorizacion: number;
    id_inscripcion: number;
    id_rsvp_grupo_integrante: number | null;
    participante: string | null;
    id_programa_autorizacion_config: number;
    codigo: string;
    titulo: string;
    texto_aceptado: string;
    aceptada: boolean;
    fecha_aceptacion: string;
    nombre_firmante: string;
}

/** Respuesta completa del endpoint GET /programas/inscripciones/{id}/autorizaciones */
export interface AutorizacionesInscripcionResponse {
    id_inscripcion: number;
    responsable: string;
    email: string;
    telefono: string;
    autorizaciones_grupo: AutorizacionInscripcionItem[];
    autorizaciones_participantes: AutorizacionInscripcionItem[];
}
