import {
  ResumenInscriptos,
  InscriptoFila,
  DetalleInscripcionOperativo,
  FiltrosInscriptos,
} from './types/panel-inscriptos.types';

const API_URL = '/api'; // Proxy de Next.js

/**
 * Obtiene el resumen de KPIs para el panel de inscriptos.
 */
export async function getResumenInscriptos(idEvento: number): Promise<ResumenInscriptos> {
  const res = await fetch(`${API_URL}/programas/${idEvento}/inscriptos/resumen`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Error al obtener el resumen de inscriptos');
  }

  return res.json();
}

/**
 * Obtiene la lista de inscriptos para la grilla, aplicando filtros opcionales.
 */
export async function getInscriptosList(
  idEvento: number,
  filtros: FiltrosInscriptos
): Promise<InscriptoFila[]> {
  const params = new URLSearchParams();

  if (filtros.q) {
    params.append('q', filtros.q);
  }

  if (filtros.estadoPago && filtros.estadoPago !== 'TODOS') {
    params.append('estadoPago', filtros.estadoPago);
  }

  if (filtros.soloAlertas) {
    params.append('soloAlertas', 'true');
  }

  const queryString = params.toString();
  const url = `${API_URL}/programas/${idEvento}/inscriptos${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Error al obtener la lista de inscriptos');
  }

  return res.json();
}

/**
 * Obtiene el detalle operativo completo de una inscripción.
 */
export async function getDetalleInscripcion(
  idInscripcion: number,
  idIdioma: number = 1
): Promise<DetalleInscripcionOperativo> {
  const res = await fetch(
    `${API_URL}/programas/inscripciones/${idInscripcion}/detalle-operativo?idIdioma=${idIdioma}`,
    {
      method: 'GET',
    }
  );

  if (!res.ok) {
    throw new Error('Error al obtener el detalle de la inscripción');
  }

  return res.json();
}
