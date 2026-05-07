import {
    Event, CreateEventPayload, TipoEvento, Idioma,
    PlantillaEvento, PlantillaTramo, DressCode,
    PlantillaDetalle, AplicarPlantillaPayload,
    EstructuraEvento, TramoEvento, AccesoEvento,
    TramoTipo, CrearEstructuraManualPayload // Agregados para manual flow
} from './types';

const API_URL = '/api'; // Apuntamos a nuestro Proxy de Next.js

// ═══════════ Plan Público B2C ═══════════

export interface PlanPublico {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number | null;
    moneda?: string;
    periodo: string | null;
    features: Array<{ codigo?: string; nombre: string; descripcion?: string } | string>;
}

export async function getPlanesCatalogB2C(): Promise<PlanPublico[]> {
    try {
        const res = await fetch(
            `/api/planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2C`,
            { method: 'GET' }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export async function getMyEvents(): Promise<Event[]> {
    const res = await fetch(`${API_URL}/events/mine`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener mis eventos');
    }

    const data = await res.json();

    // El backend devuelve PascalCase (IdEvento, AnfitrionesTexto, etc.)
    // Pero el frontend espera snake_case. Mapeamos:
    return data.map((item: any) => ({
        id_evento: item.idEvento,
        id_tipo_evento: item.idTipoEvento,
        id_idioma: item.idIdioma,
        anfitriones_texto: item.anfitrionesTexto,
        fecha_hora: item.fechaHora,
        lugar: item.lugar,
        direccion: item.direccion,
        estado: item.estado,
        fecha_alta: item.fechaAlta,
        tipo_evento: item.tipoEvento,
        tipo_evento_codigo: item.tipoEventoCodigo,
        saludo: item.saludo,
        mensajeBienvenida: item.mensajeBienvenida,
        notas: item.notas,
        id_cliente: item.idCliente,
        id_dress_code: item.idDressCode,
        dress_code_descripcion: item.dressCodeDescripcion,
    })) as Event[];
}

export async function getEventById(id: string): Promise<Event> {
    const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener el detalle del evento');
    }

    const item = await res.json();

    // Mapeo de PascalCase a snake_case
    return {
        id_evento: item.idEvento,
        id_tipo_evento: item.idTipoEvento,
        id_idioma: item.idIdioma,
        anfitriones_texto: item.anfitrionesTexto,
        fecha_hora: item.fechaHora,
        lugar: item.lugar,
        direccion: item.direccion,
        estado: item.estado,
        fecha_alta: item.fechaAlta,
        tipo_evento: item.tipoEvento,
        tipo_evento_codigo: item.tipoEventoCodigo,
        saludo: item.saludo,
        mensajeBienvenida: item.mensajeBienvenida,
        notas: item.notas,
        id_cliente: item.idCliente,
        id_dress_code: item.idDressCode,
        dress_code_descripcion: item.dressCodeDescripcion,
    } as Event;
}

export async function getAllEvents(): Promise<Event[]> {
    const res = await fetch(`${API_URL}/events-all`, { // Necesitaremos esta ruta también si falla
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener los eventos');
    }

    return res.json();
}

export async function createEvent(
    payload: CreateEventPayload
): Promise<Event> {
    const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al crear el evento');
    }

    return res.json();
}

export async function getAdminEvents(): Promise<Event[]> {
    const res = await fetch(`${API_URL}/admineventos/Listar`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener eventos de admin');
    }

    const data = await res.json();

    // Mapeo de PascalCase a snake_case
    return data.map((item: any) => ({
        id_evento: item.idEvento,
        id_tipo_evento: item.idTipoEvento,
        id_idioma: item.idIdioma,
        anfitriones_texto: item.anfitrionesTexto,
        fecha_hora: item.fechaHora,
        lugar: item.lugar,
        direccion: item.direccion,
        estado: item.estado,
        fecha_alta: item.fechaAlta,
        tipo_evento: item.tipoEvento,
        tipo_evento_codigo: item.tipoEventoCodigo,
        saludo: item.saludo,
        mensajeBienvenida: item.mensajeBienvenida,
        notas: item.notas,
        id_cliente: item.idCliente,
        id_dress_code: item.idDressCode,
        dress_code_descripcion: item.dressCodeDescripcion,
    })) as Event[];
}

export interface CurrentUser {
    email: string;
    rol: string;
    exp: number;
}

export async function getCurrentUser(): Promise<CurrentUser> {
    const res = await fetch('/api/auth/me', {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener usuario actual');
    }

    return res.json();
}
export async function getAdminEventById(id: string): Promise<Event> {
    const res = await fetch(
        `${API_URL}/admineventos/GetEvento?IdEvento=${id}`,
        {
            method: 'GET',
        }
    );

    if (!res.ok) {
        throw new Error('Error al obtener el detalle del evento de admin');
    }

    const item = await res.json();

    return {
        id_evento: item.idEvento,
        id_tipo_evento: item.idTipoEvento,
        id_idioma: item.idIdioma,
        anfitriones_texto: item.anfitrionesTexto,
        fecha_hora: item.fechaHora,
        lugar: item.lugar,
        direccion: item.direccion,
        estado: item.estado,
        fecha_alta: item.fechaAlta,
        tipo_evento_codigo: item.tipoEventoCodigo,
        saludo: item.saludo,
        mensajeBienvenida: item.mensajeBienvenida,
        notas: item.notas,
        id_cliente: item.idCliente,
        id_dress_code: item.idDressCode,
        dress_code_descripcion: item.dressCodeDescripcion,
    } as Event;
}

export async function activateEvent(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/admineventos/Activar?idEvento=${id}`, {
        method: 'POST',
    });

    if (!res.ok) {
        throw new Error('Error al activar el evento');
    }
}

export async function getTiposEvento(idIdioma: number = 2, tipoOperacion?: 'EVENTO' | 'PROGRAMA'): Promise<TipoEvento[]> {
    let url = `${API_URL}/tipos-evento?idIdioma=${idIdioma}`;
    if (tipoOperacion) {
        url += `&tipoOperacion=${tipoOperacion}`;
    }
    const res = await fetch(url, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener tipos de evento');
    }

    return res.json();
}

export async function getIdiomasActivos(): Promise<Idioma[]> {
    const res = await fetch(`${API_URL}/idiomas`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener idiomas');
    }

    return res.json();
}

export async function getPlantillasByTipo(idTipoEvento: number): Promise<PlantillaEvento[]> {
    const res = await fetch(`${API_URL}/plantillas-evento?idTipoEvento=${idTipoEvento}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener plantillas de evento');
    }

    return res.json();
}

export async function getTramosByPlantilla(idPlantilla: number): Promise<PlantillaTramo[]> {
    const res = await fetch(`${API_URL}/plantilla-tramos?idPlantilla=${idPlantilla}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener tramos de plantilla');
    }

    return res.json();
}

// ═══════════ Nuevos services para flujo "Crear Evento CON Plantilla" ═══════════

export async function getDressCodes(idIdioma: number): Promise<DressCode[]> {
    const res = await fetch(`${API_URL}/dress-codes?idIdioma=${idIdioma}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener dress codes');
    }

    return res.json();
}

export async function getPlantillaDetalle(idPlantilla: number): Promise<PlantillaDetalle> {
    const res = await fetch(`${API_URL}/plantillas-evento/${idPlantilla}/detalle`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener detalle de plantilla');
    }

    return res.json();
}

export async function aplicarPlantilla(idEvento: number, payload: AplicarPlantillaPayload): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_URL}/eventos-plantillas/aplicar?idEvento=${idEvento}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al aplicar plantilla al evento');
    }

    return res.json();
}

