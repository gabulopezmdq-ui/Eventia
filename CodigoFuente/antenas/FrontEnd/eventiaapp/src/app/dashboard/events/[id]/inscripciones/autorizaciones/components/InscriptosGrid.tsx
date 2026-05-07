'use client';

import { ShieldCheck } from 'lucide-react';
import type { InscriptoFila } from '@/src/features/inscripcion/types/panel-inscriptos.types';

interface Props {
    inscriptos: InscriptoFila[];
    onVerAutorizaciones: (idInscripcion: number) => void;
}

export default function InscriptosGrid({ inscriptos, onVerAutorizaciones }: Props) {
    if (!inscriptos.length) return (
        <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center text-muted">
            No hay inscriptos registrados.
        </div>
    );

    return (
        <div className="rounded-2xl border border-card-border overflow-hidden bg-card-bg">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-muted text-xs font-semibold uppercase tracking-widest">
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Responsable</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Teléfono</th>
                            <th className="px-4 py-3 text-center">Autorizaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inscriptos.map((i, idx) => (
                            <tr key={i.idInscripcion}
                                className={`border-t border-card-border transition-colors hover:bg-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                                <td className="px-4 py-3 text-muted font-mono">{i.idInscripcion}</td>
                                <td className="px-4 py-3 font-semibold text-foreground">{i.responsable}</td>
                                <td className="px-4 py-3 text-muted">{i.email}</td>
                                <td className="px-4 py-3 text-muted">{i.telefono}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => onVerAutorizaciones(i.idInscripcion)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-semibold text-xs border border-violet-500/20 transition-all"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
