import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idEvento: string, idInvitado: string }> }
) {
    try {
        const { idEvento, idInvitado } = await params;

        // Token desde cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            );
        }

        // Query params
        const { searchParams } = new URL(request.url);

        const url = new URL(
            `${API_URL}/programas/${idEvento}/cocina/participantes/${idInvitado}/detalle`
        );

        // Copiamos filtros
        searchParams.forEach((value, key) => {
            url.searchParams.append(key, value);
        });

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('ERROR API ROUTE COCINA DETALLE:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
