import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAdminToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value ?? null;
}

export async function PUT(request: Request) {
    try {
        const token = await getAdminToken();
        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        let idCuenta = searchParams.get('idCuenta');
        let idCuentaUsuario = searchParams.get('idCuentaUsuario');
        let activo = searchParams.get('activo');

        // Por si acaso el frontend manda la info en el body de la petición
        if (!idCuenta || !idCuentaUsuario || activo === null) {
            const body = await request.json().catch(() => ({}));
            if (body.idCuenta) idCuenta = String(body.idCuenta);
            if (body.idCuentaUsuario) idCuentaUsuario = String(body.idCuentaUsuario);
            if (body.activo !== undefined) activo = String(body.activo);
        }

        if (!idCuenta || !idCuentaUsuario || activo === null) {
            return NextResponse.json({ message: 'idCuenta, idCuentaUsuario y activo son requeridos' }, { status: 400 });
        }

        const backendUrl = `${API_URL}/cuenta_usuarios/SetActivo?idCuenta=${idCuenta}&idCuentaUsuario=${idCuentaUsuario}&activo=${activo}`;
        
        const res = await fetch(backendUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json({
                message: data.message || 'Error al cambiar el estado del usuario.'
            }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error en proxy SetActivo:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
