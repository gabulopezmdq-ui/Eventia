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

        // El backend es inconsistente: enviamos los formatos comunes (snake_case, camelCase y PascalCase)
        // para asegurarnos de que el ModelBinder de ASP.NET Core lo pueda procesar correctamente.
        const payload = {
            ...body,
            id_evento: parseInt(idEvento),
            idEvento: parseInt(idEvento),
            IdEvento: parseInt(idEvento),
            
            idProgramaServicio: body.id_programa_servicio,
            IdProgramaServicio: body.id_programa_servicio,
            
            idServicioBase: body.id_servicio_base,
            IdServicioBase: body.id_servicio_base,
            
            codigo: body.codigo,
            Codigo: body.codigo,
            
            nombre: body.nombre,
            Nombre: body.nombre,
            
            descripcion: body.descripcion,
            Descripcion: body.descripcion,
            
            tipoCalculo: body.tipo_calculo,
            TipoCalculo: body.tipo_calculo,
            
            precio: body.precio,
            Precio: body.precio,
            
            moneda: body.moneda,
            Moneda: body.moneda,
            
            obligatorio: body.obligatorio,
            Obligatorio: body.obligatorio,
            
            permiteCantidad: body.permite_cantidad,
            PermiteCantidad: body.permite_cantidad,
            
            requiereSeleccionDias: body.requiere_seleccion_dias,
            RequiereSeleccionDias: body.requiere_seleccion_dias,
            
            cupo: body.cupo,
            Cupo: body.cupo,
            
            orden: body.orden,
            Orden: body.orden,
            
            activo: body.activo,
            Activo: body.activo,
            
            configJson: body.config_json,
            ConfigJson: body.config_json
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
            const errorText = await res.text();
            let errorBody = {};
            try { 
                errorBody = JSON.parse(errorText); 
            } catch(e) { 
                errorBody = { rawError: errorText }; 
            }
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
