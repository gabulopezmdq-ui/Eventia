import {
  SaludPanelResponse,
  SaludFichaItem,
  SaludMedicacionItem,
  SaludAccionItem,
  SaludParticipanteDetalle,
  TipoAccionSalud,
  RegistrarAccionPayload,
  SaludFiltrosParams
} from './types/salud.types';

const API_URL = '/api/programas';

// Función auxiliar para serializar los query params
const buildQueryString = (params?: SaludFiltrosParams): string => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

/**
 * Obtiene los datos para la grilla del Panel Principal y el tab de Restricciones.
 */
export const getSaludPanel = async (
  idEvento: number,
  filtros?: SaludFiltrosParams
): Promise<SaludPanelResponse[]> => {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/${idEvento}/salud/panel${qs}`);
  if (!res.ok) throw new Error('Error al obtener el panel de salud');
  return res.json();
};

/**
 * Obtiene la lista operativa rápida del tab de Fichas.
 */
export const getSaludFichas = async (
  idEvento: number,
  filtros?: SaludFiltrosParams
): Promise<SaludFichaItem[]> => {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/${idEvento}/salud/fichas${qs}`);
  if (!res.ok) throw new Error('Error al obtener el listado de fichas');
  return res.json();
};

/**
 * Obtiene la lista de medicaciones para el tab Medicaciones.
 */
export const getSaludMedicaciones = async (
  idEvento: number,
  filtros?: SaludFiltrosParams
): Promise<SaludMedicacionItem[]> => {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/${idEvento}/salud/medicaciones${qs}`);
  if (!res.ok) throw new Error('Error al obtener las medicaciones');
  return res.json();
};

/**
 * Obtiene el timeline histórico operativo de incidentes y acciones.
 */
export const getSaludAcciones = async (
  idEvento: number,
  filtros?: SaludFiltrosParams
): Promise<SaludAccionItem[]> => {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/${idEvento}/salud/acciones${qs}`);
  if (!res.ok) throw new Error('Error al obtener las acciones de salud');
  return res.json();
};

/**
 * Obtiene el detalle completo (modal/drawer) de salud de un participante.
 */
export const getSaludParticipanteDetalle = async (
  idEvento: number,
  idInvitado: number
): Promise<SaludParticipanteDetalle> => {
  const res = await fetch(`${API_URL}/${idEvento}/salud/participantes/${idInvitado}/detalle`);
  if (!res.ok) throw new Error('Error al obtener el detalle del participante');
  return res.json();
};

/**
 * Obtiene el listado paramétrico de los tipos de acción (combo de selección).
 */
export const getTiposAccionSalud = async (idIdioma = 1): Promise<TipoAccionSalud[]> => {
  const res = await fetch(`${API_URL}/salud/tipos-accion?idIdioma=${idIdioma}`);
  if (!res.ok) throw new Error('Error al obtener los tipos de acción de salud');
  return res.json();
};

/**
 * Registra un nuevo incidente o acción tomada por el staff.
 */
export const registrarAccionSalud = async (
  idEvento: number,
  payload: RegistrarAccionPayload
): Promise<any> => {
  const res = await fetch(`${API_URL}/${idEvento}/salud/acciones/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar la acción');
  return res.json();
};
