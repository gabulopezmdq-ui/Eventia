import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Deriva la categoría a partir del código de restricción.
 * El frontend usa `categoria === 'ALERGIA'` para mostrar campos extra de severidad.
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
 * Ej: "ALERGIA_FRUTOS_SECOS" → "Alergia a Frutos Secos"
 * Se usa como fallback cuando el backend no envía un `nombre` / `texto` humanizado.
 */
function codigoANombre(codigo: string): string {
    return codigo
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

/**
 * GET /api/parametrica/restricciones-alimentarias?idEvento={idEvento}
 * Proxea hacia: GET /parametrica/RestriccionesAlimentarias?idEvento={idEvento}
 *
 * Normaliza la respuesta del backend al tipo CatalogoRestriccion del frontend:
 *   id          → idRestriccion
 *   texto/nombre → nombre (formateado si es el código crudo)
 *   categoria   → derivada del codigo si no viene
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idEvento = searchParams.get('idEvento');

        if (!idEvento) {
            return NextResponse.json(
                { message: 'El parámetro idEvento es requerido' },
                { status: 400 }
            );
        }

        const res = await fetch(
            `${API_URL}/parametrica/RestriccionesAlimentarias?idEvento=${idEvento}`,
            { method: 'GET' }
        );

        if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
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
            // El backend devuelve el código crudo como texto (ej: "ALERGIA_APIO")
            // Si el texto es idéntico al código, formatearlo como nombre legible
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
        console.error('Proxy Error GET /parametrica/restricciones-alimentarias:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
