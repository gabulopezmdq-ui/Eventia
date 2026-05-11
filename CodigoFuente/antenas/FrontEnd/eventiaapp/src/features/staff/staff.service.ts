// ────────────────────────────────────────────────────────────────
//  Módulo: Staff y Unidades – Service Layer
//  Descripción: Funciones que consumen los proxies Next.js de
//               /api/staff/* y los endpoints relacionados.
//  Separación de responsabilidades:
//    · Admin (ACCOUNT_ADMIN) → CRUD staff + listado por cuenta
//    · Portal staff           → login, eventos accesibles, check-in
// ────────────────────────────────────────────────────────────────

import type {
    Staff,
    CreateStaffInput,
    UpdateStaffInput,
    PatchStaffInput,
    CreateStaffResponse,
    StaffEvento,
    StaffMiembro,
    StaffUnidad,
    CheckinResponse,
} from './types';

const BASE_STAFF = '/api/staff';

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 1 – Admin: CRUD de staff
// ════════════════════════════════════════════════════════════════

/**
 * Lista todos los integrantes de staff de una cuenta con sus unidades.
 * → GET /api/staff/unidades/:id_cuenta
 */
export async function getStaffUnidades(idCuenta: number): Promise<Staff[]> {
    const res = await fetch(`${BASE_STAFF}/unidades/${idCuenta}`);
    if (!res.ok) throw new Error('Error al cargar el staff de la cuenta');
    return res.json();
}

/**
 * Obtiene el detalle de un integrante de staff (incluye sus unidades).
 * → GET /api/staff/:id
 */
export async function getStaffById(id: number): Promise<Staff> {
    const res = await fetch(`${BASE_STAFF}/${id}`);
    if (!res.ok) throw new Error(`Error al cargar staff #${id}`);
    return res.json();
}

/**
 * Crea un nuevo integrante de staff.
 * El backend genera el código de acceso (único) y lo devuelve en la respuesta.
 * ⚠ El código sólo está disponible en esta respuesta – mostrarlo al admin para que lo copie.
 * → POST /api/staff
 */
