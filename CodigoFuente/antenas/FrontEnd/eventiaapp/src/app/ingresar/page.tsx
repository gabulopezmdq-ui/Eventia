'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function Redirector() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const queryParams = new URLSearchParams(searchParams.toString());
        queryParams.set('tab', 'invitado');
        router.replace(`/login?${queryParams.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Redirigiendo al portal unificado de acceso...
            </p>
        </div>
    );
}

export default function IngresarPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Cargando...</p>
            </div>
        }>
            <Redirector />
        </Suspense>
    );
}
