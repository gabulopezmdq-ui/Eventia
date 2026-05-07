import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ idEvento: string }> }
) {
    try {
        // Necesario por Next.js para resolver el segmento dinámico,
        // pero el backend no lo requiere en esta ruta.
        await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();

        console.log('BODY [VALIDAR QR]:', body);

        const res = await fetch(`${API_URL}/programas/retiros/validar-qr`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('ERROR API ROUTE VALIDAR QR:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
