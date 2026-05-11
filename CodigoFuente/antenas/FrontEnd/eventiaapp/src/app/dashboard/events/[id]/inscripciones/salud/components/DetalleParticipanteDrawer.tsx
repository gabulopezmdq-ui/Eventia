'use client';

import { useState, useEffect, useRef } from 'react';
import {
    X, User, Phone, Mail, Stethoscope, ShieldAlert, AlertTriangle,
    Pill, WheatOff, ClipboardList, CheckCircle2, XCircle, Loader2, Plus
} from 'lucide-react';
import type { SaludParticipanteDetalle } from '@/src/features/inscripcion/types/salud.types';
import { getSaludParticipanteDetalle } from '@/src/features/inscripcion/salud.service';

export type ScrollTarget = 'top' | 'medicaciones' | 'acciones';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    idEvento: number;
    idInvitado: number | null;
    scrollTo?: ScrollTarget;
    onRegistrarAccion?: (invitado: { id: number; nombre: string; id_inscripcion: number }) => void;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-0.5">{label}</span>
            <p className="text-sm text-foreground font-medium">{value}</p>
        </div>
    );
}

function BoolBadge({ value, labelTrue, labelFalse }: { value: boolean; labelTrue: string; labelFalse?: string }) {
    return value
        ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs"><CheckCircle2 className="w-3.5 h-3.5" />{labelTrue}</span>
        : <span className="flex items-center gap-1 text-muted font-semibold text-xs"><XCircle className="w-3.5 h-3.5" />{labelFalse ?? `No ${labelTrue}`}</span>;
}

