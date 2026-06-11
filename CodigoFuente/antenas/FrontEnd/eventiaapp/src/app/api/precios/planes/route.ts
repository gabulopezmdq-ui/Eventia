import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/precios/planes?tipo=B2B&mercado={mercado}
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get('tipo') || 'B2B';
        const mercado = searchParams.get('mercado') || 'AR';

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/precios/planes?tipo=${tipo}&mercado=${mercado}`, {
            method: 'GET',
            headers
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener planes disponibles', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/precios/planes]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
