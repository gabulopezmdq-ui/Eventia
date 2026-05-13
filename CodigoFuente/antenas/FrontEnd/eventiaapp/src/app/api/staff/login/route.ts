import { NextResponse } from 'next/server';

/**
 * @deprecated Este endpoint fue reemplazado por POST /api/staff/join
 * según el protocolo_comunicacion_staff.md.
 * Usar: POST /api/staff/join con body { codigo: string }
 */
export async function POST() {
    return NextResponse.json(
        {
            message: 'Endpoint deprecado. Usar POST /api/staff/join',
            migration: 'POST /api/staff/join',
        },
        { status: 410 }
    );
}
