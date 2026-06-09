import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(
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

        const body = await request.json();

        const res = await fetch(`${API_URL}/eventos/${id}/anular`, {
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
                { message: 'Error al anular el evento', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => ({ ok: true }));
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (anular PUT):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
