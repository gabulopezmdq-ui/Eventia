import {
    TransferenciaConfig,
    TransferenciaDestino,
    MonedaCombo,
    RegaloItem,
    FondoConfig,
    MetaItem,
    AporteItem
} from './types';

// Helper local para parsear errores
async function handleResponseJson<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        const msg = errObj?.details?.error || errObj?.message || 'Error en la operación del servidor';
        throw new Error(msg);
    }
    return res.json() as Promise<T>;
}

// ═══════════════════════════════════════════════════════════════════
// SERVICIOS PARA EL ORGANIZADOR (DASHBOARD)
// ═══════════════════════════════════════════════════════════════════

export async function getTransferenciasConfig(idEvento: number): Promise<TransferenciaConfig> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/transferencias/config`, {
        method: 'GET',
    });
    return handleResponseJson<TransferenciaConfig>(res);
}

export async function saveTransferenciasConfig(
    idEvento: number,
    payload: { titulo: string; texto_intro: string | null; activo: boolean }
): Promise<TransferenciaConfig> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/transferencias/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<TransferenciaConfig>(res);
}

export async function getTransferencias(idEvento: number): Promise<TransferenciaDestino[]> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/transferencias`, {
        method: 'GET',
    });
    return handleResponseJson<TransferenciaDestino[]>(res);
}

export async function saveTransferencia(
    idEvento: number,
    payload: TransferenciaDestino
): Promise<TransferenciaDestino> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/transferencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<TransferenciaDestino>(res);
}

export async function toggleTransferenciaActivo(
    idEvento: number,
    idTf: number,
    activo: boolean
): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/transferencias/${idTf}/activo?activo=${activo}`, {
        method: 'PUT',
    });
    return handleResponseJson<{ ok: boolean }>(res);
}

export async function getListaRegalos(idEvento: number): Promise<RegaloItem[]> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/lista`, {
        method: 'GET',
    });
    return handleResponseJson<RegaloItem[]>(res);
}

export async function getRegaloItem(idEvento: number, idItem: number): Promise<RegaloItem> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/lista/${idItem}`, {
        method: 'GET',
    });
    return handleResponseJson<RegaloItem>(res);
}

export async function saveRegaloItem(
    idEvento: number,
    payload: RegaloItem
): Promise<RegaloItem> {
    const isNew = payload.id_regalo_item === null;
    const url = isNew
        ? `/api/eventos/${idEvento}/regalos/lista`
        : `/api/eventos/${idEvento}/regalos/lista/${payload.id_regalo_item}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<RegaloItem>(res);
}

export async function toggleRegaloVisible(
    idEvento: number,
    idItem: number,
    visible: boolean
): Promise<{ ok: boolean } | any> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/lista/${idItem}/visible?visible=${visible}`, {
        method: 'PUT',
    });
    // Algunos endpoints devuelven { ok: true } o el item actualizado
    return handleResponseJson<any>(res);
}

export async function duplicarRegaloItem(idEvento: number, idItem: number): Promise<RegaloItem> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/lista/${idItem}/duplicar`, {
        method: 'POST',
    });
    return handleResponseJson<RegaloItem>(res);
}

export async function getFondo(idEvento: number): Promise<FondoConfig | null> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/fondo`, {
        method: 'GET',
    });
    return handleResponseJson<FondoConfig | null>(res);
}

export async function saveFondo(
    idEvento: number,
    payload: FondoConfig
): Promise<FondoConfig> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/fondo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<FondoConfig>(res);
}

export async function getMetas(idEvento: number): Promise<MetaItem[]> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/fondo/metas`, {
        method: 'GET',
    });
    return handleResponseJson<MetaItem[]>(res);
}

export async function saveMeta(
    idEvento: number,
    payload: MetaItem
): Promise<MetaItem> {
    const isNew = payload.id_meta === null;
    const url = isNew
        ? `/api/eventos/${idEvento}/regalos/fondo/metas`
        : `/api/eventos/${idEvento}/regalos/fondo/metas/${payload.id_meta}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<MetaItem>(res);
}

export async function toggleMetaVisible(
    idEvento: number,
    idMeta: number,
    visible: boolean
): Promise<{ ok: boolean } | any> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/fondo/metas/${idMeta}/visible?visible=${visible}`, {
        method: 'PUT',
    });
    return handleResponseJson<any>(res);
}

export async function getAportes(idEvento: number, estado: 'DECLARADO' | 'CONFIRMADO'): Promise<AporteItem[]> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/fondo/aportes?estado=${estado}`, {
        method: 'GET',
    });
    return handleResponseJson<AporteItem[]>(res);
}

export async function confirmarAporte(
    idEvento: number,
    idAporte: number,
    payload: { monto_base_calculado: number; tipo_cambio_usado: number | null }
): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/eventos/${idEvento}/regalos/fondo/aportes/${idAporte}/confirmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<{ ok: boolean }>(res);
}

export async function getMonedasCombo(): Promise<MonedaCombo[]> {
    const res = await fetch(`/api/monedas/GetCombo`, {
        method: 'GET',
    });
    return handleResponseJson<MonedaCombo[]>(res);
}

// ═══════════════════════════════════════════════════════════════════
// SERVICIOS PARA EL INVITADO (PUBLIC PORTAL)
// ═══════════════════════════════════════════════════════════════════

export async function reservarRegalo(payload: {
    id_evento: number;
    id_regalo_item: number;
    rsvp_token: string;
    nombre_mostrado: string;
    es_anonimo: boolean;
    cantidad: number;
    mensaje: string | null;
}): Promise<any> {
    const res = await fetch(`/api/public/regalos/lista/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<any>(res);
}

export async function aportarAlFondo(payload: {
    id_evento: number;
    id_fondo: number;
    id_meta: number;
    rsvp_token: string;
    nombre_mostrado: string;
    es_anonimo: boolean;
    monto_aporte: number;
    moneda_aporte: string;
    mensaje: string | null;
    mostrar_en_muro: boolean;
}): Promise<any> {
    const res = await fetch(`/api/public/regalos/fondo/aportar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponseJson<any>(res);
}
