import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy público para POST /programas/inscripcion/confirmar
 * Recibe el InscripcionPayload completo armado por el frontend
 * y lo reenvía al backend. Sin autenticación.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // El backend espera el token en la URL: POST /programas/inscripcion/{token}/confirmar
        const res = await fetch(`${API_URL}/programas/inscripcion/${body.token}/confirmar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al confirmar la inscripción', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy inscripcion confirmar POST Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
