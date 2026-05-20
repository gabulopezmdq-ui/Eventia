import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/invitados/resumen-rsvp?token=TOKEN
// Obtiene el resumen de RSVP del grupo (incluyendo integrantes y sus qrToken)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
        }

        const res = await fetch(`${API_URL}/invitados/GetResumenRsvp?token=${token}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
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
        console.error('Proxy Error GET /invitados/resumen-rsvp:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
