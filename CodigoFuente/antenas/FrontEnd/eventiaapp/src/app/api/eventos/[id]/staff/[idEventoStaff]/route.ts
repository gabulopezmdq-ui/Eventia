import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

type Params = {
    params: Promise<{
        id: string;
        idEventoStaff: string;
    }>;
};

/**
 * PUT /api/eventos/[id]/staff/[idEventoStaff]
 * Actualiza el estado de una asignación de staff operativo.
 * → Backend: PUT /eventos/{id}/staff/{idEventoStaff}
 * 
 * DELETE /api/eventos/[id]/staff/[idEventoStaff]
 * Elimina una asignación de staff operativo.
 * → Backend: DELETE /eventos/{id}/staff/{idEventoStaff}
 */
export async function PUT(req: Request, { params }: Params) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { id, idEventoStaff } = await params;
        const body = await req.json();

        const res = await fetch(`${API_URL}/eventos/${id}/staff/${idEventoStaff}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al actualizar asignación de staff', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT /api/eventos/[id]/staff/[idEventoStaff]]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: Params) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { id, idEventoStaff } = await params;

        const res = await fetch(`${API_URL}/eventos/${id}/staff/${idEventoStaff}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al eliminar asignación de staff', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [DELETE /api/eventos/[id]/staff/[idEventoStaff]]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
