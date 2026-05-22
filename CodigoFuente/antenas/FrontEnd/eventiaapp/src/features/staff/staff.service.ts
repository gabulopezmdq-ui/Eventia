// ────────────────────────────────────────────────────────────────
//  Módulo: Staff – Service Layer
//  Actualizado según: protocolo_comunicacion_staff.md
//
//  Separación de responsabilidades:
//    · Admin (ACCOUNT_ADMIN) → Listar, invitar y revocar staff de cuenta
//    · Portal staff (Empleado) → join, eventos accesibles, check-in
// ────────────────────────────────────────────────────────────────

import type {
    Staff,
    CreateStaffInput,
    CreateStaffResponse,
    StaffJoinResponse,
    StaffEvento,
    StaffMiembro,
    CheckinResponse,
    UpdateStaffInput,
    StaffRolCombo,
} from './types';

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 1 – Admin: Gestión de Staff de la Cuenta
// ════════════════════════════════════════════════════════════════

/**
 * Lista todos los integrantes de staff de una cuenta con sus códigos y estado.
 * → GET /api/cuenta/:id_cuenta/staff
 */
export async function getStaffList(idCuenta: number): Promise<Staff[]> {
    const res = await fetch(`/api/cuenta/${idCuenta}/staff`);
    if (!res.ok) throw new Error('Error al cargar el staff de la cuenta');
    return res.json();
}

/**
 * Genera una nueva invitación de staff para la cuenta.
 * El backend devuelve un CÓDIGO ÚNICO que el admin debe entregar al empleado.
 * ⚠ El código solo está disponible en esta respuesta – mostrarlo al admin para que lo copie.
 * → POST /api/cuenta/:id_cuenta/staff
 */
export async function invitarStaff(
    idCuenta: number,
    input: CreateStaffInput
): Promise<CreateStaffResponse> {
    const res = await fetch(`/api/cuenta/${idCuenta}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al invitar al integrante de staff');
    return res.json();
}

/**
 * Revoca el acceso de un miembro del staff de la cuenta.
 * Desactiva el código y cualquier JWT activo del empleado.
 * → DELETE /api/cuenta/:id_cuenta/staff/:id_staff
 */
export async function revocarStaff(
    idCuenta: number,
    idStaff: number
): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/cuenta/${idCuenta}/staff/${idStaff}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Error al revocar acceso del staff #${idStaff}`);
    return res.json();
}

/**
 * Obtiene el detalle completo de un integrante de staff de la cuenta.
 * → GET /api/cuenta/:id_cuenta/staff/:id_staff
 */
export async function getStaffDetail(
    idCuenta: number,
    idStaff: number
): Promise<Staff> {
    const res = await fetch(`/api/cuenta/${idCuenta}/staff/${idStaff}`);
    if (!res.ok) throw new Error(`Error al obtener los detalles del staff #${idStaff}`);
    return res.json();
}

/**
 * Actualiza los datos de un integrante de staff de la cuenta.
 * → PUT /api/cuenta/:id_cuenta/staff/:id_staff
 */
export async function actualizarStaff(
    idCuenta: number,
    idStaff: number,
    input: UpdateStaffInput
): Promise<Staff> {
    const res = await fetch(`/api/cuenta/${idCuenta}/staff/${idStaff}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Error al actualizar el staff #${idStaff}`);
    return res.json();
}

/**
 * Renueva la vigencia del código de un staff de la cuenta (extiende fecha expiración).
 * → PUT /api/cuenta/:id_cuenta/staff/:id_staff/renovar
 */
export async function renovarStaff(
    idCuenta: number,
    idStaff: number,
    fechaExpiracion: string
): Promise<Staff> {
    const res = await fetch(`/api/cuenta/${idCuenta}/staff/${idStaff}/renovar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha_expiracion: fechaExpiracion }),
    });
    if (!res.ok) throw new Error(`Error al renovar la vigencia del staff #${idStaff}`);
    return res.json();
}

/**
 * Obtiene los roles operativos del staff para combos.
 * → GET /api/roles/combo-staff?idIdioma=1&tipoOperacion=EVENTO
 */
export async function getRolesComboStaff(
    idIdioma = 1,
    tipoOperacion = 'EVENTO'
): Promise<StaffRolCombo[]> {
    const res = await fetch(`/api/roles/combo-staff?idIdioma=${idIdioma}&tipoOperacion=${tipoOperacion}`);
    if (!res.ok) throw new Error('Error al cargar la lista de roles de staff');
    return res.json();
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 2 – Portal Staff: Acceso del Empleado (sin login previo)
// ════════════════════════════════════════════════════════════════

/**
 * El empleado usa su código para unirse a la app.
 * No requiere cuenta de usuario ni sesión previa.
 * Devuelve el JWT y toda la información de contexto (nombre, rol, unidades).
 * ⚠ Las `unidades` ya vienen en la respuesta – no es necesario un segundo fetch.
 * → POST /api/staff/join
 */
export async function joinStaff(codigo: string): Promise<StaffJoinResponse> {
    const res = await fetch('/api/staff/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.toUpperCase() }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.details?.error || err.details?.message || err.message || 'Código inválido o expirado.';
        throw new Error(msg);
    }

    return res.json();
}

/**
 * Solicita un nuevo JWT antes de que expire el actual (token refresh).
 * Requiere enviar el Bearer token vigente.
 * → POST /api/staff/refresh
 */
export async function refreshStaffToken(currentToken: string): Promise<string> {
    const res = await fetch('/api/staff/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (!res.ok) throw new Error('No se pudo renovar la sesión del staff');
    const data = await res.json();
    return data.access_token ?? data.token as string;
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 3 – Portal Staff: Eventos y Programas accesibles
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
 *
 * @param tipo    Tipo de caso de uso.
 * @param params  Parámetros de filtrado según el tipo.
 * @param token   JWT del staff (obtenido de StaffJoinResponse.access_token).
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
//  SECCIÓN 4 – Portal Staff: Miembros por Evento
// ════════════════════════════════════════════════════════════════

/**
 * Obtiene los integrantes de staff que tienen acceso a un evento concreto.
 * → GET /api/staff/miembros?eventoId=XX
 *
 * @param eventoId  ID del evento.
 * @param token     JWT del staff o del admin (opcional).
 */
export async function getMiembrosPorEvento(
    eventoId: number,
    token?: string
): Promise<StaffMiembro[]> {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`/api/staff/miembros?eventoId=${eventoId}`, { headers });
    if (!res.ok) throw new Error('Error al cargar los miembros del evento');
    return res.json();
}

// ════════════════════════════════════════════════════════════════
//  SECCIÓN 5 – Portal Staff: Check-in
// ════════════════════════════════════════════════════════════════

/**
 * Registra la presencia del staff en un evento (check-in).
 * El backend verifica que la unidad del evento esté dentro de las del staff.
 * → POST /api/eventos/:id/checkin
 *
 * @param idEvento  ID del evento.
 * @param token     JWT del staff (obtenido de StaffJoinResponse.access_token).
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
