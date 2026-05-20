export interface EventoStaff {
    id_evento_usuario: number;
    id_evento: number;
    id_usuario?: number;
    id_staff?: number;
    nombre?: string;
    apellido?: string;
    email: string;
    id_rol: number;
    codigo_rol?: string;
    activo: boolean;
    fecha_alta: string;
    es_invitacion: boolean;
    es_personal_cuenta: boolean;
    codigo_acceso?: string;
}

export interface AddEventStaffPayload {
    email?: string;
    id_staff?: number;
    id_rol: number;
    nombre?: string;
    apellido?: string;
}

export interface UpdateEventStaffPayload {
    id_rol: number;
    activo: boolean;
    nombre?: string;
    apellido?: string;
    email?: string;
}

export interface StaffCodigo {
    email: string;
    codigo_acceso: string;
}

const API_URL = '/api/eventos';

export async function getEventStaffList(idEvento: number): Promise<EventoStaff[]> {
    const res = await fetch(`${API_URL}/${idEvento}/staff`);
    if (!res.ok) throw new Error('Error al obtener la lista de staff del evento.');
    return res.json();
}

export async function getEventStaffCodigos(idEvento: number): Promise<StaffCodigo[]> {
    const res = await fetch(`${API_URL}/${idEvento}/staff/codigos`);
    if (!res.ok) throw new Error('Error al obtener los códigos de acceso de staff.');
    return res.json();
}

export async function addEventStaff(idEvento: number, payload: AddEventStaffPayload): Promise<EventoStaff | { message: string; email: string; token: string; es_invitacion: true }> {
    const res = await fetch(`${API_URL}/${idEvento}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details?.error || errorData.message || 'Error al agregar staff al evento.');
    }
    return res.json();
}

export async function createEventStaff(idEvento: number, payload: AddEventStaffPayload): Promise<EventoStaff> {
    const res = await fetch(`${API_URL}/${idEvento}/staff/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details?.error || errorData.message || 'Error al crear staff para el evento.');
    }
    return res.json();
}

export async function updateEventStaff(idEvento: number, idEventoUsuario: number, payload: UpdateEventStaffPayload): Promise<void> {
    const res = await fetch(`${API_URL}/${idEvento}/staff/${idEventoUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details?.error || errorData.message || 'Error al actualizar staff del evento.');
    }
}

export async function deleteEventStaff(idEvento: number, idEventoUsuario: number): Promise<void> {
    const res = await fetch(`${API_URL}/${idEvento}/staff/${idEventoUsuario}`, {
        method: 'DELETE'
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details?.error || errorData.message || 'Error al eliminar staff del evento.');
    }
}
