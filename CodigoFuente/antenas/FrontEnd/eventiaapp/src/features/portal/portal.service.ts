// ═══════════════════════════════════════════════════════════════════
// TIPOS — Portal Puntual y Portal Persistente (Mi-Eventia)
// Basado en la documentación: documentacion_portal_persistente.md
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

/** Respuesta de la landing pública — no requiere JWT */
export interface PortalPublicoResponse {
    evento: PortalEvento;
}

// ── Tipos de Doble Verificación (POST /api/portal/{token}/verificar) ──

/** Payload de verificación de email */
export interface VerificarEmailPayload {
    email: string;
}

/** Respuesta exitosa de la verificación — contiene el JWT de 24h */
export interface VerificacionResponse {
    token: string;
}

// ── Tipos del Dashboard Protegido (GET /api/portal/dashboard) ─────

/** Sección habilitada para el portal del evento */
export interface SeccionHabilitada {
    codigo: string;
    orden: number;
    titulo: string;
}

/** Datos del participante/responsable en el dashboard */
export interface PortalParticipante {
    nombre_responsable: string;
    apellido_responsable: string;
}

/** Respuesta del dashboard protegido — requiere JWT en Authorization header */
export interface PortalDashboardResponse {
    evento: PortalEvento;
    participante: PortalParticipante;
    secciones_habilitadas: SeccionHabilitada[];
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
const SESSION_KEY_JWT_PREFIX = 'jwt_portal_';

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

/**
 * Persiste el JWT de Soft Verification (24h) en sessionStorage para un token de consulta.
 * Al cerrar el navegador, el JWT se elimina automáticamente.
 */
export function guardarJwtPortalPuntual(tokenConsulta: string, jwt: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(`${SESSION_KEY_JWT_PREFIX}${tokenConsulta}`, jwt);
    }
}

/**
 * Recupera el JWT de Soft Verification para un token de consulta específico.
 * Retorna null si el JWT expiró (se eliminó) o nunca se verificó.
 */
export function obtenerJwtPortalPuntual(tokenConsulta: string): string | null {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(`${SESSION_KEY_JWT_PREFIX}${tokenConsulta}`);
    }
    return null;
}

/**
 * Elimina el JWT de Soft Verification del sessionStorage.
 * Se llama cuando el backend responde con 401 Unauthorized (JWT expirado/inválido).
 */
export function eliminarJwtPortalPuntual(tokenConsulta: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`${SESSION_KEY_JWT_PREFIX}${tokenConsulta}`);
    }
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

    return res.json();
}

/**
 * GET — Portal Puntual (Landing Pública)
 * Obtiene la información básica del evento para la landing inicial.
 * No requiere JWT — acceso completamente público.
 */
export async function getPortalPublico(tokenConsulta: string): Promise<PortalPublicoResponse> {
    const res = await fetch(`/api/portal/${tokenConsulta}`);

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'Portal no encontrado o token inválido');
    }

    return res.json();
}

/**
 * POST — Doble Verificación / Soft Verification
 * Contrasta el email ingresado con el del responsable registrado.
 * Si coincide, el backend emite un JWT firmado válido por 24 horas.
 *
 * @throws Error con mensaje descriptivo si el email es incorrecto (401)
 */
export async function verificarEmailPortal(
    tokenConsulta: string,
    email: string
): Promise<VerificacionResponse> {
    const payload: VerificarEmailPayload = { email };

    const res = await fetch(`/api/portal/${tokenConsulta}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (res.status === 401) {
        throw new Error('El email ingresado no coincide con el responsable registrado.');
    }

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'Error al verificar el email');
    }

    return res.json();
}

/**
 * GET — Dashboard Protegido del Portal Puntual
 * Requiere el JWT de Soft Verification guardado en sessionStorage.
 * Si el backend responde con 401, el JWT expiró y debe eliminarse del storage.
 *
 * @throws Error con código 'SESSION_EXPIRED' si el JWT expiró (frontend debe mostrar modal)
 */
export async function getPortalDashboard(tokenConsulta: string): Promise<PortalDashboardResponse> {
    const jwt = obtenerJwtPortalPuntual(tokenConsulta);

    if (!jwt) {
        const err = new Error('Sin JWT de verificación. Se requiere verificar el email.');
        (err as any).code = 'SESSION_EXPIRED';
        throw err;
    }

    const res = await fetch('/api/portal/dashboard', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
        },
    });

    if (res.status === 401) {
        // JWT expirado — limpiar storage y forzar nueva verificación
        eliminarJwtPortalPuntual(tokenConsulta);
        const err = new Error('Sesión expirada. Por favor, verificá tu email nuevamente.');
        (err as any).code = 'SESSION_EXPIRED';
        throw err;
    }

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'Error al obtener el dashboard del portal');
    }

    return res.json();
}
