import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /cuenta_eventos/mis-eventos
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const idCuenta = searchParams.get('idCuenta');

        const fetchUrl = idCuenta
            ? `${API_URL}/cuenta_eventos/mis-eventos?idCuenta=${idCuenta}`
            : `${API_URL}/cuenta_eventos/mis-eventos`;

        const res = await fetch(fetchUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener eventos de cuenta', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [cuenta-eventos]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
