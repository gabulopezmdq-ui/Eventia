// ── Tipos ──

export interface CatalogoRestriccion {
    idRestriccion: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    iconKey?: string;
    orden: number;
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

// ── Tipos para Invitación Personal (GET /invitacion/{token}) ──

export interface TramoInvitacion {
    nombre: string;
    descripcion: string;
    lugar: string;
    direccion: string;
    orden: number;
}

export interface AccesoInvitacion {
    idAcceso?: number;
    nombreAcceso: string;
    tramos: TramoInvitacion[];
}

export interface PersonaInvitacion {
    idInvitado: number;
    nombreCompleto: string;
    rolEvento: 'A' | 'N'; // A = Adulto, N = Niño
}

export interface InvitacionPersonalResponse {
    idEvento: number;
    idGrupo: number;
    nombreGrupo: string;
    saludo: string;
    anfitriones: string;
    mensajeBienvenida: string;
    agenda: AccesoInvitacion[];
    personas: PersonaInvitacion[];
    cuposAdultosRestantes: number;
    cuposMenoresRestantes: number;
}

// ── Tipos para Confirmar RSVP (POST /invitacion/{token}/confirmar) ──

export interface RestriccionConfirmarItem {
    idRestriccion: number;
    observaciones?: string | null;
}

export interface PersonaConfirmarPayload {
    idInvitado?: number;       // Si existe → persona conocida. Si no → se crea.
    nombre: string;
    apellido: string;
    email?: string;
    celular?: string;
    rolEvento: 'A' | 'N';
    asiste: boolean;
    mensaje?: string;
    alimentacionDetalle?: string;          // Texto libre opcional (alergias, aclaraciones)
    restricciones?: RestriccionConfirmarItem[]; // Forma detallada con observaciones por restricción
    idsRestricciones?: number[];           // Forma simple: solo array de IDs (fallback)
}

export interface ConfirmarRsvpPayload {
    mensajeGrupo?: string;
    personas: PersonaConfirmarPayload[];
}

// ── Tipos para Resumen de RSVP ──

export interface IntegranteResumen {
    idInvitado: number;
    nombreCompleto: string;
    esTitularGrupo: boolean;
    rsvpEstado: string; // Y = Confirmado, R = Rechazado, P = Pendiente
    qrToken: string | null;
    rsvpMensaje: string | null;
    fechaRsvp: string | null;
    idMesa: number | null;
    mesaNombre: string | null;
    tieneRestricciones: boolean;
    restricciones: string[];
    cantidadSugerenciasMusica: number;
    sugerenciasMusica: string[];
}

export interface ResumenRsvpResponse {
    idEvento: number;
    evento: string;
    idRsvpGrupo: number;
    titular: string;
    rsvpEstadoGrupo: string; // e.g. "CONFIRMADO", "INCOMPLETO", "PENDIENTE"
    rsvpMensaje: string | null;
    personasCargadas?: number;
    cuposSinDefinir?: number;
    adultosDisponibles?: number;
    menoresDisponibles?: number;
    puedeEditarGrupo?: boolean;
    grupoCerrado?: boolean;
    integrantes: IntegranteResumen[];
}

// ── Tipos legacy (mantener compatibilidad) ──

export interface NinosPayload {
    nombre: string;
    apellido: string;
}

// ── Services ──

/**
 * Obtener la invitación personal completa (grupo, agenda, personas, cupos).
 * GET /api/invitaciones/{token} → GET /invitacion/{token}
 */
export async function getInvitacionPersonal(token: string): Promise<InvitacionPersonalResponse> {
    const res = await fetch(`/api/invitaciones/${token}`);

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al obtener la invitación');
    }

    return res.json();
}

/**
 * Confirmar asistencia RSVP del grupo.
 * POST /api/invitaciones/{token}/confirmar
 * Envía: { mensajeGrupo, personas: [...] }
 */
export async function confirmarRsvp(token: string, payload: ConfirmarRsvpPayload): Promise<any> {
    const res = await fetch(`/api/invitaciones/${token}/confirmar`, {
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
 * PASO 5 (PREFERIDO): Obtener catálogo de restricciones por idEvento.
 * GET /api/parametrica/restricciones-alimentarias?idEvento={id}
 * → Este endpoint respeta el idioma configurado para el evento.
 */
export async function getCatalogoParametrico(idEvento: number): Promise<CatalogoRestriccion[]> {
    const res = await fetch(`/api/parametrica/restricciones-alimentarias?idEvento=${idEvento}`);

    if (!res.ok) {
        throw new Error('Error al obtener el catálogo de restricciones del evento');
    }

    return res.json();
}

/**
 * Fallback: Obtener catálogo de restricciones dietarias por locale.
 * GET /api/restricciones/catalogo?locale=es-AR
 * Usar solo si no se tiene idEvento disponible.
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

/**
 * Obtener el resumen de RSVP del grupo (incluyendo integrantes y sus qrToken).
 * GET /api/invitados/resumen-rsvp?token={token}
 */
export async function getResumenRsvp(token: string): Promise<ResumenRsvpResponse> {
    const res = await fetch(`/api/invitados/resumen-rsvp?token=${token}`);

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al obtener el resumen del RSVP');
    }

    return res.json();
}

/**
 * Cerrar el grupo RSVP (el titular indica que no agregará más acompañantes).
 * POST /api/invitados/cerrar-grupo?token={token}
 */
export async function cerrarGrupoRsvp(token: string, observaciones: string = 'El titular indicó que no agregará más acompañantes.'): Promise<any> {
    const res = await fetch(`/api/invitados/cerrar-grupo?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observaciones }),
    });

    if (!res.ok) {
        const errText = await res.text();
        let errData;
        try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }
        throw new Error(errData?.message || 'Error al cerrar el grupo');
    }

    return res.json().catch(() => ({}));
}
