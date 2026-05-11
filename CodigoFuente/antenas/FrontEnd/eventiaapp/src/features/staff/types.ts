// ────────────────────────────────────────────────────────────────
//  Módulo: Staff y Unidades
//  Descripción: Tipos compartidos para la gestión de staff en
//               eventos personales, cuentas B2B y programas.
// ────────────────────────────────────────────────────────────────

// ── Roles disponibles ─────────────────────────────────────────────
export type StaffRol =
    | 'STAFF_DJ'
    | 'STAFF_MESERO'
    | 'STAFF_COCINA'
    | 'STAFF_SEGURIDAD'
    | 'STAFF_PROPIETARIO'
    | 'ACCOUNT_ADMIN';

// ── Unidad vinculada al staff ─────────────────────────────────────
export interface StaffUnidad {
    id_unidad: number;
    nombre: string;
}

// ── Entidad Staff (lectura) ───────────────────────────────────────
export interface Staff {
    id_staff: number;
    /** El código sólo se expone al momento de la creación; no se repite. */
    codigo?: string;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    id_cuenta: number;
    rol: StaffRol;
    activo: boolean;
    fecha_expiracion?: string;
    fecha_alta?: string;
    fecha_modif?: string;
    unidades: StaffUnidad[];
}

// ── Payloads de escritura ─────────────────────────────────────────

/** Payload para POST /staff (crear nuevo integrante) */
export interface CreateStaffInput {
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    id_cuenta: number;
    rol: StaffRol;
    /** Array de id_unidad a asignar (mínimo 1). */
    unidades: number[];
}

/** Payload para PUT /staff/:id (actualización parcial o total) */
export interface UpdateStaffInput {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    rol?: StaffRol;
    /** Si se omite, el backend conserva las unidades actuales. */
    unidades?: number[];
}

/** Payload para PATCH /staff/:id (cambio de disponibilidad) */
export interface PatchStaffInput {
    activo?: boolean;
    fecha_expiracion?: string;
}

// ── Respuestas de API ─────────────────────────────────────────────

/**
 * Respuesta de POST /staff (201 Created).
 * El campo `codigo` se muestra UNA SOLA VEZ al admin y debe copiarse.
 */
export interface CreateStaffResponse {
    id_staff: number;
    codigo: string;
    activo: boolean;
    fecha_expiracion: string;
}

// ── Autenticación staff (login por código) ────────────────────────

export interface StaffLoginPayload {
    codigo: string;
}

export interface StaffLoginResponse {
    token: string;
}

/** Claims decodificados del JWT que emite el backend al staff. */
export interface StaffJwtClaims {
    sub: string;
    id_staff: number;
    id_cuenta: number;
    role: StaffRol;
    is_staff: boolean;
    /** Unix timestamp (segundos) de expiración. */
    exp: number;
}

// ── Estado del usuario en el portal staff ────────────────────────

export interface StaffAuthUser {
    idStaff: number;
    idCuenta: number;
    role: StaffRol;
    /** Se carga tras el login mediante GET /staff/unidades/:id_cuenta */
    unidades: StaffUnidad[];
}

// ── Eventos y programas accesibles ───────────────────────────────

/** Item de evento/programa que el staff puede ver según sus unidades. */
export interface StaffEvento {
    id_evento: number;
    nombre: string;
    fecha_inicio: string;
    unidad: string;
    estado?: string;
}

// ── Respuesta de miembros por evento ─────────────────────────────

export interface StaffMiembro {
    id_staff: number;
    nombre: string;
    apellido?: string;
    rol?: StaffRol;
}

// ── Check-in ─────────────────────────────────────────────────────

export interface CheckinResponse {
    ok: boolean;
    hora: string;
}
