import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

/**
 * GET /api/programas
 * Sirve para que el staff consulte sus programas accesibles, o para listado general.
 */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        const staffToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const adminToken = staffToken ? null : await getAdminToken();
        const token = staffToken ?? adminToken;

        if (!token) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const urlParams = searchParams.toString();

        const res = await fetch(`${API_URL}/programas?${urlParams}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener programas', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/programas]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
