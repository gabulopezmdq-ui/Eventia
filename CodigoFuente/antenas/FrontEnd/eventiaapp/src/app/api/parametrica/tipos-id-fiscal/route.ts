import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /tipos_identificacion_fiscal/GetByPais?idPais={id}&idIdioma=1
export async function GET(request: NextRequest) {
    try {
        const idPais = request.nextUrl.searchParams.get('idPais');

        if (!idPais) {
            return NextResponse.json({ message: 'idPais es requerido' }, { status: 400 });
        }

        const res = await fetch(
            `${API_URL}/tipos_identificacion_fiscal/GetByPais?idPais=${idPais}&idIdioma=1`,
            { method: 'GET' }
        );

        if (!res.ok) {
            return NextResponse.json(
                { message: 'Error al obtener tipos de identificación fiscal' },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [parametrica/tipos-id-fiscal]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
