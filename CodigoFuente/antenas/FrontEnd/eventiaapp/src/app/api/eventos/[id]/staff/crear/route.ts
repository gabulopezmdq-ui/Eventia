import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        // Mapeo snake_case -> PascalCase
        const payload = {
            email: body.email,
            idStaff: body.id_staff,
            idRol: body.id_rol,
            nombre: body.nombre,
            apellido: body.apellido
        };

        const res = await fetch(`${API_URL}/eventos/${id}/staff/crear`, {
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
        
        const mappedData = {
            id_evento_usuario: data.idEventoUsuario,
            id_evento: data.idEvento,
            id_usuario: data.idUsuario,
            id_staff: data.idStaff,
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            id_rol: data.idRol,
            codigo_rol: data.codigoRol,
            activo: data.activo,
            fecha_alta: data.fechaAlta,
            es_invitacion: data.esInvitacion,
            es_personal_cuenta: data.esPersonalCuenta,
            codigo_acceso: data.codigoAcceso
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
