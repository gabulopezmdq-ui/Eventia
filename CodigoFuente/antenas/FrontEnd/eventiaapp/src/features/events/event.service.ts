import { Event, CreateEventPayload } from './types';

const API_URL = 'https://eventia-kg28.onrender.com';

export async function getAllEvents(): Promise<Event[]> {
    const res = await fetch(`${API_URL}/eventos/getall`, {
        method: 'GET',
        credentials: 'include', // IMPORTANTE (cookies)
    });

    if (!res.ok) {
        throw new Error('Error al obtener los eventos');
    }

    return res.json();
}

export async function createEvent(
    payload: CreateEventPayload
): Promise<Event> {
    const res = await fetch(`${API_URL}/eventos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Error al crear el evento');
    }

    return res.json();
}
