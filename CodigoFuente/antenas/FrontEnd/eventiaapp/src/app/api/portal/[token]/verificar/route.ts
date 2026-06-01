import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy para POST /api/portal/{token}/verificar  (Soft Verification)
 * Recibe el email del responsable y lo contrasta con el registrado en la inscripción.
 * Si coincide: registra el intento en portal_verificacion y devuelve un JWT de 24h.
 * Si no coincide: devuelve 401 Unauthorized.
 *
 * Body esperado: { "email": "responsable@example.com" }
 * Respuesta OK:  { "token": "<jwt>" }
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await req.json();

        const res = await fetch(`${API_URL}/api/portal/${token}/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Email incorrecto o verificación fallida', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy portal verificar POST Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
