'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    aceptada: boolean;
    titulo: string;
    firmante?: string;
    fecha?: string;
}

export default function AutorizacionChip({ aceptada, titulo, firmante, fecha }: Props) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
            aceptada
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
        }`}>
            {aceptada
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                : <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            }
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className={`text-sm font-semibold ${aceptada ? 'text-emerald-300' : 'text-red-400'}`}>
                    {titulo}
                </span>
                {firmante && (
                    <span className="text-xs text-muted">
                        Firmó: {firmante}
                        {fecha && ` · ${new Date(fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`}
                    </span>
                )}
            </div>
        </div>
    );
}
