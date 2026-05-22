'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { StaffAuthUser, StaffJoinResponse } from '@/src/features/staff/types';
import { refreshStaffToken } from '@/src/features/staff/staff.service';

interface StaffAuthCtx {
    user: StaffAuthUser | null;
    token: string | null;
    /** Inicializa la sesión con el objeto completo retornado por POST /staff/join */
    login: (joinResponse: StaffJoinResponse) => void;
    logout: () => void;
    isLoading: boolean;
    activeRol: { id_rol: number; rol_codigo: string; rol_texto: string; pantalla_inicio: string; } | null;
    selectRol: (rol: { id_rol: number; rol_codigo: string; rol_texto: string; pantalla_inicio: string; }) => void;
}

const STORAGE_KEY = 'staff_session';

const Ctx = createContext<StaffAuthCtx | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<StaffAuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRol, setActiveRol] = useState<{ id_rol: number; rol_codigo: string; rol_texto: string; pantalla_inicio: string; } | null>(null);

    /**
     * Construye el StaffAuthUser a partir del objeto completo de /staff/join.
     * Las unidades ya vienen incluidas — no se necesita un segundo fetch.
     */
    const buildUser = (resp: StaffJoinResponse): StaffAuthUser => {
        // Extraer el primer evento disponible si viene en eventos_disponibles
        const firstEvento = resp.eventos_disponibles?.[0];
        const rawRoles = firstEvento?.roles_evento || resp.roles_evento || [];

        // Mapear roles a formato homogéneo en frontend
        const rolesEvento = rawRoles.map(r => ({
            id_rol: r.id_rol,
            // Soportar codigo_rol del backend o rol_codigo
            rol_codigo: (r as any).codigo_rol || (r as any).rol_codigo || '',
            rol_texto: r.rol_texto || '',
            pantalla_inicio: '/staff/home'
        }));

        const primaryRolCodigo = rolesEvento[0]?.rol_codigo || resp.rol_codigo || '';

        return {
            idStaff: resp.id_staff,
            idCuenta: resp.id_cuenta,
            idEvento: firstEvento?.id_evento || resp.id_evento || 0,
            nombre: resp.nombre,
            apellido: resp.apellido,
            rolCodigo: primaryRolCodigo,
            unidades: resp.unidades || [],
            token: resp.access_token,
            expiresAt: resp.expires_at_utc,
            rolesEvento: rolesEvento,
            pantallaInicioDefault: firstEvento?.pantalla_inicio_default || resp.pantalla_inicio_default || '/staff/home',
        };
    };

    /**
     * Restaura la sesión guardada en localStorage al montar el contexto.
     * Verifica que el token no haya expirado antes de restaurar.
     */
    const hydrateFromStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const session: StaffAuthUser = JSON.parse(raw);

            // Verificar que la sesión no haya expirado
            if (session.expiresAt && new Date(session.expiresAt) <= new Date()) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }

            setUser(session);
            setToken(session.token);
            if (session.activeRol) {
                setActiveRol(session.activeRol);
            } else if (session.rolesEvento && session.rolesEvento.length === 1) {
                setActiveRol(session.rolesEvento[0]);
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // Hidratar desde localStorage al montar
    useEffect(() => {
        hydrateFromStorage();
        setIsLoading(false);
    }, [hydrateFromStorage]);

    // Renovación automática 1h antes de expirar
    useEffect(() => {
        if (!token || !user?.expiresAt) return;

        const expiresMs = new Date(user.expiresAt).getTime();
        const msLeft = expiresMs - Date.now() - 3_600_000; // 1h antes

        if (msLeft <= 0) return;

        const timer = setTimeout(async () => {
            try {
                const newToken = await refreshStaffToken(token);
                // Actualizar token en el user persistido
                const updatedUser: StaffAuthUser = { ...user!, token: newToken };
                setToken(newToken);
                setUser(updatedUser);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
            } catch (e) {
                console.error('Error al renovar token de staff', e);
                logout();
            }
        }, msLeft);

        return () => clearTimeout(timer);
    }, [token, user?.expiresAt]);

    /**
     * Inicializa la sesión a partir del objeto completo de POST /staff/join.
     * Guarda en localStorage para persistir entre recargas.
     */
    function login(joinResponse: StaffJoinResponse) {
        const staffUser = buildUser(joinResponse);
        
        // Si tiene un solo rol, lo pre-seleccionamos como activo
        if (staffUser.rolesEvento && staffUser.rolesEvento.length === 1) {
            staffUser.activeRol = staffUser.rolesEvento[0];
            setActiveRol(staffUser.rolesEvento[0]);
        } else if (staffUser.rolesEvento && staffUser.rolesEvento.length > 1) {
            // Múltiples roles: activeRol se seleccionará en pantalla intermedia
        } else {
            // Fallback por compatibilidad
            const singleRol = {
                id_rol: 0,
                rol_codigo: staffUser.rolCodigo,
                rol_texto: staffUser.rolCodigo ? staffUser.rolCodigo.replace('STAFF_', '') : '',
                pantalla_inicio: '/staff/home'
            };
            staffUser.activeRol = singleRol;
            setActiveRol(singleRol);
        }

        setUser(staffUser);
        setToken(joinResponse.access_token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staffUser));
    }

    const selectRol = useCallback((rol: { id_rol: number; rol_codigo: string; rol_texto: string; pantalla_inicio: string; }) => {
        setActiveRol(rol);
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, activeRol: rol };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    function logout() {
        setUser(null);
        setToken(null);
        setActiveRol(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    return (
        <Ctx.Provider value={{ user, token, login, logout, isLoading, activeRol, selectRol }}>
            {children}
        </Ctx.Provider>
    );
}

export function useStaffAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useStaffAuth must be inside StaffAuthProvider');
    return ctx;
}
