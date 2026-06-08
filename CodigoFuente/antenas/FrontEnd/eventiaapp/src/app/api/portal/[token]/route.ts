import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy público para GET /api/portal/{token}
 * Devuelve información básica y pública del evento/programa
 * (nombre, fechas, logo, estado) para renderizar la landing page inicial.
 * No requiere JWT — ruta completamente pública.
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const res = await fetch(`${API_URL}/evento_portal_config/full/${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Portal no encontrado o token inválido', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy portal GET Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
