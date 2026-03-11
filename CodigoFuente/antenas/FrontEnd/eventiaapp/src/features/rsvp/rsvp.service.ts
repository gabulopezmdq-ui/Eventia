// Tipos

export interface CatalogoRestriccion {
    idRestriccion: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    iconKey?: string;
    orden: number;
}

export interface NinosPayload {
    nombre: string;
    apellido: string;
}

export interface ConfirmarRsvpPayload {
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
    asiste: boolean;
    mensaje?: string;
    acompanantes?: NinosPayload[];
    extras?: number;
}

export interface RestriccionItem {
    idRestriccion: number;
    observaciones?: string | null;
    severidad?: 'L' | 'M' | 'G' | null;
}

export interface IntegranteRestriccion {
    idRsvpGrupoIntegrante: number;
    restricciones: RestriccionItem[];
}

export interface GrupoRsvpInfo {
    idEvento: number;
    idGrupo: number;
    integrantes: IntegranteRestriccion[];
}

export interface GuardarRestriccionesPayload {
    integrantes: IntegranteRestriccion[];
}

// Services

/**
 * PASO 3: Confirmar asistencia del invitado.
 * POST /api/invitaciones/confirmar?token={token}
 */
export async function confirmarRsvp(token: string, payload: ConfirmarRsvpPayload): Promise<any> {
    const res = await fetch(`/api/invitaciones/confirmar?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al confirmar la asistencia');
    }

    return res.json().catch(() => ({}));
}

/**
 * PASO 2.5: Obtener datos básicos de la invitación antes de confirmar.
 * GET /api/invitaciones/datos?token={token}
 */
export async function getDatosInvitacion(token: string): Promise<any> {
    const res = await fetch(`/api/invitaciones/datos?token=${token}`);

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al obtener datos de la invitación');
    }

    return res.json();
}

/**
 * PASO 4/5: Obtener integrantes del grupo RSVP.
 * GET /api/restricciones/mis-restricciones?token={token}
 * Lanza error si el invitado aún no confirmó (no tiene grupo).
 */
export async function getMisRestricciones(token: string): Promise<GrupoRsvpInfo> {
    const res = await fetch(`/api/restricciones/mis-restricciones?token=${token}`);

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'El invitado no pertenece a un grupo RSVP');
    }

    return res.json();
}

/**
 * PASO 5: Obtener catálogo de restricciones dietarias disponibles.
 * GET /api/restricciones/catalogo?locale=es-AR
 */
export async function getCatalogoRestricciones(locale: string = 'es-AR'): Promise<CatalogoRestriccion[]> {
    const res = await fetch(`/api/restricciones/catalogo?locale=${locale}`);

    if (!res.ok) {
        throw new Error('Error al obtener el catálogo de restricciones');
    }

    return res.json();
}

/**
 * PASO 6: Guardar restricciones alimentarias de cada integrante.
 * POST /api/restricciones/mis-restricciones?token={token}
 * IMPORTANTE: Usar siempre idRsvpGrupoIntegrante, NUNCA idInvitado.
 */
export async function guardarRestricciones(token: string, payload: GuardarRestriccionesPayload): Promise<any> {
    const res = await fetch(`/api/restricciones/mis-restricciones?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al guardar las restricciones alimentarias');
    }

    return res.json().catch(() => ({}));
}
