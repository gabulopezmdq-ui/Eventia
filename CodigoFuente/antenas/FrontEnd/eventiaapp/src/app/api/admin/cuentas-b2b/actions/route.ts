import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST para redirigir a PUT (Aprobar, Suspender, Reactivar, CambiarPlan)
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const url = new URL(request.url);
        const action = url.searchParams.get('action'); // Aprobar, Suspender, Reactivar, CambiarPlan
        
        if (!['Aprobar', 'Suspender', 'Reactivar', 'CambiarPlan'].includes(action || '')) {
             return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
        }

        const body = await request.json();

        const res = await fetch(`${API_URL}/admin/cuentas/${action}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ message: `Error al ${action}`, details: err }, { status: res.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
