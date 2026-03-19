import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Missing token' }, { status: 400 });
        }

        const body = await req.json();

        // El backend espera la nueva estructura recibiendo el token en la URL:
        // POST /invitacion/{token}/confirmar
        // Body: { "mensajeGrupo": "...", "personas": [ ... ] }

        // Guest endpoint, no need for access_token cookie
        const res = await fetch(`${API_URL}/invitacion/${token}/confirmar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
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
        console.error('Proxy Error /invitaciones/confirmar:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
