import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/invitaciones/datos?token={token} -> Obtiene datos de la invitación antes de confirmar
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Missing token' }, { status: 400 });
        }

        // Backend expects: GET /invitacion/DatosInvitacion/{token}
        const res = await fetch(`${API_URL}/invitacion/DatosInvitacion/${token}`, {
            method: 'GET'
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
        console.error('Proxy Error GET /invitaciones/datos:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
