import {
    AudienciaPersona,
    AudienciaPersonaDetalle,
    TagSugerido,
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
