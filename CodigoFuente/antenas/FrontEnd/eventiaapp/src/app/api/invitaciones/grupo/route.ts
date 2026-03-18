import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/invitaciones/grupo → Crear grupo de invitados manualmente
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('access_token')?.value;

        if (!authToken) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();

        const res = await fetch(`${API_URL}/invitacion/grupo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = errorText;
            }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : { success: true };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error POST /invitaciones/grupo:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
