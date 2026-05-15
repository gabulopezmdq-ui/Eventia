import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /idiomas/GetAll?idIdioma={id}
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const idIdioma = searchParams.get('idIdioma') || '1';

        const res = await fetch(`${API_URL}/idiomas/GetAll?idIdioma=${idIdioma}`, {
            method: 'GET',
        });

        if (!res.ok) {
            return NextResponse.json(
                { message: 'Error al obtener idiomas' },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [parametrica/idiomas]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
