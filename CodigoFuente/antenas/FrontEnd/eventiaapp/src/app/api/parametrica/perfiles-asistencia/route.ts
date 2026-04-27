import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /parametrica/PerfilesAsistencia?idEvento={id}
// Ruta pública — usada también en el formulario de registro público del asistente
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json({ message: 'idEvento requerido' }, { status: 400 });
        }

        const res = await fetch(
            `${API_URL}/parametrica/PerfilesAsistencia?idEvento=${idEvento}`,
            { method: 'GET' }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener perfiles de asistencia', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [parametrica/perfiles-asistencia GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
