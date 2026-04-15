import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mercado = searchParams.get('mercado') || 'AR';
        const moneda = searchParams.get('moneda') || 'ARS';
        const tipo = searchParams.get('tipo') || 'B2C';

        const res = await fetch(`${API_URL}/planesPublic/PublicCatalog?mercado=${mercado}&moneda=${moneda}&tipo=${tipo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error("Backend Error /planesPublic/PublicCatalog:", res.status, res.statusText);
            return NextResponse.json(
                { error: "Error en la petición al servidor" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch catalog:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
