import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

/**
 * POST /api/staff
 * Crea un nuevo integrante de staff.
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 * Devuelve { id_staff, codigo, activo, fecha_expiracion }.
 * ⚠ El campo `codigo` sólo está disponible en esta respuesta.
 */
export async function POST(req: Request) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/staff`, {
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
                { message: 'Error al crear el staff', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json(), { status: 201 });
    } catch (error) {
        console.error('Proxy Error [POST /api/staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
