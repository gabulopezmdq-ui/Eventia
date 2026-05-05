import { 
    Programa, CrearProgramaPayload, ProgramaPeriodo, ProgramaServicio,
    AutorizacionConfig, TraduccionAutorizacion, SaludConfig, StaffPrograma 
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
export const getServicios = async (idEvento: number, soloActivos = false): Promise<ProgramaServicio[]> => {
    const res = await fetch(`${API_URL}/${idEvento}/servicios?soloActivos=${soloActivos}`);
    if (!res.ok) throw new Error('Error obteniendo servicios');
    return res.json();
};

export const upsertServicio = async (idEvento: number, payload: ProgramaServicio): Promise<ProgramaServicio> => {
    const res = await fetch(`${API_URL}/${idEvento}/servicios/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error guardando servicio');
    return res.json();
};

// Autorizaciones
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
