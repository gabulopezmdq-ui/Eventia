'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { StaffAuthUser, StaffJoinResponse } from '@/src/features/staff/types';
import { refreshStaffToken } from '@/src/features/staff/staff.service';

/**
 * Determina si un evento está activo hoy.
 * - PROGRAMA: Hoy está dentro de [fecha_inicio_operativa, fecha_fin_operativa] (día completo)
 * - EVENTO: Hoy es la fecha de inicio del evento o el día posterior (para eventos nocturnos)
 */
export function isEventActiveToday(evento: {
    tipo_operacion: string;
    fecha_inicio_operativa?: string | null;
    fecha_fin_operativa?: string | null;
    fecha_inicio?: string | null;
}) {
    const today = new Date();
    // Inicio del día local
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    // Fin del día local
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    if (evento.tipo_operacion?.toUpperCase() === 'PROGRAMA') {
        if (!evento.fecha_inicio_operativa || !evento.fecha_fin_operativa) return false;
        
        const start = new Date(evento.fecha_inicio_operativa);
        const end = new Date(evento.fecha_fin_operativa);
        
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
        
        return startOfToday <= endDay && endOfToday >= startDay;
    } else if (evento.tipo_operacion?.toUpperCase() === 'EVENTO') {
        const dateStr = evento.fecha_inicio || evento.fecha_inicio_operativa;
        if (!dateStr) {
            // Fallback: si no tiene fecha, lo consideramos activo para no romper/ocultar nada incorrectamente
            return true;
        }
        
        const eventStart = new Date(dateStr);
        const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate(), 0, 0, 0, 0);
        
        const eventNextDay = new Date(eventStartDay);
        eventNextDay.setDate(eventStartDay.getDate() + 1);
        
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        
        return todayDay.getTime() === eventStartDay.getTime() || todayDay.getTime() === eventNextDay.getTime();
    }
    
    return false;
}

interface StaffAuthCtx {
    user: StaffAuthUser | null;
    token: string | null;
    /** Inicializa la sesión con el objeto completo retornado por POST /staff/join */
    login: (joinResponse: StaffJoinResponse) => void;
    logout: () => void;
    isLoading: boolean;
    activeRol: { id_rol: number; rol_codigo: string; rol_texto: string; pantalla_inicio: string; } | null;
    selectRol: (rol: { id_rol: number; rol_codigo: string; rol_texto: string; pantalla_inicio: string; }) => void;
    selectEvento: (idEvento: number) => void;
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
        const allEvents = resp.eventos_disponibles || [];
        const activeEventsToday = allEvents.filter(e => isEventActiveToday(e));
        
        // Extraer el primer evento disponible si viene en eventos_disponibles
        const firstEvento = activeEventsToday[0] || allEvents[0];
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
            idEvento: activeEventsToday.length === 1 ? firstEvento.id_evento : (resp.id_evento || 0),
            nombre: resp.nombre,
            apellido: resp.apellido,
            rolCodigo: primaryRolCodigo,
            unidades: resp.unidades || [],
            token: resp.access_token,
            expiresAt: resp.expires_at_utc,
            eventosDisponibles: allEvents,
            rolesEvento: activeEventsToday.length === 1 ? rolesEvento : [],
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
        
        const allEvents = joinResponse.eventos_disponibles || [];
        const activeEventsToday = allEvents.filter(e => isEventActiveToday(e));

        if (activeEventsToday.length === 1) {
            const singleEvent = activeEventsToday[0];
            const roles = singleEvent.roles_evento.map(r => ({
                id_rol: r.id_rol,
                rol_codigo: r.codigo_rol || (r as any).rol_codigo || '',
                rol_texto: r.rol_texto || '',
                pantalla_inicio: '/staff/home'
            }));
            
            staffUser.idEvento = singleEvent.id_evento;
            staffUser.rolesEvento = roles;
            staffUser.pantallaInicioDefault = singleEvent.pantalla_inicio_default || '/staff/home';

            // Si tiene un solo rol, lo pre-seleccionamos como activo
            if (roles.length === 1) {
                staffUser.activeRol = roles[0];
                setActiveRol(roles[0]);
            } else {
                staffUser.activeRol = undefined;
                setActiveRol(null);
            }
        } else {
            // Múltiples o 0 eventos hoy: se seleccionará interactivamente en la pantalla intermedia
            staffUser.idEvento = 0;
            staffUser.rolesEvento = [];
            staffUser.activeRol = undefined;
            setActiveRol(null);
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

    const selectEvento = useCallback((idEvento: number) => {
        setUser(prev => {
            if (!prev) return null;
            
            const allEvents = prev.eventosDisponibles || [];
            const foundEvent = allEvents.find(e => e.id_evento === idEvento);
            
            if (!foundEvent) return prev;
            
            const roles = foundEvent.roles_evento.map(r => ({
                id_rol: r.id_rol,
                rol_codigo: r.codigo_rol || (r as any).rol_codigo || '',
                rol_texto: r.rol_texto || '',
                pantalla_inicio: '/staff/home'
            }));

            // Si tiene un solo rol en este evento, lo ponemos como pre-seleccionado
            let matchedActiveRol = null;
            if (roles.length === 1) {
                matchedActiveRol = roles[0];
                setActiveRol(roles[0]);
            } else {
                setActiveRol(null);
            }
            
            const updated = {
                ...prev,
                idEvento: idEvento,
                rolesEvento: roles,
                pantallaInicioDefault: foundEvent.pantalla_inicio_default || '/staff/home',
                activeRol: matchedActiveRol || undefined
            };
            
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
        <Ctx.Provider value={{ user, token, login, logout, isLoading, activeRol, selectRol, selectEvento }}>
            {children}
        </Ctx.Provider>
    );
}

export function useStaffAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useStaffAuth must be inside StaffAuthProvider');
    return ctx;
}
