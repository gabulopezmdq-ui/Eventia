import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/invitaciones/[token] → GET /invitacion/{token}
// Obtiene toda la información de la invitación personal (grupo, agenda, cupos, personas)
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        if (!token) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
        }

        const res = await fetch(`${API_URL}/invitacion/${token}`, {
            method: 'GET',
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
        // ─── LOG SERVIDOR: ver en la terminal de Next.js (no en el browser) ───
        console.log(`--- RAW RESPUESTA BACKEND (GET /invitacion/${token}) ---`);
        console.log('Keys del objeto raíz:', Object.keys(data));
        console.log('idEvento:', data.idEvento, '| id_evento:', data.id_evento, '| idGrupo:', data.idGrupo);
        console.dir(data, { depth: null });
        // ─── Normalizar: si el backend devuelve id_evento en lugar de idEvento ───
        const normalized = {
            ...data,
            idEvento: data.idEvento ?? data.id_evento ?? data.eventoId ?? null,
        };
        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Proxy Error GET /invitaciones/[token]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
