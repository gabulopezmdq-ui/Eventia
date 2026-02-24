import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const res = await fetch(`${API_URL}/plantillas_evento/${id}/Detalle`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener detalle de plantilla', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (plantilla detalle):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
