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
        const idIdioma = url.searchParams.get('idIdioma') || '3';
        const soloActivas = url.searchParams.get('soloActivas') || 'false';

        const res = await fetch(`${API_URL}/programas/${idEvento}/autorizaciones-config?idIdioma=${idIdioma}&soloActivas=${soloActivas}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        const mappedData = data.map((item: any) => ({
            id_programa_autorizacion_config: item.idProgramaAutorizacionConfig,
            id_evento: item.idEvento,
            id_autorizacion_base: item.idAutorizacionBase,
            codigo: item.codigo,
            titulo: item.titulo,
            texto: item.texto,
            obligatoria: item.obligatoria,
            requiere_aceptacion: item.requiereAceptacion,
            requiere_datos_responsable: item.requiereDatosResponsable,
            orden: item.orden,
            activo: item.activo
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
