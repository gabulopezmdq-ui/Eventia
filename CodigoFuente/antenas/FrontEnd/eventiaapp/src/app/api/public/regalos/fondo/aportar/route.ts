import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${API_URL}/public/regalos/fondo/aportar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al registrar aporte al fondo', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (aportar al fondo):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
