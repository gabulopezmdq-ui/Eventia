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

        // El backend es inconsistente: periodos requiere snake_case, pero servicios requiere camelCase
        // Enviamos ambos formatos en el mismo JSON para que el ModelBinder de ASP.NET Core agarre el que necesite
        const payload = {
            ...body,
            id_evento: parseInt(idEvento),
            idEvento: parseInt(idEvento),
            idProgramaServicio: body.id_programa_servicio,
            idServicioBase: body.id_servicio_base,
            tipoCalculo: body.tipo_calculo,
            permiteCantidad: body.permite_cantidad,
            requiereSeleccionDias: body.requiere_seleccion_dias,
            configJson: body.config_json
        };

        const res = await fetch(`${API_URL}/programas/${idEvento}/servicios/upsert`, {
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
            id_programa_servicio: data.idProgramaServicio ?? data.IdProgramaServicio ?? data.id_programa_servicio,
            id_evento: data.idEvento ?? data.IdEvento ?? data.id_evento,
            id_servicio_base: data.idServicioBase ?? data.IdServicioBase ?? data.id_servicio_base,
            codigo: data.codigo ?? data.Codigo,
            nombre: data.nombre ?? data.Nombre,
            descripcion: data.descripcion ?? data.Descripcion,
            tipo_calculo: data.tipoCalculo ?? data.TipoCalculo ?? data.tipo_calculo,
            precio: data.precio ?? data.Precio,
            moneda: data.moneda ?? data.Moneda,
            obligatorio: data.obligatorio ?? data.Obligatorio,
            permite_cantidad: data.permiteCantidad ?? data.PermiteCantidad ?? data.permite_cantidad,
            requiere_seleccion_dias: data.requiereSeleccionDias ?? data.RequiereSeleccionDias ?? data.requiere_seleccion_dias,
            cupo: data.cupo ?? data.Cupo,
            orden: data.orden ?? data.Orden,
            activo: data.activo ?? data.Activo,
            config_json: data.configJson ?? data.ConfigJson ?? data.config_json
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
