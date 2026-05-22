import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

/**
 * POST /api/eventos/[id]/staff/desde-cuenta
 * Asigna un staff desde la cuenta al evento.
 * → Backend: POST /eventos/{id}/staff/desde-cuenta
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getAdminToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const idIdioma = searchParams.get('idIdioma') ?? '1';
        const body = await req.json();

        const res = await fetch(`${API_URL}/eventos/${id}/staff/desde-cuenta?idIdioma=${idIdioma}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al asignar staff desde cuenta', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST /api/eventos/[id]/staff/desde-cuenta]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
