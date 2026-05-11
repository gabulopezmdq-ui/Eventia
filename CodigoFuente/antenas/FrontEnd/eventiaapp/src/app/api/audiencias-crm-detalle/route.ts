import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /audiencia_crm/{idAudienciaPersona}/detalle
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { message: 'id (idAudienciaPersona) es requerido' },
                { status: 400 }
            );
        }

        const res = await fetch(
            `${API_URL}/audiencia_crm/${id}/detalle`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener detalle CRM', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-crm-detalle GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
