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

        // Mapeo snake_case -> PascalCase para el backend
        const payload = {
            idProgramaPeriodo: body.id_programa_periodo,
            idEvento: parseInt(idEvento),
            codigo: body.codigo,
            nombre: body.nombre,
            fechaDesde: body.fecha_desde,
            fechaHasta: body.fecha_hasta,
            precioBase: body.precio_base,
            moneda: body.moneda,
            cupo: body.cupo,
            orden: body.orden,
            activo: body.activo
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
            id_programa_periodo: data.idProgramaPeriodo,
            id_evento: data.idEvento,
            codigo: data.codigo,
            nombre: data.nombre,
            fecha_desde: data.fechaDesde,
            fecha_hasta: data.fechaHasta,
            precio_base: data.precioBase,
            moneda: data.moneda,
            cupo: data.cupo,
            orden: data.orden,
            activo: data.activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
