import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

// GET /cuenta_unidades/MisUnidades?soloActivas=true
export async function GET(req: Request) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const soloActivas = searchParams.get('soloActivas') ?? 'true';

        const res = await fetch(
            `${API_URL}/cuenta_unidades/MisUnidades?soloActivas=${soloActivas}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al obtener unidades', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET cuenta-unidades]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// POST /cuenta_unidades  →  Crear unidad
export async function POST(req: Request) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/cuenta_unidades`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al crear unidad', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST cuenta-unidades]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// PUT /cuenta_unidades  →  Editar unidad
export async function PUT(req: Request) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/cuenta_unidades`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al actualizar unidad', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT cuenta-unidades]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
