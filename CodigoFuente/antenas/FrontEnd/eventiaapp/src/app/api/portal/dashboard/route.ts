import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Proxy protegido para GET /api/portal/dashboard
 * Requiere el JWT generado por la Soft Verification en la cabecera Authorization.
 * Devuelve el perfil del responsable y las secciones habilitadas configuradas
 * para ese evento/programa.
 *
 * Headers requeridos:
 *   Authorization: Bearer <jwt_token_24h>
 *
 * Responde 401 si el JWT expiró o es inválido — el frontend debe
 * eliminar el token de sessionStorage y redirigir al modal de verificación.
 */
export async function GET(req: Request) {
    try {
        // Reenviar el header de autorización al backend tal cual lo recibimos
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { message: 'Token de verificación requerido. Por favor, verificá tu email.' },
                { status: 401 }
            );
        }

        const res = await fetch(`${API_URL}/api/portal/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (res.status === 401) {
            // JWT expirado o inválido — el frontend deberá solicitar nueva verificación
            return NextResponse.json(
                { message: 'Sesión expirada. Por favor, verificá tu email nuevamente.' },
                { status: 401 }
            );
        }

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: 'Error al obtener el dashboard del portal', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy portal dashboard GET Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
