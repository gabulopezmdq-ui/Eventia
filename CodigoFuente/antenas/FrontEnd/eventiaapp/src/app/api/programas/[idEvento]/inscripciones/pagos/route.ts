import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/programas/[idEvento]/inscripciones/pagos
 * Proxy a:
 * GET {backend}/programas/{idEvento}/inscripciones/pagos
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idEvento: string }> }
) {
    try {
        const { idEvento } = await params;

        // Token desde cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        console.log('========================');
        console.log('idEvento:', idEvento);
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

        const url = `${BACKEND_URL}/programas/${idEvento}/inscripciones/pagos`;

        console.log('FINAL URL:', url);

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                // Si tu cookie ya incluye "Bearer "
                // cambia esto por:
                // Authorization: token
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        console.log('BACKEND STATUS:', res.status);

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