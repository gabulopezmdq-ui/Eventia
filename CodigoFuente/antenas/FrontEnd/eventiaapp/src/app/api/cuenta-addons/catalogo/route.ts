import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/cuenta-addons/catalogo?mercado={mercado}&moneda={moneda}
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mercado = searchParams.get('mercado') || 'AR';
        const moneda = searchParams.get('moneda') || 'ARS';

        const res = await fetch(`${API_URL}/addonsPublic/PublicCatalog?mercado=${mercado}&moneda=${moneda}&scope=CUENTA`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            return NextResponse.json({ message: 'Error al obtener catálogo de addons de cuenta' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
