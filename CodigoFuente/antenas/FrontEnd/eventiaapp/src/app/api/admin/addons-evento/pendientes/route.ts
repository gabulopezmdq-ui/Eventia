import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/admin/addons-evento/pendientes?mercado={mercado}&moneda={moneda}
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const mercado = searchParams.get('mercado') || 'AR';
        const moneda = searchParams.get('moneda') || 'ARS';

        const res = await fetch(`${API_URL}/admin/addons_evento/pendientes?mercado=${mercado}&moneda=${moneda}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            return NextResponse.json({ message: 'Error al obtener addons pendientes' }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
