'use client';

import { SaludAccionItem } from '@/src/features/inscripcion/types/salud.types';
import { Eye, Plus, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    items: SaludAccionItem[];
    onVerDetalle: (idInvitado: number, scrollTo: 'acciones') => void;
    onRegistrarAccion: () => void;
}

const TIPO_COLORS: Record<string, string> = {
    MEDICACION: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    PRIMEROS_AUXILIOS: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    CONTACTO_FAMILIA: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    DERIVACION: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    OBSERVACION: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

function BoolCell({ value }: { value: boolean }) {
    return value
        ? <span className="flex items-center justify-center gap-1 text-emerald-500 text-xs"><CheckCircle2 className="w-3.5 h-3.5" />Sí</span>
        : <span className="flex items-center justify-center gap-1 text-muted text-xs"><XCircle className="w-3.5 h-3.5" />No</span>;
}

export default function AccionesTab({ items, onVerDetalle, onRegistrarAccion }: Props) {
    if (items.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center text-muted text-sm">
                <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No hay acciones registradas aún.
                <div className="mt-4">
                    <button onClick={onRegistrarAccion} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 mx-auto transition-colors">
                        <Plus className="w-4 h-4" /> Registrar primera acción
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-card-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-card-border bg-card-bg">
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Fecha / Hora</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Tipo</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Descripción</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden md:table-cell">Contactó familia</th>
                        <th className="text-center px-4 py-3 text-xs font-black text-muted uppercase tracking-widest hidden md:table-cell">Seguimiento</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-muted uppercase tracking-widest">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => {
                        const tipoStyle = TIPO_COLORS[item.tipo_accion] ?? 'bg-card-bg text-muted border-card-border';
                        return (
                            <tr key={item.id_accion_salud} className={`border-b border-card-border transition-colors hover:bg-card-bg/50 ${idx % 2 === 0 ? '' : 'bg-card-bg/20'}`}>
                                <td className="px-4 py-3 text-muted whitespace-nowrap">
                                    {new Date(item.fecha_hora).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase ${tipoStyle}`}>
                                        {item.tipo_accion.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-foreground/80 max-w-xs truncate">{item.descripcion}</td>
                                <td className="px-4 py-3 text-center hidden md:table-cell"><BoolCell value={item.contacto_realizado} /></td>
                                <td className="px-4 py-3 text-center hidden md:table-cell"><BoolCell value={item.requiere_seguimiento} /></td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => onVerDetalle(item.id_participante, 'acciones')}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-card-border text-muted hover:text-foreground text-xs font-semibold transition-colors ml-auto"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Ver detalle
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
