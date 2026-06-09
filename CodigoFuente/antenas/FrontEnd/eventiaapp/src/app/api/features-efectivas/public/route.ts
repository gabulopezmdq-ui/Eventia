import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/features-efectivas/public?idEvento={id}
// Versión pública para la web RSVP que no requiere cookie de sesión del organizador.
export async function GET(request: NextRequest) {
    try {
        const idEvento = request.nextUrl.searchParams.get('idEvento');
        if (!idEvento) return NextResponse.json({ message: 'idEvento es requerido' }, { status: 400 });

        const res = await fetch(`${API_URL}/features_efectivas/GetByEvento?idEvento=${idEvento}`, {
            method: 'GET',
        });

        if (!res.ok) {
            return NextResponse.json({ message: 'Error al obtener features efectivas' }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
