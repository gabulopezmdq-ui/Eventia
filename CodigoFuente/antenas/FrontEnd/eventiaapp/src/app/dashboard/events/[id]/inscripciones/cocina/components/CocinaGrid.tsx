import { ParticipanteCocina } from '@/src/features/inscripcion/types/cocina.types';
import { Eye, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface Props {
    participantes: ParticipanteCocina[];
    onVerDetalle: (idInvitado: number) => void;
}

export default function CocinaGrid({ participantes, onVerDetalle }: Props) {
    const getAlertIcon = (nivel: string) => {
        switch (nivel) {
            case 'ALTA':
                return <ShieldAlert className="w-5 h-5 text-red-500" aria-label="Alerta Alta" />;
            case 'MEDIA':
                return <AlertTriangle className="w-5 h-5 text-amber-500" aria-label="Alerta Media" />;
            case 'NORMAL':
            default:
                return null;
        }
    };

    if (!participantes || participantes.length === 0) {
        return (
            <div className="p-8 sm:p-12 rounded-2xl bg-card-bg border border-card-border text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <Info className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No hay comensales</h3>
                <p className="text-muted max-w-sm text-sm mb-6">
                    Para la fecha seleccionada no se encontraron participantes anotados en este servicio.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-card-bg border border-card-border overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest bg-background/50">
                        <th className="px-6 py-4 font-bold text-center w-16">⚠</th>
                        <th className="px-6 py-4 font-bold">Participante</th>
                        <th className="px-6 py-4 font-bold">Responsable</th>
                        <th className="px-6 py-4 font-bold">Teléfono</th>
                        <th className="px-6 py-4 font-bold w-64">Restricciones</th>
                        <th className="px-6 py-4 font-bold">Observaciones</th>
                        <th className="px-6 py-4 font-bold text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {participantes.map((p) => (
                        <tr key={p.idInvitado} className="border-b border-card-border/30 last:border-b-0 hover:bg-background/50 transition-colors">
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                    {getAlertIcon(p.nivelAlerta)}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-foreground">{p.participante}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-foreground/90">{p.responsable}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-[12px] text-muted font-mono">{p.telefonoResponsable || '—'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {p.restricciones && p.restricciones.length > 0 ? (
                                        p.restricciones.map((rest, idx) => (
                                            <span
                                                key={idx}
                                                className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${rest.requiereAlertaVisual
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                    }`}
                                            >
                                                {rest.texto}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted italic">Ninguna</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    {p.restricciones && p.restricciones.map((rest, idx) => (
                                        rest.observaciones ? (
                                            <p key={idx} className="text-xs text-muted leading-relaxed line-clamp-2" title={rest.observaciones}>
                                                {rest.observaciones}
                                            </p>
                                        ) : null
                                    ))}
                                    {(!p.restricciones || !p.restricciones.some(r => r.observaciones)) && (
                                        <span className="text-xs text-muted italic">—</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onVerDetalle(p.idInvitado)}
                                    className="p-2 rounded-lg bg-card-bg border border-card-border text-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-all inline-flex justify-center items-center"
                                    title="Ver detalle"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
