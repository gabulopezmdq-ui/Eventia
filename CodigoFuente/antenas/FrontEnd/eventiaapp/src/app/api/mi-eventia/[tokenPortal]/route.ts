import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy público para GET /mi-eventia/{tokenPortal}
 * Devuelve la persona y la lista de todos sus accesos (items)
 * agrupados por el tokenPortal (GUID persistente).
 * Sin autenticación — el GUID actúa como credencial.
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ tokenPortal: string }> }
) {
    try {
        const { tokenPortal } = await params;

        const res = await fetch(`${API_URL}/mi-eventia/${tokenPortal}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Portal persistente no encontrado o token inválido', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy mi-eventia GET Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
