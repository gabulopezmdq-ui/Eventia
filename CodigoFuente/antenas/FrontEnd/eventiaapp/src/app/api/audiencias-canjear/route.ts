import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /evento_beneficios_registro/Canjear?idBeneficioRegistro={id}&observaciones={texto}
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idBeneficioRegistro = searchParams.get('idBeneficioRegistro');
        const observaciones = searchParams.get('observaciones');

        if (!idBeneficioRegistro) {
            return NextResponse.json(
                { message: 'idBeneficioRegistro requerido' },
                { status: 400 }
            );
        }

        const url = observaciones
            ? `${API_URL}/evento_beneficios_registro/Canjear?idBeneficioRegistro=${idBeneficioRegistro}&observaciones=${encodeURIComponent(observaciones)}`
            : `${API_URL}/evento_beneficios_registro/Canjear?idBeneficioRegistro=${idBeneficioRegistro}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al canjear beneficio', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-canjear POST]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
