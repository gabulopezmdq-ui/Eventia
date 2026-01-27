import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        return NextResponse.json(
            { message: 'Error al registrar usuario' },
            { status: 400 }
        );
    }

    // El register NO inicia sesión automáticamente
    await res.json();

    return NextResponse.json({ success: true });
}
