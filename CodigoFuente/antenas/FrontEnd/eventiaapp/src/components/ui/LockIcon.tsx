'use client';

import { usePlanLimit } from '@/src/context/PlanLimitContext';

interface LockIconProps {
    /** Mensaje a mostrar en el UpsellModal al hacer click */
    message?: string;
    /** Tamaño del ícono en px. Default: 16 */
    size?: number;
}

/**
 * Ícono de candado que, al hacer click, abre el UpsellModal con el mensaje de plan.
 * Usar junto a inputs o botones deshabilitados por restricciones de plan.
 *
 * @example
 * <div style={{ position: 'relative' }}>
 *   <input disabled={!limites.permitirEstructuraManual} ... />
 *   {!limites.permitirEstructuraManual && (
 *     <LockIcon message="Tu plan no permite editar la estructura del evento." />
 *   )}
 * </div>
 */
export function LockIcon({
    message = 'Esta funcionalidad no está disponible en tu plan actual. Mejorá tu plan para acceder.',
    size = 16,
}: LockIconProps) {
    const { openUpsell } = usePlanLimit();

    return (
        <button
            type="button"
            aria-label="Funcionalidad restringida por plan. Click para ver opciones."
            title="Requiere mejora de plan"
            onClick={() => openUpsell(message)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.125rem',
                borderRadius: '0.25rem',
                color: '#f59e0b',
                fontSize: size,
                lineHeight: 1,
                transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.75';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
        >
            🔒
        </button>
    );
}
