import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * POST /api/programas/inscripciones/[idInscripcion]/ajustes
 * → Proxy a: POST {backend}/programas/inscripciones/{idInscripcion}/ajustes
 *
 * Registra un ajuste manual (descuento, bonificación o recargo).
 * Body esperado: AgregarAjusteRequest (JSON)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ idInscripcion: string }> }
) {
    const { idInscripcion } = await params;
    const body = await request.json();

    const res = await fetch(
        `${BACKEND_URL}/programas/inscripciones/${idInscripcion}/ajustes`,
        {
            method: 'POST',
            headers: {
                Authorization: request.headers.get('Authorization') ?? '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
