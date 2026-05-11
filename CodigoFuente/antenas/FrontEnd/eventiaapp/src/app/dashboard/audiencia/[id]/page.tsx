'use client';

import { use, useEffect, useState } from 'react';
import { getAudienciaCRMDetalle } from '@/src/features/captacion/audiencias.service';
import type { AudienciaCRMDetalle, TipoPersonaCRM, AlertaCRM } from '@/src/features/captacion/types';
import {
    Loader2, ArrowLeft, Heart, UtensilsCrossed, Utensils,
    User, Mail, Phone, Calendar, AlertTriangle,
    Users, ShieldCheck, Stethoscope, ClipboardList,
    Check, X as XIcon,
} from 'lucide-react';
import Link from 'next/link';

// ─── Helpers visuales ────────────────────────────────────────────────────────

const TIPO_BADGE: Record<TipoPersonaCRM, string> = {
    TODOS:                 '',
    RESPONSABLE_PROGRAMA:  'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    PARTICIPANTE_PROGRAMA: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    EVENTO_PUBLICO:        'bg-amber-500/10  text-amber-600  border-amber-500/20',
    EVENTO_PRIVADO:        'bg-purple-500/10 text-purple-600 border-purple-500/20',
    STAFF:                 'bg-cyan-500/10   text-cyan-600   border-cyan-500/20',
    SIN_CLASIFICAR:        'bg-neutral-500/10 text-neutral-500 border-neutral-500/20',
};

const ALERTA_CONFIG: Record<AlertaCRM, { label: string; icon: React.ReactNode; cls: string }> = {
    SALUD: {
        label: 'Salud',
        icon: <Heart className="w-3.5 h-3.5" />,
        cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    },
    RESTRICCION_ALIMENTARIA: {
        label: 'Rest. Alimentaria',
        icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
        cls: 'bg-red-500/10 text-red-600 border-red-500/20',
    },
    COMEDOR: {
        label: 'Comedor',
        icon: <Utensils className="w-3.5 h-3.5" />,
        cls: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    },
};

