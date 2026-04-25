'use client';

import { use, useEffect, useState } from 'react';
import PublicLanding from '@/src/components/captacion/PublicLanding';
import { getLandingPublica } from '@/src/features/captacion/captacion.service';
import type { LandingData } from '@/src/features/captacion/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegistroPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [data, setData] = useState<LandingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getLandingPublica(token)
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Enlace no válido</h1>
                <p className="text-white/60 max-w-md">{error || 'La campaña solicitada no existe o ha expirado.'}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30">
            <PublicLanding data={data} token={token} />
        </main>
    );
}
