import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * GET /api/programas/inscripciones/[idInscripcion]/estado-pago
 * → Proxy a: GET {backend}/programas/inscripciones/{idInscripcion}/estado-pago?idIdioma=X
 *
 * Devuelve el detalle completo de la inscripción: períodos, servicios,
 * ajustes, pagos y resumen financiero actualizado.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idInscripcion: string }> }
) {
    const { idInscripcion } = await params;
    const { searchParams } = new URL(request.url);
    const idIdioma = searchParams.get('idIdioma') ?? '3';

    const res = await fetch(
        `${BACKEND_URL}/programas/inscripciones/${idInscripcion}/estado-pago?idIdioma=${idIdioma}`,
        {
            headers: {
                Authorization: request.headers.get('Authorization') ?? '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
