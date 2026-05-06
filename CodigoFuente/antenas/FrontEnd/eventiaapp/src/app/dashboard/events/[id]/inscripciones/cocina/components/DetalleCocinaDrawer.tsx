import { useState, useEffect } from 'react';
import {
    X,
    User,
    Phone,
    Mail,
    CalendarDays,
    WheatOff,
    Stethoscope,
    ShieldAlert,
    AlertTriangle,
    Utensils,
    Loader2,
} from 'lucide-react';
import { ParticipanteDetalleResponse } from '@/src/features/inscripcion/types/cocina.types';
import { getParticipanteCocinaDetalle } from '@/src/features/inscripcion/cocina.service';

interface DetalleCocinaDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    idEvento: number;
    idInvitado: number | null;
    fecha: string;
}

export default function DetalleCocinaDrawer({ isOpen, onClose, idEvento, idInvitado, fecha }: DetalleCocinaDrawerProps) {
    const [detalle, setDetalle] = useState<ParticipanteDetalleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDetalle() {
            if (!idInvitado) return;
            setIsLoading(true);
            setError(null);
            setDetalle(null);
            try {
                const data = await getParticipanteCocinaDetalle(idEvento, idInvitado, fecha);
                setDetalle(data);
            } catch (err) {
                setError('No se pudo cargar el detalle del participante.');
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen && idInvitado) {
            loadDetalle();
        }
    }, [idInvitado, idEvento, fecha, isOpen]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-card-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header Drawer */}
                <div className="flex items-center justify-between p-6 border-b border-card-border bg-card-bg">
                    <h2 className="text-xl font-bold text-foreground">Ficha de Cocina</h2>
                    <button onClick={onClose} className="p-2 rounded-xl text-muted hover:bg-muted/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-sm font-medium">Cargando ficha del participante...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20">
                            {error}
                        </div>
                    ) : !detalle ? (
                        <div className="text-center text-muted py-10">No hay datos disponibles</div>
                    ) : (
                        <>
                            {/* ── Encabezado Participante ── */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{detalle.participante.nombreCompleto}</h3>
                                        <p className="text-sm text-muted">
                                            Responsable: <span className="font-semibold text-foreground/80">{detalle.responsable.nombreCompleto}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {detalle.responsable.telefono && (
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <Phone className="w-4 h-4 text-emerald-500/70 flex-shrink-0" />
                                            <span>{detalle.responsable.telefono}</span>
                                        </div>
                                    )}
                                    {detalle.responsable.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <Mail className="w-4 h-4 text-emerald-500/70 flex-shrink-0" />
                                            <span className="truncate">{detalle.responsable.email}</span>
                                        </div>
                                    )}
                                    {detalle.fecha && (
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <CalendarDays className="w-4 h-4 text-emerald-500/70 flex-shrink-0" />
                                            <span>
                                                {new Date(detalle.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                                                    day: '2-digit', month: 'long', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {detalle.serviciosDelDia?.map((s) => (
                                        <div key={s.codigo} className="flex items-center gap-2 text-sm">
                                            <Utensils className="w-4 h-4 text-teal-500/70 flex-shrink-0" />
                                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                                                {s.nombre}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Nivel de Alerta ── */}
                            {detalle.nivelAlerta === 'ALTA' && (
                                <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-semibold">
                                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">Alerta Visual — Nivel ALTA</span>
                                </div>
                            )}
                            {detalle.nivelAlerta === 'MEDIA' && (
                                <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">Alerta Visual — Nivel MEDIA</span>
                                </div>
                            )}

                            {/* ── Restricciones Alimentarias ── */}
                            {detalle.restricciones && detalle.restricciones.length > 0 && (
                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 border-b border-card-border pb-2">
                                        <WheatOff className="w-4 h-4" /> Restricciones Alimentarias
                                    </h5>
                                    <div className="space-y-3">
                                        {detalle.restricciones.map((r) => (
                                            <div
                                                key={r.idRestriccionAlim}
                                                className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 space-y-1.5"
                                            >
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-foreground text-sm">{r.texto}</span>
                                                    {r.esAlergeno && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-black bg-red-500/10 text-red-500 border border-red-500/20">
                                                            Alérgeno
                                                        </span>
                                                    )}
                                                    {r.requiereAlertaVisual && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                            Alerta Visual
                                                        </span>
                                                    )}
                                                </div>
                                                {r.observaciones && (
                                                    <p className="text-xs text-muted leading-relaxed">{r.observaciones}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Salud ── */}
                            {Array.isArray(detalle.salud) && detalle.salud.length > 0 && (
                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-3 border-b border-card-border pb-2">
                                        <Stethoscope className="w-4 h-4" /> Información de Salud
                                    </h5>
                                    <div className="space-y-3">
                                        {detalle.salud.map((s, idx) => (
                                            <div key={idx} className="p-4 rounded-xl border bg-red-500/5 border-red-500/20 space-y-2 text-sm">
                                                {s.problemaMedico && (
                                                    <div>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-0.5">Problema Médico</span>
                                                        <p className="text-foreground font-medium">{s.problemaMedico}</p>
                                                    </div>
                                                )}
                                                {s.necesidadEspecial && (
                                                    <div>
                                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-0.5">Necesidad Especial</span>
                                                        <p className="text-foreground">{s.necesidadEspecial}</p>
                                                    </div>
                                                )}
                                                {s.observacionesFamilia && (
                                                    <div>
                                                        <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-0.5">Observaciones Familia</span>
                                                        <p className="text-muted italic">"{s.observacionesFamilia}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
