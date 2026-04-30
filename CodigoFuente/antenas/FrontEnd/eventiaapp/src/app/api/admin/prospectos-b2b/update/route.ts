import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PUT /admin/prospectos-b2b/update?idProspecto={id}
export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idProspecto = request.nextUrl.searchParams.get('idProspecto');
        if (!idProspecto) return NextResponse.json({ message: 'idProspecto es requerido' }, { status: 400 });

        const body = await request.json();

        const res = await fetch(`${API_URL}/admin/prospectos_b2b/Update?idProspecto=${idProspecto}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al actualizar prospecto', details: err }, { status: res.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
