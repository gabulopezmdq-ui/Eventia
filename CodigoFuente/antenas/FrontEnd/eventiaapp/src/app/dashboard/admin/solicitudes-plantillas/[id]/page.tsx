'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    FileEdit,
    Layers,
    AlertCircle,
    Users,
    MapPin,
    Sparkles,
    Hash,
    Calendar,
    X,
    Rocket,
    MessageSquare,
    Check,
    ShieldCheck,
    FileCheck2,
    ListChecks,
} from 'lucide-react';

import {
    getSolicitudById,
    rechazarSolicitud,
    convertirSolicitud,
} from '@/src/features/plantillas/solicitudes-plantilla.service';
import { getTiposEvento, getTramoTipos } from '@/src/features/events/event.service';
import type { SolicitudPlantilla, SolicitudPayload } from '@/src/features/plantillas/types';
import type { TipoEvento, TramoTipo } from '@/src/features/events/types';

/* ═══════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════ */
const TABS = [
    { id: 'tramos', label: 'Tramos', icon: Layers },
    { id: 'accesos', label: 'Accesos', icon: Users },
    { id: 'relaciones', label: 'Relaciones', icon: ListChecks },
] as const;

type TabId = typeof TABS[number]['id'];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
function parsePayloadSafe(payloadStr: string): SolicitudPayload | null {
    try {
        return JSON.parse(payloadStr);
    } catch {
        return null;
    }
}

