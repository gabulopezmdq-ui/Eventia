import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

type Params = { params: Promise<{ id_cuenta: string }> };

/**
 * GET /api/staff/unidades/:id_cuenta
 * Si se llama con token de ACCOUNT_ADMIN, devuelve la lista completa de
 * staff y sus unidades para esa cuenta.
 * Si el staff llama a esto post-login (con su JWT), el backend puede
 * detectar su id y devolver solo sus unidades. El endpoint backend
 * maneja esto en base al sub del JWT.
 */
export async function GET(req: Request, { params }: Params) {
    try {
        const { id_cuenta } = await params;
        
        // Prioridad: Bearer del staff → cookie del admin
        const authHeader = req.headers.get('Authorization');
        const staffToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const adminToken = staffToken ? null : await getAdminToken();
        const token = staffToken ?? adminToken;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/staff/unidades/${id_cuenta}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener listado de unidades', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/staff/unidades/:id_cuenta]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
