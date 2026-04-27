import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PUT /clientes/SetActivo?idCliente=X&activo=false
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const idCliente = searchParams.get('idCliente');
        const activo = searchParams.get('activo');

        if (!idCliente || activo === null) {
            return NextResponse.json({ message: 'Parámetros requeridos: idCliente, activo' }, { status: 400 });
        }

        const res = await fetch(
            `${API_URL}/clientes/SetActivo?idCliente=${idCliente}&activo=${activo}`,
            {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error al cambiar estado', details: err }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [PUT clientes/set-activo]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
