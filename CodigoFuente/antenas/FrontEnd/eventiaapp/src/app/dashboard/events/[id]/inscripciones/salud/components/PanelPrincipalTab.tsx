'use client';

import { SaludPanelResponse } from '@/src/features/inscripcion/types/salud.types';
import { ShieldAlert, AlertTriangle, Pill, ClipboardList, Eye, Plus } from 'lucide-react';

interface Props {
    items: SaludPanelResponse[];
    onVerDetalle: (idInvitado: number) => void;
    onRegistrarAccion: (invitado: { id: number; nombre: string; id_inscripcion: number }) => void;
}

const NIVEL_STYLES: Record<string, string> = {
    ALTA: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    MEDIA: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    NORMAL: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export default function PanelPrincipalTab({ items, onVerDetalle, onRegistrarAccion }: Props) {
    if (items.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center text-muted text-sm">
                No hay participantes que coincidan con los filtros aplicados.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-card-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-card-border bg-card-bg">
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Participante</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden md:table-cell">Responsable / Tel.</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden lg:table-cell">Restricciones</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Medicación</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Seguimiento</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Alerta</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr
                            key={item.id_invitado}
                            className={`border-b border-card-border transition-colors hover:bg-card-bg/50 ${idx % 2 === 0 ? '' : 'bg-card-bg/20'}`}
                        >
                            <td className="px-4 py-3">
                                <div className="font-semibold text-foreground">{item.participante}</div>
                                {item.tiene_problema_medico && (
                                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold mt-0.5">
                                        <ShieldAlert className="w-3 h-3" /> Problema médico
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                                <div className="text-foreground/80">{item.responsable}</div>
                                <div className="text-muted text-xs">{item.telefono_responsable}</div>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                                {item.restricciones_alimentarias.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {item.restricciones_alimentarias.slice(0, 2).map((r) => (
                                            <span key={r} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                                                {r.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                        {item.restricciones_alimentarias.length > 2 && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card-border text-muted">+{item.restricciones_alimentarias.length - 2}</span>
                                        )}
                                    </div>
                                ) : <span className="text-muted">—</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {item.tiene_medicacion
                                    ? <span className="flex items-center justify-center gap-1 text-blue-500 text-xs font-bold"><Pill className="w-3.5 h-3.5" />Sí</span>
                                    : <span className="text-muted text-xs">No</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {item.requiere_seguimiento
                                    ? <span className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold"><ClipboardList className="w-3.5 h-3.5" />Sí</span>
                                    : <span className="text-muted text-xs">No</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {item.alerta_visual ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase ${NIVEL_STYLES[item.nivel_alerta] ?? NIVEL_STYLES.NORMAL}`}>
                                        <AlertTriangle className="w-3 h-3" />{item.nivel_alerta}
                                    </span>
                                ) : <span className="text-muted text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onVerDetalle(item.id_invitado)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-card-border text-muted hover:text-foreground text-xs font-semibold transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Ver detalle
                                    </button>
                                    <button
                                        onClick={() => onRegistrarAccion({ id: item.id_invitado, nombre: item.participante, id_inscripcion: item.id_inscripcion })}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Acción
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
