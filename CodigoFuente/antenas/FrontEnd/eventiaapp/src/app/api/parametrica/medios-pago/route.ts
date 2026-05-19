import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/parametrica/medios-pago
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const idIdioma = searchParams.get('idIdioma') || '1';

        const res = await fetch(`${API_URL}/medios_pago/GetAll?idIdioma=${idIdioma}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener medios de pago', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [parametrica/medios-pago]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
