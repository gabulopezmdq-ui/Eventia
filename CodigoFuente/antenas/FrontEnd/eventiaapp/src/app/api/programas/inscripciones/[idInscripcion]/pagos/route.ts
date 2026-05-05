import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * POST /api/programas/inscripciones/[idInscripcion]/pagos
 * Proxy a:
 * POST {backend}/programas/inscripciones/{idInscripcion}/pagos
 *
 * Registra un nuevo pago
 * (parcial o total)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ idInscripcion: string }> }
) {
    try {
        const { idInscripcion } = await params;

        // Token desde cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        console.log('========================');
        console.log('idInscripcion:', idInscripcion);
        console.log('TOKEN EXISTS:', !!token);
        console.log('========================');

        if (!token) {
            return NextResponse.json(
                {
                    message: 'No autorizado',
                },
                {
                    status: 401,
                }
            );
        }

        // Body request
        const body = await request.json();

        console.log('REQUEST BODY:', body);

        const url = `${BACKEND_URL}/programas/inscripciones/${idInscripcion}/pagos`;

        console.log('FINAL URL:', url);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                // IMPORTANTE:
                // Si la cookie ya incluye "Bearer "
                // usar:
                // Authorization: token
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('BACKEND STATUS:', res.status);

        // Evitamos romper si backend devuelve vacío
        const text = await res.text();

        console.log('BACKEND RESPONSE:', text);

        return new NextResponse(text, {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('ERROR PAGOS API:', error);

        return NextResponse.json(
            {
                message: 'Error interno del proxy',
            },
            {
                status: 500,
            }
        );
    }
}