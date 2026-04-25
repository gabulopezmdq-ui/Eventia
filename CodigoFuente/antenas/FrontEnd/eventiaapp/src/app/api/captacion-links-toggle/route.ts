import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PUT /evento_captacion_links/SetActivo?idAccesoLink={id}&activo={true|false}
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idAccesoLink = searchParams.get('idAccesoLink');
        const activo = searchParams.get('activo');

        if (!idAccesoLink || activo === null) {
            return NextResponse.json(
                { message: 'idAccesoLink y activo son requeridos' },
                { status: 400 }
            );
        }

        const res = await fetch(
            `${API_URL}/evento_captacion_links/SetActivo?idAccesoLink=${idAccesoLink}&activo=${activo}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al cambiar estado de campaña', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [captacion-links-toggle PUT]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
