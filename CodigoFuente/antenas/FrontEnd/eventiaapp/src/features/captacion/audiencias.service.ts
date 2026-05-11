import {
    AudienciaPersona,
    AudienciaPersonaDetalle,
    TagSugerido,
    // Panel Audiencias CRM — nuevo modelo segmentado
    AudienciaCRMPersona,
    AudienciaCRMDetalle,
    TipoPersonaCRM,
} from './types';

const API = '/api'; // Apunta al proxy de Next.js

// ═══════════════════════════════════════════════════════════════════
// AUDIENCIA DE CUENTA (mini CRM)
// ═══════════════════════════════════════════════════════════════════

/** Listar toda la audiencia de la cuenta */
export async function getAudienciaCuenta(
    soloActivas: boolean = true
): Promise<AudienciaPersona[]> {
    const res = await fetch(
        `${API}/audiencias-cuenta?soloActivas=${soloActivas}`
    );
    if (!res.ok) throw new Error('Error al obtener audiencia de cuenta');
    return res.json();
}

/** Obtener el detalle de una persona (con historial y tags) */
export async function getAudienciaDetalle(
    idAudienciaPersona: number
): Promise<AudienciaPersonaDetalle> {
    const res = await fetch(
        `${API}/audiencias-detalle?idAudienciaPersona=${idAudienciaPersona}`
    );
    if (!res.ok) throw new Error('Error al obtener detalle de audiencia');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════════════════════════

/** Obtener el catálogo de tags sugeridos */
export async function getTagsSugeridos(): Promise<TagSugerido[]> {
    const res = await fetch(`${API}/audiencias-tags`);
    if (!res.ok) throw new Error('Error al obtener tags sugeridos');
    return res.json();
}

/** Agregar un tag manual a una persona de la audiencia */
export async function agregarTag(
    idAudienciaPersona: number,
    tag_tipo: string,
    tag_valor: string
): Promise<unknown> {
    const res = await fetch(
        `${API}/audiencias-tags?idAudienciaPersona=${idAudienciaPersona}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag_tipo, tag_valor }),
        }
    );
    if (!res.ok) throw new Error('Error al agregar tag');
    return res.json();
}

/** Desactivar (quitar) un tag de una persona */
export async function setTagActivo(
    idAudienciaPersonaTag: number,
    activo: boolean
): Promise<unknown> {
    const res = await fetch(
        `${API}/audiencias-tags?idAudienciaPersonaTag=${idAudienciaPersonaTag}&activo=${activo}`,
        { method: 'PUT' }
    );
    if (!res.ok) throw new Error('Error al actualizar tag');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// PANEL AUDIENCIAS CRM — Nuevo modelo segmentado
// ═══════════════════════════════════════════════════════════════════

/**
 * Listar audiencia CRM segmentada por tipo de persona.
 * Consume GET /audiencia_crm/listar
 */
export async function getAudienciaCRM(params: {
    idCuenta: number;
    tipo?: TipoPersonaCRM;
    q?: string;
    idEvento?: number;
}): Promise<AudienciaCRMPersona[]> {
    const qs = new URLSearchParams({
        idCuenta: String(params.idCuenta),
        tipo: params.tipo ?? 'TODOS',
        q: params.q ?? '',
    });
    if (params.idEvento) qs.set('idEvento', String(params.idEvento));

    const res = await fetch(`${API}/audiencias-crm-listar?${qs.toString()}`);
    if (!res.ok) throw new Error('Error al obtener audiencia CRM');
    return res.json();
}

/**
 * Obtener el detalle CRM enriquecido de una persona.
 * Consume GET /audiencia_crm/{id}/detalle
 */
export async function getAudienciaCRMDetalle(
    idAudienciaPersona: number
): Promise<AudienciaCRMDetalle> {
    const res = await fetch(
        `${API}/audiencias-crm-detalle?id=${idAudienciaPersona}`
    );
    if (!res.ok) throw new Error('Error al obtener detalle CRM');
    return res.json();
}
