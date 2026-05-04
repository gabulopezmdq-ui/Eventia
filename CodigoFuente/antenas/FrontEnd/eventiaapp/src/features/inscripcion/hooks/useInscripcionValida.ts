import { useMemo } from 'react';
import type { InscripcionState, Participante, ValidationResult } from '../types/inscripcion.types';

/**
 * Valida el estado completo de la inscripción.
 * El botón "Confirmar inscripción" solo se activa cuando valida === true.
 *
 * Reglas (V2):
 *  - Responsable: nombre, apellido, email, telefono y relacion obligatorios
 *  - Al menos 1 participante
 *  - Cada participante: al menos 1 semana seleccionada
 *  - Cada participante (salud): autoriza_emergencia_medica === true y al menos 1 contacto_emergencia
 *  - Cada participante (retiro): al menos 1 autorizado_retiro
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

                // Semanas
                if (p.periodos.length === 0) {
                    errores.push(`${label}: seleccioná al menos una semana`);
                }

                // Salud — autorización emergencia médica
                if (!p.salud?.autoriza_emergencia_medica) {
                    errores.push(`${label}: debe autorizar la atención de emergencias médicas (tab Salud)`);
                }

                // Salud — al menos 1 contacto de emergencia
                if (!p.salud?.contactos_emergencia || p.salud.contactos_emergencia.length === 0) {
                    errores.push(`${label}: agregá al menos un contacto de emergencia (tab Salud)`);
                }

                // Retiro — al menos 1 autorizado
                if (p.autorizados_retiro.length === 0) {
                    errores.push(`${label}: agregá al menos un autorizado de retiro (tab Retiro)`);
                }
            });
        }

        // ── Firma ────────────────────────────────────────────────
        if (!state.firma?.nombre_completo?.trim()) {
            errores.push('Falta la firma del responsable');
        }

        return { valida: errores.length === 0, errores };
    }, [state]);
}

/**
 * Indica si un participante específico tiene al menos 1 semana seleccionada.
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

/** Estado visual de un tab: ok = completo, warn = pendiente requerido, empty = opcional vacío */
export type TabBadgeStatus = 'ok' | 'warn' | 'empty';

export interface ParticipanteBadges {
    semanas: TabBadgeStatus;
    servicios: TabBadgeStatus;
    alimentacion: TabBadgeStatus;
    salud: TabBadgeStatus;
    retiro: TabBadgeStatus;
}

/**
 * Calcula el estado visual de cada tab para un participante dado.
 * - 'ok'    → campo requerido completo, o sección opcional con datos cargados
 * - 'warn'  → campo requerido faltante (bloquea confirmación)
 * - 'empty' → sección opcional sin datos (no bloquea)
 */
export function getParticipanteBadges(p: Participante): ParticipanteBadges {
    const saludCompleta =
        p.salud?.autoriza_emergencia_medica === true &&
        (p.salud?.contactos_emergencia?.length ?? 0) > 0;

    return {
        semanas:      p.periodos.length > 0 ? 'ok' : 'warn',
        servicios:    p.servicios.length > 0 ? 'ok' : 'empty',
        alimentacion: p.restricciones_alimentarias.length > 0 ? 'ok' : 'empty',
        salud:        saludCompleta ? 'ok' : 'warn',
        retiro:       p.autorizados_retiro.length > 0 ? 'ok' : 'warn',
    };
}
