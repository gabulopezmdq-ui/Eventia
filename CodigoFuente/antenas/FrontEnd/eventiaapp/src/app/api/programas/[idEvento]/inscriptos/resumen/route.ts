import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/programas/[idEvento]/inscriptos/resumen
 * Proxy para traer los KPIs desde el backend
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idEvento: string }> }
) {
    try {
        // Params dinámicos
        const { idEvento } = await params;

        // Cookies
        const cookieStore = await cookies();

        // Token
        const token = cookieStore.get('access_token')?.value;

        // Logs de debug
        console.log('========================');
        console.log('ALL COOKIES:', cookieStore.getAll());
        console.log('TOKEN:', token);
        console.log('idEvento:', idEvento);
        console.log('========================');

        // Validamos token
        if (!token) {
            return NextResponse.json(
                {
                    message: 'No autorizado - token inexistente',
                },
                {
                    status: 401,
                }
            );
        }

        // URL backend
        const url = `${BACKEND_URL}/programas/${idEvento}/inscriptos/resumen`;

        console.log('RESUMEN URL:', url);

        // Request backend
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        console.log('BACKEND STATUS:', res.status);

        // Evitamos crashes si backend devuelve vacío
        const text = await res.text();

        console.log('BACKEND RESPONSE:', text);

        return new NextResponse(text, {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('ERROR RESUMEN API:', error);

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