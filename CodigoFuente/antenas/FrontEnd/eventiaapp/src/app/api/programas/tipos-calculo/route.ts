import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const url = new URL(req.url);
        const idIdioma = url.searchParams.get('idIdioma') || '1';

        const res = await fetch(`${API_URL}/programas/tipos-calculo?idIdioma=${idIdioma}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error (tipos-calculo):', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
