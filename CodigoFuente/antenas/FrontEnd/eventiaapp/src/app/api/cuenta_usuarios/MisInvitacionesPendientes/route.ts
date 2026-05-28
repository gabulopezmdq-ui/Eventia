import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

export async function GET(request: Request) {
    try {
        const token = await getAdminToken();
        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const idCuenta = searchParams.get('idCuenta');

        if (!idCuenta) {
            return NextResponse.json({ message: 'idCuenta es requerido' }, { status: 400 });
        }

        console.log('Fetching backend:', `${API_URL}/cuenta_usuarios/MisInvitacionesPendientes?idCuenta=${idCuenta}`);
        const res = await fetch(`${API_URL}/cuenta_usuarios/MisInvitacionesPendientes?idCuenta=${idCuenta}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const rawText = await res.text();
        console.log('Backend response status:', res.status);
        console.log('Backend response body:', rawText);

        const data = rawText ? JSON.parse(rawText) : {};

        if (!res.ok) {
            return NextResponse.json({
                message: data.message || 'Error al obtener invitaciones pendientes.'
            }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error en proxy MisInvitacionesPendientes:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
