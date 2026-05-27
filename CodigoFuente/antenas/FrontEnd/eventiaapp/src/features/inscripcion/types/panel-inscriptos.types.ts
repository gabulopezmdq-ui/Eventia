// ─── Resumen del panel ────────────────────────────────────────────
export interface ResumenInscriptos {
  id_evento: number;
  programa: string;
  modulo: string;
  total_familias: number;
  total_participantes: number;
  total_deuda: number;
  moneda: string;
  pendientes: number;
  parciales: number;
  pagados: number;
  sin_cargo: number;
  con_alertas: number;
}

// ─── Fila de la grilla principal ─────────────────────────────────
export type EstadoPago = 'PENDIENTE' | 'PARCIAL' | 'PAGADO' | 'SIN_CARGO';
export type EstadoInscripcion = 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA';

export interface InscriptoFila {
  idInscripcion: number;
  idRsvpGrupo: number;
  responsable: string;
  email: string;
  telefono: string;
  participantes: string[];
  cantidadParticipantes: number;
  cantidadPeriodos: number;
  cantidadServicios: number;
  tieneRestriccionesAlimentarias: boolean;
  tieneAlertasSalud: boolean;
  totalOriginal: number;
  totalPagado: number;
  saldo: number;
  moneda: string;
  estadoPago: EstadoPago;
  estadoInscripcion: EstadoInscripcion;
}

// ─── Detalle operativo completo ───────────────────────────────────
export interface PeriodoParticipante {
  idProgramaPeriodo: number;
  nombre: string;
  fechaDesde: string;
  fechaHasta: string;
  precioBase: number;
  moneda: string;
}

export interface ServicioParticipante {
  idProgramaServicio: number;
  codigo: string;
  nombre: string;
  tipoCalculo: 'POR_DIA' | 'FIJO' | string;
  precio: number;
  subtotal: number;
  moneda: string;
  cantidadCalculada: number;
}

export interface RestriccionAlimentaria {
  idRestriccionAlim: number;
  codigo: string;
  texto: string;
  categoria: 'INTOLERANCIA' | 'ALERGIA' | 'ELECCION' | string;
  requiereAlertaVisual: boolean;
  esAlergeno: boolean;
  observaciones: string | null;
  severidad: string | null;
}

export interface SaludParticipante {
  descripcion?: string;
  observaciones?: string;
}

export interface AutorizadoRetiro {
  id_autorizacion: number;
  nombre: string;
  telefono_autorizado?: string;
  relacion?: string;
  qr_token?: string;
  observaciones?: string;
}

export interface ParticipanteDetalle {
  idInvitado: number;
  idRsvpGrupoIntegrante: number;
  nombreCompleto: string;
  fechaNacimiento: string | null;
  observaciones: string | null;
  periodos: PeriodoParticipante[];
  servicios: ServicioParticipante[];
  restriccionesAlimentarias: RestriccionAlimentaria[];
  salud: SaludParticipante | null;
  autorizadosRetiro: AutorizadoRetiro[];
}

export interface DetalleInscripcionOperativo {
  idInscripcion: number;
  idRsvpGrupo: number;
  responsable: string;
  email: string;
  telefono: string;
  estadoInscripcion: EstadoInscripcion;
  estadoPago: EstadoPago;
  totalOriginal: number;
  totalPagado: number;
  saldo: number;
  moneda: string;
  participantes: ParticipanteDetalle[];
}

// ─── Filtros de búsqueda ──────────────────────────────────────────
export interface FiltrosInscriptos {
  q?: string;
  estadoPago?: EstadoPago | 'TODOS';
  soloAlertas?: boolean;
}
