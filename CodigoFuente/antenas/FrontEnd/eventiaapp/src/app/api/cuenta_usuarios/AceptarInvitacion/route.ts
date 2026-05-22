import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const inviteToken = body.token;

        if (!inviteToken) {
            return NextResponse.json({ message: 'El token de invitación es requerido' }, { status: 400 });
        }

        const backendRes = await fetch(`${API_URL}/cuenta_usuarios/AceptarInvitacion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: inviteToken }),
        });

        const data = await backendRes.json().catch(() => ({}));

        if (!backendRes.ok) {
            return NextResponse.json({
                message: data.message || 'Error al aceptar la invitación.'
            }, { status: backendRes.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error en proxy AceptarInvitacion:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}
