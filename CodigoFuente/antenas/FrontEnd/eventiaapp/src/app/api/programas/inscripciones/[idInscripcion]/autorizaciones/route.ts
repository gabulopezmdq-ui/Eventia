import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/programas/inscripciones/[idInscripcion]/autorizaciones
 * Proxy para recuperar las autorizaciones legales de una inscripción
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idInscripcion: string }> }
) {
    try {
        const { idInscripcion } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);

        const url = new URL(
            `${BACKEND_URL}/programas/inscripciones/${idInscripcion}/autorizaciones`
        );
        searchParams.forEach((value, key) => url.searchParams.append(key, value));

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
