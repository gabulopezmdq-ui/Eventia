import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/cuentas/[idCuenta]/plan-cambios/pendiente
export async function GET(req: Request, { params }: { params: Promise<{ idCuenta: string }> }) {
    try {
        const { idCuenta } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const res = await fetch(`${API_URL}/cuentas/${idCuenta}/plan-cambios/pendiente`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al verificar solicitud pendiente', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/cuentas/[idCuenta]/plan-cambios/pendiente]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
