import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

type Params = { params: Promise<{ id_cuenta: string; id_staff: string }> };

/**
 * GET /api/cuenta/:id_cuenta/staff/:id_staff
 * Obtiene el detalle de un miembro del staff.
 * → Backend: GET /cuenta/{id_cuenta}/staff/{id_staff}
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { id_cuenta, id_staff } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/cuenta/${id_cuenta}/staff/${id_staff}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: `Error al obtener detalles del staff #${id_staff}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/cuenta/:id_cuenta/staff/:id_staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

/**
 * PUT /api/cuenta/:id_cuenta/staff/:id_staff
 * Modifica los datos de un miembro del staff.
 * → Backend: PUT /cuenta/{id_cuenta}/staff/{id_staff}
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 */
export async function PUT(req: Request, { params }: Params) {
    try {
        const { id_cuenta, id_staff } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/cuenta/${id_cuenta}/staff/${id_staff}`, {
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
                { message: `Error al actualizar datos del staff #${id_staff}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT /api/cuenta/:id_cuenta/staff/:id_staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

/**
 * DELETE /api/cuenta/:id_cuenta/staff/:id_staff
 * Revoca el acceso de un miembro del staff: desactiva el código y el JWT.
 * → Backend: DELETE /cuenta/{id_cuenta}/staff/{id_staff}
 * Permisos: ACCOUNT_ADMIN (token en cookie 'access_token').
 * Respuesta: { ok: true }
 */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { id_cuenta, id_staff } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/cuenta/${id_cuenta}/staff/${id_staff}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: `Error al revocar acceso del staff #${id_staff}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [DELETE /api/cuenta/:id_cuenta/staff/:id_staff]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
