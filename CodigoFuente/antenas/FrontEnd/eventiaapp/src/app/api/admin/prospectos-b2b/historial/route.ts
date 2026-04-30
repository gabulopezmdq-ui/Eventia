import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /admin/prospectos-b2b/historial?idProspecto={id}
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idProspecto = request.nextUrl.searchParams.get('idProspecto');
        if (!idProspecto) return NextResponse.json({ message: 'idProspecto es requerido' }, { status: 400 });

        const res = await fetch(`${API_URL}/admin/prospectos_b2b/Historial?idProspecto=${idProspecto}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            return NextResponse.json({ message: 'Error al obtener historial' }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
