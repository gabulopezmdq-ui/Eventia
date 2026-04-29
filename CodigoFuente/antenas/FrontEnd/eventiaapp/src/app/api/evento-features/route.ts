import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /evento-features?idEvento={id}
// PUT /evento-features?idEvento={id} (body: string[]) -> Mapea a SetActivosBulk
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idEvento = request.nextUrl.searchParams.get('idEvento');
        if (!idEvento) return NextResponse.json({ message: 'idEvento es requerido' }, { status: 400 });

        const res = await fetch(`${API_URL}/evento_features/GetByEvento?idEvento=${idEvento}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return NextResponse.json({ message: 'Error' }, { status: res.status });

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idEvento = request.nextUrl.searchParams.get('idEvento');
        if (!idEvento) return NextResponse.json({ message: 'idEvento es requerido' }, { status: 400 });

        const body = await request.json(); // array de códigos de feature [ 'REGALOS', 'MUSICA' ]

        const res = await fetch(`${API_URL}/evento_features/SetActivosBulk?idEvento=${idEvento}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) return NextResponse.json({ message: 'Error al guardar features' }, { status: res.status });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
}
