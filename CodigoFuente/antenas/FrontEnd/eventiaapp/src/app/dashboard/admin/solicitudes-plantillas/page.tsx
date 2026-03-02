'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    FileCheck2,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    FileEdit,
    Eye,
    Layers,
    AlertCircle,
    Inbox,
} from 'lucide-react';

import { listarSolicitudes } from '@/src/features/plantillas/solicitudes-plantilla.service';
import { getTiposEvento } from '@/src/features/events/event.service';
import type { SolicitudPlantilla, EstadoSolicitud, SolicitudPayload } from '@/src/features/plantillas/types';
import type { TipoEvento } from '@/src/features/events/types';

/* ═══════════════════════════════════════════════════════════
   CONFIGURACIÓN DE ESTADOS
   ═══════════════════════════════════════════════════════════ */
const ESTADOS = [
    { value: 'P', label: 'Pendientes', icon: Clock, color: 'amber' },
    { value: 'D', label: 'Borrador', icon: FileEdit, color: 'blue' },
    { value: 'A', label: 'Aprobadas', icon: CheckCircle2, color: 'emerald' },
    { value: 'R', label: 'Rechazadas', icon: XCircle, color: 'red' },
    { value: '', label: 'Todas', icon: Layers, color: 'neutral' },
] as const;

