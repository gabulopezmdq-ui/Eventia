import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Decodificar el JWT para obtener la info del usuario (sin verificar firma en cliente)
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);

        return NextResponse.json({
            email: payload.sub || payload.email,
            rol: payload.rol || payload.role || 'user',
            exp: payload.exp,
        });
    } catch (error) {
        console.error('Error decoding token:', error);
        return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
}
