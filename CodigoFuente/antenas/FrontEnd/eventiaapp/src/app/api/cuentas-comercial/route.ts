import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /cuentas-comercial?idCuenta={id}
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const idCuenta = request.nextUrl.searchParams.get('idCuenta');
        if (!idCuenta) return NextResponse.json({ message: 'idCuenta es requerido' }, { status: 400 });

        const res = await fetch(`${API_URL}/cuentas_comercial/Get?idCuenta=${idCuenta}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            return NextResponse.json({ message: 'Error al obtener datos comerciales de la cuenta' }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
