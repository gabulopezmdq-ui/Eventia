'use client';

import { SaludFichaItem } from '@/src/features/inscripcion/types/salud.types';
import { Eye, CheckCircle2, XCircle, Users, Phone, Stethoscope } from 'lucide-react';

interface Props {
    items: SaludFichaItem[];
    onVerDetalle: (idInvitado: number) => void;
}

function BoolCell({ value }: { value: boolean }) {
    return value
        ? <span className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Sí</span>
        : <span className="flex items-center justify-center gap-1 text-muted text-xs"><XCircle className="w-3.5 h-3.5" />No</span>;
}

export default function FichasTab({ items, onVerDetalle }: Props) {
    if (items.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center text-muted text-sm">
                <Stethoscope className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No hay fichas que coincidan con los filtros aplicados.
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
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Prob. médico</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Alergias</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden lg:table-cell">Nec. especial</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden lg:table-cell">Autoriza emerg.</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.id_invitado} className={`border-b border-card-border transition-colors hover:bg-card-bg/50 ${idx % 2 === 0 ? '' : 'bg-card-bg/20'}`}>
                            <td className="px-4 py-3">
                                <div className="font-semibold text-foreground">{item.participante}</div>
                                <div className="text-xs text-muted flex items-center gap-1">
                                    <Users className="w-3 h-3" />{item.acciones_salud_count} acciones
                                </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                                <div className="text-foreground/80">{item.responsable}</div>
                                <div className="flex items-center gap-1 text-muted text-xs"><Phone className="w-3 h-3" />{item.telefono_responsable}</div>
                            </td>
                            <td className="px-4 py-3 text-center"><BoolCell value={item.tiene_problema_medico} /></td>
                            <td className="px-4 py-3 text-center"><BoolCell value={item.tiene_alergias_no_alimentarias} /></td>
                            <td className="px-4 py-3 text-center hidden lg:table-cell"><BoolCell value={item.tiene_necesidad_especial} /></td>
                            <td className="px-4 py-3 text-center hidden lg:table-cell"><BoolCell value={item.autoriza_emergencia_medica} /></td>
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