function SectionCard({ title, icon, children }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-card-border flex items-center gap-2">
                <span className="text-muted">{icon}</span>
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start gap-4 py-2 border-b border-card-border last:border-0">
            <span className="text-xs text-muted font-medium shrink-0">{label}</span>
            <span className="text-sm text-foreground text-right">{value ?? <span className="text-muted italic">—</span>}</span>
        </div>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AudienciaCRMDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [persona, setPersona] = useState<AudienciaCRMDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]    = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getAudienciaCRMDetalle(Number(id))
            .then(setPersona)
            .catch(() => setError('No se pudo cargar el detalle de esta persona.'))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-muted text-sm">Cargando perfil…</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error || !persona) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <p className="text-muted text-sm">{error ?? 'Persona no encontrada.'}</p>
                <Link href="/dashboard/audiencia" className="text-indigo-500 text-sm hover:underline">
                    Volver a la audiencia
                </Link>
            </div>
        );
    }

    const { programa, salud } = {
        programa: persona.programa,
        salud: persona.programa?.salud ?? null,
    };

    const tieneSalud = salud && (
        salud.tieneProblemaMedico ||
        salud.tieneAlergiasNoAlimentarias ||
        salud.necesidadEspecial ||
        salud.coberturaMedica ||
        salud.observacionesFamilia
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-start gap-4">
                <Link
                    href="/dashboard/audiencia"
                    className="mt-1 p-2 bg-card-bg hover:bg-background border border-card-border rounded-xl transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 text-muted hover:text-foreground" />
                </Link>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">
                            {persona.nombre} {persona.apellido}
                        </h1>
                        {/* Badge tipo */}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${TIPO_BADGE[persona.tipo_persona]}`}>
                            {persona.tipo_label}
                        </span>
                        {/* Badges de alerta */}
                        {persona.alertas.map(a => {
                            const cfg = ALERTA_CONFIG[a];
                            return (
                                <span key={a} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.cls}`}>
                                    {cfg.icon} {cfg.label}
                                </span>
                            );
                        })}
                    </div>
                    <p className="text-muted text-sm mt-1">
                        Perfil CRM — ID #{persona.id_audiencia_persona}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ══════════════════════════════════════════════════════
                    COLUMNA IZQUIERDA
                ══════════════════════════════════════════════════════ */}
                <div className="space-y-6 lg:col-span-1">

                    {/* Datos personales */}
                    <SectionCard title="Información Personal" icon={<User className="w-4 h-4" />}>
                        <div className="space-y-0">
                            <InfoRow
                                label="Email"
                                value={persona.email ?? <span className="italic text-muted">Sin email</span>}
                            />
                            <InfoRow
                                label="Celular"
                                value={persona.celular ?? <span className="italic text-muted">Sin celular</span>}
                            />
                            <InfoRow
                                label="Edad"
                                value={persona.edad != null ? `${persona.edad} años` : null}
                            />
                            <InfoRow
                                label="Nacimiento"
                                value={
                                    persona.fecha_nacimiento
                                        ? new Date(persona.fecha_nacimiento).toLocaleDateString('es-AR')
                                        : null
                                }
                            />
                        </div>
                    </SectionCard>

                    {/* Alertas activas */}
                    {persona.alertas.length > 0 && (
                        <SectionCard title="Alertas Activas" icon={<AlertTriangle className="w-4 h-4" />}>
                            <div className="flex flex-wrap gap-2">
                                {persona.alertas.map(a => {
                                    const cfg = ALERTA_CONFIG[a];
                                    return (
                                        <span key={a} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${cfg.cls}`}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </SectionCard>
                    )}

                    {/* Tags */}
                    {persona.tags.length > 0 && (
                        <SectionCard title="Etiquetas (Tags)" icon={<ClipboardList className="w-4 h-4" />}>
                            <div className="flex flex-wrap gap-2">
                                {persona.tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-xs font-bold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* ══════════════════════════════════════════════════════
                    COLUMNA DERECHA
                ══════════════════════════════════════════════════════ */}
                <div className="space-y-6 lg:col-span-2">

                    {/* ── Programa / Casal (condicional) ────────────── */}
                    {programa && (
                        <SectionCard title="Programa / Casal" icon={<Calendar className="w-4 h-4" />}>
                            <div className="space-y-5">

                                {/* Evento y grupo */}
                                <div>
                                    <p className="font-bold text-foreground">{programa.evento}</p>
                                    <p className="text-xs text-muted mt-0.5">Grupo: {programa.nombre_grupo}</p>
                                </div>

                                {/* Responsable del grupo */}
                                <div className="p-3 rounded-xl bg-background border border-card-border">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3" /> Responsable
                                    </p>
                                    <p className="font-bold text-sm text-foreground">{programa.responsable.nombreCompleto}</p>
                                    {programa.responsable.relacion && (
                                        <p className="text-xs text-muted">{programa.responsable.relacion}</p>
                                    )}
                                    <div className="mt-1.5 space-y-0.5">
                                        {programa.responsable.email && (
                                            <p className="text-xs text-foreground flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-muted" /> {programa.responsable.email}
                                            </p>
                                        )}
                                        {programa.responsable.telefono && (
                                            <p className="text-xs text-foreground flex items-center gap-1.5">
                                                <Phone className="w-3 h-3 text-muted" /> {programa.responsable.telefono}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Otros participantes del grupo */}
                                {programa.participantes_grupo.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 flex items-center gap-1.5">
                                            <Users className="w-3 h-3" /> Participantes del grupo
                                        </p>
                                        <div className="space-y-1.5">
                                            {programa.participantes_grupo.map(p => (
                                                <div key={p.idInvitado} className="flex items-center justify-between px-3 py-2 rounded-xl bg-background border border-card-border">
                                                    <span className="text-sm font-medium text-foreground">{p.nombreCompleto}</span>
                                                    {p.edad != null && (
                                                        <span className="text-xs text-muted">{p.edad} años</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Períodos */}
                                {programa.periodos.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Períodos inscriptos</p>
                                        <div className="space-y-1.5">
                                            {programa.periodos.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-background border border-card-border">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{p.nombre}</p>
                                                        <p className="text-xs text-muted">
                                                            {new Date(p.fechaDesde).toLocaleDateString('es-AR')} → {new Date(p.fechaHasta).toLocaleDateString('es-AR')}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-bold text-indigo-600">
                                                        {p.precioBase.toLocaleString('es-AR', { style: 'currency', currency: p.moneda })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Servicios adicionales */}
                                {programa.servicios.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Servicios adicionales</p>
                                        <div className="space-y-1.5">
                                            {programa.servicios.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-background border border-card-border">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{s.nombre}</p>
                                                        <p className="text-xs text-muted">{s.tipoCalculo.replace('_', ' ')} · {s.fechas.length} día(s)</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        {s.subtotal.toLocaleString('es-AR', { style: 'currency', currency: s.moneda })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Salud (condicional) ────────────────────────── */}
                    {tieneSalud && salud && (
                        <SectionCard title="Información de Salud" icon={<Stethoscope className="w-4 h-4" />}>
                            <div className="space-y-0">
                                <InfoRow
                                    label="Problema médico"
                                    value={
                                        salud.tieneProblemaMedico
                                            ? salud.problemaMedicoDetalle ?? 'Sí (sin detalle)'
                                            : <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> No</span>
                                    }
                                />
                                <InfoRow
                                    label="Alergias no alim."
                                    value={
                                        salud.tieneAlergiasNoAlimentarias
                                            ? salud.alergiasNoAlimentariasDetalle ?? 'Sí (sin detalle)'
                                            : <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> No</span>
                                    }
                                />
                                {salud.necesidadEspecial && (
                                    <InfoRow label="Necesidad especial" value={salud.necesidadEspecial} />
                                )}
                                {salud.coberturaMedica && (
                                    <InfoRow label="Cobertura médica" value={salud.coberturaMedica} />
                                )}
                                {salud.observacionesFamilia && (
                                    <InfoRow label="Obs. familia" value={salud.observacionesFamilia} />
                                )}
                                <InfoRow
                                    label="Autoriza emergencia"
                                    value={
                                        salud.autorizaEmergenciaMedica
                                            ? <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Sí</span>
                                            : <span className="text-red-500 flex items-center gap-1"><XIcon className="w-3 h-3" /> No</span>
                                    }
                                />
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Restricciones alimentarias (condicional) ─────── */}
                    {programa && programa.restricciones.length > 0 && (
                        <SectionCard title="Restricciones Alimentarias" icon={<UtensilsCrossed className="w-4 h-4" />}>
                            <div className="space-y-2">
                                {programa.restricciones.map(r => (
                                    <div key={r.idRestriccionAlim} className="flex items-start justify-between px-3 py-2.5 rounded-xl bg-background border border-card-border">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{r.codigo.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-muted capitalize">{r.categoria.toLowerCase()}</p>
                                            {r.observaciones && <p className="text-xs text-muted mt-1">{r.observaciones}</p>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                                            {r.requiereAlertaVisual && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600">Alerta visual</span>
                                            )}
                                            {r.esAlergeno && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600">Alérgeno</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Autorizados de retiro (condicional) ───────────── */}
                    {programa && programa.autorizados_retiro.length > 0 && (
                        <SectionCard title="Autorizados para el Retiro" icon={<ShieldCheck className="w-4 h-4" />}>
                            <div className="space-y-2">
                                {programa.autorizados_retiro.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background border border-card-border">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{a.nombreAutorizado}</p>
                                            {a.relacion && <p className="text-xs text-muted">{a.relacion}</p>}
                                            {a.observaciones && <p className="text-xs text-muted mt-0.5 italic">{a.observaciones}</p>}
                                        </div>
                                        {a.telefonoAutorizado && (
                                            <span className="text-xs text-foreground flex items-center gap-1 shrink-0 ml-4">
                                                <Phone className="w-3 h-3 text-muted" /> {a.telefonoAutorizado}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Historial de participaciones (siempre visible) ─ */}
                    <SectionCard title="Historial de Participaciones" icon={<Calendar className="w-4 h-4" />}>
                        {persona.historial.length === 0 ? (
                            <p className="text-muted text-sm text-center py-4">No hay historial de participaciones.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-background/50 border-b border-card-border text-xs uppercase tracking-widest text-muted">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Evento</th>
                                            <th className="px-4 py-3 font-bold">Tipo</th>
                                            <th className="px-4 py-3 font-bold text-center">Registro</th>
                                            <th className="px-4 py-3 font-bold text-center">Asistencia</th>
                                            <th className="px-4 py-3 font-bold text-center">Beneficio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-card-border">
                                        {persona.historial.map(h => (
                                            <tr key={`${h.id_evento}-${h.fecha_registro}`} className="hover:bg-background/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-bold text-foreground">{h.evento}</p>
                                                    <p className="text-xs text-muted mt-0.5">{h.origen_registro}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-muted">{h.tipo_operacion}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs font-bold text-muted">
                                                    {new Date(h.fecha_registro).toLocaleDateString('es-AR')}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {h.asistio
                                                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-bold"><Check className="w-3 h-3" /> Asistió</span>
                                                        : <span className="inline-flex px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-xs font-bold">No show</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {h.beneficio_otorgado
                                                        ? h.beneficio_canjeado
                                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-xs font-bold"><Check className="w-3 h-3" /> Canjeado</span>
                                                            : <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-xs font-bold">Pendiente</span>
                                                        : <span className="text-xs text-muted">—</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>

                </div>{/* fin col derecha */}
            </div>
        </div>
    );
}
