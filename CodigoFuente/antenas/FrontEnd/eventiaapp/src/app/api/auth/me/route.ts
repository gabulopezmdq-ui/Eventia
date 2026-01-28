import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Decode JWT (sin verificar firma, solo lectura)
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);

        const role =
            payload[ROLE_CLAIM]?.toLowerCase() ?? 'user';

        return NextResponse.json({
            email: payload.email ?? payload.sub,
            rol: role, // ← superadmin
            exp: payload.exp,
        });
    } catch (error) {
        console.error('Error decoding token:', error);
        return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
}
