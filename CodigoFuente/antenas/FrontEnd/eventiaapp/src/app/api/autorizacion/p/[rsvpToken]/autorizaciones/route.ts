import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/autorizacion/p/[rsvpToken]/autorizaciones
 * Proxy para recuperar las personas autorizadas de retiro de un grupo familiar por rsvpToken
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ rsvpToken: string }> }
) {
    try {
        const { rsvpToken } = await params;

        if (!rsvpToken) {
            return NextResponse.json(
                { message: 'Token RSVP no provisto' },
                { status: 400 }
            );
        }

        const url = `${BACKEND_URL}/autorizacion/p/${rsvpToken}/autorizaciones`;
        console.log('PROXY [GET AUTORIZACIONES RSVP]:', url);

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('ERROR PROXY GET AUTORIZACIONES RSVP:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/autorizacion/p/[rsvpToken]/autorizaciones
 * Proxy para crear un autorizado de retiro para el grupo familiar por rsvpToken (Autoservicio)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ rsvpToken: string }> }
) {
    try {
        const { rsvpToken } = await params;

        if (!rsvpToken) {
            return NextResponse.json(
                { message: 'Token RSVP no provisto' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const url = `${BACKEND_URL}/autorizacion/p/${rsvpToken}/autorizaciones`;
        console.log('PROXY [POST AUTORIZACION RSVP]:', url, body);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
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
        console.error('ERROR PROXY POST AUTORIZACION RSVP:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
