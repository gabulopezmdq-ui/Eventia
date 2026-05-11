import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/eventos
 * Sirve para que el staff consulte sus eventos accesibles.
 * El backend valida los query params: staffId, cuentaId, unidades
 */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const urlParams = searchParams.toString();

        const res = await fetch(`${API_URL}/eventos?${urlParams}`, {
            headers: { Authorization: authHeader },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener eventos accesibles', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET /api/eventos]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
