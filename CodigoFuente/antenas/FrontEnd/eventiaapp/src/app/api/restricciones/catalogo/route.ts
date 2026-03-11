import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const locale = searchParams.get('locale') || 'es-AR';

        // Guest endpoint, no need for access_token cookie
        const res = await fetch(`${API_URL}/restricciones/catalogo?locale=${locale}`, {
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
        console.error('Proxy Error /restricciones/catalogo:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