export default function DetalleParticipanteDrawer({ isOpen, onClose, idEvento, idInvitado, scrollTo = 'top', onRegistrarAccion }: Props) {
    const [detalle, setDetalle] = useState<SaludParticipanteDetalle | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const medicacionesRef = useRef<HTMLDivElement>(null);
    const accionesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !idInvitado) return;
        setIsLoading(true);
        setError(null);
        setDetalle(null);
        getSaludParticipanteDetalle(idEvento, idInvitado)
            .then(setDetalle)
            .catch(() => setError('No se pudo cargar el detalle del participante.'))
            .finally(() => setIsLoading(false));
    }, [isOpen, idInvitado, idEvento]);

    useEffect(() => {
        if (!detalle || scrollTo === 'top') return;
        const timeout = setTimeout(() => {
            const ref = scrollTo === 'medicaciones' ? medicacionesRef : accionesRef;
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
        return () => clearTimeout(timeout);
    }, [detalle, scrollTo]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed inset-y-0 right-0 w-full md:w-[680px] bg-background border-l border-card-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-card-border bg-card-bg flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Ficha de Salud</h2>
                        {detalle && <p className="text-sm text-muted mt-0.5">{detalle.participante}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {detalle && onRegistrarAccion && (
                            <button
                                onClick={() => onRegistrarAccion({ id: detalle.id_invitado, nombre: detalle.participante, id_inscripcion: detalle.id_inscripcion })}
                                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> Registrar Acción
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-xl text-muted hover:bg-muted/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-blue-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-sm font-medium">Cargando ficha de salud...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20">{error}</div>
                    ) : !detalle ? null : (
                        <>
                            {/* Sección 1: Datos Generales */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-blue-500/20 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{detalle.participante}</h3>
                                        <p className="text-sm text-muted">Responsable: <span className="font-semibold text-foreground/80">{detalle.responsable}</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    {detalle.telefono_responsable && (
                                        <div className="flex items-center gap-2 text-muted"><Phone className="w-3.5 h-3.5 text-blue-500/70" />{detalle.telefono_responsable}</div>
                                    )}
                                    {detalle.email_responsable && (
                                        <div className="flex items-center gap-2 text-muted"><Mail className="w-3.5 h-3.5 text-blue-500/70" /><span className="truncate">{detalle.email_responsable}</span></div>
                                    )}
                                </div>
                            </div>

                            {/* Sección 2: Salud */}
                            {detalle.ficha ? (
                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-3 border-b border-card-border pb-2">
                                        <Stethoscope className="w-4 h-4" /> Salud
                                    </h5>
                                    <div className="p-4 rounded-xl border bg-red-500/5 border-red-500/20 space-y-3">
                                        {detalle.ficha.tiene_problema_medico && <InfoRow label="Problema Médico" value={detalle.ficha.detalle_problema_medico} />}
                                        {detalle.ficha.tiene_alergias_no_alimentarias && <InfoRow label="Alergias no alimentarias" value={detalle.ficha.detalle_alergias_no_alimentarias} />}
                                        {detalle.ficha.tiene_necesidad_especial && <InfoRow label="Necesidad especial" value={detalle.ficha.detalle_necesidad_especial} />}
                                        {detalle.ficha.tiene_cobertura_medica && (
                                            <InfoRow label="Cobertura médica" value={`${detalle.ficha.cobertura_medica_nombre ?? ''}${detalle.ficha.cobertura_medica_numero ? ` - N° ${detalle.ficha.cobertura_medica_numero}` : ''}`} />
                                        )}
                                        <BoolBadge value={detalle.ficha.autoriza_emergencia_medica} labelTrue="Autoriza emergencia médica" />
                                        {detalle.ficha.observaciones_familia && (
                                            <InfoRow label="Observaciones Familia" value={<span className="italic">&quot;{detalle.ficha.observaciones_familia}&quot;</span>} />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-card-border text-muted text-sm text-center">
                                    <Stethoscope className="w-5 h-5 mx-auto mb-2 opacity-40" />Sin ficha médica declarada
                                </div>
                            )}

                            {/* Sección 3: Contactos de Emergencia */}
                            {detalle.contactos_emergencia && detalle.contactos_emergencia.length > 0 && (
                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 border-b border-card-border pb-2">
                                        <Phone className="w-4 h-4" /> Contactos de Emergencia
                                    </h5>
                                    <div className="space-y-2">
                                        {detalle.contactos_emergencia.sort((a, b) => a.orden - b.orden).map((c, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/50 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black flex items-center justify-center">{c.orden}</span>
                                                    <span className="font-semibold text-foreground">{c.nombre}</span>
                                                    <span className="text-muted text-xs">({c.relacion})</span>
                                                </div>
                                                <span className="text-muted">{c.telefono}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sección 4: Medicaciones */}
                            <div ref={medicacionesRef}>
                                <h5 className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 border-b border-card-border pb-2">
                                    <Pill className="w-4 h-4" /> Medicaciones
                                </h5>
                                {detalle.medicaciones.length === 0 ? (
                                    <p className="text-muted text-sm text-center py-3">Sin medicaciones declaradas</p>
                                ) : (
                                    <div className="space-y-3">
                                        {detalle.medicaciones.map((m) => (
                                            <div key={m.id_medicacion} className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2 text-sm">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <span className="font-bold text-foreground">{m.nombre_medicamento}</span>
                                                    <div className="flex gap-2">
                                                        {m.administracion_autorizada && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">Adm. autorizada</span>}
                                                        {m.requiere_refrigeracion && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">Refrigeración</span>}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                    <InfoRow label="Dosis" value={m.dosis} />
                                                    <InfoRow label="Frecuencia" value={m.frecuencia} />
                                                    {m.horario && <InfoRow label="Horario" value={m.horario} />}
                                                </div>
                                                {m.instrucciones && <InfoRow label="Instrucciones" value={m.instrucciones} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sección 5: Restricciones Alimentarias */}
                            {detalle.restricciones_alimentarias.length > 0 && (
                                <div>
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 border-b border-card-border pb-2">
                                        <WheatOff className="w-4 h-4" /> Restricciones Alimentarias
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {detalle.restricciones_alimentarias.map((r) => (
                                            <span key={r} className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                                {r.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sección 6: Acciones / Timeline */}
                            <div ref={accionesRef}>
                                <div className="flex items-center justify-between mb-3 border-b border-card-border pb-2">
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-violet-500 uppercase tracking-widest">
                                        <ClipboardList className="w-4 h-4" /> Acciones / Incidentes
                                    </h5>
                                    {onRegistrarAccion && (
                                        <button onClick={() => onRegistrarAccion({ id: detalle.id_invitado, nombre: detalle.participante, id_inscripcion: detalle.id_inscripcion })} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Nueva acción
                                        </button>
                                    )}
                                </div>
                                {detalle.acciones.length === 0 ? (
                                    <p className="text-muted text-sm text-center py-3">Sin acciones registradas</p>
                                ) : (
                                    <div className="space-y-3">
                                        {detalle.acciones.map((a) => (
                                            <div key={a.id_accion_salud} className="relative pl-4 border-l-2 border-violet-500/30">
                                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-violet-500" />
                                                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">
                                                    {new Date(a.fecha_hora).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    &nbsp;·&nbsp;<span className="text-violet-500">{a.tipo_accion.replace(/_/g, ' ')}</span>
                                                </p>
                                                <p className="text-sm text-foreground mt-0.5">{a.descripcion}</p>
                                                <div className="flex gap-3 mt-1">
                                                    {a.requirio_contacto_familia && <BoolBadge value={a.contacto_realizado} labelTrue="Contacto realizado" labelFalse="Contacto pendiente" />}
                                                    {a.requiere_seguimiento && <span className="text-xs text-amber-500 font-semibold">⚠ Requiere seguimiento</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
