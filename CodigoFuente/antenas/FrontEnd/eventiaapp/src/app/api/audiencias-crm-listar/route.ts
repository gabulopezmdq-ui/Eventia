import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /audiencia_crm/listar?idCuenta=&tipo=&q=&idEvento=
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idCuenta = searchParams.get('idCuenta');
        const tipo     = searchParams.get('tipo') ?? 'TODOS';
        const q        = searchParams.get('q') ?? '';
        const idEvento = searchParams.get('idEvento') ?? '';

        if (!idCuenta) {
            return NextResponse.json(
                { message: 'idCuenta es requerido' },
                { status: 400 }
            );
        }

        const qs = new URLSearchParams({ idCuenta, tipo, q });
        if (idEvento) qs.set('idEvento', idEvento);

        const res = await fetch(
            `${API_URL}/audiencia_crm/listar?${qs.toString()}`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al listar audiencia CRM', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-crm-listar GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
