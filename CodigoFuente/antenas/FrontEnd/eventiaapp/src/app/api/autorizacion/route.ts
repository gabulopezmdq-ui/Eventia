import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/autorizacion
 * Proxy para crear manualmente una autorización de retiro desde el Backoffice (Operador)
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const url = `${BACKEND_URL}/autorizacion`;
        console.log('PROXY [POST AUTORIZACION BACKOFFICE]:', url, body);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('ERROR PROXY POST AUTORIZACION OPERADOR:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
