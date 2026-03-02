// ═══════════ Solicitudes de Plantilla ═══════════

// Tramo dentro del payload de una solicitud
export interface SolicitudTramo {
    cupo: number | null;
    lugar: string;
    orden: number;
    activo: boolean;
    nombre: string;
    latitud: number | null;
    longitud: number | null;
    direccion: string;
    id_tramo_tipo: number;
    fecha_hora_fin: string;
    leyenda_visible: string;
    fecha_hora_inicio: string;
}

// Acceso dentro del payload de una solicitud
export interface SolicitudAcceso {
    orden: number;
    activo: boolean;
    nombre: string;
    es_default: boolean;
    mensaje_rsvp: string;
}

// Relación acceso-tramo dentro del payload de una solicitud
export interface SolicitudRelacion {
    tramo_orden: number;
    acceso_orden: number;
}

// Payload completo parseado de una solicitud
export interface SolicitudPayload {
    motivo: string;
    tramos: SolicitudTramo[];
    accesos: SolicitudAcceso[];
    relaciones: SolicitudRelacion[];
    borrar_existente: boolean;
    id_solicitud_draft: number;
    registrar_solicitud: boolean;
}

// Entidad principal: Solicitud de Plantilla
export interface SolicitudPlantilla {
    id_solicitud: number;
    id_evento: number;
    id_tipo_evento: number;
    id_plantilla_referida: number | null;
    motivo: string;
    detalle: string | null;
    payload: string; // JSON stringificado — se parsea a SolicitudPayload
    estado: 'D' | 'P' | 'A' | 'R'; // Draft / Pendiente / Aprobada / Rechazada
    id_usuario_solicita: number;
    fecha_alta: string;
    fecha_revision: string | null;
    id_usuario_revisa: number | null;
    observaciones_admin: string | null;
    evento: unknown | null;
}

// Estados posibles para filtrado
export type EstadoSolicitud = 'D' | 'P' | 'A' | 'R' | '';

// Filtros para el listado de solicitudes
export interface SolicitudFiltros {
    estado?: EstadoSolicitud;
    idTipoEvento?: number;
    idEvento?: number;
}

// ═══════════ Payloads de Acciones del SuperAdmin ═══════════

// Payload para rechazar una solicitud
export interface RechazarSolicitudPayload {
    estado: 'R';
    observaciones_admin: string;
}

// Payload para convertir una solicitud en plantilla
export interface ConvertirSolicitudPayload {
    codigo: string;
    observaciones_admin?: string;
    activo: boolean;
}

// Respuesta del endpoint de conversión
export interface ConvertirSolicitudResponse {
    ok: boolean;
    id_plantilla: number;
}

// Respuesta genérica de revisión (rechazar)
export interface RevisarSolicitudResponse {
    ok: boolean;
}
