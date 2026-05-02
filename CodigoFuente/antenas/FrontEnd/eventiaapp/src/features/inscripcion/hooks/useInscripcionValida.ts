import { useMemo } from 'react';
import type { InscripcionState, ValidationResult } from '../types/inscripcion.types';

/**
 * Valida el estado completo de la inscripción.
 * El botón "Confirmar inscripción" solo se activa cuando valida === true.
 *
 * Reglas:
 *  - Responsable: nombre, apellido, email, telefono y relacion obligatorios
 *  - Al menos 1 participante
 *  - Cada participante: al menos 1 semana seleccionada
 *  - Firma: nombre_completo no vacío
 */
export function useInscripcionValida(state: InscripcionState): ValidationResult {
    return useMemo(() => {
        const errores: string[] = [];

        // ── Responsable ──────────────────────────────────────────
        const { responsable } = state;
        if (!responsable.nombre?.trim()) errores.push('Falta el nombre del responsable');
        if (!responsable.apellido?.trim()) errores.push('Falta el apellido del responsable');
        if (!responsable.email?.trim()) errores.push('Falta el email del responsable');
        if (!responsable.telefono?.trim()) errores.push('Falta el teléfono del responsable');
        if (!responsable.relacion) errores.push('Falta la relación del responsable');

        // ── Participantes ────────────────────────────────────────
        if (state.participantes.length === 0) {
            errores.push('Agregá al menos un participante');
        } else {
            state.participantes.forEach((p, i) => {
                const label = p.nombre ? `${p.nombre} ${p.apellido}` : `Participante ${i + 1}`;
                if (p.periodos.length === 0) {
                    errores.push(`${label}: seleccioná al menos una semana`);
                }
            });
        }

        return { valida: errores.length === 0, errores };
    }, [state]);
}

/**
 * Indica si un participante específico tiene al menos 1 semana seleccionada.
 * Útil para el badge de estado dentro de ParticipanteCard.
 */
export function useParticipanteValido(
    clientId: string,
    state: InscripcionState
): boolean {
    return useMemo(() => {
        const p = state.participantes.find((p) => p._clientId === clientId);
        if (!p) return false;
        return p.periodos.length > 0;
    }, [clientId, state.participantes]);
}
