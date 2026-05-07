import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idEvento: string }> }
) {
    try {
        const { idEvento } = await params;

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
            `${API_URL}/programas/${idEvento}/cocina/dia`
        );

        // Copiamos filtros (fecha, idIdioma)
        searchParams.forEach((value, key) => {
            url.searchParams.append(key, value);
        });

        console.log('FINAL URL:', url.toString());

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
        console.error('ERROR API ROUTE COCINA DIA:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
