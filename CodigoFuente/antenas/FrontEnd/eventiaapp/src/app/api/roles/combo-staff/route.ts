import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

/**
 * GET /api/roles/combo-staff
 * Obtiene los roles de staff permitidos desde el backend.
 * → Backend: GET /roles/combo-staff
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 */
export async function GET(req: Request) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const idIdioma = searchParams.get('idIdioma') ?? '1';
        const tipoOperacion = searchParams.get('tipoOperacion') ?? 'EVENTO';

        const res = await fetch(`${API_URL}/roles/combo-staff?idIdioma=${idIdioma}&tipoOperacion=${tipoOperacion}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener roles de combo staff', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/roles/combo-staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
