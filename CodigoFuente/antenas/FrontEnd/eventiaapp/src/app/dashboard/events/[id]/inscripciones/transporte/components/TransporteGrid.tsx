'use client';

import { Bus, HeartPulse, AlertTriangle, Phone } from 'lucide-react';
import type { TransporteDiaItem } from '@/src/features/programas/types';

interface Props {
    participantes: TransporteDiaItem[];
}

export default function TransporteGrid({ participantes }: Props) {
    if (participantes.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-card-bg border border-card-border text-center">
                <Bus className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <p className="text-muted text-sm">No hay participantes con servicio de transporte para este día.</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-card-border overflow-hidden bg-card-bg">
            {/* Cabecera */}
            <div className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_2fr] gap-4 px-6 py-3 border-b border-card-border bg-card-bg/80">
                {['Participante', 'Responsable', 'Teléfono', 'Servicio', 'Alertas / Obs. Salud'].map((h) => (
                    <span key={h} className="text-[11px] font-black text-muted uppercase tracking-widest">{h}</span>
                ))}
            </div>

            {/* Filas */}
            <div className="divide-y divide-card-border">
                {participantes.map((item) => (
                    <div
                        key={item.idInvitado}
                        className={`grid grid-cols-[2fr_2fr_1.5fr_1.2fr_2fr] gap-4 px-6 py-4 items-center transition-colors hover:bg-card-hover
                            ${item.tieneAlertaSalud ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}
                    >
                        {/* Participante */}
                        <div className="flex items-center gap-2">
                            {item.tieneAlertaSalud && (
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-label="Alerta de salud" />
                            )}
                            <span className="font-semibold text-sm text-foreground">{item.participante}</span>
                        </div>

                        {/* Responsable */}
                        <span className="text-sm text-foreground/80">{item.responsable}</span>

                        {/* Teléfono */}
                        <a
                            href={`tel:${item.telefonoResponsable}`}
                            className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {item.telefonoResponsable}
                        </a>

                        {/* Servicio */}
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold w-fit">
                            {item.servicio}
                        </span>

                        {/* Observaciones Salud */}
                        <div>
                            {item.tieneAlertaSalud && item.observacionesSalud ? (
                                <div className="flex items-start gap-1.5">
                                    <HeartPulse className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                                    <span className="text-xs text-red-300 leading-relaxed">{item.observacionesSalud}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-muted">—</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
