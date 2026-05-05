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
            idProgramaServicio: body.id_programa_servicio,
            idEvento: parseInt(idEvento),
            idServicioBase: body.id_servicio_base,
            codigo: body.codigo,
            nombre: body.nombre,
            descripcion: body.descripcion,
            tipoCalculo: body.tipo_calculo,
            precio: body.precio,
            moneda: body.moneda,
            obligatorio: body.obligatorio,
            permiteCantidad: body.permite_cantidad,
            requiereSeleccionDias: body.requiere_seleccion_dias,
            cupo: body.cupo,
            orden: body.orden,
            activo: body.activo,
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
            id_programa_servicio: data.idProgramaServicio,
            id_evento: data.idEvento,
            id_servicio_base: data.idServicioBase,
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipo_calculo: data.tipoCalculo,
            precio: data.precio,
            moneda: data.moneda,
            obligatorio: data.obligatorio,
            permite_cantidad: data.permiteCantidad,
            requiere_seleccion_dias: data.requiereSeleccionDias,
            cupo: data.cupo,
            orden: data.orden,
            activo: data.activo,
            config_json: data.configJson
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
