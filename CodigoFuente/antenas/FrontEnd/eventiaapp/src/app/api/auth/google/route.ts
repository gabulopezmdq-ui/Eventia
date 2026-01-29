import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
    const { idToken } = await req.json();

    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }), // Backend expects id_token (snake_case)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(
            { message: errorData.message || 'Error de autenticación con Google' },
            { status: 401 }
        );
    }

    const data = await res.json();

    const response = NextResponse.json({
        success: true,
        access_token: data.access_token
    });

    response.cookies.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    return response;
}
