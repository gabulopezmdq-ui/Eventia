import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

type Params = { params: Promise<{ id_cuenta: string; id_staff: string }> };

/**
 * PUT /api/cuenta/:id_cuenta/staff/:id_staff/renovar
 * Renueva la vigencia de un miembro del staff (cambia fecha_expiracion).
 * → Backend: PUT /cuenta/{id_cuenta}/staff/{id_staff}/renovar
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 * Body: { fecha_expiracion }
 */
export async function PUT(req: Request, { params }: Params) {
    try {
        const { id_cuenta, id_staff } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/cuenta/${id_cuenta}/staff/${id_staff}/renovar`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: `Error al renovar vigencia del staff #${id_staff}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT /api/cuenta/:id_cuenta/staff/:id_staff/renovar]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
