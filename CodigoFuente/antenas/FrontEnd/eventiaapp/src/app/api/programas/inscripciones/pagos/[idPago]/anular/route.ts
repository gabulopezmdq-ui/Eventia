import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * PUT /api/programas/inscripciones/pagos/[idPago]/anular
 * → Proxy a: PUT {backend}/programas/inscripciones/pagos/{idPago}/anular
 *
 * Marca un pago como anulado. NO elimina físicamente.
 *
 * ⚠️ IMPORTANTE: el body es texto plano, NO JSON.
 * El frontend debe enviar: Content-Type: text/plain
 * Ejemplo de body: "Pago cargado por error."
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ idPago: string }> }
) {
    const { idPago } = await params;
    // Leer el body como texto plano (string con el motivo)
    const motivo = await request.text();

    const res = await fetch(
        `${BACKEND_URL}/programas/inscripciones/pagos/${idPago}/anular`,
        {
            method: 'PUT',
            headers: {
                Authorization: request.headers.get('Authorization') ?? '',
                'Content-Type': 'text/plain',
            },
            body: motivo,
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
