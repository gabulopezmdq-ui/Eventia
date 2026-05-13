import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

type Params = { params: Promise<{ id_cuenta: string }> };

/**
 * GET /api/cuenta/:id_cuenta/staff
 * Devuelve la lista de todo el staff vinculado a la cuenta con sus códigos y estado.
 * → Backend: GET /cuenta/{id_cuenta}/staff
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { id_cuenta } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/cuenta/${id_cuenta}/staff`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener el staff de la cuenta', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/cuenta/:id_cuenta/staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

/**
 * POST /api/cuenta/:id_cuenta/staff
 * Genera una nueva invitación de staff. El backend devuelve un código único.
 * → Backend: POST /cuenta/{id_cuenta}/staff
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 * Body: { id_rol, nombre, apellido, email, telefono?, fecha_expiracion, id_unidades }
 * Respuesta: { id_staff, codigo, nombre, apellido, fecha_expiracion }
 * ⚠ El campo `codigo` solo está disponible en esta respuesta. Mostrarlo al admin.
 */
export async function POST(req: Request, { params }: Params) {
    try {
        const { id_cuenta } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/cuenta/${id_cuenta}/staff`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al invitar al integrante de staff', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json(), { status: 200 });
    } catch (error) {
        console.error('Proxy Error [POST /api/cuenta/:id_cuenta/staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
