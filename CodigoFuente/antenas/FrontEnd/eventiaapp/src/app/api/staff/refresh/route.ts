import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/staff/refresh
 * Renueva el JWT del staff antes de que expire.
 * Requiere el token actual en el header Authorization: Bearer <token>.
 * Devuelve { token: string } con un nuevo JWT (12 h).
 */
export async function POST(req: Request) {
    try {
        const authorization = req.headers.get('Authorization');

        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Token de staff requerido' }, { status: 401 });
        }

        const res = await fetch(`${API_URL}/staff/refresh`, {
            method: 'POST',
            headers: { Authorization: authorization },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'No se pudo renovar la sesión', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST /api/staff/refresh]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
