import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        let authToken = cookieStore.get('access_token')?.value;

        if (!authToken) {
            const authHeader = req.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                authToken = authHeader.substring(7);
            }
        }

        if (!authToken) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json({ message: 'Falta idEvento' }, { status: 400 });
        }

        const res = await fetch(`${API_URL}/invitados/GetPersonasEvento?idEvento=${idEvento}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try { errorData = JSON.parse(errorText); } catch { errorData = errorText; }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();

        // Obtener la lista de tokens para asociar el rsvpToken correcto a cada invitado
        let tokensMap: Record<number, string> = {};
        try {
            const tokensRes = await fetch(`${API_URL}/invitacion/tokens?idEvento=${idEvento}`, {
                method: 'GET'
            });
            if (tokensRes.ok) {
                const tokensData = await tokensRes.json();
                if (Array.isArray(tokensData)) {
                    tokensData.forEach((t: any) => {
                        if (t.idInvitado && t.token) {
                            tokensMap[t.idInvitado] = t.token;
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Proxy Error: Fallo al obtener los tokens de invitados para unificar:', e);
        }

        // Si existen los items, inyectamos el rsvpToken correspondiente
        if (data && Array.isArray(data.items)) {
            data.items = data.items.map((item: any) => ({
                ...item,
                rsvpToken: tokensMap[item.idInvitado] || null
            }));
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error GET /invitaciones/personas:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
