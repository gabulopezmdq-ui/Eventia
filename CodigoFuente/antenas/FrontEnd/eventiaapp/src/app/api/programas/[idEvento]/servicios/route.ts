import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request, props: { params: Promise<{ idEvento: string }> }) {
    try {
        const { idEvento } = await props.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const url = new URL(req.url);
        const soloActivos = url.searchParams.get('soloActivos') || 'false';

        const res = await fetch(`${API_URL}/programas/${idEvento}/servicios?soloActivos=${soloActivos}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        const mappedData = data.map((item: any) => ({
            id_programa_servicio: item.idProgramaServicio ?? item.IdProgramaServicio ?? item.id_programa_servicio,
            id_evento: item.idEvento ?? item.IdEvento ?? item.id_evento,
            id_servicio_base: item.idServicioBase ?? item.IdServicioBase ?? item.id_servicio_base,
            servicio_base_codigo: item.servicioBaseCodigo ?? item.ServicioBaseCodigo ?? item.servicio_base_codigo,
            codigo: item.codigo ?? item.Codigo,
            nombre: item.nombre ?? item.Nombre,
            descripcion: item.descripcion ?? item.Descripcion,
            tipo_calculo: item.tipoCalculo ?? item.TipoCalculo ?? item.tipo_calculo,
            precio: item.precio ?? item.Precio,
            moneda: item.moneda ?? item.Moneda,
            obligatorio: item.obligatorio ?? item.Obligatorio,
            permite_cantidad: item.permiteCantidad ?? item.PermiteCantidad ?? item.permite_cantidad,
            requiere_seleccion_dias: item.requiereSeleccionDias ?? item.RequiereSeleccionDias ?? item.requiere_seleccion_dias,
            cupo: item.cupo ?? item.Cupo,
            orden: item.orden ?? item.Orden,
            activo: item.activo ?? item.Activo,
            config_json: item.configJson ?? item.ConfigJson ?? item.config_json
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
