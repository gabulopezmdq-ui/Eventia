import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy para POST /mi-eventia/recuperar
 * Inicia la solicitud de recuperación de accesos enviando un enlace/código al Email.
 *
 * Body esperado: { "email": "responsable@example.com", "telefono": null, "canal": "EMAIL" }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${API_URL}/mi-eventia/recuperar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al procesar la solicitud de recuperación', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy mi-eventia recuperar POST Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
