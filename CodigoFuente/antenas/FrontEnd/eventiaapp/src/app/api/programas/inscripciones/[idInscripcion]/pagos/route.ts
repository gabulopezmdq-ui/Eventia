import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * POST /api/programas/inscripciones/[idInscripcion]/pagos
 * → Proxy a: POST {backend}/programas/inscripciones/{idInscripcion}/pagos
 *
 * Registra un nuevo pago (parcial o total) contra la inscripción.
 * Body esperado: RegistrarPagoRequest (JSON)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ idInscripcion: string }> }
) {
    const { idInscripcion } = await params;
    const body = await request.json();

    const res = await fetch(
        `${BACKEND_URL}/programas/inscripciones/${idInscripcion}/pagos`,
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
