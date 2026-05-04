import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * GET /api/programas/[idEvento]/inscripciones/pagos
 * → Proxy a: GET {backend}/programas/{idEvento}/inscripciones/pagos
 *
 * Devuelve el listado de todas las inscripciones con su resumen financiero.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idEvento: string }> }
) {
    const { idEvento } = await params;

    const res = await fetch(
        `${BACKEND_URL}/programas/${idEvento}/inscripciones/pagos`,
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
