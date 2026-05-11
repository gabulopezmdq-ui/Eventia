import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/eventos/:id/checkin
 * Registra presencia del staff en el evento.
 */
export async function POST(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const authHeader = req.headers.get('Authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
        }

        const res = await fetch(`${API_URL}/eventos/${id}/checkin`, {
            method: 'POST',
            headers: { Authorization: authHeader },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al registrar check-in', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST /api/eventos/:id/checkin]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
