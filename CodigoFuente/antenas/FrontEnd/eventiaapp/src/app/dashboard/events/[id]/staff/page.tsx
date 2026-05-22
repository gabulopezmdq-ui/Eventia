'use client';

import { use } from 'react';
import StaffManager from '@/src/features/programas/components/StaffManager';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
    params: Promise<{ id: string }>;
}

export default function EventStaffPage({ params }: Props) {
    const { id } = use(params);
    const idEvento = Number(id);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
                <Link
                    href={`/dashboard/events/${idEvento}`}
                    className="p-2 text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Equipo y Staff del Evento</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Configuración y administración de accesos del personal para el evento.</p>
                </div>
            </div>
            
            <StaffManager idEvento={idEvento} tipoOperacion="EVENTO" />
        </div>
    );
}
