import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleProxy(
    request: NextRequest,
    context: { params: Promise<{ id: string; path?: string[] }> }
) {
    try {
        const { id, path = [] } = await context.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const subPath = path.join('/');
        const { searchParams } = new URL(request.url);
        const queryStr = searchParams.toString();
        const targetUrl = `${API_URL}/eventos/${id}/regalos${subPath ? '/' + subPath : ''}${queryStr ? '?' + queryStr : ''}`;

        let body: any = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            body = await request.text().catch(() => '');
        }

        const res = await fetch(targetUrl, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: body ? body : undefined,
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            let errJson;
            try {
                errJson = JSON.parse(errText);
            } catch {
                errJson = { message: errText };
            }
            return NextResponse.json(
                { message: `Error en proxy backend: ${request.method} ${subPath}`, details: errJson },
                { status: res.status }
            );
        }

        const responseText = await res.text();
        try {
            return NextResponse.json(JSON.parse(responseText));
        } catch {
            return new NextResponse(responseText, { status: 200 });
        }
    } catch (error) {
        console.error('Proxy Event Gifts Error:', error);
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}

export {
    handleProxy as GET,
    handleProxy as POST,
    handleProxy as PUT,
    handleProxy as DELETE,
};
