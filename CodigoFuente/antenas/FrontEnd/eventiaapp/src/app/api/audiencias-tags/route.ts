import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /audiencias/TagsSugeridos
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const res = await fetch(`${API_URL}/audiencias/TagsSugeridos`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener tags sugeridos', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-tags GET]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// POST /audiencias/AgregarTag?idAudienciaPersona={id}
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idAudienciaPersona = searchParams.get('idAudienciaPersona');

        if (!idAudienciaPersona) {
            return NextResponse.json(
                { message: 'idAudienciaPersona requerido' },
                { status: 400 }
            );
        }

        const body = await req.json();

        const res = await fetch(
            `${API_URL}/audiencias/AgregarTag?idAudienciaPersona=${idAudienciaPersona}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al agregar tag', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-tags POST]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

// PUT /audiencias/SetTagActivo?idAudienciaPersonaTag={id}&activo={bool}
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idAudienciaPersonaTag = searchParams.get('idAudienciaPersonaTag');
        const activo = searchParams.get('activo');

        if (!idAudienciaPersonaTag || activo === null) {
            return NextResponse.json(
                { message: 'idAudienciaPersonaTag y activo son requeridos' },
                { status: 400 }
            );
        }

        const res = await fetch(
            `${API_URL}/audiencias/SetTagActivo?idAudienciaPersonaTag=${idAudienciaPersonaTag}&activo=${activo}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al actualizar tag', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-tags PUT]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
