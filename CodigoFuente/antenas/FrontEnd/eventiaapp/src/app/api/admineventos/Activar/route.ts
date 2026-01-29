import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            );
        }

        // Leer query param ?idEvento=#
        const idEvento = request.nextUrl.searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json(
                { message: 'idEvento es requerido' },
                { status: 400 }
            );
        }

        // Backend espera ?idEvento=... 
        // No body required according to user request format: /adminEventos/Activar?idEvento=1
        const res = await fetch(
            `${API_URL}/adminEventos/Activar?idEvento=${idEvento}`,
            {
                method: 'POST', // Asumiendo POST para acciones
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { message: 'Error en la API de backend' },
                { status: res.status }
            );
        }

        // Si la respuesta tiene contenido, lo devolvemos, sino solo ok
        const text = await res.text();
        const data = text ? JSON.parse(text) : { success: true };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
