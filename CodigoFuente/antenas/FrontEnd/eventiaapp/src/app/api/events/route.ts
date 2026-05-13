import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();

        // El backend .NET espera snake_case. El frontend envía camelCase.
        // Aceptamos camelCase, snake_case y PascalCase para mayor compatibilidad.
        const backendPayload = {
            id_tipo_evento:               body.idTipoEvento        ?? body.id_tipo_evento        ?? body.IdTipoEvento,
            id_idioma:                    body.idIdioma             ?? body.id_idioma             ?? body.IdIdioma,
            id_plantilla:                 body.idPlantilla          ?? body.id_plantilla          ?? body.IdPlantilla,
            id_dress_code:                body.idDressCode          ?? body.id_dress_code         ?? body.IdDressCode,
            anfitriones_texto:            body.anfitrionesTexto     ?? body.anfitriones_texto     ?? body.AnfitrionesTexto,
            saludo:                       body.saludo               ?? body.Saludo,
            mensaje_bienvenida:           body.mensajeBienvenida    ?? body.mensaje_bienvenida    ?? body.MensajeBienvenida,
            notas:                        body.notas                ?? body.Notas,
            info_publica:                 body.infoPublica          ?? body.info_publica          ?? body.InfoPublica,
            fecha_hora:                   body.fechaHora            ?? body.fecha_hora            ?? body.FechaHora,
            fecha_inicio:                 body.fechaInicio          ?? body.fecha_inicio          ?? body.FechaInicio,
            fecha_fin:                    body.fechaFin             ?? body.fecha_fin             ?? body.FechaFin,
            lugar:                        body.lugar                ?? body.Lugar,
            direccion:                    body.direccion            ?? body.Direccion,
            latitud:                      body.latitud              ?? body.Latitud,
            longitud:                     body.longitud             ?? body.Longitud,
            modalidad:                    body.modalidad            ?? body.Modalidad,
            id_unidad:                    body.idUnidad             ?? body.id_unidad             ?? body.IdUnidad,
            id_cliente:                   body.idCliente            ?? body.id_cliente            ?? body.IdCliente,
            codigo_plan:                  body.codigoPlan           ?? body.codigo_plan           ?? body.CodigoPlan,
            tipo_operacion:               body.tipoOperacion        ?? body.tipo_operacion        ?? body.TipoOperacion,
        };

        // Limpiar undefined para que el JSON quede limpio
        Object.keys(backendPayload).forEach(key => {
            if (backendPayload[key as keyof typeof backendPayload] === undefined) {
                delete backendPayload[key as keyof typeof backendPayload];
            }
        });

        const res = await fetch(`${API_URL}/eventos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(backendPayload),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
