import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request, props: { params: Promise<{ idEvento: string, idInvitado: string }> }) {
    try {
        const { idEvento, idInvitado } = await props.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/programas/${idEvento}/salud/participantes/${idInvitado}/detalle`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const rawData = await res.json();

        // Fase 5: Normalización del campo mixto idInscripcion en el array de acciones del detalle
        if (rawData && Array.isArray(rawData.acciones)) {
            rawData.acciones = rawData.acciones.map((accion: any) => ({
                ...accion,
                id_inscripcion: accion.id_inscripcion || accion.idInscripcion
            }));
        }

        return NextResponse.json(rawData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