export async function createStaff(
    input: CreateStaffInput
): Promise<CreateStaffResponse> {
    const res = await fetch(BASE_STAFF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al crear el integrante de staff');
    return res.json();
}

/**
 * Actualiza datos personales y/o unidades de un integrante de staff.
 * Si se omite `unidades` en el payload, el backend conserva las actuales.
 * → PUT /api/staff/:id
 */
export async function updateStaff(
    id: number,
    input: UpdateStaffInput
): Promise<{ ok: boolean }> {
    const res = await fetch(`${BASE_STAFF}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Error al actualizar staff #${id}`);
    return res.json();
}

/**
 * Desactiva (soft-delete) un integrante de staff y elimina sus relaciones
 * con unidades. Operación reversible desde el panel admin.
 * → DELETE /api/staff/:id
 */
export async function deleteStaff(id: number): Promise<{ ok: boolean }> {
    const res = await fetch(`${BASE_STAFF}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error al desactivar staff #${id}`);
    return res.json();
}

/**
 * Actualiza disponibilidad o expiración de un integrante de staff.
 * Puede ser invocado por el propio staff (auto-desactivación) o por el admin.
 * → PATCH /api/staff/:id
 */
export async function patchStaff(
    id: number,
    input: PatchStaffInput
): Promise<{ ok: boolean }> {
    const res = await fetch(`${BASE_STAFF}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Error al actualizar disponibilidad de staff #${id}`);
    return res.json();
}

/**
 * Obtiene los integrantes de staff que tienen acceso a un evento concreto
 * (filtrado por unidades vinculadas al evento).
 * → GET /api/staff/miembros?eventoId=XX
 */
export async function getMiembrosPorEvento(
    eventoId: number
): Promise<StaffMiembro[]> {
    const res = await fetch(`${BASE_STAFF}/miembros?eventoId=${eventoId}`);
    if (!res.ok) throw new Error('Error al cargar los miembros del evento');
    return res.json();
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 2 – Portal Staff: autenticación
// ════════════════════════════════════════════════════════════════

/**
 * Autentica al staff usando su código de 8 caracteres.
 * Devuelve el JWT (válido por 12 h) que debe guardarse de forma segura.
 * → POST /api/staff/login
 */
export async function loginStaff(codigo: string): Promise<string> {
    const res = await fetch(`${BASE_STAFF}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.toUpperCase() }),
    });
    if (!res.ok) {
        throw new Error('Código inválido o expirado. Verificá las mayúsculas.');
    }
    const data = await res.json();
    return data.token as string;
}

/**
 * Solicita un nuevo JWT antes de que expire el actual (token refresh).
 * Requiere enviar el Bearer token vigente.
 * → POST /api/staff/refresh
 */
export async function refreshStaffToken(currentToken: string): Promise<string> {
    const res = await fetch(`${BASE_STAFF}/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (!res.ok) throw new Error('No se pudo renovar la sesión del staff');
    const data = await res.json();
    return data.token as string;
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 3 – Portal Staff: unidades accesibles
// ════════════════════════════════════════════════════════════════

/**
 * Recupera las unidades a las que pertenece el staff autenticado.
 * Se invoca justo después del login para poblar el contexto global.
 * → GET /api/staff/unidades/:id_cuenta  (con Bearer token del staff)
 *
 * @param idCuenta  ID de la cuenta extraído del claim `id_cuenta` del JWT.
 * @param token     JWT del staff (se envía como Bearer desde el cliente).
 */
export async function getUnidadesStaff(
    idCuenta: number,
    token: string
): Promise<StaffUnidad[]> {
    const res = await fetch(`${BASE_STAFF}/unidades/${idCuenta}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al cargar las unidades del staff');
    const data = await res.json();
    // El backend puede devolver { staffId, unidades: [...] } o directo array
    return Array.isArray(data) ? data : (data.unidades ?? []);
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 4 – Portal Staff: eventos y programas accesibles
// ════════════════════════════════════════════════════════════════

/**
 * Obtiene los eventos asignados al staff según el tipo de caso de uso.
 *
 * - `'personal'`: staff propietario de un único evento
 *   → GET /api/eventos?staffId={staffId}
 *
 * - `'cuenta'`: staff B2B con acceso filtrado por unidades
 *   → GET /api/eventos?cuentaId={cuentaId}&unidades=1,3,5
 *
 * - `'programa'`: programas accesibles por unidades
 *   → GET /api/programas?cuentaId={cuentaId}&unidades=1,3
 */
export async function getEventosAccesibles(
    tipo: 'personal' | 'cuenta' | 'programa',
    params: {
        staffId?: number;
        cuentaId?: number;
        unidades?: number[];
    },
    token: string
): Promise<StaffEvento[]> {
    const headers: HeadersInit = { Authorization: `Bearer ${token}` };
    const qs = new URLSearchParams();

    let url: string;

    if (tipo === 'personal') {
        if (!params.staffId) throw new Error('staffId requerido para modo personal');
        qs.set('staffId', String(params.staffId));
        url = `/api/eventos?${qs.toString()}`;
    } else if (tipo === 'cuenta') {
        if (!params.cuentaId) throw new Error('cuentaId requerido para modo cuenta');
        qs.set('cuentaId', String(params.cuentaId));
        if (params.unidades?.length) qs.set('unidades', params.unidades.join(','));
        url = `/api/eventos?${qs.toString()}`;
    } else {
        // programa
        if (!params.cuentaId) throw new Error('cuentaId requerido para modo programa');
        qs.set('cuentaId', String(params.cuentaId));
        if (params.unidades?.length) qs.set('unidades', params.unidades.join(','));
        url = `/api/programas?${qs.toString()}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Error al cargar los eventos accesibles');
    return res.json();
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 5 – Portal Staff: check-in
// ════════════════════════════════════════════════════════════════

/**
 * Registra la presencia del staff en un evento (check-in).
 * El backend verifica que la unidad del evento esté dentro de las del staff.
 * → POST /api/eventos/:id/checkin
 *
 * @param idEvento  ID del evento.
 * @param token     JWT del staff.
 */
export async function registrarCheckin(
    idEvento: number,
    token: string
): Promise<CheckinResponse> {
    const res = await fetch(`/api/eventos/${idEvento}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al registrar la presencia en el evento');
    return res.json();
}
