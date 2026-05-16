'use client';

/**
 * apiClient — wrapper de fetch con manejo centralizado de errores de límites de plan.
 *
 * Uso:
 *   import { apiClient } from '@/src/lib/apiClient';
 *   const data = await apiClient('/api/events/mine');
 *
 * Cuando el backend responde 400 o 403 con { "error": "..." } o { "message": "..." },
 * lanza un PlanLimitError que los componentes pueden capturar para mostrar el modal de upsell.
 */

// ─────────────────────────────────────────────
// Error tipado de límite de plan
// ─────────────────────────────────────────────

export class PlanLimitError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = 'PlanLimitError';
    }
}

/** Extrae el mensaje de error del body de una respuesta fallida */
async function extractErrorMessage(res: Response): Promise<string> {
    try {
        const body = await res.json();
        return body?.error || body?.message || body?.details?.error || `Error ${res.status}`;
    } catch {
        return `Error ${res.status}`;
    }
}

/**
 * Lista de códigos de error HTTP que consideramos "límites de plan".
 * 400 = límite excedido (acción inválida por plan).
 * 403 = acción no permitida por plan.
 */
const PLAN_LIMIT_STATUS = [400, 403];

// ─────────────────────────────────────────────
// apiClient
// ─────────────────────────────────────────────

type RequestOptions = RequestInit & {
    /**
     * Si es true, un 400/403 lanzará un PlanLimitError (default: true).
     * Pasar false cuando el endpoint usa 400/403 para otras validaciones
     * y querés manejarlo manualmente.
     */
    interceptPlanLimits?: boolean;
};

export async function apiClient<T = unknown>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const { interceptPlanLimits = true, ...fetchOptions } = options;

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
        const message = await extractErrorMessage(res);

        // Si es un error de límite de plan, lanzar error tipado
        if (interceptPlanLimits && PLAN_LIMIT_STATUS.includes(res.status)) {
            throw new PlanLimitError(message, res.status);
        }

        // Para otros errores, lanzar error genérico con el mensaje del backend
        throw new Error(message);
    }

    // Si la respuesta es 204 No Content u otros sin body, devolver null
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
        return null as unknown as T;
    }

    return res.json() as Promise<T>;
}
