export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    expires_at_utc: string;
};
export interface RegisterPayload {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
}

export interface RegisterResponse {
    success: boolean;
}

export interface GoogleAuthPayload {
    idToken: string;
}

// ─────────────────────────────────────────────
// Tipos para GET /auth/me (respuesta completa del backend)
// ─────────────────────────────────────────────

export type CuentaEstadoUI = 'SIN_CUENTA' | 'CUENTA_ACTIVA' | 'CUENTA_PENDIENTE';

export interface CuentaContext {
    estado_ui: CuentaEstadoUI;
    id_cuenta: number | null;
    nombre_cuenta: string | null;
    tipo: string | null;           // 'B2B', 'SALON', etc.
    estado: string | null;
    id_plan: number | null;
    plan_codigo: string | null;
    rol_cuenta: string | null;     // 'ACCOUNT_ADMIN', etc.
    vinculo_activo: boolean | null;
}

export interface EventosContext {
    cantidad_propios: number;
    cantidad_compartidos: number;
}

export interface UIFlags {
    mostrar_menu_cuenta: boolean;
    puede_crear_evento_b2c: boolean;
    mostrar_solicitar_cuenta: boolean;
    mostrar_estado_cuenta_pendiente: boolean;
    mostrar_admin: boolean;
}

export interface UsuarioContext {
    id_usuario: number;
    email: string;
    nombre?: string | null;
    apellido?: string | null;
}

/**
 * Respuesta completa fusionada del proxy /api/auth/me.
 * Incluye campos legacy (email, rol, exp) para backward compat
 * y los nuevos bloques del backend (ui, cuenta, eventos).
 */
export interface AuthMeResponse {
    // ── Campos legacy ──
    email: string;
    rol: string;             // 'superadmin' | 'user'
    exp: number;
    // ── Nuevos del backend ──
    usuario: UsuarioContext | null;
    cuenta: CuentaContext | null;
    eventos: EventosContext | null;
    ui: UIFlags | null;
    roles_globales: string[];
}
