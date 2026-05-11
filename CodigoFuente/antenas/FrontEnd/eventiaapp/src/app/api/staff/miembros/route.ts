import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

/**
 * GET /api/staff/miembros?eventoId=XX
 * Devuelve los staff con acceso a un evento específico.
 */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        const staffToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const adminToken = staffToken ? null : await getAdminToken();
        const token = staffToken ?? adminToken;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const eventoId = searchParams.get('eventoId');

        if (!eventoId) {
            return NextResponse.json({ message: 'eventoId requerido' }, { status: 400 });
        }

        const res = await fetch(`${API_URL}/staff/miembros?eventoId=${eventoId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener miembros del evento', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/staff/miembros]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
