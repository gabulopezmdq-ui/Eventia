import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Reenviamos el body al backend
        const res = await fetch(`${API_URL}/prospectos_b2b/QuieroInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.error("Backend Error /prospectos_b2b/QuieroInfo:", res.status, res.statusText);
            return NextResponse.json(
                { error: "Error en la petición al servidor" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to post prospectos:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
