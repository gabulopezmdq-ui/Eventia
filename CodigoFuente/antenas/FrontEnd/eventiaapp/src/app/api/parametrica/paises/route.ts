import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /paises/GetAll?idIdioma=1
export async function GET() {
    try {
        const res = await fetch(`${API_URL}/paises/GetAll?idIdioma=1`, {
            method: 'GET',
        });

        if (!res.ok) {
            return NextResponse.json(
                { message: 'Error al obtener países' },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [parametrica/paises]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
