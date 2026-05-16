'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { UpsellModal } from '@/src/components/ui/UpsellModal';
import { useToast } from './ToastContext';
import { PlanLimitError } from '@/src/lib/apiClient';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface PlanLimitContextValue {
    /**
     * Evalúa si el error es un PlanLimitError y lo maneja automáticamente
     * mostrando el Toast de advertencia + el UpsellModal.
     * Si NO es un PlanLimitError, lo re-lanza para que el componente lo maneje.
     *
     * @example
     * try {
     *   await apiClient('/api/evento_links/Create', { method: 'POST', body: ... });
     * } catch (err) {
     *   handlePlanLimitError(err);
     * }
     */
    handlePlanLimitError: (err: unknown) => void;

    /**
     * Abre el modal de upsell directamente con un mensaje custom.
     * Útil para bloqueos preventivos (ej. botón deshabilitado por flag).
     */
    openUpsell: (message: string) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const PlanLimitContext = createContext<PlanLimitContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function PlanLimitProvider({ children }: { children: ReactNode }) {
    const { toastPlanLimit } = useToast();
    const [upsellOpen, setUpsellOpen] = useState(false);
    const [upsellMessage, setUpsellMessage] = useState('');

    const openUpsell = useCallback((message: string) => {
        setUpsellMessage(message);
        setUpsellOpen(true);
        // También mostrar Toast breve para que el usuario lo vea aunque el modal tarde en abrir
        toastPlanLimit(message);
    }, [toastPlanLimit]);

    const handlePlanLimitError = useCallback(
        (err: unknown) => {
            if (err instanceof PlanLimitError) {
                openUpsell(err.message);
                return;
            }
            // No es un error de límite, re-lanzar para manejo local
            throw err;
        },
        [openUpsell]
    );

    return (
        <PlanLimitContext.Provider value={{ handlePlanLimitError, openUpsell }}>
            {children}
            <UpsellModal
                open={upsellOpen}
                message={upsellMessage}
                onClose={() => setUpsellOpen(false)}
            />
        </PlanLimitContext.Provider>
    );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

/**
 * Hook para manejar errores de límites de plan.
 *
 * @example
 * const { handlePlanLimitError, openUpsell } = usePlanLimit();
 *
 * // En un catch:
 * try { await crearLink(payload); }
 * catch (err) { handlePlanLimitError(err); }
 *
 * // Bloqueo preventivo (botón con candado):
 * onClick={() => openUpsell('Tu plan no permite generar más links.')}
 */
export function usePlanLimit(): PlanLimitContextValue {
    const ctx = useContext(PlanLimitContext);
    if (!ctx) {
        throw new Error('usePlanLimit debe usarse dentro de <PlanLimitProvider>');
    }
    return ctx;
}
