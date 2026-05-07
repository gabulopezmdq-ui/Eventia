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
            id_programa_servicio: item.idProgramaServicio,
            id_evento: item.idEvento,
            id_servicio_base: item.idServicioBase,
            servicio_base_codigo: item.servicioBaseCodigo,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            tipo_calculo: item.tipoCalculo,
            precio: item.precio,
            moneda: item.moneda,
            obligatorio: item.obligatorio,
            permite_cantidad: item.permiteCantidad,
            requiere_seleccion_dias: item.requiereSeleccionDias,
            cupo: item.cupo,
            orden: item.orden,
            activo: item.activo,
            config_json: item.configJson
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
