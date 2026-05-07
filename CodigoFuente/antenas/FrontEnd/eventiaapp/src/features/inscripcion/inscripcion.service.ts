import type {
    ProgramaInscripcionData,
    InscripcionPayload,
    ConfirmacionResponse,
} from './types/inscripcion.types';

const API = '/api/inscripcion';

// ═══════════════════════════════════════════════════════════════════
// GET — Datos del programa por token
// ═══════════════════════════════════════════════════════════════════

/**
 * Obtiene los datos del casal/colonia para mostrar en la pantalla
 * de presentación y pre-cargar períodos, servicios, etc.
 *
 * @param token  Token único del programa (viene en la URL)
 * @param idIdioma  1=Castellano, 2=Inglés, 3=Catalán (default)
 */
export async function getProgramaInscripcion(
    token: string,
    idIdioma = 3
): Promise<ProgramaInscripcionData> {
    const res = await fetch(`${API}/${token}?idIdioma=${idIdioma}`);
    if (!res.ok) throw new Error('Programa no encontrado o token inválido');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// POST — Confirmar inscripción
// ═══════════════════════════════════════════════════════════════════

/**
 * Envía el payload completo al backend para confirmar la inscripción.
 * Se llama UNA SOLA VEZ al final del flujo (Fase D).
 *
 * @returns ConfirmacionResponse con mensaje y QRs de retiro por autorizado
 */
export async function confirmarInscripcion(
    payload: InscripcionPayload
): Promise<ConfirmacionResponse> {
    const res = await fetch('/api/inscripcion-confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al confirmar la inscripción. Intentá nuevamente.');
    return res.json();
}
