import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Deriva la categoría a partir del código de restricción.
 */
function derivarCategoria(codigo: string): string {
    if (codigo.startsWith('ALERGIA_') || codigo === 'GLUTEN_CELIACO' || codigo === 'INTOL_LACTOSA') {
        return 'ALERGIA';
    }
    if (codigo === 'VEGANO' || codigo === 'VEGETARIANO') return 'DIETA';
    if (codigo === 'HALAL' || codigo === 'KOSHER') return 'RELIGION';
    if (codigo === 'DIABETES_SIN_AZUCAR' || codigo === 'FENILCETONURIA_PKU') return 'MEDICA';
    return 'OTRO';
}

/**
 * Formatea el código como nombre legible.
 */
function codigoANombre(codigo: string): string {
    return codigo
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const locale = searchParams.get('locale') || 'es-AR';

        // Guest endpoint, no need for access_token cookie
        const res = await fetch(`${API_URL}/alimentacion/catalogo/${locale}`, {
            method: 'GET'
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = errorText;
            }
            return NextResponse.json(
                { message: 'Error en la API de backend', details: errorData },
                { status: res.status }
            );
        }

        const raw: any[] = await res.json();

        // Normalizar cada item al tipo CatalogoRestriccion esperado por el frontend
        const normalized = raw.map((item: any) => {
            const codigo: string = item.codigo ?? '';
            const textoRaw: string = item.nombre ?? item.texto ?? codigo;
            const nombre = textoRaw === codigo ? codigoANombre(codigo) : textoRaw;

            return {
                idRestriccion: item.idRestriccion ?? item.id,
                codigo,
                nombre,
                descripcion: item.descripcion ?? undefined,
                categoria: item.categoria ?? derivarCategoria(codigo),
                iconKey: item.iconKey ?? undefined,
                orden: item.orden ?? 999,
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Proxy Error /restricciones/catalogo:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
