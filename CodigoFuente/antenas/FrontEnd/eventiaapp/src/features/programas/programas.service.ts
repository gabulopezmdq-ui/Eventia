import {
    Programa, CrearProgramaPayload, ProgramaPeriodo, ProgramaServicio, ServicioBase,
    AutorizacionConfig, TraduccionAutorizacion, SaludConfig, StaffPrograma, AutorizacionBase,
    ValidarQRPayload, ValidarQRResponse,
    RegistrarRetiroPayload, RegistrarRetiroResponse,
    RetirosDiaResponse,
    TransporteDiaResponse, TransporteServicioCodigo,
    AutorizacionesInscripcionResponse
} from './types';

const API_URL = '/api/programas';

// Generales
export const getMisProgramas = async (): Promise<Programa[]> => {
    const res = await fetch(`${API_URL}/mis-programas`);
    if (!res.ok) throw new Error('Error al obtener programas');
    return res.json();
};

export const createPrograma = async (payload: CrearProgramaPayload): Promise<Programa> => {
    // Apunta al endpoint proxy de eventos que le agrega tipoOperacion="PROGRAMA"
    const res = await fetch(`/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error creando programa');
    return res.json();
};

export const generarLinkPublico = async (idEvento: number) => {
    const res = await fetch(`${API_URL}/${idEvento}/generar-link-publico`, { method: 'POST' });
    if (!res.ok) throw new Error('Error generando link');
    return res.json();
};

// Períodos
export const getPeriodos = async (idEvento: number, soloActivos = false): Promise<ProgramaPeriodo[]> => {
    const res = await fetch(`${API_URL}/${idEvento}/periodos?soloActivos=${soloActivos}`);
    if (!res.ok) throw new Error('Error obteniendo períodos');
    return res.json();
};

export const upsertPeriodo = async (idEvento: number, payload: ProgramaPeriodo): Promise<ProgramaPeriodo> => {
    const res = await fetch(`${API_URL}/${idEvento}/periodos/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error guardando período');
    return res.json();
};

// Servicios
export const getServiciosBase = async (idIdioma = 3): Promise<ServicioBase[]> => {
    const res = await fetch(`${API_URL}/servicios-base?idIdioma=${idIdioma}`);
    if (!res.ok) throw new Error('Error obteniendo servicios base');
    return res.json();
};

export const getServicios = async (idEvento: number, soloActivos = false): Promise<ProgramaServicio[]> => {
    const res = await fetch(`${API_URL}/${idEvento}/servicios?soloActivos=${soloActivos}`);
    if (!res.ok) throw new Error('Error obteniendo servicios');
    return res.json();
};

export const upsertServicio = async (
    idEvento: number,
    payload: ProgramaServicio
): Promise<ProgramaServicio> => {

    const res = await fetch(
        `${API_URL}/${idEvento}/servicios/upsert`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );

    if (!res.ok) {
        throw new Error('Error guardando servicio');
    }

    return res.json();
};

// Autorizaciones
export const getAutorizacionesBase = async (idIdioma = 3): Promise<AutorizacionBase[]> => {
    const res = await fetch(`${API_URL}/autorizaciones-base?idIdioma=${idIdioma}`);
    if (!res.ok) throw new Error('Error obteniendo autorizaciones base');
    return res.json();
};

export const getAutorizacionesConfig = async (idEvento: number, idIdioma = 3, soloActivas = false): Promise<AutorizacionConfig[]> => {
    const res = await fetch(`${API_URL}/${idEvento}/autorizaciones-config?idIdioma=${idIdioma}&soloActivas=${soloActivas}`);
    if (!res.ok) throw new Error('Error obteniendo autorizaciones');
    return res.json();
};

export const upsertAutorizacionConfig = async (idEvento: number, payload: AutorizacionConfig): Promise<AutorizacionConfig> => {
    const res = await fetch(`${API_URL}/${idEvento}/autorizaciones-config/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error guardando autorización');
    return res.json();
};

export const getTraducciones = async (idConfig: number): Promise<TraduccionAutorizacion[]> => {
    const res = await fetch(`${API_URL}/autorizaciones-config/${idConfig}/traducciones`);
    if (!res.ok) throw new Error('Error obteniendo traducciones');
    return res.json();
};

export const updateTraducciones = async (idConfig: number, traducciones: TraduccionAutorizacion[]) => {
    const res = await fetch(`${API_URL}/autorizaciones-config/${idConfig}/traducciones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: traducciones })
    });
    if (!res.ok) throw new Error('Error guardando traducciones');
    return res.json();
};

