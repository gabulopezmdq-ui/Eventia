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
    
    const data = await res.json();
    
    // El backend no devuelve el token en el JSON, lo inyectamos acá para no perderlo
    data.token = token;

    // Parche: Si el backend no envía el catálogo, lo buscamos en el endpoint de paramétricas
    if (data.id_evento && !data.restricciones_alimentarias_config) {
        try {
            const catRes = await fetch(`/api/parametrica/restricciones-alimentarias?idEvento=${data.id_evento}`);
            if (catRes.ok) {
                const catData = await catRes.json();
                data.restricciones_alimentarias_config = catData.map((c: any) => ({
                    id: c.idRestriccion,
                    nombre: c.nombre
                }));
            } else {
                data.restricciones_alimentarias_config = [];
            }
        } catch (e) {
            console.warn('Error fetching restricciones catalog:', e);
            data.restricciones_alimentarias_config = [];
        }
    }

    return data;
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
