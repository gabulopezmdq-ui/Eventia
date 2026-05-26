import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy público para POST /programas/inscripcion/{token}/cotizar
 * Sin autenticación. Recibe el payload completo de inscripción
 * y obtiene la cotización oficial en tiempo real desde el backend.
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await req.json();

        const res = await fetch(`${API_URL}/programas/inscripcion/${token}/cotizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const rawBody = await res.text().catch(() => '');
            console.error('Backend Cotizar Error raw response:', rawBody);
            let errorDetails = {};
            try {
                errorDetails = JSON.parse(rawBody);
            } catch (e) {
                errorDetails = { rawText: rawBody };
            }

            return NextResponse.json(
                { message: 'Error al cotizar la inscripción', details: errorDetails },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy cotizar POST Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
