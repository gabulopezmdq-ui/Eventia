import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /audiencias/Registrar?token={token}
// Ruta pública — la usa el asistente para registrarse
export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'token requerido' }, { status: 400 });
        }

        const body = await req.json();

        const res = await fetch(
            `${API_URL}/audiencias/Registrar?token=${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            let err: any = {};
            const text = await res.text().catch(() => '');
            try {
                err = JSON.parse(text);
            } catch (_) {
                err = text ? { message: text } : {};
            }
            return NextResponse.json(
                { message: 'Error al registrar audiencia', details: err },
                { status: res.status }
            );
        }

        return NextResponse.json(await res.json());
    } catch (error) {
        console.error('Proxy Error [audiencias-registrar POST]:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
