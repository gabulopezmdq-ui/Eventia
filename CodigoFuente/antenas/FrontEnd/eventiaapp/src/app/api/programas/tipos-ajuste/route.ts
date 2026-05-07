import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/programas/tipos-ajuste
 * Proxy a:
 * GET {backend}/programas/tipos-ajuste?idIdioma=X
 *
 * Devuelve el catálogo de tipos de ajuste
 * para el modal "Agregar Ajuste"
 */
export async function GET(request: NextRequest) {
    try {
        // Token desde cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        console.log('========================');
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

        // Query params
        const { searchParams } = new URL(request.url);

        const idIdioma = searchParams.get('idIdioma') ?? '3';

        const url = `${BACKEND_URL}/programas/tipos-ajuste?idIdioma=${idIdioma}`;

        console.log('FINAL URL:', url);

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                // IMPORTANTE:
                // Si tu cookie ya incluye "Bearer "
                // usar:
                // Authorization: token
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
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
        console.error('ERROR TIPOS AJUSTE API:', error);

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