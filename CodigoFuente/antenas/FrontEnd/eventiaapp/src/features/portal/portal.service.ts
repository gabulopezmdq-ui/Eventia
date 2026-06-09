// ═══════════════════════════════════════════════════════════════════
// TIPOS — Portal Puntual y Portal Persistente (Mi-Eventia)
// Basado en la documentación: documentacion_tecnica_portal_circuitos.md
// ═══════════════════════════════════════════════════════════════════

// ── Tipos comunes ─────────────────────────────────────────────────

/** Información básica del evento — usada tanto en el portal puntual como en Mi-Eventia */
export interface PortalEvento {
    nombre: string;
    fecha_inicio: string;   // ISO "2026-12-15"
    fecha_fin: string;      // ISO "2026-12-22"
    logo_url: string | null;
    estado: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO' | string;
}

// ── Tipos del Portal Puntual (GET /api/portal/{token}) ────────────

/** Sección habilitada para el portal del evento */
export interface SeccionHabilitada {
    codigo: string;
    orden: number;
    titulo: string;
    visible: boolean;
    requiere_desbloqueo: boolean;
}

/** Respuesta completa e integrada del Portal Puntual */
export interface PortalPuntualResponse {
    tipoPortal: 'PROGRAMA' | 'EVENTO' | string;
    idEvento: number;
    evento: PortalEvento;
    usuario: {
        nombre: string;
        email: string;
    };
    requiere_desbloqueo_sensible: boolean;
    desbloqueado_sensible: boolean;
    url_mi_eventia: string;
    secciones: SeccionHabilitada[];
    data: {
        resumen: any;
        pagos: any;
        salud: any | null;
        qrsRetiro: any | null;
        [key: string]: any;
    };
}

// ── Tipos del Portal Persistente Mi-Eventia ───────────────────────

/** Identidad unificada de la persona en el portal persistente */
export interface PortalPersona {
    idPortalPersona: number;
    nombre: string;
    email: string;
    telefono: string;
}

/** Tipo de acceso vinculado a la persona */
export type TipoAcceso = 'PROGRAMA' | 'EVENTO' | string;

/** Item de acceso de Mi-Eventia — representa un evento/programa al que tiene acceso */
export interface PortalAccesoItem {
    tipo: TipoAcceso;
    idEvento: number;
    idInscripcion: number | null;
    idInvitado: number | null;
    tokenConsulta: string;
    titulo: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO' | string;
    urlPortal: string;  // e.g. "/portal/abc123xyz789"
}

/** Respuesta completa del dashboard Mi-Eventia */
export interface MiEventiaResponse {
    persona: PortalPersona;
    items: PortalAccesoItem[];
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS — Gestión de tokens en storage del navegador
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY_PORTAL = 'mi_eventia_token';

/**
 * Persiste el token del portal persistente (GUID de largo plazo) en localStorage.
 * Se llama al confirmar una inscripción exitosa.
 */
export function guardarTokenPortal(tokenPortal: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PORTAL, tokenPortal);
    }
}

/**
 * Recupera el token del portal persistente desde localStorage.
 * Retorna null si el usuario nunca completó una inscripción desde este navegador.
 */
export function obtenerTokenPortal(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY_PORTAL);
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════
// SERVICIOS — Consumo de la API del Portal
// ═══════════════════════════════════════════════════════════════════

/**
 * GET — Dashboard Mi-Eventia (Portal Persistente)
 * Obtiene el perfil y los accesos unificados de la persona por GUID.
 * No requiere JWT.
 */
export async function getMiEventia(tokenPortal: string): Promise<MiEventiaResponse> {
    const res = await fetch(`/api/mi-eventia/${tokenPortal}`);

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'No se pudo cargar tu panel Mi-Eventia');
    }

    const data = await res.json();

    return {
        persona: {
            idPortalPersona: data.persona?.id_portal_persona ?? data.persona?.idPortalPersona,
            nombre: data.persona?.nombre,
            email: data.persona?.email,
            telefono: data.persona?.telefono,
        },
        items: (data.items || []).map((item: {
            tipo: string;
            id_evento?: number;
            idEvento?: number;
            id_inscripcion?: number | null;
            idInscripcion?: number | null;
            id_invitado?: number | null;
            idInvitado?: number | null;
            token_consulta?: string;
            tokenConsulta?: string;
            titulo: string;
            estado: string;
            url_portal?: string;
            urlPortal?: string;
        }) => ({
            tipo: item.tipo,
            idEvento: item.id_evento ?? item.idEvento ?? 0,
            idInscripcion: item.id_inscripcion ?? item.idInscripcion ?? null,
            idInvitado: item.id_invitado ?? item.idInvitado ?? null,
            tokenConsulta: item.token_consulta ?? item.tokenConsulta ?? '',
            titulo: item.titulo,
            estado: item.estado,
            urlPortal: item.url_portal ?? item.urlPortal ?? '',
        })),
    };
}

/**
 * GET — Portal Puntual (Landing Pública y Secciones Protegidas)
 * Obtiene la información del evento, secciones y datos habilitados.
 */
