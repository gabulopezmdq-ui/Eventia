import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const url = new URL(req.url);
        const idIdioma = url.searchParams.get('idIdioma') || '3';

        const res = await fetch(`${API_URL}/programas/servicios-base?idIdioma=${idIdioma}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        const mappedData = data.map((item: any) => ({
            id_servicio_base: item.idServicioBase ?? item.IdServicioBase ?? item.id_servicio_base,
            codigo: item.codigo ?? item.Codigo,
            nombre: item.nombre ?? item.Nombre,
            descripcion: item.descripcion ?? item.Descripcion,
            config_json_defecto: item.configJsonDefecto ?? item.ConfigJsonDefecto ?? item.config_json_defecto
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
