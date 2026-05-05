import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request, props: { params: Promise<{ idEvento: string }> }) {
    try {
        const { idEvento } = await props.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        // Mapeo snake_case -> PascalCase
        const payload = {
            idEvento: parseInt(idEvento),
            idUsuario: body.id_usuario,
            email: body.email,
            idRol: body.id_rol,
            activo: body.activo
        };

        const res = await fetch(`${API_URL}/programas/${idEvento}/staff/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        // Mapeo PascalCase -> snake_case
        const mappedData = {
            id_evento: data.idEvento,
            id_usuario: data.idUsuario,
            email: data.email,
            id_rol: data.idRol,
            activo: data.activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
