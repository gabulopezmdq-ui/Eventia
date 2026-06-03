import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy para POST /mi-eventia/validar-recuperacion
 * Valida el código OTP de recuperación y retorna el token persistente de portal.
 *
 * Body esperado: { "token_recuperacion": "abc123xyz...", "codigo": "123456" }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${API_URL}/mi-eventia/validar-recuperacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Código de recuperación incorrecto o vencido', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy mi-eventia validar-recuperacion POST Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
