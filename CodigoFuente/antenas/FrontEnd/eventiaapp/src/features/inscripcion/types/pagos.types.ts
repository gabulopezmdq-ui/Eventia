// ═══════════════════════════════════════════════════════════════════
// TIPOS — Pagos de Inscripciones (Colonias / Casales)
// ═══════════════════════════════════════════════════════════════════

// ── Enumeraciones ─────────────────────────────────────────────────

/** Estado de pago calculado por el backend. Nunca se persiste. */
export type EstadoPago = 'SIN_CARGO' | 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

/** Tipo de ajuste manual sobre el importe de la inscripción */
export type TipoAjuste = 'DESCUENTO' | 'BONIFICACION' | 'RECARGO';

/** Medio de pago aceptado */
export type MedioPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'BIZUM' | 'OTRO';

/**
 * Define cómo se calcula la cantidad de un servicio.
 * POR_DIA      → cantidadCalculada representa días (mostrar "N días")
 * POR_INSCRIPCION → cantidadCalculada es siempre 1 (mostrar solo "1")
 */
export type TipoCalculo = 'POR_DIA' | 'POR_INSCRIPCION';

// ── Listado principal ─────────────────────────────────────────────

/**
 * Fila de la grilla principal de pagos.
 * Endpoint: GET /programas/{idEvento}/inscripciones/pagos
 */
export interface InscripcionPagoResumen {
    idInscripcion: number;
    idRsvpGrupo: number;
    responsable: string;
    email: string;
    telefono: string;
    participantes: string[];
    totalOriginal: number;
    /** Suma neta de ajustes tipo DESCUENTO + BONIFICACION (valor absoluto) */
    totalDescuentos: number;
    /** Suma neta de ajustes tipo RECARGO */
    totalRecargos: number;
    totalAPagar: number;
    totalPagado: number;
    saldo: number;
    moneda: string;
    estadoPago: EstadoPago;
}

// ── Detalle de estado de pago ─────────────────────────────────────

/**
 * Período (semana) inscripto por un participante.
 * Se agrupa visualmente por `participante` en la vista de detalle.
 */
export interface PeriodoDetalle {
    participante: string;
    nombre: string;        // Ej: "Setmana 1 - del 22/06 al 26/06"
    fechaDesde: string;    // ISO date "YYYY-MM-DD"
    fechaHasta: string;    // ISO date "YYYY-MM-DD"
    precioBase: number;
    moneda: string;
}

/**
 * Servicio adicional inscripto por un participante.
 * Se agrupa visualmente por `participante` en la vista de detalle.
 * La presentación de `cantidadCalculada` varía según `tipoCalculo`.
 */
export interface ServicioDetalle {
    participante: string;
    codigo: string;
    nombre: string;
    tipoCalculo: TipoCalculo;
    precio: number;
    subtotal: number;
    moneda: string;
    /** Días si tipoCalculo=POR_DIA; 1 si tipoCalculo=POR_INSCRIPCION */
    cantidadCalculada: number;
}

/**
 * Ajuste manual (descuento, bonificación o recargo) aplicado a la inscripción.
 * Si `activo` es false, debe mostrarse tachado/opaco (anulación futura).
 */
export interface AjusteInscripcion {
    idInscripcionAjuste: number;
    tipo: TipoAjuste;
    idTipoAjuste: number;
    tipoAjusteCodigo: string;   // Ej: "SOCIO_CLUB", "PROMOCION", "ERROR_CARGA"
    tipoAjusteTexto: string;    // Texto traducido según idIdioma
    descripcion: string;
    importe: number;
    moneda: string;
    activo: boolean;
    fechaAlta: string;          // ISO datetime
}

/**
 * Pago registrado contra la inscripción.
 * Si `anulado` es true: mostrar tachado y deshabilitar botón "Anular".
 */
export interface PagoInscripcion {
    idInscripcionPago: number;
    fechaPago: string;          // ISO datetime
    importe: number;
    moneda: string;
    medioPago: MedioPago;
    referencia?: string;
    observaciones?: string;
    anulado: boolean;
}

/**
 * Respuesta completa del endpoint de detalle.
 * Endpoint: GET /programas/inscripciones/{idInscripcion}/estado-pago?idIdioma=X
 *
 * IMPORTANTE: si periodos/servicios/ajustes/pagos vienen como [] →
 * mostrar la sección vacía (no renderizar la tabla).
 */
export interface EstadoPagoDetalle extends InscripcionPagoResumen {
    periodos: PeriodoDetalle[];
    servicios: ServicioDetalle[];
    ajustes: AjusteInscripcion[];
    pagos: PagoInscripcion[];
}

// ── Agrupamiento por participante (helper de UI) ──────────────────

/**
 * Estructura auxiliar para agrupar períodos y servicios por participante
 * en la vista de detalle. Se construye en el componente a partir de
 * `EstadoPagoDetalle.periodos` y `EstadoPagoDetalle.servicios`.
 */
export interface DetalleParticipante {
    nombre: string;
    periodos: PeriodoDetalle[];
    servicios: ServicioDetalle[];
}

// ── Paramétricas ──────────────────────────────────────────────────

/**
 * Ítem del catálogo de tipos de ajuste.
 * Endpoint: GET /programas/tipos-ajuste?idIdioma=X
 */
export interface TipoAjusteParam {
    idTipoAjuste: number;
    codigo: string;
    texto: string;  // Traducido según idIdioma
}

// ── Payloads de requests ──────────────────────────────────────────

/**
 * Body del POST /programas/inscripciones/{idInscripcion}/ajustes
 */
export interface AgregarAjusteRequest {
    tipo: TipoAjuste;
    idTipoAjuste: number;
    importe: number;
    descripcion?: string;
}

/**
 * Body del POST /programas/inscripciones/{idInscripcion}/pagos
 */
export interface RegistrarPagoRequest {
    importe: number;
    medioPago: MedioPago;
    referencia?: string;
    observaciones?: string;
}

/**
 * Body del PUT /programas/inscripciones/pagos/{idPago}/anular
 *
 * ⚠️ ATENCIÓN: Se envía como texto plano (string), NO como JSON.
 * Usar Content-Type: text/plain en el fetch.
 * Ejemplo: "Pago cargado por error."
 */
export type AnularPagoPayload = string;

// ── Respuesta común a mutaciones ──────────────────────────────────

/**
 * Respuesta de POST /ajustes, POST /pagos y PUT /anular.
 * Contiene el resumen financiero actualizado pero NO las grillas de
 * ajustes ni pagos → hacer refetch a /estado-pago para actualizar esas grillas.
 */
export interface MutacionPagoResponse {
    ok: boolean;
    idInscripcion: number;
    totalOriginal: number;
    totalDescuentos: number;
    totalRecargos: number;
    totalAPagar: number;
    totalPagado: number;
    saldo: number;
    estadoPago: EstadoPago;
}
