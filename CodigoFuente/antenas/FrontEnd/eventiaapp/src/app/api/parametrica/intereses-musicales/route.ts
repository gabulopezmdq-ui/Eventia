import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /parametrica/InteresesEventoPublico?idEvento={id}
// GET /parametrica/PreferenciasMusicales?idEvento={id}
// Rutas públicas — usadas en el formulario de registro del asistente
// El parámetro `tipo` distingue cuál traer: 'intereses' | 'musicales'
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');
        const tipo = searchParams.get('tipo'); // 'intereses' | 'musicales'

        if (!idEvento) {
            return NextResponse.json({ message: 'idEvento requerido' }, { status: 400 });
        }

        const endpoint = tipo === 'musicales'
            ? `${API_URL}/parametrica/PreferenciasMusicales?idEvento=${idEvento}`
            : `${API_URL}/parametrica/InteresesEventoPublico?idEvento=${idEvento}`;

        const res = await fetch(endpoint, { method: 'GET' });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener paramétrica', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [parametrica/intereses-musicales GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
