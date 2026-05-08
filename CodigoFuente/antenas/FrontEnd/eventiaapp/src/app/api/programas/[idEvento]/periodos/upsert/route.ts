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

        // El backend espera snake_case para los endpoints de programas
        const payload = {
            ...body,
            id_evento: parseInt(idEvento)
        };

        const res = await fetch(`${API_URL}/programas/${idEvento}/periodos/upsert`, {
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
        
        // Mapeo de vuelta a snake_case
        const mappedData = {
            id_programa_periodo: data.idProgramaPeriodo ?? data.IdProgramaPeriodo ?? data.id_programa_periodo,
            id_evento: data.idEvento ?? data.IdEvento ?? data.id_evento,
            codigo: data.codigo ?? data.Codigo,
            nombre: data.nombre ?? data.Nombre,
            fecha_desde: data.fechaDesde ?? data.FechaDesde ?? data.fecha_desde,
            fecha_hasta: data.fechaHasta ?? data.FechaHasta ?? data.fecha_hasta,
            precio_base: data.precioBase ?? data.PrecioBase ?? data.precio_base,
            moneda: data.moneda ?? data.Moneda,
            cupo: data.cupo ?? data.Cupo,
            orden: data.orden ?? data.Orden,
            activo: data.activo ?? data.Activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
