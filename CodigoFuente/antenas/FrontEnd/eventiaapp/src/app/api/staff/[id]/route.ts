import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

/**
 * Extrae el Bearer token del staff desde el header Authorization del request.
 * Se usa en PATCH para permitir que el propio staff cambie su disponibilidad.
 */
function getStaffTokenFromHeader(req: Request): string | null {
    const auth = req.headers.get('Authorization');
    return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/staff/:id
 * Detalle de un integrante de staff con sus unidades.
 * Permisos: ACCOUNT_ADMIN.
 */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/staff/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: `Error al obtener staff #${id}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/staff/:id]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

/**
 * PUT /api/staff/:id
 * Actualiza datos personales y/o unidades de un integrante de staff.
 * Permisos: ACCOUNT_ADMIN.
 */
export async function PUT(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/staff/${id}`, {
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
                { message: `Error al actualizar staff #${id}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT /api/staff/:id]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

/**
 * DELETE /api/staff/:id
 * Desactiva (soft-delete) un integrante de staff y elimina sus unidades.
 * Permisos: ACCOUNT_ADMIN.
 */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/staff/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: `Error al desactivar staff #${id}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [DELETE /api/staff/:id]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

/**
 * PATCH /api/staff/:id
 * Cambia disponibilidad o expiración.
 * Puede ser invocado por:
 *   · El propio staff → envía su JWT en el header Authorization.
 *   · El admin → usa la cookie 'access_token'.
 */
export async function PATCH(req: Request, { params }: Params) {
    try {
        const { id } = await params;

        // Prioridad: Bearer del staff → cookie del admin
        const staffToken = getStaffTokenFromHeader(req);
        const adminToken = staffToken ? null : await getAdminToken();
        const token = staffToken ?? adminToken;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/staff/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: `Error al actualizar disponibilidad de staff #${id}`, details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PATCH /api/staff/:id]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
