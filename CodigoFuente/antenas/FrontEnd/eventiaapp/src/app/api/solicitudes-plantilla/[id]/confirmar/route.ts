import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/solicitudes-plantilla/[id]/confirmar
// Proxies → POST /solicitudes_plantilla/{id}/confirmar
// Cambia el estado de la solicitud de D (Draft) a P (Pendiente)
export async function POST(
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

        const res = await fetch(`${API_URL}/solicitudes_plantilla/${id}/confirmar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al confirmar solicitud', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (solicitudes_plantilla confirmar):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
