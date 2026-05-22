export interface CuentaUsuario {
    id_cuenta_usuario: number;
    id_cuenta: number;
    id_usuario: number | null;
    email: string;
    nombre: string | null;
    apellido: string | null;
    rol_codigo: 'ACCOUNT_ADMIN' | 'ACCOUNT_STAFF';
    activo: boolean;
    fecha_alta: string;
}

export interface InvitarUsuarioInput {
    email: string;
    rolCodigo: 'ACCOUNT_ADMIN' | 'ACCOUNT_STAFF';
}

export interface InvitarResponse {
    ok: boolean;
    mensaje?: string;
    token?: string; // token generado de invitacion
    link?: string;  // link de invitacion pre-calculado
}

/**
 * Obtener listado de usuarios de la cuenta B2B activa.
 */
export async function getCuentaUsuarios(idCuenta: number): Promise<CuentaUsuario[]> {
    const res = await fetch(`/api/cuenta_usuarios/MisUsuarios?idCuenta=${idCuenta}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al obtener los usuarios de la cuenta');
    }
    const data = await res.json();
    return data.map((item: any) => ({
        id_cuenta_usuario: item.id_cuenta_usuario || item.idCuentaUsuario,
        id_cuenta: item.id_cuenta || item.idCuenta,
        id_usuario: item.id_usuario ?? item.idUsuario ?? null,
        email: item.email ?? '',
        nombre: item.nombre ?? null,
        apellido: item.apellido ?? null,
        rol_codigo: item.rol_codigo ?? item.rolCodigo ?? 'ACCOUNT_STAFF',
        activo: item.activo ?? item.es_activo ?? true,
        fecha_alta: item.fecha_alta ?? item.fechaAlta ?? '',
    }));
}

/**
 * Generar una invitación de usuario para la cuenta B2B activa.
 */
export async function invitarUsuario(idCuenta: number, email: string, rolCodigo: string): Promise<InvitarResponse> {
    const res = await fetch(`/api/cuenta_usuarios/Invitar?idCuenta=${idCuenta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rolCodigo }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al enviar la invitación');
    }
    return res.json();
}

/**
 * Cambiar el rol (ACCOUNT_ADMIN | ACCOUNT_STAFF) de un usuario en la cuenta activa.
 */
export async function cambiarRolUsuario(idCuenta: number, idCuentaUsuario: number, rolCodigo: string): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/cuenta_usuarios/CambiarRol?idCuenta=${idCuenta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCuentaUsuario, rolCodigo }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al actualizar el rol');
    }
    return res.json();
}

/**
 * Habilitar o deshabilitar temporalmente a un usuario de la cuenta B2B activa.
 */
export async function setActivoUsuario(idCuenta: number, idCuentaUsuario: number, activo: boolean): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/cuenta_usuarios/SetActivo?idCuenta=${idCuenta}&idCuentaUsuario=${idCuentaUsuario}&activo=${activo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al modificar el estado de activación');
    }
    return res.json();
}
