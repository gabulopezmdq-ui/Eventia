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
        idEventoUsuario: string;
    }>;
};

/**
 * PUT /api/eventos/[id]/equipo/[idEventoUsuario]
 * Actualiza el estado de un miembro del equipo interno.
 * → Backend: PUT /eventos/{id}/equipo/{idEventoUsuario}
 * 
 * DELETE /api/eventos/[id]/equipo/[idEventoUsuario]
 * Elimina un miembro del equipo interno.
 * → Backend: DELETE /eventos/{id}/equipo/{idEventoUsuario}
 */
export async function PUT(req: Request, { params }: Params) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { id, idEventoUsuario } = await params;
        const body = await req.json();

        const res = await fetch(`${API_URL}/eventos/${id}/equipo/${idEventoUsuario}`, {
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
                { message: 'Error al actualizar miembro del equipo', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT /api/eventos/[id]/equipo/[idEventoUsuario]]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: Params) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { id, idEventoUsuario } = await params;

        const res = await fetch(`${API_URL}/eventos/${id}/equipo/${idEventoUsuario}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al eliminar miembro del equipo', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [DELETE /api/eventos/[id]/equipo/[idEventoUsuario]]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
