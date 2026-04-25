import {
    CaptacionLink,
    CaptacionLinkPayload,
    LandingData,
    RegistroAudienciaPayload,
    RegistroAudienciaResponse,
    PersonaRegistrada,
    BusquedaRegistrado,
    QrEntradaResult,
    CheckinPayload,
    CheckinResponse,
    QrBeneficioResult,
    CheckinEvento,
    MetricasEvento,
    Parametrica,
    TipoBeneficio,
} from './types';

const API = '/api'; // Apunta al proxy de Next.js

// ═══════════════════════════════════════════════════════════════════
// CAMPAÑAS / CAPTACIÓN LINKS
// ═══════════════════════════════════════════════════════════════════

/** Listar campañas de un evento */
export async function getCampanas(idEvento: number): Promise<CaptacionLink[]> {
    const res = await fetch(`${API}/captacion-links?idEvento=${idEvento}`);
    if (!res.ok) throw new Error('Error al obtener campañas');
    return res.json();
}

/** Crear o editar una campaña (id_acceso_link null = crear) */
export async function saveCampana(
    idEvento: number,
    payload: CaptacionLinkPayload
): Promise<unknown> {
    const res = await fetch(`${API}/captacion-links?idEvento=${idEvento}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al guardar campaña');
    return res.json();
}

/** Activar o desactivar una campaña */
export async function toggleCampana(
    idAccesoLink: number,
    activo: boolean
): Promise<{ ok: boolean; id_acceso_link: number; activo: boolean }> {
    const res = await fetch(
        `${API}/captacion-links-toggle?idAccesoLink=${idAccesoLink}&activo=${activo}`,
        { method: 'PUT' }
    );
    if (!res.ok) throw new Error('Error al cambiar estado de campaña');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// LANDING PÚBLICA
// ═══════════════════════════════════════════════════════════════════

/** Obtener datos de la landing pública por token de campaña */
export async function getLandingPublica(token: string): Promise<LandingData> {
    const res = await fetch(`${API}/captacion-landing?token=${token}`);
    if (!res.ok) throw new Error('Landing no encontrada o expirada');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// REGISTRO DE AUDIENCIA (formulario público)
// ═══════════════════════════════════════════════════════════════════

/** Registrar a una persona en una campaña */
export async function registrarAudiencia(
    token: string,
    payload: RegistroAudienciaPayload
): Promise<RegistroAudienciaResponse> {
    const res = await fetch(`${API}/audiencias-registrar?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al registrar audiencia');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// PERSONAS REGISTRADAS AL EVENTO
// ═══════════════════════════════════════════════════════════════════

/** Listar todas las personas registradas al evento */
export async function getPersonasRegistradas(
    idEvento: number
): Promise<PersonaRegistrada[]> {
    const res = await fetch(`${API}/audiencias-evento?idEvento=${idEvento}`);
    if (!res.ok) throw new Error('Error al obtener personas registradas');
    return res.json();
}

/** Buscar un registrado por nombre, email o celular */
export async function buscarRegistrado(
    idEvento: number,
    query: string
): Promise<BusquedaRegistrado[]> {
    const res = await fetch(
        `${API}/audiencias-buscar?idEvento=${idEvento}&query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error('Error al buscar registrado');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// QR ENTRADA
// ═══════════════════════════════════════════════════════════════════

/** Resolver QR de entrada (escaneo) */
export async function resolverQrEntrada(
    idEvento: number,
    qrToken: string
): Promise<QrEntradaResult> {
    const res = await fetch(
        `${API}/audiencias-qr-entrada?idEvento=${idEvento}&qrToken=${qrToken}`
    );
    if (!res.ok) throw new Error('QR no válido o persona no encontrada');
    return res.json();
}

/** Resolver entrada manual (cuando se perdió el QR) */
export async function resolverEntradaManual(
    idEvento: number,
    idInvitado: number
): Promise<QrEntradaResult> {
    const res = await fetch(
        `${API}/audiencias-entrada-manual?idEvento=${idEvento}&idInvitado=${idInvitado}`
    );
    if (!res.ok) throw new Error('Error al resolver entrada manual');
    return res.json();
}

/** Registrar ingreso o reingreso */
export async function registrarCheckin(
    payload: CheckinPayload
): Promise<CheckinResponse> {
    const res = await fetch(`${API}/audiencias-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al registrar check-in');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// QR BENEFICIO
// ═══════════════════════════════════════════════════════════════════

/** Resolver QR de beneficio */
export async function resolverQrBeneficio(
    idEvento: number,
    qrToken: string
): Promise<QrBeneficioResult> {
    const res = await fetch(
        `${API}/audiencias-qr-beneficio?idEvento=${idEvento}&qrToken=${qrToken}`
    );
    if (!res.ok) throw new Error('QR de beneficio no válido');
    return res.json();
}

/** Canjear el beneficio de un asistente */
export async function canjearBeneficio(
    idBeneficioRegistro: number,
    observaciones?: string
): Promise<{ ok: boolean }> {
    const url = observaciones
        ? `${API}/audiencias-canjear?idBeneficioRegistro=${idBeneficioRegistro}&observaciones=${encodeURIComponent(observaciones)}`
        : `${API}/audiencias-canjear?idBeneficioRegistro=${idBeneficioRegistro}`;

    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Error al canjear beneficio');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// ASISTENCIA
// ═══════════════════════════════════════════════════════════════════

/** Listar check-ins (personas que concurrieron al evento) */
export async function getAsistencia(idEvento: number): Promise<CheckinEvento[]> {
    const res = await fetch(`${API}/audiencias-asistencia?idEvento=${idEvento}`);
    if (!res.ok) throw new Error('Error al obtener asistencia');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// MÉTRICAS
// ═══════════════════════════════════════════════════════════════════

/** Obtener métricas completas del evento público */
export async function getMetricasEvento(idEvento: number): Promise<MetricasEvento> {
    const res = await fetch(`${API}/audiencias-metricas?idEvento=${idEvento}`);
    if (!res.ok) throw new Error('Error al obtener métricas');
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// PARAMÉTRICAS
// ═══════════════════════════════════════════════════════════════════

/** Tipos de beneficio de registro (para el formulario de campaña) */
export async function getTiposBeneficio(idEvento: number): Promise<TipoBeneficio[]> {
    const res = await fetch(`${API}/parametrica/tipos-beneficio?idEvento=${idEvento}`);
    if (!res.ok) throw new Error('Error al obtener tipos de beneficio');
    return res.json();
}

/** Perfiles de asistencia (Solo, Pareja, Amigos, Grupo) */
export async function getPerfilesAsistencia(idEvento: number): Promise<Parametrica[]> {
    const res = await fetch(
        `${API}/parametrica/perfiles-asistencia?idEvento=${idEvento}`
    );
    if (!res.ok) throw new Error('Error al obtener perfiles de asistencia');
    return res.json();
}

/** Intereses de evento (Sunset, Tardeo, After, etc.) */
export async function getInteresesEvento(idEvento: number): Promise<Parametrica[]> {
    const res = await fetch(
        `${API}/parametrica/intereses-musicales?idEvento=${idEvento}&tipo=intereses`
    );
    if (!res.ok) throw new Error('Error al obtener intereses');
    return res.json();
}

/** Preferencias musicales (House, Pop, Rock, etc.) */
export async function getPreferenciasMusicales(idEvento: number): Promise<Parametrica[]> {
    const res = await fetch(
        `${API}/parametrica/intereses-musicales?idEvento=${idEvento}&tipo=musicales`
    );
    if (!res.ok) throw new Error('Error al obtener preferencias musicales');
    return res.json();
}
