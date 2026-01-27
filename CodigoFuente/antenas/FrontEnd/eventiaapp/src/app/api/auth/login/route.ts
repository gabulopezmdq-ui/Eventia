import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
    const credentials = await req.json();

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        return NextResponse.json(
            { message: 'Credenciales inválidas' },
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
