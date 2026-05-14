import { NextResponse } from 'next/server';

/**
 * @deprecated Este endpoint fue reemplazado.
 *
 * Para LISTAR staff de una cuenta:  GET  /api/cuenta/:id_cuenta/staff
 * Para CREAR (invitar) nuevo staff: POST /api/cuenta/:id_cuenta/staff
 *
 * según el protocolo_comunicacion_staff.md.
 */
export async function GET() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar GET /api/cuenta/:id_cuenta/staff',
            migration: 'GET /api/cuenta/:id_cuenta/staff',
        },
        { status: 410 }
    );
}

export async function POST() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar POST /api/cuenta/:id_cuenta/staff',
            migration: 'POST /api/cuenta/:id_cuenta/staff',
        },
        { status: 410 }
    );
}