export async function getEstructuraEvento(idEvento: number): Promise<EstructuraEvento> {
    const res = await fetch(`${API_URL}/eventos-plantillas/estructura?idEvento=${idEvento}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener estructura del evento');
    }

    return res.json();
}

export async function updateTramo(idTramo: number, payload: Partial<TramoEvento>): Promise<TramoEvento> {
    const res = await fetch(`${API_URL}/evento-tramos/${idTramo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al actualizar el tramo');
    }

    return res.json();
}

export async function updateAcceso(idAcceso: number, payload: Partial<AccesoEvento>): Promise<AccesoEvento> {
    const res = await fetch(`${API_URL}/evento-accesos/${idAcceso}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al actualizar el acceso');
    }

    return res.json();
}

export async function setAccesoDefault(
    idEvento: number,
    idAcceso: number
): Promise<{ ok: boolean; id_evento: number; id_acceso_default: number }> {
    const res = await fetch(`${API_URL}/events/${idEvento}/acceso-default?idAcceso=${idAcceso}`, {
        method: 'PUT',
    });

    if (!res.ok) {
        throw new Error('Error al setear acceso default');
    }

    return res.json();
}

// ═══════════ Relaciones Acceso-Tramo (Matriz editable) ═══════════

export async function createRelacionAccesoTramo(
    idAcceso: number,
    idTramo: number
): Promise<{ id_acceso: number; id_tramo: number }> {
    const res = await fetch(`${API_URL}/evento-acceso-tramos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_acceso: idAcceso, id_tramo: idTramo }),
    });
    if (!res.ok) throw new Error('Error al crear relación acceso-tramo');
    return res.json();
}

export async function deleteRelacionAccesoTramo(
    idAcceso: number,
    idTramo: number
): Promise<void> {
    const res = await fetch(
        `${API_URL}/evento-acceso-tramos?idAcceso=${idAcceso}&idTramo=${idTramo}`,
        { method: 'DELETE' }
    );
    if (!res.ok) throw new Error('Error al eliminar relación acceso-tramo');
}

// ═══════════ Nuevos services para flujo "Crear Evento SIN Plantilla" ═══════════

export async function getTramoTipos(idIdioma: number = 2): Promise<TramoTipo[]> {
    const res = await fetch(`${API_URL}/tramo-tipos?idIdioma=${idIdioma}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Error al obtener tipos de tramo');
    }

    return res.json();
}

export async function iniciarSolicitudDraft(
    idEvento: number,
    motivo: string
): Promise<{ ok: boolean; id_solicitud_draft: number; estado: string }> {
    const res = await fetch(
        `${API_URL}/solicitudes-plantilla/draft?idEvento=${idEvento}&motivo=${motivo}`,
        { method: 'POST' }
    );

    if (!res.ok) {
        throw new Error('Error al iniciar solicitud draft');
    }

    return res.json();
}

export async function crearEstructuraManual(
    idEvento: number,
    payload: CrearEstructuraManualPayload
): Promise<any> {
    const res = await fetch(
        `${API_URL}/eventos-plantillas/crear-estructura-manual?idEvento=${idEvento}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        throw new Error('Error al enviar estructura manual');
    }

    return res.json();
}

