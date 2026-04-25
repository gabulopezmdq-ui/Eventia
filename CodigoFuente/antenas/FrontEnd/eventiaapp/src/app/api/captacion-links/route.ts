import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /evento_captacion_links/GetByEvento?idEvento={id}
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json({ message: 'idEvento requerido' }, { status: 400 });
        }

        const res = await fetch(
            `${API_URL}/evento_captacion_links/GetByEvento?idEvento=${idEvento}`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener campañas', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [captacion-links GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// POST /evento_captacion_links/Upsert?idEvento={id}
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json({ message: 'idEvento requerido' }, { status: 400 });
        }

        const body = await req.json();

        const res = await fetch(
            `${API_URL}/evento_captacion_links/Upsert?idEvento=${idEvento}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al guardar campaña', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [captacion-links POST]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
