import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const res = await fetch(`${API_URL}/programas/mis-programas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { message: 'Error en la API de backend' },
                { status: res.status }
            );
        }

        const data = await res.json();
        
        // Mapeo PascalCase a snake_case para consistencia
        const mappedData = data.map((item: any) => ({
            id_evento: item.idEvento,
            id_tipo_evento: item.idTipoEvento,
            id_idioma: item.idIdioma,
            anfitriones_texto: item.anfitrionesTexto,
            fecha_hora: item.fechaHora,
            lugar: item.lugar,
            direccion: item.direccion,
            estado: item.estado,
            fecha_alta: item.fechaAlta,
            tipo_evento_codigo: item.tipoEventoCodigo,
            saludo: item.saludo,
            mensaje_bienvenida: item.mensajeBienvenida,
            notas: item.notas,
            fecha_inicio: item.fechaInicio,
            fecha_fin: item.fechaFin,
            tipo_operacion: item.tipoOperacion
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
