import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/staff/login
 * Autentica al staff con su código de 8 caracteres.
 * No requiere sesión de admin (endpoint público).
 * Devuelve { token: string }.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json(); // { codigo: string }

        const res = await fetch(`${API_URL}/staff/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Código inválido o expirado', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST /api/staff/login]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
