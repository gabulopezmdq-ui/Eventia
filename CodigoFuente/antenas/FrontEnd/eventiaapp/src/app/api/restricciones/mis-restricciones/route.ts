import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Missing token' }, { status: 400 });
        }

        // Guest endpoint, no need for access_token cookie
        const res = await fetch(`${API_URL}/restricciones/mis-restricciones?token=${token}`, {
            method: 'GET'
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = errorText;
            }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error GET /restricciones/mis-restricciones:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Missing token' }, { status: 400 });
        }

        const body = await req.json();

        // Guest endpoint, no need for access_token cookie
        const res = await fetch(`${API_URL}/restricciones/mis-restricciones?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            let errorData;
            try {
                errorData = await res.json();
            } catch (e) {
                errorData = await res.text();
            }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error POST /restricciones/mis-restricciones:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
