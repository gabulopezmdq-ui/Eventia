'use client';

import { SaludPanelResponse } from '@/src/features/inscripcion/types/salud.types';
import { Eye, WheatOff, AlertTriangle } from 'lucide-react';

interface Props {
    items: SaludPanelResponse[];
    onVerDetalle: (idInvitado: number) => void;
}

const NIVEL_STYLES: Record<string, string> = {
    ALTA: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    MEDIA: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    NORMAL: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export default function RestriccionesTab({ items, onVerDetalle }: Props) {
    // Solo participantes con restricciones alimentarias
    const filtered = items.filter(i => i.tiene_restricciones_alimentarias && i.restricciones_alimentarias.length > 0);

    if (filtered.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center text-muted text-sm">
                <WheatOff className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No hay participantes con restricciones alimentarias registradas.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-card-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-card-border bg-card-bg">
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Participante</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden md:table-cell">Responsable</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Restricciones</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Nivel alerta</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((item, idx) => (
                        <tr key={item.id_invitado} className={`border-b border-card-border transition-colors hover:bg-card-bg/50 ${idx % 2 === 0 ? '' : 'bg-card-bg/20'}`}>
                            <td className="px-4 py-3 font-semibold text-foreground">{item.participante}</td>
                            <td className="px-4 py-3 text-muted hidden md:table-cell">{item.responsable}</td>
                            <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                    {item.restricciones_alimentarias.map((r) => (
                                        <span key={r} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 uppercase">
                                            {r.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {item.alerta_visual ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase ${NIVEL_STYLES[item.nivel_alerta] ?? NIVEL_STYLES.NORMAL}`}>
                                        <AlertTriangle className="w-3 h-3" />{item.nivel_alerta}
                                    </span>
                                ) : <span className="text-muted text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => onVerDetalle(item.id_invitado)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-card-border text-muted hover:text-foreground text-xs font-semibold transition-colors ml-auto"
                                >
                                    <Eye className="w-3.5 h-3.5" /> Ver detalle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
