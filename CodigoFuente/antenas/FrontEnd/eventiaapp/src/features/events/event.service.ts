import { Event, CreateEventPayload } from './types';

const API_URL = '/api'; // Apuntamos a nuestro Proxy de Next.js

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
    const res = await fetch(`${API_URL}/admin/events`, {
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

