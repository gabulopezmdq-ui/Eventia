import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Campos legacy para no romper el código existente
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeJwtLegacyFields(token: string): { email: string; rol: string; exp: number } {
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        return {
            email: payload.email ?? payload.sub ?? '',
            rol: payload[ROLE_CLAIM]?.toLowerCase() ?? 'user',
            exp: payload.exp ?? 0,
        };
    } catch {
        return { email: '', rol: 'user', exp: 0 };
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Campos legacy (backward compat: layout, events/page, parametricas usan user.rol)
        const legacy = decodeJwtLegacyFields(token);

        // Llamada al backend real para obtener contexto completo B2C/B2B
        const backendRes = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!backendRes.ok) {
            console.warn('Fallback: Backend /auth/me no respondió 2xx. Usando datos legacy del JWT.');
            return NextResponse.json({
                email: legacy.email,
                rol: legacy.rol,
                exp: legacy.exp,
                usuario: { id_usuario: 0, email: legacy.email },
                cuenta: null,
                eventos: { cantidad_propios: 0, cantidad_compartidos: 0 },
                ui: {
                    mostrar_menu_cuenta: false,
                    puede_crear_evento_b2c: true, // Por defecto para que fluya B2C
                    mostrar_solicitar_cuenta: false,
                    mostrar_estado_cuenta_pendiente: false,
                    mostrar_admin: legacy.rol === 'superadmin'
                },
                roles_globales: [legacy.rol]
            });
        }

        const backendData = await backendRes.json();

        // Fusionamos: legacy (rol, email, exp) + respuesta completa del backend (ui, cuenta, eventos, espacios)
        return NextResponse.json({
            // ── Campos legacy (código existente los sigue leyendo sin cambios) ──
            email: legacy.email,
            rol: legacy.rol,
            exp: legacy.exp,
            // ── Nuevos campos del backend (para AuthContext y módulo B2B) ──
            usuario: backendData.usuario ?? null,
            cuenta: backendData.cuenta ?? null,
            eventos: backendData.eventos ?? null,
            ui: backendData.ui ?? null,
            roles_globales: backendData.roles_globales ?? [],
            espacios: backendData.espacios ?? [],
        });
    } catch (error) {
        console.error('Error en proxy /auth/me:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}
