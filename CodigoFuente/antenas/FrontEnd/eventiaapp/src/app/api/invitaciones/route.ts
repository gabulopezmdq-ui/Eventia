import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/invitaciones?idEvento=15 → listado de invitados del evento
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('access_token')?.value;

        if (!authToken) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json({ message: 'Falta idEvento' }, { status: 400 });
        }

        const res = await fetch(`${API_URL}/invitacion/Invitados?idEvento=${idEvento}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
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
        // Map backend field `token` → `rsvpToken` expected by the frontend types
        const mapped = Array.isArray(data)
            ? data.map((inv: Record<string, unknown>) => ({ ...inv, rsvpToken: inv.token ?? inv.rsvpToken }))
            : data;
        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Proxy Error GET /invitaciones:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
