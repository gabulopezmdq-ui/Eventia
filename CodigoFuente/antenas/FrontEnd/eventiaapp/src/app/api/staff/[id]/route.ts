import { NextResponse } from 'next/server';

/**
 * @deprecated Este endpoint fue reemplazado.
 * Para eliminar staff de una cuenta usar:
 * DELETE /api/cuenta/:id_cuenta/staff/:id_staff
 * según el protocolo_comunicacion_staff.md.
 */
export async function GET() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar las rutas bajo /api/cuenta/:id_cuenta/staff',
            migration: 'DELETE /api/cuenta/:id_cuenta/staff/:id_staff',
        },
        { status: 410 }
    );
}

export async function PUT() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar las rutas bajo /api/cuenta/:id_cuenta/staff',
            migration: 'DELETE /api/cuenta/:id_cuenta/staff/:id_staff',
        },
        { status: 410 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar DELETE /api/cuenta/:id_cuenta/staff/:id_staff',
            migration: 'DELETE /api/cuenta/:id_cuenta/staff/:id_staff',
        },
        { status: 410 }
    );
}

export async function PATCH() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar las rutas bajo /api/cuenta/:id_cuenta/staff',
            migration: 'DELETE /api/cuenta/:id_cuenta/staff/:id_staff',
        },
        { status: 410 }
    );
}
