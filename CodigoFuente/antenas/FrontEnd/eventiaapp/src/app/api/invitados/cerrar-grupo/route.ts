import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/invitados/cerrar-grupo?token=TOKEN
// Cierra el grupo RSVP (el titular indica que no agregará más acompañantes)
export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
        }

        const body = await req.json();

        const res = await fetch(`${API_URL}/invitados/CerrarGrupoRsvp?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try { errorData = JSON.parse(errorText); } catch { errorData = errorText; }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error POST /api/invitados/cerrar-grupo:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
