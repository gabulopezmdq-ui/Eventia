import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/solicitudes-plantilla/listar?estado=P&idTipoEvento=4
// Proxies → GET /solicitudes_plantilla/listar?estado=P&idTipoEvento=4
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const params = new URLSearchParams();

        const estado = searchParams.get('estado');
        const idTipoEvento = searchParams.get('idTipoEvento');
        const idEvento = searchParams.get('idEvento');

        if (estado) params.set('estado', estado);
        if (idTipoEvento) params.set('idTipoEvento', idTipoEvento);
        if (idEvento) params.set('idEvento', idEvento);

        const queryString = params.toString() ? `?${params.toString()}` : '';

        const res = await fetch(`${API_URL}/solicitudes_plantilla/listar${queryString}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al listar solicitudes de plantilla', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (solicitudes_plantilla listar):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
