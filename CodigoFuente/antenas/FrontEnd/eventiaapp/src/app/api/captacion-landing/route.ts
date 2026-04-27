import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /evento_captacion_links/Landing?token={token}
// Esta ruta es pública (no requiere autenticación — la usa el asistente)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'token requerido' }, { status: 400 });
        }

        const res = await fetch(
            `${API_URL}/evento_captacion_links/Landing?token=${token}`,
            { method: 'GET' }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Landing no encontrada o expirada', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [captacion-landing GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
