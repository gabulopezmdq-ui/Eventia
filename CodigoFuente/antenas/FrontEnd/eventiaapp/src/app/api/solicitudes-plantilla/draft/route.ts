import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');
        const motivo = searchParams.get('motivo');

        if (!idEvento || !motivo) {
            return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
        }

        const res = await fetch(`${API_URL}/solicitudes_plantilla/draft?idEvento=${idEvento}&motivo=${motivo}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al iniciar draft', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (solicitudes_plantilla draft):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
