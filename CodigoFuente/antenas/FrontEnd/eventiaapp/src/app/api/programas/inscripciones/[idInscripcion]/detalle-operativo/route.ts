import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/programas/inscripciones/[idInscripcion]/detalle-operativo
 * Proxy para recuperar el desglose del panel Drawer
 */
export async function GET(
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

        // Query params
        const { searchParams } = new URL(request.url);

        const url = new URL(
            `${BACKEND_URL}/programas/inscripciones/${idInscripcion}/detalle-operativo`
        );

        // Copiamos query params (ej: idIdioma=1)
        searchParams.forEach((value, key) => {
            url.searchParams.append(key, value);
        });

        console.log('FINAL URL:', url.toString());

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                // IMPORTANTE:
                // Si tu cookie YA incluye "Bearer "
                // cambia esto por Authorization: token
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
        console.error('ERROR DETALLE OPERATIVO:', error);

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