function getEstadoBadgeClasses(estado: string) {
    switch (estado) {
        case 'P': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'D': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'A': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'R': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
}

function getEstadoLabel(estado: string) {
    switch (estado) {
        case 'P': return 'Pendiente';
        case 'D': return 'Borrador';
        case 'A': return 'Aprobada';
        case 'R': return 'Rechazada';
        default: return estado;
    }
}

function getEstadoIcon(estado: string) {
    switch (estado) {
        case 'P': return Clock;
        case 'D': return FileEdit;
        case 'A': return CheckCircle2;
        case 'R': return XCircle;
        default: return AlertCircle;
    }
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export default function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // ── Data ──────────────────────────────────────────────
    const [solicitud, setSolicitud] = useState<SolicitudPlantilla | null>(null);
    const [payload, setPayload] = useState<SolicitudPayload | null>(null);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [tramoTipos, setTramoTipos] = useState<TramoTipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── UI ────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabId>('tramos');
    const [showRechazarModal, setShowRechazarModal] = useState(false);
    const [showConvertirModal, setShowConvertirModal] = useState(false);

    // ── Rechazar ──────────────────────────────────────────
    const [rechazarObs, setRechazarObs] = useState('');
    const [rechazarLoading, setRechazarLoading] = useState(false);
    const [rechazarError, setRechazarError] = useState<string | null>(null);

    // ── Convertir ─────────────────────────────────────────
    const [convertirCodigo, setConvertirCodigo] = useState('');
    const [convertirObs, setConvertirObs] = useState('');
    const [convertirActivo, setConvertirActivo] = useState(true);
    const [convertirLoading, setConvertirLoading] = useState(false);
    const [convertirError, setConvertirError] = useState<string | null>(null);

    /* ═══════════════════════════════════════════════════════════
       EFFECTS
       ═══════════════════════════════════════════════════════════ */

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const [solicitudData, tipos, trTipos] = await Promise.all([
                    getSolicitudById(parseInt(id, 10)),
                    getTiposEvento(2),
                    getTramoTipos(2),
                ]);
                setSolicitud(solicitudData);
                setTiposEvento(tipos);
                setTramoTipos(trTipos);

                if (solicitudData.payload) {
                    setPayload(parsePayloadSafe(solicitudData.payload));
                }
            } catch {
                setError('No se pudo cargar la solicitud.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    /* ═══════════════════════════════════════════════════════════
       HANDLERS
       ═══════════════════════════════════════════════════════════ */

    const handleRechazar = async () => {
        if (!rechazarObs.trim()) {
            setRechazarError('Debés ingresar un motivo para rechazar.');
            return;
        }
        setRechazarLoading(true);
        setRechazarError(null);
        try {
            await rechazarSolicitud(parseInt(id, 10), rechazarObs.trim());
            // Recargar
            const updated = await getSolicitudById(parseInt(id, 10));
            setSolicitud(updated);
            setShowRechazarModal(false);
            setRechazarObs('');
        } catch {
            setRechazarError('Error al rechazar la solicitud.');
        } finally {
            setRechazarLoading(false);
        }
    };

    const handleConvertir = async () => {
        if (!convertirCodigo.trim()) {
            setConvertirError('El código de plantilla es obligatorio.');
            return;
        }
        setConvertirLoading(true);
        setConvertirError(null);
        try {
            await convertirSolicitud(parseInt(id, 10), {
                codigo: convertirCodigo.trim().toUpperCase(),
                observaciones_admin: convertirObs.trim() || undefined,
                activo: convertirActivo,
            });
            // Recargar
            const updated = await getSolicitudById(parseInt(id, 10));
            setSolicitud(updated);
            setShowConvertirModal(false);
        } catch {
            setConvertirError('Error al convertir la solicitud.');
        } finally {
            setConvertirLoading(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════════════ */

    const getTipoEventoTexto = (idTipo: number) =>
        tiposEvento.find(t => t.id === idTipo)?.texto || `Tipo #${idTipo}`;

    const getTramoTipoTexto = (idTramoTipo: number) =>
        tramoTipos.find(t => t.id === idTramoTipo)?.texto || `Tipo #${idTramoTipo}`;

    const formatFechaHora = (fecha: string) => {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isPending = solicitud?.estado === 'P';
    const EstadoIcon = solicitud ? getEstadoIcon(solicitud.estado) : AlertCircle;

    /* ═══════════════════════════════════════════════════════════
       LOADING / ERROR
       ═══════════════════════════════════════════════════════════ */

    if (loading) {
        return (
            <section className="max-w-5xl mx-auto py-24">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-sm text-muted">Cargando solicitud...</span>
                </div>
            </section>
        );
    }

    if (error || !solicitud) {
        return (
            <section className="max-w-5xl mx-auto py-24">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-sm text-red-300">{error || 'Solicitud no encontrada'}</p>
                    <button
                        onClick={() => router.push('/dashboard/admin/solicitudes-plantillas')}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        ← Volver a solicitudes
                    </button>
                </div>
            </section>
        );
    }

    /* ═══════════════════════════════════════════════════════════
       MAIN RENDER
       ═══════════════════════════════════════════════════════════ */

    return (
        <section className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.push('/dashboard/admin/solicitudes-plantillas')}
                        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver a solicitudes</span>
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Solicitud #{solicitud.id_solicitud}
                    </h1>
                    <p className="text-muted text-sm mt-1">Revisá la estructura propuesta y decidí si la aprobás como plantilla</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${getEstadoBadgeClasses(solicitud.estado)}`}>
                        <EstadoIcon className="w-3.5 h-3.5" />
                        {getEstadoLabel(solicitud.estado)}
                    </span>
                </div>
            </div>

            {/* ─── Cabecera de Datos ─── */}
            <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <FileCheck2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">Información General</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tipo de Evento */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-card-border">
                        <Calendar className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Tipo de Evento</p>
                            <p className="text-sm font-medium text-foreground">{getTipoEventoTexto(solicitud.id_tipo_evento)}</p>
                        </div>
                    </div>

                    {/* Evento */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-card-border">
                        <Hash className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">ID Evento</p>
                            <p className="text-sm font-medium text-foreground">#{solicitud.id_evento}</p>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-card-border">
                        <MessageSquare className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Motivo</p>
                            <p className="text-sm font-medium text-foreground">{solicitud.motivo?.replace(/_/g, ' ') || '—'}</p>
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-card-border">
                        <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Fecha de Solicitud</p>
                            <p className="text-sm font-medium text-foreground">{formatFechaHora(solicitud.fecha_alta)}</p>
                        </div>
                    </div>

                    {/* Usuario */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-card-border">
                        <Users className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Usuario Solicitante</p>
                            <p className="text-sm font-medium text-foreground">ID #{solicitud.id_usuario_solicita}</p>
                        </div>
                    </div>

                    {/* Detalle */}
                    {solicitud.detalle && (
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-card-border">
                            <Sparkles className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Detalle</p>
                                <p className="text-sm font-medium text-foreground">{solicitud.detalle}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Observaciones admin (si ya fue revisada) */}
                {solicitud.observaciones_admin && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Observaciones del Admin</p>
                        </div>
                        <p className="text-sm text-foreground italic">&quot;{solicitud.observaciones_admin}&quot;</p>
                        {solicitud.fecha_revision && (
                            <p className="text-[10px] text-muted mt-2">Revisada: {formatFechaHora(solicitud.fecha_revision)}</p>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Tabs de Estructura ─── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Layers className="w-4 h-4 text-purple-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">Estructura Propuesta</h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-background/50 border border-card-border mb-6">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        const count = tab.id === 'tramos' ? payload?.tramos?.length
                            : tab.id === 'accesos' ? payload?.accesos?.length
                                : payload?.relaciones?.length;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 ${isActive
                                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20 shadow-lg shadow-purple-500/5'
                                    : 'text-muted hover:text-foreground border border-transparent'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {count !== undefined && (
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'bg-card-bg text-muted'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {!payload ? (
                    <div className="py-12 text-center text-muted text-sm">
                        No se pudo parsear la estructura de la solicitud.
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        {/* ═══════════ TAB: Tramos ═══════════ */}
                        {activeTab === 'tramos' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-card-border">
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">#</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">Tipo Tramo</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">Nombre</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">Leyenda</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest hidden md:table-cell">Lugar</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest hidden lg:table-cell">Horario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payload.tramos?.map((tramo, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-card-border/50 hover:bg-purple-500/[0.03] transition-colors"
                                            >
                                                <td className="py-3.5 px-4">
                                                    <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
                                                        {tramo.orden}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 text-xs font-medium">
                                                        {getTramoTipoTexto(tramo.id_tramo_tipo)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-foreground">{tramo.nombre}</td>
                                                <td className="py-3.5 px-4 text-muted text-xs">{tramo.leyenda_visible || '—'}</td>
                                                <td className="py-3.5 px-4 text-muted text-xs hidden md:table-cell">
                                                    {tramo.lugar ? (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                                            {tramo.lugar}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-muted text-xs hidden lg:table-cell">
                                                    {tramo.fecha_hora_inicio
                                                        ? `${new Date(tramo.fecha_hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(tramo.fecha_hora_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ═══════════ TAB: Accesos ═══════════ */}
                        {activeTab === 'accesos' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-card-border">
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">#</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">Nombre</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">Mensaje RSVP</th>
                                            <th className="text-center py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">Default</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payload.accesos?.map((acceso, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-card-border/50 hover:bg-purple-500/[0.03] transition-colors"
                                            >
                                                <td className="py-3.5 px-4">
                                                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300">
                                                        {acceso.orden}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-foreground">{acceso.nombre}</td>
                                                <td className="py-3.5 px-4 text-muted text-xs max-w-xs truncate">{acceso.mensaje_rsvp || '—'}</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    {acceso.es_default ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                                                            <Check className="w-3 h-3" />
                                                            Sí
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ═══════════ TAB: Relaciones (Matriz) ═══════════ */}
                        {activeTab === 'relaciones' && (
                            <div className="overflow-x-auto">
                                <p className="text-xs text-muted mb-4">Filas = Accesos  |  Columnas = Tramos. Un check indica que ese acceso incluye ese tramo.</p>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-card-border">
                                            <th className="text-left py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest min-w-[140px]">
                                                Acceso ↓ / Tramo →
                                            </th>
                                            {payload.tramos?.map((tramo) => (
                                                <th key={tramo.orden} className="text-center py-3 px-3 min-w-[90px]">
                                                    <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/15 text-[10px] font-bold">
                                                        {tramo.nombre}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payload.accesos?.map((acceso) => (
                                            <tr key={acceso.orden} className="border-b border-card-border/50 hover:bg-purple-500/[0.03] transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="text-xs font-semibold text-foreground">{acceso.nombre}</span>
                                                    {acceso.es_default && (
                                                        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                                                            default
                                                        </span>
                                                    )}
                                                </td>
                                                {payload.tramos?.map((tramo) => {
                                                    const hasRelation = payload.relaciones?.some(
                                                        r => r.acceso_orden === acceso.orden && r.tramo_orden === tramo.orden
                                                    );
                                                    return (
                                                        <td key={tramo.orden} className="text-center py-3 px-3">
                                                            {hasRelation ? (
                                                                <span className="inline-flex w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 items-center justify-center">
                                                                    <Check className="w-4 h-4 text-purple-400" />
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex w-7 h-7 rounded-lg bg-card-bg border border-card-border items-center justify-center">
                                                                    <span className="w-2 h-0.5 bg-muted/30 rounded" />
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Acciones (solo si está Pendiente) ─── */}
            {isPending && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => setShowRechazarModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-red-500/30 bg-red-500/5 text-red-400 font-semibold text-sm hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                    >
                        <XCircle className="w-5 h-5" />
                        Rechazar
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowConvertirModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                    >
                        <Rocket className="w-5 h-5" />
                        Convertir en Plantilla
                    </button>
                </div>
            )}

            {/* ═══════════ MODAL: Rechazar ═══════════ */}
            {showRechazarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRechazarModal(false)} />
                    <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <button
                            onClick={() => setShowRechazarModal(false)}
                            className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-card-bg"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Rechazar Solicitud</h3>
                                <p className="text-xs text-muted">Indicá el motivo por el cual no es viable como plantilla</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                <MessageSquare className="w-3 h-3" />
                                Observaciones (obligatorio)
                            </label>
                            <textarea
                                value={rechazarObs}
                                onChange={(e) => setRechazarObs(e.target.value)}
                                placeholder="Ej: No es reutilizable como plantilla general porque le falta..."
                                rows={4}
                                className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none text-sm"
                            />
                        </div>

                        {rechazarError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-300">{rechazarError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowRechazarModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-card-border text-muted text-sm font-medium hover:text-foreground hover:border-muted/60 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleRechazar}
                                disabled={rechazarLoading || !rechazarObs.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {rechazarLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <XCircle className="w-4 h-4" />
                                )}
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ MODAL: Convertir en Plantilla ═══════════ */}
            {showConvertirModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConvertirModal(false)} />
                    <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <button
                            onClick={() => setShowConvertirModal(false)}
                            className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-card-bg"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                                <Rocket className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Convertir en Plantilla</h3>
                                <p className="text-xs text-muted">La estructura se guardará como plantilla reutilizable</p>
                            </div>
                        </div>

                        <div className="space-y-5 mb-6">
                            {/* Código */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                    <Hash className="w-3 h-3" />
                                    Código de Plantilla (obligatorio)
                                </label>
                                <input
                                    value={convertirCodigo}
                                    onChange={(e) => setConvertirCodigo(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                                    placeholder="Ej: CUMPLE15_RECEPCION_CENA_FIESTA"
                                    className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted font-mono text-sm uppercase"
                                />
                                <p className="text-[10px] text-muted mt-1.5 ml-1">Debe ser único. Se usará como identificador de esta plantilla.</p>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                    <MessageSquare className="w-3 h-3" />
                                    Observaciones
                                    <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                </label>
                                <textarea
                                    value={convertirObs}
                                    onChange={(e) => setConvertirObs(e.target.value)}
                                    placeholder="Ej: Aprobada. Buena estructura estándar para eventos de 15 años."
                                    rows={3}
                                    className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none text-sm"
                                />
                            </div>

                            {/* Activo Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-card-border">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Plantilla Activa</p>
                                    <p className="text-[10px] text-muted mt-0.5">Si la desactivás, no aparecerá disponible para los usuarios</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConvertirActivo(!convertirActivo)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${convertirActivo
                                        ? 'bg-indigo-600'
                                        : 'bg-card-border'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${convertirActivo ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {convertirError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-300">{convertirError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConvertirModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-card-border text-muted text-sm font-medium hover:text-foreground hover:border-muted/60 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConvertir}
                                disabled={convertirLoading || !convertirCodigo.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {convertirLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Rocket className="w-4 h-4" />
                                )}
                                Crear Plantilla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
