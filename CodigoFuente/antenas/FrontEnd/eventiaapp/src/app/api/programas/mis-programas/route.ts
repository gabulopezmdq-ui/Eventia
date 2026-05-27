import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
            ? `${API_URL}/programas/mis-programas?idCuenta=${idCuenta}`
            : `${API_URL}/programas/mis-programas`;

        const res = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { message: 'Error en la API de backend' },
                { status: res.status }
            );
        }

        const data = await res.json();

        // El backend ya devuelve snake_case — pasamos la data tal cual
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
