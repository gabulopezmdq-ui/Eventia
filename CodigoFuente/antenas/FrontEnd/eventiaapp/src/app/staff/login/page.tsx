'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StaffLoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login?tab=staff');
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Redirigiendo al portal unificado de acceso...
            </p>
        </div>
    );
}
