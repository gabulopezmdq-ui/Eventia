import type {
    InscripcionPagoResumen,
    EstadoPagoDetalle,
    TipoAjusteParam,
    AgregarAjusteRequest,
    RegistrarPagoRequest,
    MutacionPagoResponse,
} from './types/pagos.types';

// Base interna de los proxies Next.js
const API = '/api/programas';

// ═══════════════════════════════════════════════════════════════════
// GET — Listado de inscripciones con estado de pago
// ═══════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las inscripciones de un programa con su resumen financiero.
 * Se usa para construir la grilla principal de la pantalla de Pagos.
 *
 * @param idEvento  ID numérico del evento/programa
 */
export async function getPagosInscripciones(
    idEvento: number
): Promise<InscripcionPagoResumen[]> {
    const res = await fetch(`${API}/${idEvento}/inscripciones/pagos`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Error al obtener los pagos del programa');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// GET — Detalle completo de estado de pago de una inscripción
// ═══════════════════════════════════════════════════════════════════

/**
 * Obtiene el detalle completo de una inscripción: períodos, servicios,
 * ajustes, pagos y resumen financiero actualizado.
 * Se llama al abrir el modal de detalle y al refetchear tras mutaciones.
 *
 * @param idInscripcion  ID de la inscripción
 * @param idIdioma       1=Castellano | 2=Inglés | 3=Catalán (default)
 */
export async function getEstadoPagoInscripcion(
    idInscripcion: number,
    idIdioma = 3
): Promise<EstadoPagoDetalle> {
    const res = await fetch(
        `${API}/inscripciones/${idInscripcion}/estado-pago?idIdioma=${idIdioma}`,
        { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('Error al obtener el estado de pago de la inscripción');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// GET — Catálogo de tipos de ajuste (paramétrica)
// ═══════════════════════════════════════════════════════════════════

/**
 * Obtiene el catálogo de motivos de ajuste para popular el combobox
 * del modal "Agregar Ajuste". Se carga al abrir el modal.
 *
 * @param idIdioma  1=Castellano | 2=Inglés | 3=Catalán (default)
 */
export async function getTiposAjuste(
    idIdioma = 3
): Promise<TipoAjusteParam[]> {
    const res = await fetch(`${API}/tipos-ajuste?idIdioma=${idIdioma}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Error al obtener los tipos de ajuste');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// POST — Agregar ajuste (descuento, bonificación o recargo)
// ═══════════════════════════════════════════════════════════════════

/**
 * Registra un ajuste manual sobre el importe de la inscripción.
 * Tras éxito, refetchear con getEstadoPagoInscripcion para actualizar la grilla de ajustes.
 *
 * @param idInscripcion  ID de la inscripción a ajustar
 * @param payload        Datos del ajuste (tipo, motivo, importe, descripción)
 */
export async function agregarAjuste(
    idInscripcion: number,
    payload: AgregarAjusteRequest
): Promise<MutacionPagoResponse> {
    const res = await fetch(`${API}/inscripciones/${idInscripcion}/ajustes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al guardar el ajuste');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// POST — Registrar pago (parcial o total)
// ═══════════════════════════════════════════════════════════════════

/**
 * Registra un pago recibido contra la inscripción.
 * Tras éxito, refetchear con getEstadoPagoInscripcion para actualizar la grilla de pagos.
 *
 * @param idInscripcion  ID de la inscripción
 * @param payload        Importe, medio de pago, referencia y observaciones
 */
export async function registrarPago(
    idInscripcion: number,
    payload: RegistrarPagoRequest
): Promise<MutacionPagoResponse> {
    const res = await fetch(`${API}/inscripciones/${idInscripcion}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al registrar el pago');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// PUT — Anular pago
// ═══════════════════════════════════════════════════════════════════

/**
 * Marca un pago como anulado. No elimina físicamente el registro.
 * Tras éxito, refetchear con getEstadoPagoInscripcion para actualizar la grilla.
 *
 * ⚠️ El body se envía como texto plano (Content-Type: text/plain),
 * NO como JSON. Pasar el motivo como string directamente.
 *
 * @param idPago   ID del pago a anular
 * @param motivo   Texto libre con el motivo de la anulación (obligatorio)
 */
export async function anularPago(
    idPago: number,
    motivo: string
): Promise<MutacionPagoResponse> {
    const res = await fetch(
        `/api/programas/inscripciones/pagos/${idPago}/anular`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(motivo),
        }
    );
    if (!res.ok) throw new Error('Error al anular el pago');
    return res.json();
}
