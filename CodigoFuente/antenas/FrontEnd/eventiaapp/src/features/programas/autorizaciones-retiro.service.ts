import {
    AutorizacionRetiro,
    CrearAutorizacionRsvpPayload,
    CrearAutorizacionOperadorPayload
} from './types';

const API_URL = '/api/autorizacion';

/**
 * Obtiene la lista de personas autorizadas registradas para el grupo familiar por token RSVP.
 * GET /api/autorizacion/p/{rsvpToken}/autorizaciones
 */
export async function getAutorizacionesRsvp(rsvpToken: string): Promise<AutorizacionRetiro[]> {
    const res = await fetch(`${API_URL}/p/${rsvpToken}/autorizaciones`, {
        method: 'GET',
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Error al obtener los autorizados de retiro');
    }

    return res.json();
}

/**
 * Registra una persona autorizada de retiro desde el link RSVP familiar (Autoservicio).
 * POST /api/autorizacion/p/{rsvpToken}/autorizaciones
 */
export async function createAutorizacionRsvp(
    rsvpToken: string,
    payload: CrearAutorizacionRsvpPayload
): Promise<any> {
    const res = await fetch(`${API_URL}/p/${rsvpToken}/autorizaciones`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar la autorización de retiro');
    }

    return res.json();
}

/**
 * Registra manualmente una persona autorizada desde el Backoffice (Operador).
 * POST /api/autorizacion
 */
export async function createAutorizacionOperador(
    payload: CrearAutorizacionOperadorPayload
): Promise<AutorizacionRetiro> {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear la autorización');
    }

    return res.json();
}

/**
 * Modifica los datos de una persona autorizada (Backoffice u Operador).
 * PUT /api/autorizacion/{idAutorizacion}
 */
export async function updateAutorizacion(
    idAutorizacion: number,
    payload: Partial<CrearAutorizacionOperadorPayload>
): Promise<AutorizacionRetiro> {
    const res = await fetch(`${API_URL}/${idAutorizacion}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la autorización');
    }

    return res.json();
}

/**
 * Baja lógica de una persona autorizada (Desactivación de QR).
 * DELETE /api/autorizacion/{idAutorizacion}
 */
export async function deleteAutorizacion(idAutorizacion: number): Promise<any> {
    const res = await fetch(`${API_URL}/${idAutorizacion}`, {
        method: 'DELETE'
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar la autorización');
    }

    return res.json();
}
