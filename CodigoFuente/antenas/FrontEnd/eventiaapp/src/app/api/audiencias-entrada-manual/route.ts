import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /audiencias/ResolverEntradaManual?idEvento={id}&idInvitado={id}
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');
        const idInvitado = searchParams.get('idInvitado');

        if (!idEvento || !idInvitado) {
            return NextResponse.json(
                { message: 'idEvento e idInvitado son requeridos' },
                { status: 400 }
            );
        }

        const res = await fetch(
            `${API_URL}/audiencias/ResolverEntradaManual?idEvento=${idEvento}&idInvitado=${idInvitado}`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al resolver entrada manual', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-entrada-manual GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
