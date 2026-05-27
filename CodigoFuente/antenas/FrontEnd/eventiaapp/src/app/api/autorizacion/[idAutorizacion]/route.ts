import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * PUT /api/autorizacion/[idAutorizacion]
 * Proxy para modificar manualmente los datos de una autorización de retiro
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ idAutorizacion: string }> }
) {
    try {
        const { idAutorizacion } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const url = `${BACKEND_URL}/autorizacion/${idAutorizacion}`;
        console.log('PROXY [PUT AUTORIZACION BACKOFFICE]:', url, body);

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('ERROR PROXY PUT AUTORIZACION OPERADOR:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/autorizacion/[idAutorizacion]
 * Proxy para dar de baja lógica a una autorización de retiro (Desactivación de QR)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ idAutorizacion: string }> }
) {
    try {
        const { idAutorizacion } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        // Nota: Permitimos DELETE desde el RSVP de padres si no hay token de operador,
        // o si es a nivel de RSVP se valida del lado del backend.
        // Pero en la base de datos y la regla del negocio,
        // la baja lógica desde el link personal se realiza mediante el mismo DELETE.
        // Si el backend lo expone de forma pública bajo el link o validando el token,
        // podemos pasar la cabecera si existe o no.
        // Por seguridad, si el operador está logueado se la pasamos.
        // El backend maneja su propia seguridad para solicitudes públicas / privadas.
        
        const url = `${BACKEND_URL}/autorizacion/${idAutorizacion}`;
        console.log('PROXY [DELETE AUTORIZACION]:', url);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, {
            method: 'DELETE',
            headers
        });

        const text = await res.text();

        return new NextResponse(text, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('ERROR PROXY DELETE AUTORIZACION:', error);
        return NextResponse.json(
            { message: 'Error interno del proxy' },
            { status: 500 }
        );
    }
}
