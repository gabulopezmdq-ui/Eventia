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

        const payload = {
            idProgramaAutorizacionConfig: body.id_programa_autorizacion_config,
            idEvento: parseInt(idEvento),
            idAutorizacionBase: body.id_autorizacion_base,
            codigo: body.codigo,
            titulo: body.titulo,
            texto: body.texto,
            obligatoria: body.obligatoria,
            requiereAceptacion: body.requiere_aceptacion,
            requiereDatosResponsable: body.requiere_datos_responsable,
            orden: body.orden,
            activo: body.activo
        };

        const res = await fetch(`${API_URL}/programas/${idEvento}/autorizaciones-config/upsert`, {
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
            id_programa_autorizacion_config: data.idProgramaAutorizacionConfig,
            id_evento: data.idEvento,
            id_autorizacion_base: data.idAutorizacionBase,
            codigo: data.codigo,
            titulo: data.titulo,
            texto: data.texto,
            obligatoria: data.obligatoria,
            requiere_aceptacion: data.requiereAceptacion,
            requiere_datos_responsable: data.requiereDatosResponsable,
            orden: data.orden,
            activo: data.activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
