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
}

const STORAGE_KEY = 'staff_session';

const Ctx = createContext<StaffAuthCtx | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<StaffAuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Construye el StaffAuthUser a partir del objeto completo de /staff/join.
     * Las unidades ya vienen incluidas — no se necesita un segundo fetch.
     */
    const buildUser = (resp: StaffJoinResponse): StaffAuthUser => ({
        idStaff: resp.id_staff,
        idCuenta: resp.id_cuenta,
        idEvento: resp.id_evento,
        nombre: resp.nombre,
        apellido: resp.apellido,
        rolCodigo: resp.rol_codigo,
        unidades: resp.unidades,
        token: resp.access_token,
        expiresAt: resp.expires_at_utc,
    });

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
        setUser(staffUser);
        setToken(joinResponse.access_token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staffUser));
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    return (
        <Ctx.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </Ctx.Provider>
    );
}

export function useStaffAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useStaffAuth must be inside StaffAuthProvider');
    return ctx;
}