export async function getPortalPuntual(
    tokenConsulta: string,
    idIdioma: number = 1
): Promise<PortalPuntualResponse> {
    const res = await fetch(`/api/portal/${tokenConsulta}?idIdioma=${idIdioma}`);

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'Portal no encontrado o token inválido');
    }

    const data = await res.json();

    return {
        tipoPortal: data.tipoPortal ?? data.tipo_portal ?? 'EVENTO',
        idEvento: data.idEvento ?? data.id_evento ?? 0,
        evento: {
            nombre: data.evento?.nombre ?? data.evento?.titulo ?? data.data?.resumen?.titulo ?? data.data?.resumen?.nombre ?? '',
            fecha_inicio: data.evento?.fecha_inicio ?? data.evento?.fechaInicio ?? data.data?.resumen?.fecha_inicio ?? data.data?.resumen?.fecha_evento ?? '',
            fecha_fin: data.evento?.fecha_fin ?? data.evento?.fechaFin ?? data.data?.resumen?.fecha_fin ?? data.data?.resumen?.fecha_evento ?? '',
            logo_url: data.evento?.logo_url ?? data.evento?.logoUrl ?? data.data?.resumen?.logo_url ?? null,
            estado: data.evento?.estado ?? data.data?.resumen?.estado ?? 'ACTIVO',
        },
        usuario: {
            nombre: data.usuario?.nombre ?? '',
            email: data.usuario?.email ?? '',
        },
        requiere_desbloqueo_sensible: data.requiere_desbloqueo_sensible ?? data.requiereDesbloqueoSensible ?? false,
        desbloqueado_sensible: data.desbloqueado_sensible ?? data.desbloqueadoSensible ?? false,
        url_mi_eventia: data.url_mi_eventia ?? data.urlMiEventia ?? '',
        secciones: (data.secciones || []).map((sec: {
            codigo: string;
            orden: number;
            titulo: string;
            visible?: boolean;
            requiere_desbloqueo?: boolean;
            requiereDesbloqueo?: boolean;
        }) => ({
            codigo: sec.codigo,
            orden: sec.orden,
            titulo: sec.titulo,
            visible: sec.visible ?? true,
            requiere_desbloqueo: sec.requiere_desbloqueo ?? sec.requiereDesbloqueo ?? false,
        })),
        data: {
            resumen: data.data?.resumen ?? {},
            pagos: data.data?.pagos ?? null,
            salud: data.data?.salud ?? [],
            qrsRetiro: data.data?.qrsRetiro ?? data.data?.qrs_retiro ?? [],
            ...(data.data || {}),
        },
    };
}

/**
 * POST — Solicitar Código de Verificación OTP
 * Envía un código de 6 dígitos mediante el canal seleccionado (EMAIL o WHATSAPP).
 */
export async function solicitarCodigoOtp(
    tokenConsulta: string,
    canal: 'EMAIL' | 'WHATSAPP'
): Promise<{ ok: boolean; mensaje: string; codigo_dev?: string }> {
    const res = await fetch(`/api/portal/${tokenConsulta}/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'No se pudo enviar el código de verificación.');
    }

    return res.json();
}

/**
 * POST — Validar Código de Verificación OTP
 * Valida el código de 6 dígitos ingresado por el usuario.
 */
export async function validarCodigoOtp(
    tokenConsulta: string,
    codigo: string
): Promise<{ ok: boolean; desbloqueado: boolean; mensaje: string }> {
    const res = await fetch(`/api/portal/${tokenConsulta}/validar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'El código ingresado es incorrecto.');
    }

    return res.json();
}

/**
 * POST — Solicitar Recuperación de Acceso a Mi Eventia
 * Envía las instrucciones de acceso si existe una identidad asociada al email.
 */
export async function solicitarRecuperacionMiEventia(
    email: string
): Promise<{ ok: boolean; mensaje: string; token_recuperacion: string }> {
    const res = await fetch('/api/mi-eventia/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, telefono: null, canal: 'EMAIL' }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'No se pudo enviar la solicitud de recuperación.');
    }

    return res.json();
}

/**
 * POST — Regenerar Código de Acceso a Mi Eventia
 * Regenera el código OTP para una identidad y envía el nuevo código.
 */
export async function regenerarCodigoMiEventia(
    email: string
): Promise<{ ok: boolean; mensaje: string; token_recuperacion: string }> {
    const res = await fetch('/api/mi-eventia/regenerar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, telefono: null, canal: 'EMAIL' }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'No se pudo regenerar el código de recuperación.');
    }

    return res.json();
}

/**
 * POST — Validar Recuperación de Acceso a Mi Eventia
 * Valida el código de recuperación para obtener el token de portal y la URL de redirección.
 */
export async function validarRecuperacionMiEventia(
    tokenRecuperacion: string,
    codigo: string
): Promise<{ ok: boolean; token_portal: string; url_mi_eventia: string }> {
    const res = await fetch('/api/mi-eventia/validar-recuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_recuperacion: tokenRecuperacion, codigo }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'El código de recuperación es incorrecto.');
    }

    return res.json();
}
