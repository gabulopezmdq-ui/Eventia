import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/evento-addons?idEvento={id}
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idEvento = request.nextUrl.searchParams.get('idEvento');
        if (!idEvento) return NextResponse.json({ message: 'idEvento es requerido' }, { status: 400 });

        const res = await fetch(`${API_URL}/evento_addons/GetByEvento?idEvento=${idEvento}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            return NextResponse.json({ message: 'Error al obtener addons del evento' }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// POST /api/evento-addons?idEvento={id}
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idEvento = request.nextUrl.searchParams.get('idEvento');
        if (!idEvento) return NextResponse.json({ message: 'idEvento es requerido' }, { status: 400 });

        const body = await request.json(); // { id_addon, mercado, moneda }

        const res = await fetch(`${API_URL}/evento_addons/Solicitar?idEvento=${idEvento}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ message: errorText || 'Error al solicitar el addon' }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
