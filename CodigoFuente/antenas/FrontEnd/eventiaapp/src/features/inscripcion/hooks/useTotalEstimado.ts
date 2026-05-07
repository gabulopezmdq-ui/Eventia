import { useMemo } from 'react';
import type {
    Participante,
    ProgramaInscripcionData,
    TotalEstimado,
} from '../types/inscripcion.types';

/**
 * Calcula el total estimado de la inscripción en tiempo real.
 * Se recalcula automáticamente con useMemo cuando cambian
 * los participantes o los datos del programa.
 *
 * Lógica:
 *  - Semanas: precio_base por cada período seleccionado
 *  - Servicios POR_DIA: precio × cantidad de fechas seleccionadas
 *  - Servicios UNICO / POR_CANTIDAD: precio × cantidad
 *  - Descuento hermanos: 10% si hay 2+ participantes
 */
export function useTotalEstimado(
    participantes: Participante[],
    programaData: ProgramaInscripcionData | null
): TotalEstimado {
    return useMemo(() => {
        const moneda = programaData?.periodos[0]?.moneda ?? 'EUR';

        if (!programaData || participantes.length === 0) {
            return { subtotal: 0, descuento: 0, total: 0, moneda };
        }

        let subtotal = 0;

        for (const participante of participantes) {
            // ── Semanas ──────────────────────────────────────────
            for (const { id_programa_periodo } of participante.periodos) {
                const periodo = programaData.periodos.find(
                    (p) => p.id_programa_periodo === id_programa_periodo
                );
                if (periodo) subtotal += periodo.precio_base;
            }

            // ── Servicios ────────────────────────────────────────
            for (const svc of participante.servicios) {
                const servicio = programaData.servicios.find(
                    (s) => s.idProgramaServicio === svc.id_programa_servicio
                );
                if (!servicio) continue;

                if (servicio.tipoCalculo === 'POR_DIA') {
                    subtotal += servicio.precio * svc.fechas.length;
                } else if (
                    servicio.tipoCalculo === 'UNICO' ||
                    servicio.tipoCalculo === 'POR_CANTIDAD'
                ) {
                    subtotal += servicio.precio * (svc.cantidad ?? 1);
                }
            }
        }

        // ── Descuento por hermanos (10% si hay 2+ participantes) ─
        const descuento = participantes.length >= 2 ? subtotal * 0.1 : 0;
        const total = subtotal - descuento;

        return {
            subtotal: Math.round(subtotal * 100) / 100,
            descuento: Math.round(descuento * 100) / 100,
            total: Math.round(total * 100) / 100,
            moneda,
        };
    }, [participantes, programaData]);
}
