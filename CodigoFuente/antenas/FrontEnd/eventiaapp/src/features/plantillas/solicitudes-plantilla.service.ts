import {
    SolicitudPlantilla,
    SolicitudFiltros,
    RechazarSolicitudPayload,
    ConvertirSolicitudPayload,
    ConvertirSolicitudResponse,
} from './types';

const API_URL = '/api'; // Proxy de Next.js

// ═══════════ Listados ═══════════

/**
 * Listar solicitudes de plantilla con filtros opcionales.
 * GET /api/solicitudes-plantilla/listar?estado=P&idTipoEvento=4
 */
export async function listarSolicitudes(
    filtros?: SolicitudFiltros
): Promise<SolicitudPlantilla[]> {
    const params = new URLSearchParams();

    if (filtros?.estado) params.set('estado', filtros.estado);
    if (filtros?.idTipoEvento) params.set('idTipoEvento', String(filtros.idTipoEvento));
    if (filtros?.idEvento) params.set('idEvento', String(filtros.idEvento));

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_URL}/solicitudes-plantilla/listar${queryString}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al listar solicitudes de plantilla');
    }

    const data: SolicitudPlantilla[] = await res.json();

    // Fallback: si el backend no filtra nativamente por idEvento, filtramos acá
    if (filtros?.idEvento) {
        return data.filter(s => s.id_evento === filtros.idEvento);
    }

    return data;
}

/**
 * Obtener solicitudes pendientes (atajo para el SuperAdmin).
 * GET /api/solicitudes-plantilla/pendientes?idTipoEvento=4
 */
export async function getSolicitudesPendientes(
    idTipoEvento?: number
): Promise<SolicitudPlantilla[]> {
    const queryString = idTipoEvento ? `?idTipoEvento=${idTipoEvento}` : '';

    const res = await fetch(`${API_URL}/solicitudes-plantilla/pendientes${queryString}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener solicitudes pendientes');
    }

    return res.json();
}

// ═══════════ Detalle ═══════════

/**
 * Obtener el detalle completo de una solicitud de plantilla.
 * GET /api/solicitudes-plantilla/{id}
 */
export async function getSolicitudById(
    idSolicitud: number
): Promise<SolicitudPlantilla> {
    const res = await fetch(`${API_URL}/solicitudes-plantilla/${idSolicitud}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener detalle de solicitud');
    }

    return res.json();
}

// ═══════════ Confirmar Solicitud (D → P) ═══════════

/**
 * Confirmar una solicitud de plantilla.
 * Cambia el estado de D (Draft) a P (Pendiente) para revisión del admin.
 * POST /api/solicitudes-plantilla/{id}/confirmar
 */
export async function confirmarSolicitud(
    idSolicitud: number
): Promise<{ ok: boolean; id_solicitud: number; estado: string }> {
    const res = await fetch(`${API_URL}/solicitudes-plantilla/${idSolicitud}/confirmar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error('Error al confirmar solicitud');
    }

    return res.json();
}

// ═══════════ Acciones del SuperAdmin ═══════════

/**
 * Rechazar una solicitud de plantilla.
 * PUT /api/solicitudes-plantilla/{id}/revisar
 */
export async function rechazarSolicitud(
    idSolicitud: number,
    observaciones: string
): Promise<void> {
    const payload: RechazarSolicitudPayload = {
        estado: 'R',
        observaciones_admin: observaciones,
    };

    const res = await fetch(`${API_URL}/solicitudes-plantilla/${idSolicitud}/revisar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al rechazar solicitud');
    }
}

/**
 * Aprobar y convertir una solicitud en plantilla reutilizable.
 * POST /api/solicitudes-plantilla/{id}/convertir
 */
export async function convertirSolicitud(
    idSolicitud: number,
    payload: ConvertirSolicitudPayload
): Promise<ConvertirSolicitudResponse> {
    const res = await fetch(`${API_URL}/solicitudes-plantilla/${idSolicitud}/convertir`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al convertir solicitud en plantilla');
    }

    return res.json();
}
