import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/invitaciones/[token]/confirmar → POST /invitacion/{token}/confirmar
// Confirma asistencia RSVP del grupo
export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        if (!token) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
        }

        const body = await req.json();

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
            try { errorData = JSON.parse(errorText); } catch { errorData = errorText; }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : { success: true };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error POST /invitaciones/[token]/confirmar:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