function getEstadoConfig(estado: string) {
    switch (estado) {
        case 'P': return { label: 'Pendiente', color: 'amber', icon: Clock };
        case 'D': return { label: 'Borrador', color: 'blue', icon: FileEdit };
        case 'A': return { label: 'Aprobada', color: 'emerald', icon: CheckCircle2 };
        case 'R': return { label: 'Rechazada', color: 'red', icon: XCircle };
        default: return { label: estado, color: 'neutral', icon: AlertCircle };
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

function parsePayloadSafe(payloadStr: string): SolicitudPayload | null {
    try {
        return JSON.parse(payloadStr);
    } catch {
        return null;
    }
}

export default function SolicitudesPlantillasPage() {
    const router = useRouter();

    // ── Estado de datos ──────────────────────────────────
    const [solicitudes, setSolicitudes] = useState<SolicitudPlantilla[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Filtros ──────────────────────────────────────────
    const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud>('P');
    const [filtroTipoEvento, setFiltroTipoEvento] = useState<number>(0);

    /* ═══════════════════════════════════════════════════════════
       EFFECTS
       ═══════════════════════════════════════════════════════════ */

    // Cargar tipos de evento al montar
    useEffect(() => {
        getTiposEvento(2)
            .then(setTiposEvento)
            .catch(() => console.error('Error al cargar tipos de evento'));
    }, []);

    // Cargar solicitudes al montar y cuando cambian los filtros
    useEffect(() => {
        async function loadSolicitudes() {
            setLoading(true);
            setError(null);
            try {
                const data = await listarSolicitudes({
                    estado: filtroEstado || undefined,
                    idTipoEvento: filtroTipoEvento > 0 ? filtroTipoEvento : undefined,
                });
                // Ordenar por fecha más nueva primero
                const sorted = [...data].sort(
                    (a, b) => new Date(b.fecha_alta).getTime() - new Date(a.fecha_alta).getTime()
                );
                setSolicitudes(sorted);
            } catch {
                setError('No se pudieron cargar las solicitudes.');
            } finally {
                setLoading(false);
            }
        }
        loadSolicitudes();
    }, [filtroEstado, filtroTipoEvento]);

    /* ═══════════════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════════════ */

    const getTipoEventoTexto = (idTipo: number) =>
        tiposEvento.find(t => t.id === idTipo)?.texto || `Tipo #${idTipo}`;

    const formatFecha = (fecha: string) => {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

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

    const activeEstado = ESTADOS.find(e => e.value === filtroEstado) || ESTADOS[0];
    const pendientesCount = solicitudes.filter(s => s.estado === 'P').length;

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */

    return (
        <section className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Panel General</span>
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Solicitudes de Plantillas
                    </h1>
                    <p className="text-muted text-sm mt-1">Revisa, aprueba o rechaza las estructuras propuestas por los usuarios</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5">
                    <FileCheck2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                        {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
                    </span>
                </div>
            </div>

            {/* ─── Filtros ─── */}
            <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Filter className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Filtro de Estado — Tabs estilo pills */}
                    <div className="flex-1">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-2.5 ml-1">
                            <Search className="w-3 h-3" />
                            Estado
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {ESTADOS.map((estado) => {
                                const isActive = filtroEstado === estado.value;
                                const Icon = estado.icon;
                                return (
                                    <button
                                        key={estado.value}
                                        type="button"
                                        onClick={() => setFiltroEstado(estado.value as EstadoSolicitud)}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${isActive
                                            ? estado.color === 'amber' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-lg shadow-amber-500/10'
                                                : estado.color === 'blue' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10'
                                                    : estado.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                                                        : estado.color === 'red' ? 'bg-red-500/15 text-red-300 border-red-500/30 shadow-lg shadow-red-500/10'
                                                            : 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30 shadow-lg shadow-neutral-500/10'
                                            : 'bg-transparent text-muted border-card-border hover:border-muted/50 hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {estado.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filtro de Tipo de Evento */}
                    <div className="sm:w-64">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-2.5 ml-1">
                            <Layers className="w-3 h-3" />
                            Tipo de Evento
                        </label>
                        <div className="relative">
                            <select
                                value={filtroTipoEvento}
                                onChange={(e) => setFiltroTipoEvento(parseInt(e.target.value, 10))}
                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10 text-sm"
                            >
                                <option value={0}>Todos los tipos</option>
                                {tiposEvento.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.texto}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Loading ─── */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-sm text-muted">Cargando solicitudes...</span>
                    </div>
                </div>
            )}

            {/* ─── Error ─── */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 mb-6">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* ─── Empty State ─── */}
            {!loading && !error && solicitudes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                        <Inbox className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No hay solicitudes</h3>
                    <p className="text-sm text-muted max-w-sm">
                        No se encontraron solicitudes {filtroEstado ? `con estado "${activeEstado.label}"` : ''}.
                        Probá cambiando los filtros.
                    </p>
                </div>
            )}

            {/* ─── Lista de Solicitudes ─── */}
            {!loading && !error && solicitudes.length > 0 && (
                <div className="space-y-3">
                    {solicitudes.map((solicitud) => {
                        const estadoConfig = getEstadoConfig(solicitud.estado);
                        const EstadoIcon = estadoConfig.icon;
                        const payload = parsePayloadSafe(solicitud.payload);
                        const tramosCount = payload?.tramos?.length ?? 0;
                        const accesosCount = payload?.accesos?.length ?? 0;

                        return (
                            <button
                                key={solicitud.id_solicitud}
                                type="button"
                                onClick={() => router.push(`/dashboard/admin/solicitudes-plantillas/${solicitud.id_solicitud}`)}
                                className="w-full text-left p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.005] group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Left: info principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Badge Estado */}
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getEstadoBadgeClasses(solicitud.estado)}`}>
                                                <EstadoIcon className="w-3 h-3" />
                                                {estadoConfig.label}
                                            </span>

                                            {/* ID */}
                                            <span className="text-xs text-muted font-mono">#SOL-{solicitud.id_solicitud}</span>
                                        </div>

                                        {/* Tipo de evento + Motivo */}
                                        <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-indigo-300 transition-colors">
                                            {getTipoEventoTexto(solicitud.id_tipo_evento)}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {formatFechaHora(solicitud.fecha_alta)}
                                            </span>

                                            <span className="flex items-center gap-1.5">
                                                <Layers className="w-3 h-3" />
                                                {tramosCount} tramo{tramosCount !== 1 ? 's' : ''}, {accesosCount} acceso{accesosCount !== 1 ? 's' : ''}
                                            </span>

                                            {solicitud.motivo && (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-card-bg border border-card-border">
                                                    {solicitud.motivo.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Detalle preview (1 línea) */}
                                        {solicitud.detalle && (
                                            <p className="mt-2 text-xs text-muted truncate max-w-lg">
                                                {solicitud.detalle}
                                            </p>
                                        )}

                                        {/* Observaciones admin (si ya fue revisada) */}
                                        {solicitud.observaciones_admin && (
                                            <p className="mt-2 text-xs text-amber-400/80 italic truncate max-w-lg">
                                                Admin: &quot;{solicitud.observaciones_admin}&quot;
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Acción visual */}
                                    <div className="flex items-center gap-3 sm:flex-shrink-0">
                                        {/* Mini preview de tramos */}
                                        {payload?.tramos && payload.tramos.length > 0 && (
                                            <div className="hidden lg:flex flex-wrap gap-1 max-w-48">
                                                {payload.tramos.slice(0, 3).map((tramo, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/15 text-[10px] font-medium"
                                                    >
                                                        {tramo.nombre}
                                                    </span>
                                                ))}
                                                {payload.tramos.length > 3 && (
                                                    <span className="px-2 py-0.5 rounded-md bg-card-bg text-muted border border-card-border text-[10px] font-medium">
                                                        +{payload.tramos.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Botón Ver */}
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 text-xs font-semibold group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                                            <Eye className="w-4 h-4" />
                                            <span className="hidden sm:inline">Revisar</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
