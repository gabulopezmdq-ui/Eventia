import { RetiroDiaItem } from '@/src/features/programas/types';
import { Info } from 'lucide-react';

interface Props {
    items: RetiroDiaItem[];
}

export default function RetirosGrid({ items }: Props) {
    if (!items || items.length === 0) {
        return (
            <div className="p-8 sm:p-12 rounded-2xl bg-card-bg border border-card-border text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <Info className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No hay retiros</h3>
                <p className="text-muted max-w-sm text-sm mb-6">
                    Para la fecha seleccionada no se registraron retiros aún.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-card-bg border border-card-border overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest bg-background/50">
                        <th className="px-6 py-4 font-bold">Hora</th>
                        <th className="px-6 py-4 font-bold">Participante</th>
                        <th className="px-6 py-4 font-bold">Retiró</th>
                        <th className="px-6 py-4 font-bold">Teléfono</th>
                        <th className="px-6 py-4 font-bold">Método</th>
                        <th className="px-6 py-4 font-bold">Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((p) => {
                        const dateObj = new Date(p.fechaRetiro);
                        const horaFormateada = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

                        return (
                            <tr key={p.idRetiro} className="border-b border-card-border/30 last:border-b-0 hover:bg-background/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-foreground/80">{horaFormateada}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-foreground">{p.participante}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-foreground/90">{p.nombreRetirador}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[12px] text-muted font-mono">{p.telefonoRetirador || '—'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                                        p.metodoValidacion === 'A' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                        p.metodoValidacion === 'M' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                                        'bg-gray-500/10 border-gray-500/20 text-gray-600'
                                    }`}>
                                        {p.metodoValidacion === 'A' ? 'QR Autorizado' :
                                         p.metodoValidacion === 'M' ? 'Manual' : 'Otro'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-muted leading-relaxed line-clamp-2" title={p.observaciones}>
                                        {p.observaciones || '—'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
