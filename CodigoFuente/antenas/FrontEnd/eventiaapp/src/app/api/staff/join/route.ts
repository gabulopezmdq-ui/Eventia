import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/staff/join
 * El empleado usa su código para acceder a la app. No requiere sesión previa.
 * → Backend: POST /staff/join
 * Auth: Anónimo (sin token previo).
 * Body: { codigo: string }
 * Respuesta: {
 *   id_staff, id_cuenta, id_evento, nombre, apellido,
 *   rol_codigo, unidades: [{ id_unidad, nombre }],
 *   access_token, expires_at_utc
 * }
 * ⚠ Guardar access_token en localStorage para las llamadas siguientes.
 * ⚠ Las unidades ya vienen incluidas — no es necesario un segundo fetch.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json(); // { codigo: string }

        const res = await fetch(`${API_URL}/staff/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Código inválido o expirado', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST /api/staff/join]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
