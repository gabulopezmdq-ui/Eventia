import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PUT /api/solicitudes-plantilla/[id]/revisar
// Proxies → PUT /solicitudes_plantilla/{id}/revisar
// Body: { "estado": "R", "observaciones_admin": "..." }
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const res = await fetch(`${API_URL}/solicitudes_plantilla/${id}/revisar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al revisar solicitud', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (solicitudes_plantilla revisar):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
