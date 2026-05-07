'use client';

import { Bus, MessageSquare, HeartPulse } from 'lucide-react';
import type { TransporteDiaResumen } from '@/src/features/programas/types';

interface Props {
    resumen: TransporteDiaResumen;
}

const cards = [
    {
        key: 'total' as const,
        label: 'Total Transporte',
        icon: Bus,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    {
        key: 'conObservaciones' as const,
        label: 'Con Observaciones',
        icon: MessageSquare,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    {
        key: 'conAlertasSalud' as const,
        label: 'Alertas Salud',
        icon: HeartPulse,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
    },
];

export default function TransporteSummaryCards({ resumen }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({ key, label, icon: Icon, color, bg, border }) => (
                <div
                    key={key}
                    className={`rounded-2xl border ${border} ${bg} p-5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                    <div className={`p-3 rounded-xl ${bg} border ${border}`}
                    >
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground">{resumen[key]}</p>
                        <p className="text-xs font-semibold text-muted uppercase tracking-widest mt-0.5">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
