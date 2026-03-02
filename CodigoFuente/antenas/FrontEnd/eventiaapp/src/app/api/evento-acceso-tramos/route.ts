import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Función helper para obtener el token desde la cookie
async function getAuthHeaders() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// POST /api/evento-acceso-tramos  → POST /evento_acceso_tramos
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const headers = await getAuthHeaders();

        if (!headers.Authorization) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const res = await fetch(`${API_BASE}/evento_acceso_tramos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al crear relación acceso-tramo', details: String(error) },
            { status: 500 }
        );
    }
}

// DELETE /api/evento-acceso-tramos?idAcceso=X&idTramo=Y  → DELETE /evento_acceso_tramos?idAcceso=X&idTramo=Y
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const idAcceso = searchParams.get('idAcceso');
        const idTramo = searchParams.get('idTramo');
        const headers = await getAuthHeaders();

        if (!headers.Authorization) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const res = await fetch(
            `${API_BASE}/evento_acceso_tramos?idAcceso=${idAcceso}&idTramo=${idTramo}`,
            {
                method: 'DELETE',
                headers: headers,
            }
        );

        if (res.status === 204 || res.ok) {
            // Algunos DELETE devuelven 200 con el item, otros vacío
            const text = await res.text();
            const data = text ? JSON.parse(text) : { ok: true };
            return NextResponse.json(data);
        }

        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(errorData, { status: res.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al eliminar relación acceso-tramo', details: String(error) },
            { status: 500 }
        );
    }
}
