// ────────────────────────────────────────────────────────────────
//  Módulo: Staff y Unidades
//  Descripción: Tipos compartidos para la gestión de staff en
//               eventos personales, cuentas B2B y programas.
//  Actualizado según: protocolo_comunicacion_staff.md
// ────────────────────────────────────────────────────────────────

// ── Unidad vinculada al staff ─────────────────────────────────────
export interface StaffUnidad {
    id_unidad: number;
    nombre: string;
}

// ── Entidad Staff (lectura – GET /cuenta/:id_cuenta/staff) ────────
export interface Staff {
    id_staff: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    /** Código de acceso. */
    codigo?: string;
    rol_codigo: string;
    rol_descripcion: string;
    activo: boolean;
    fecha_expiracion: string;
    /** Cantidad de veces que el código fue usado. */
    usos: number;
    /** Fecha en que el código fue usado por última vez. */
    fecha_uso?: string;
    /** Sectores/unidades asignadas. */
    id_unidades?: number[];
}

// ── Payload de creación (Admin) ───────────────────────────────────

/**
 * Payload para POST /cuenta/:id_cuenta/staff (invitar nuevo integrante).
 * El id_cuenta se envía por URL, NO en el body.
 */
export interface CreateStaffInput {
    /** ID numérico del rol asignado (ej. 1 para STAFF_OPERADOR). */
    id_rol: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_expiracion: string;
    /** Array de IDs de sectores/unidades donde puede operar. */
    id_unidades: number[];
}

// ── Respuesta de creación (Admin) ─────────────────────────────────

/**
 * Respuesta de POST /cuenta/:id_cuenta/staff (200 OK).
 * El campo `codigo` se muestra UNA SOLA VEZ al admin y debe copiarse.
 */
export interface CreateStaffResponse {
    id_staff: number;
    codigo: string;
    nombre: string;
    apellido: string;
    fecha_expiracion: string;
}

// ── Flujo del Empleado: POST /staff/join ──────────────────────────

export interface StaffJoinPayload {
    codigo: string;
}

/**
 * Respuesta completa de POST /staff/join (200 OK).
 * Incluye el JWT y toda la información de contexto del empleado.
 * Las `unidades` eliminan la necesidad de un segundo fetch post-login.
 */
export interface StaffJoinResponse {
    id_staff: number;
    id_cuenta: number;
    id_evento?: number;
    nombre: string;
    apellido: string;
    rol_codigo?: string;
    unidades?: StaffUnidad[];
    access_token: string;
    expires_at_utc: string;
    eventos_disponibles?: {
        id_evento: number;
        tipo_operacion: string;
        nombre_evento: string;
        fecha_inicio_operativa?: string | null;
        fecha_fin_operativa?: string | null;
        fecha_inicio?: string | null;
        roles_evento: {
            id_evento_staff: number;
            id_rol: number;
            codigo_rol: string;
            rol_texto: string;
            pantalla_inicio: string;
        }[];
        pantalla_inicio_default?: string;
    }[];
    roles_evento?: {
        id_rol: number;
        rol_codigo: string;
        rol_texto: string;
        pantalla_inicio: string;
    }[];
    pantalla_inicio_default?: string;
}

// ── Claims del JWT del empleado ───────────────────────────────────

/** Claims decodificados del JWT que emite el backend al staff. */
export interface StaffJwtClaims {
    sub: string;
    id_staff: number;
    id_cuenta: number;
    id_evento: number;
    role: string;
    is_staff: boolean;
    /** Unix timestamp (segundos) de expiración. */
    exp: number;
}

// ── Estado del usuario en el portal staff ────────────────────────

/** Estado persistido en StaffAuthContext después de un join exitoso. */
export interface StaffAuthUser {
    idStaff: number;
    idCuenta: number;
    idEvento: number;
    nombre: string;
    apellido: string;
    rolCodigo: string;
    unidades: StaffUnidad[];
    token: string;
    expiresAt: string;
    eventosDisponibles?: StaffJoinResponse['eventos_disponibles'];
    rolesEvento?: {
        id_rol: number;
        rol_codigo: string;
        rol_texto: string;
        pantalla_inicio: string;
    }[];
    pantallaInicioDefault?: string;
    activeRol?: {
        id_rol: number;
        rol_codigo: string;
        rol_texto: string;
        pantalla_inicio: string;
    };
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
    rol_codigo?: string;
}

// ── Check-in ─────────────────────────────────────────────────────

export interface CheckinResponse {
    ok: boolean;
    hora: string;
}

// ── Payload de edición ──────────────────────────────────────────
export interface UpdateStaffInput {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    id_rol: number;
    fecha_expiracion: string;
    activo: boolean;
    id_unidades?: number[];
}

// ── Item de combo de roles ──────────────────────────────────────
export interface StaffRolCombo {
    id_rol: number;
    codigo: string;
    texto: string;
    categoria?: string;
    aplica_tipo_operacion?: string;
    requiere_usuario?: boolean;
    permite_codigo_staff?: boolean;
    pantalla_inicio?: string;
    orden_ui?: number;
}
