'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { StaffAuthUser, StaffJwtClaims } from '@/src/features/staff/types';
import { getUnidadesStaff, refreshStaffToken } from '@/src/features/staff/staff.service';

interface StaffAuthCtx {
    user: StaffAuthUser | null;
    token: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const Ctx = createContext<StaffAuthCtx | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<StaffAuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const hydrate = useCallback(async (jwt: string) => {
        try {
            const claims = parseJwt(jwt);
            setToken(jwt);
            
            // Setear estado parcial para que la UI sepa que hay sesión (aunque falten unidades)
            setUser({ 
                idStaff: claims.id_staff, 
                idCuenta: claims.id_cuenta, 
                role: claims.role, 
                unidades: [] 
            });

            // Llamada al backend para obtener las unidades del staff
            const unidades = await getUnidadesStaff(claims.id_cuenta, jwt);
            
            // Completar el estado con las unidades
            setUser({ 
                idStaff: claims.id_staff, 
                idCuenta: claims.id_cuenta, 
                role: claims.role, 
                unidades 
            });
            
            sessionStorage.setItem('staffToken', jwt);
        } catch (error) {
            console.error('Error al hidratar sesión de staff:', error);
            logout(); // Si falla (ej. token inválido), limpiamos todo
        }
    }, []);

    // Hidratar desde sessionStorage al montar
    useEffect(() => {
        const saved = sessionStorage.getItem('staffToken');
        if (saved) {
            hydrate(saved).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [hydrate]);

    // Renovación automática 1h antes de expirar
    useEffect(() => {
        if (!token) return;
        
        try {
            const claims = parseJwt(token);
            // exp está en segundos, Date.now() en ms
            // timer disparará 1h (3600_000 ms) antes de la expiración
            const msLeft = (claims.exp * 1000) - Date.now() - 3600_000;
            
            if (msLeft <= 0) return; // Ya expiró o falta menos de 1h (podríamos refrescar directo acá)
            
            const timer = setTimeout(async () => {
                try {
                    const newToken = await refreshStaffToken(token);
                    await hydrate(newToken);
                } catch (e) {
                    console.error('Error al renovar token de staff', e);
                }
            }, msLeft);
            
            return () => clearTimeout(timer);
        } catch (e) {
            console.error('Token inválido en useEffect', e);
        }
    }, [token, hydrate]);

    async function login(jwt: string) {
        setIsLoading(true);
        await hydrate(jwt);
        setIsLoading(false);
    }

    function logout() {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('staffToken');
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

function parseJwt(token: string): StaffJwtClaims {
    // Basic JWT decode (does not verify signature, that's done in backend)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}
