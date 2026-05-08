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

        const res = await fetch(`${API_URL}/programas/autorizaciones-base?idIdioma=${idIdioma}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        const mappedData = data.map((item: any) => ({
            id_autorizacion_base: item.idAutorizacionBase ?? item.IdAutorizacionBase ?? item.id_autorizacion_base,
            codigo: item.codigo ?? item.Codigo,
            titulo: item.titulo ?? item.Titulo,
            texto: item.texto ?? item.Texto,
            obligatoria_default: item.obligatoriaDefault ?? item.ObligatoriaDefault ?? item.obligatoria_default,
            requiere_aceptacion_default: item.requiereAceptacionDefault ?? item.RequiereAceptacionDefault ?? item.requiere_aceptacion_default,
            requiere_datos_responsable_default: item.requiereDatosResponsableDefault ?? item.RequiereDatosResponsableDefault ?? item.requiere_datos_responsable_default
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