// Salud
export const getSaludConfig = async (idEvento: number): Promise<SaludConfig> => {
    const res = await fetch(`${API_URL}/${idEvento}/salud/config`);
    if (!res.ok) throw new Error('Error obteniendo configuración médica');
    return res.json();
};

export const upsertSaludConfig = async (idEvento: number, payload: SaludConfig): Promise<SaludConfig> => {
    const res = await fetch(`${API_URL}/${idEvento}/salud/config/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error guardando configuración médica');
    return res.json();
};

// Staff
export const getStaffPrograma = async (idEvento: number): Promise<StaffPrograma[]> => {
    const res = await fetch(`${API_URL}/${idEvento}/staff`);
    if (!res.ok) throw new Error('Error obteniendo staff');
    return res.json();
};

export const upsertStaffPrograma = async (idEvento: number, payload: StaffPrograma): Promise<StaffPrograma> => {
    const res = await fetch(`${API_URL}/${idEvento}/staff/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error asignando staff. Puede que el email no esté registrado.');
    return res.json();
};

// ── Retiros QR ──────────────────────────────────────────────────

/**
 * Valida si el QR de una persona está autorizado a retirar participantes.
 * idEvento se usa sólo para construir la ruta del proxy Next.js.
 */
export const validarQR = async (
    idEvento: number,
    payload: ValidarQRPayload
): Promise<ValidarQRResponse> => {
    const res = await fetch(`${API_URL}/${idEvento}/retiros/validar-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al validar el QR');
    return res.json();
};

/**
 * Registra la salida de uno o más niños con el QR validado.
 * idEvento se usa sólo para construir la ruta del proxy Next.js.
 */
export const registrarRetiro = async (
    idEvento: number,
    payload: RegistrarRetiroPayload
): Promise<RegistrarRetiroResponse> => {
    const res = await fetch(`${API_URL}/${idEvento}/retiros/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al registrar el retiro');
    return res.json();
};

/** Obtiene el resumen y la grilla de retiros de un día para el programa. */
export const getRetirosDia = async (
    idEvento: number,
    fecha: string
): Promise<RetirosDiaResponse> => {
    const res = await fetch(`${API_URL}/${idEvento}/retiros/dia?fecha=${fecha}`);
    if (!res.ok) throw new Error('Error al obtener los retiros del día');
    return res.json();
};

// ── Transporte ────────────────────────────────────────────────

/**
 * Obtiene la lista operativa de transporte de un día para el programa.
 * @param idEvento   ID del evento/programa
 * @param fecha      Fecha en formato YYYY-MM-DD
 * @param servicioCodigo  Filtro: 'TODOS' | 'ACOGIDA' | 'TRANSPORTE'
 */
export const getTransporteDia = async (
    idEvento: number,
    fecha: string,
    servicioCodigo: TransporteServicioCodigo = 'TODOS'
): Promise<TransporteDiaResponse> => {
    const res = await fetch(
        `${API_URL}/${idEvento}/transporte/dia?fecha=${fecha}&servicioCodigo=${servicioCodigo}`
    );
    if (!res.ok) throw new Error('Error al obtener el listado de transporte del día');
    return res.json();
};

// ── Autorizaciones de Inscripción ────────────────────────────

/**
 * Obtiene las autorizaciones firmadas de una inscripción concreta.
 * @param idInscripcion   ID de la inscripción
 * @param idEvento        ID del evento/programa (para validación de permisos en el backend)
 * @param idIdioma        Idioma para los textos (default: 1)
 */
export const getAutorizacionesInscripcion = async (
    idInscripcion: number,
    idEvento: number,
    idIdioma = 1
): Promise<AutorizacionesInscripcionResponse> => {
    const res = await fetch(
        `/api/programas/inscripciones/${idInscripcion}/autorizaciones?idIdioma=${idIdioma}&idEvento=${idEvento}`
    );
    if (!res.ok) throw new Error('Error al obtener las autorizaciones de la inscripción');
    return res.json();
};

export async function getProgramaDetalle(
    idEvento: number
) {

    const response = await fetch(
        `/api/events/${idEvento}`
    );

    if (!response.ok) {

        throw new Error(
            'Error obteniendo programa'
        );
    }

    return response.json();
}