import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ valida: false, mensaje: 'Token no provisto.' }, { status: 400 });
        }

        const backendRes = await fetch(`${API_URL}/cuenta_usuarios/ValidarInvitacion?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ 
                valida: false, 
                mensaje: errorData.message || 'La invitación es inválida o expiró.' 
            });
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error en proxy ValidarInvitacion:', error);
        return NextResponse.json({ valida: false, mensaje: 'Error al conectar con el servidor.' }, { status: 500 });
    }
}
