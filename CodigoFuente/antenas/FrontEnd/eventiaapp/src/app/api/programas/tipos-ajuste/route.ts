import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * GET /api/programas/tipos-ajuste
 * → Proxy a: GET {backend}/programas/tipos-ajuste?idIdioma=X
 *
 * Devuelve el catálogo de tipos de ajuste (motivos) para popular
 * el combobox del modal "Agregar Ajuste".
 * El idIdioma se toma del query param; default: 3 (Catalán).
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const idIdioma = searchParams.get('idIdioma') ?? '3';

    const res = await fetch(
        `${BACKEND_URL}/programas/tipos-ajuste?idIdioma=${idIdioma}`,
        {
            headers: {
                Authorization: request.headers.get('Authorization') ?? '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
