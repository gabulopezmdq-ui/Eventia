'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getAuthMe } from '@/src/features/auth/auth.service';
import type { AuthMeResponse, UIFlags, CuentaContext, EventosContext, UsuarioContext, EspacioContext } from '@/src/features/auth/types';

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
    /** Shortcut a authMe.ui (adaptado dinámicamente al espacio activo) */
    ui: UIFlags | null;
    /** Cuenta B2B activa actualmente (null si es espacio personal) */
    cuenta: CuentaContext | null;
    /** Shortcut a authMe.eventos (null si no hay sesión) */
    eventos: EventosContext | null;
    /** Shortcut a authMe.usuario */
    usuario: UsuarioContext | null;
    /** Lista de espacios disponibles para el usuario */
    espacios: EspacioContext[];
    /** ID del espacio activo seleccionado */
    selectedEspacioId: number | null | undefined;
    /** true si el usuario es superadmin (legacy) */
    isSuperAdmin: boolean;
    /** Refetch manual, útil después de cambios de plan o cuenta */
    refresh: () => Promise<void>;
    /** Seleccionar un espacio de trabajo (null para espacio personal) */
    selectEspacio: (idCuenta: number | null) => void;
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
    
    // Estado del espacio seleccionado. 
    // undefined = aún no inicializado desde localStorage.
    // null = espacio personal.
    // number = ID de la cuenta B2B.
    const [selectedEspacioId, setSelectedEspacioId] = useState<number | null | undefined>(undefined);

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

    // Cargar selección inicial de localStorage una vez montado
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('eventia_selected_cuenta_id');
            if (saved === 'personal') {
                setSelectedEspacioId(null);
            } else if (saved !== null) {
                setSelectedEspacioId(Number(saved));
            } else {
                setSelectedEspacioId(undefined);
            }
        }
    }, []);

    const selectEspacio = useCallback((idCuenta: number | null) => {
        setSelectedEspacioId(idCuenta);
        if (typeof window !== 'undefined') {
            if (idCuenta === null) {
                localStorage.setItem('eventia_selected_cuenta_id', 'personal');
            } else {
                localStorage.setItem('eventia_selected_cuenta_id', String(idCuenta));
            }
        }
    }, []);

    useEffect(() => {
        fetchAuthMe();
    }, [fetchAuthMe]);

    // Lógica para auto-seleccionar si solo tiene 1 espacio disponible
    useEffect(() => {
        if (loading || !authMe) return;
        
        const currentEspacios = authMe.espacios ?? [];
        if (currentEspacios.length === 1) {
            const single = currentEspacios[0];
            selectEspacio(single.id_cuenta);
        } else if (currentEspacios.length > 1 && selectedEspacioId === undefined) {
            // Verificar si el valor cargado de localStorage es válido para la lista actual de espacios
            const saved = localStorage.getItem('eventia_selected_cuenta_id');
            if (saved === 'personal') {
                setSelectedEspacioId(null);
            } else if (saved !== null) {
                const id = Number(saved);
                const exists = currentEspacios.some(e => e.id_cuenta === id);
                if (exists) {
                    setSelectedEspacioId(id);
                } else {
                    setSelectedEspacioId(undefined);
                }
            }
        }
    }, [authMe, loading, selectedEspacioId, selectEspacio]);

    const eventos = authMe?.eventos ?? null;
    const usuario = authMe?.usuario ?? null;
    const isSuperAdmin = authMe?.rol === 'superadmin';
    const espacios = authMe?.espacios ?? [];

    // ─────────────────────────────────────────────────────────────
    // Resolución dinámica de 'cuenta' y flags de 'ui'
    // ─────────────────────────────────────────────────────────────
    let cuenta: CuentaContext | null = null;
    let ui: UIFlags | null = authMe?.ui ?? null;

    if (authMe) {
        if (selectedEspacioId === null) {
            // Espacio Personal (B2C)
            cuenta = null;
            if (ui) {
                ui = {
                    ...ui,
                    mostrar_menu_cuenta: false,
                    puede_crear_evento_b2c: true,
                    mostrar_solicitar_cuenta: espacios.some(e => e.tipo === 'CUENTA') ? false : ui.mostrar_solicitar_cuenta,
                    mostrar_estado_cuenta_pendiente: false,
                };
            }
        } else if (typeof selectedEspacioId === 'number') {
            // Espacio de Cuenta B2B
            const space = espacios.find(e => e.id_cuenta === selectedEspacioId);
            if (space) {
                cuenta = {
                    estado_ui: 'CUENTA_ACTIVA',
                    id_cuenta: space.id_cuenta,
                    nombre_cuenta: space.nombre_cuenta,
                    tipo: authMe.cuenta?.tipo ?? 'EMPRESA',
                    estado: space.estado,
                    id_plan: authMe.cuenta?.id_plan ?? null,
                    plan_codigo: authMe.cuenta?.plan_codigo ?? null,
                    rol_cuenta: space.rol_cuenta,
                    vinculo_activo: space.vinculo_activo,
                };
                if (ui) {
                    ui = {
                        ...ui,
                        mostrar_menu_cuenta: true,
                        puede_crear_evento_b2c: false,
                        mostrar_solicitar_cuenta: false,
                        mostrar_estado_cuenta_pendiente: false,
                    };
                }
            } else {
                cuenta = authMe.cuenta;
            }
        } else {
            // Si está indefinido (ej. carga inicial), usar los valores por defecto del perfil
            cuenta = authMe.cuenta;
        }
    }

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
                espacios,
                selectedEspacioId,
                isSuperAdmin,
                refresh: fetchAuthMe,
                selectEspacio,
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
