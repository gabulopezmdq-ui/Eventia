import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * PUT /api/programas/inscripciones/pagos/[idPago]/anular
 * Proxy a:
 * PUT {backend}/programas/inscripciones/pagos/{idPago}/anular
 *
 * Marca un pago como anulado (soft delete)
 *
 * IMPORTANTE:
 * El body es texto plano (text/plain)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ idPago: string }> }
) {
    try {
        const { idPago } = await params;

        // Token desde cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        console.log('========================');
        console.log('idPago:', idPago);
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

        // Body texto plano
        let motivo = await request.text();
        // Si ya viene como string JSON, lo parseamos para no stringificar doble
        try {
            const parsed = JSON.parse(motivo);
            if (typeof parsed === 'string') motivo = parsed;
        } catch (e) {
            // Ignorar, ya es texto
        }

        console.log('MOTIVO:', motivo);

        const url = `${BACKEND_URL}/programas/inscripciones/pagos/${idPago}/anular`;

        console.log('FINAL URL:', url);

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                // IMPORTANTE:
                // Si tu cookie ya incluye "Bearer "
                // usar:
                // Authorization: token
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(motivo),
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
        console.error('ERROR ANULAR PAGO API:', error);

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