import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy público para GET /programas/inscripcion/{token}?idIdioma={n}
 * Sin autenticación — ruta pública accesible por cualquier usuario.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const { searchParams } = new URL(req.url);
        const idIdioma = searchParams.get('idIdioma') ?? '3';

        const res = await fetch(
            `${API_URL}/programas/inscripcion/${token}?idIdioma=${idIdioma}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Programa no encontrado o token inválido', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy inscripcion GET Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
