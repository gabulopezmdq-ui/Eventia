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

        // Enviamos ambos formatos (snake_case y camelCase) para que ASP.NET Core no falle por inconsistencias de atributos en los DTOs
        const payload = {
            ...body,
            id_evento: parseInt(idEvento),
            idEvento: parseInt(idEvento),
            idProgramaAutorizacionConfig: body.id_programa_autorizacion_config,
            idAutorizacionBase: body.id_autorizacion_base,
            requiereAceptacion: body.requiere_aceptacion,
            requiereDatosResponsable: body.requiere_datos_responsable
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
            id_programa_autorizacion_config: data.idProgramaAutorizacionConfig ?? data.IdProgramaAutorizacionConfig ?? data.id_programa_autorizacion_config,
            id_evento: data.idEvento ?? data.IdEvento ?? data.id_evento,
            id_autorizacion_base: data.idAutorizacionBase ?? data.IdAutorizacionBase ?? data.id_autorizacion_base,
            codigo: data.codigo ?? data.Codigo,
            titulo: data.titulo ?? data.Titulo,
            texto: data.texto ?? data.Texto,
            obligatoria: data.obligatoria ?? data.Obligatoria,
            requiere_aceptacion: data.requiereAceptacion ?? data.RequiereAceptacion ?? data.requiere_aceptacion,
            requiere_datos_responsable: data.requiereDatosResponsable ?? data.RequiereDatosResponsable ?? data.requiere_datos_responsable,
            orden: data.orden ?? data.Orden,
            activo: data.activo ?? data.Activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
