import { NextResponse } from 'next/server';

/**
 * @deprecated Este endpoint fue reemplazado.
 * Las unidades del staff ya vienen incluidas en la respuesta de POST /api/staff/join.
 * No es necesario un segundo fetch para obtenerlas.
 * según el protocolo_comunicacion_staff.md.
 */
export async function GET() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Las unidades se obtienen directamente desde POST /api/staff/join',
            migration: 'POST /api/staff/join → campo `unidades` en la respuesta',
        },
        { status: 410 }
    );
}
