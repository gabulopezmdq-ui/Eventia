// Tipos

export interface InvitadoPayload {
    nombre: string;
    apellido: string;
    email?: string;
    celular?: string;
    idAcceso?: number;
}

export interface CargarInvitadoPayload {
    idEvento: number;
    invitados: InvitadoPayload[];
}

export interface InvitacionResponse {
    idInvitado: number;
    rsvpToken: string;
    rsvpEstado: string;
}

export interface InvitadoListado {
    idInvitado: number;
    nombre: string;
    apellido: string;
    email?: string;
    celular?: string;
    rsvpToken: string;
    rsvpEstado: 'P' | 'C' | 'R'; // P=Pendiente, C=Confirmado, R=Rechazado
}

// Services

export async function cargarInvitacion(payload: CargarInvitadoPayload): Promise<InvitacionResponse[]> {
    const res = await fetch('/api/invitaciones/cargar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idEvento: payload.idEvento,
            invitados: payload.invitados.map(inv => ({
                nombre: inv.nombre,
                apellido: inv.apellido,
                email: inv.email ?? null,
                celular: inv.celular ?? null,
                idAcceso: inv.idAcceso ?? null,
            }))
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(
            errData?.details
                ? (typeof errData.details === 'string' ? errData.details : JSON.stringify(errData.details))
                : errData?.message || 'Error al generar la invitación'
        );
    }

    return res.json();
}

export async function listarInvitados(idEvento: number): Promise<InvitadoListado[]> {
    const res = await fetch(`/api/invitaciones?idEvento=${idEvento}`, {
        method: 'GET',
    });

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al obtener el listado de invitados');
    }

    return res.json();
}
