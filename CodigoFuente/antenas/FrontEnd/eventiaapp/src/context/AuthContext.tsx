'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getAuthMe } from '@/src/features/auth/auth.service';
import type { AuthMeResponse, UIFlags, CuentaContext, EventosContext, UsuarioContext } from '@/src/features/auth/types';

// ─────────────────────────────────────────────────────────────
// Tipos del Context
// ─────────────────────────────────────────────────────────────

interface AuthContextValue {
    /** Datos completos del usuario. null mientras carga o si no hay sesión. */
    authMe: AuthMeResponse | null;
    /** true durante la carga inicial */
    loading: boolean;
    /** Error si falló la carga */
    error: string | null;
    /** Shortcut a authMe.ui (null si no hay sesión) */
    ui: UIFlags | null;
    /** Shortcut a authMe.cuenta (null si no hay cuenta B2B) */
    cuenta: CuentaContext | null;
    /** Shortcut a authMe.eventos (null si no hay sesión) */
    eventos: EventosContext | null;
    /** Shortcut a authMe.usuario */
    usuario: UsuarioContext | null;
    /** true si el usuario es superadmin (legacy) */
    isSuperAdmin: boolean;
    /** Refetch manual, útil después de cambios de plan o cuenta */
    refresh: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authMe, setAuthMe] = useState<AuthMeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAuthMe = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAuthMe();
            setAuthMe(data);
        } catch (err) {
            setError('No se pudo obtener el perfil del usuario');
            setAuthMe(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuthMe();
    }, [fetchAuthMe]);

    const ui = authMe?.ui ?? null;
    const cuenta = authMe?.cuenta ?? null;
    const eventos = authMe?.eventos ?? null;
    const usuario = authMe?.usuario ?? null;
    const isSuperAdmin = authMe?.rol === 'superadmin';

    return (
        <AuthContext.Provider
            value={{
                authMe,
                loading,
                error,
                ui,
                cuenta,
                eventos,
                usuario,
                isSuperAdmin,
                refresh: fetchAuthMe,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Hook para consumir el contexto de autenticación.
 * Debe usarse dentro de un componente envuelto por <AuthProvider>.
 *
 * @example
 * const { ui, cuenta, isSuperAdmin } = useAuth();
 * if (ui?.mostrar_menu_cuenta) { ... }
 */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    }
    return ctx;
}
