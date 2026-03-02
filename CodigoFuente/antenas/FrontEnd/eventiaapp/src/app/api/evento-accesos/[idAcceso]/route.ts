import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ idAcceso: string }> }
) {
    try {
        const { idAcceso } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();

        const res = await fetch(`${API_URL}/evento_accesos/${idAcceso}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al actualizar acceso', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (evento_accesos PUT):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
