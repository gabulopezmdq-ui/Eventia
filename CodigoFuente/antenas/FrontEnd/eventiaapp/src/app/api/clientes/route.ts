import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

// GET /clientes/MisClientes?soloActivos=true
export async function GET(req: Request) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const soloActivos = searchParams.get('soloActivos') ?? 'true';

        const res = await fetch(
            `${API_URL}/clientes/MisClientes?soloActivos=${soloActivos}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al obtener clientes', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [GET clientes]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// POST /clientes  →  Crear cliente
export async function POST(req: Request) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al crear cliente', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [POST clientes]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// PUT /clientes  →  Editar cliente
export async function PUT(req: Request) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        const res = await fetch(`${API_URL}/clientes`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al actualizar cliente', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT clientes]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
