'use client';

import { SaludMedicacionItem } from '@/src/features/inscripcion/types/salud.types';
import { Eye, Pill, CheckCircle2, XCircle, Thermometer } from 'lucide-react';

interface Props {
    items: SaludMedicacionItem[];
    onVerDetalle: (idInvitado: number, scrollTo: 'medicaciones') => void;
}

export default function MedicacionesTab({ items, onVerDetalle }: Props) {
    if (items.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center text-muted text-sm">
                <Pill className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No hay medicaciones declaradas para este programa.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-card-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-card-border bg-card-bg">
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Participante</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Medicación</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden md:table-cell">Dosis</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden lg:table-cell">Frecuencia</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden lg:table-cell">Horario</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Req. Autorización</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.id_medicacion} className={`border-b border-card-border transition-colors hover:bg-card-bg/50 ${idx % 2 === 0 ? '' : 'bg-card-bg/20'}`}>
                            <td className="px-4 py-3 font-semibold text-foreground">{item.participante ?? '—'}</td>
                            <td className="px-4 py-3">
                                <div className="font-bold text-blue-600 dark:text-blue-400">{item.nombre_medicamento}</div>
                                {item.requiere_refrigeracion && (
                                    <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-0.5">
                                        <Thermometer className="w-3 h-3" /> Refrigeración
                                    </div>
                                )}
                                {item.debe_llevar_participante && (
                                    <div className="text-[10px] text-muted font-semibold mt-0.5">Lleva el participante</div>
                                )}
                            </td>
                            <td className="px-4 py-3 text-muted hidden md:table-cell">{item.dosis}</td>
                            <td className="px-4 py-3 text-muted hidden lg:table-cell">{item.frecuencia}</td>
                            <td className="px-4 py-3 text-muted hidden lg:table-cell">{item.horario ?? '—'}</td>
                            <td className="px-4 py-3 text-center">
                                {item.administracion_autorizada
                                    ? <span className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Sí</span>
                                    : <span className="flex items-center justify-center gap-1 text-muted text-xs"><XCircle className="w-3.5 h-3.5" />No</span>}
                            </td>
                            <td className="px-4 py-3 text-right">
                                {item.id_participante && (
                                    <button
                                        onClick={() => onVerDetalle(item.id_participante!, 'medicaciones')}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-card-border text-muted hover:text-foreground text-xs font-semibold transition-colors ml-auto"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Ver detalle
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
