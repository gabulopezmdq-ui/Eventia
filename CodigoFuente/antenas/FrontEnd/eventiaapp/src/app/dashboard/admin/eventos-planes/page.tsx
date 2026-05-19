'use client';

import { useEffect, useState } from 'react';
import { RefreshCcw, Search, ExternalLink, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, X, XCircle, DollarSign, Calendar, Tag, ShieldCheck, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SolicitudPendiente {
    id_evento_plan_cambio: number;
    id_evento: number;
    evento_anfitriones: string;
    plan_actual_codigo: string;
    plan_actual_nombre: string;
    plan_solicitado_codigo: string;
    plan_solicitado_nombre: string;
    estado: string;
    motivo_solicitud: string | null;
    fecha_solicitud: string;
    codigo_mercado: string;
    codigo_moneda: string;
    precio_plan_actual_reconocido: number | null;
    precio_plan_solicitado_publicado: number | null;
    diferencia_base: number | null;
}

interface SolicitudDetalle extends SolicitudPendiente {
    motivo_resolucion?: string | null;
    fecha_resolucion?: string | null;
    tipo_ajuste?: string | null;
    importe_ajuste?: number | null;
    importe_final_a_cobrar?: number | null;
    id_medio_pago_sugerido?: number | null;
}

interface MedioPago {
    id_medio_pago: number;
    texto: string;
    codigo: string;
}

export default function AdminEventosPlanesPage() {
    const router = useRouter();
    const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detalle, setDetalle] = useState<SolicitudDetalle | null>(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);

    // Form State for Approval/Rejection
    const [tipoAjuste, setTipoAjuste] = useState<'NINGUNO' | 'DESCUENTO' | 'RECARGO' | 'BONIFICACION'>('NINGUNO');
    const [importeAjuste, setImporteAjuste] = useState<number>(0);
    const [motivoAjuste, setMotivoAjuste] = useState('');
    const [descripcionAjuste, setDescripcionAjuste] = useState('');
    const [codigoMedioPago, setCodigoMedioPago] = useState<string>('');
    const [importePagado, setImportePagado] = useState<number>(0);
    const [referenciaPago, setReferenciaPago] = useState('');
    const [observacionAdmin, setObservacionAdmin] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const loadSolicitudes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/eventos-planes/pendientes');
            if (!res.ok) throw new Error('Error al cargar solicitudes');
            const data = await res.json();
            setSolicitudes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const loadMediosPago = async () => {
        try {
            const res = await fetch('/api/parametrica/medios-pago');
            if (res.ok) {
                const data = await res.json();
                setMediosPago(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error cargando medios de pago:', e);
        }
    };

    useEffect(() => {
        loadSolicitudes();
        loadMediosPago();
    }, []);

    const openModal = async (id: number) => {
        setSelectedId(id);
        setDetalle(null);
        setLoadingDetalle(true);
        setTipoAjuste('NINGUNO');
        setImporteAjuste(0);
        setMotivoAjuste('');
        setDescripcionAjuste('');
        setCodigoMedioPago('');
        setImportePagado(0);
        setReferenciaPago('');
        setObservacionAdmin('');
        try {
            const res = await fetch(`/api/admin/eventos-planes/${id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDetalle(data);
        } catch {
            setActionError('No se pudo cargar el detalle de la solicitud.');
            setSelectedId(null);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleAprobar = async () => {
        if (!detalle) return;
        setActionError(null);
        setActionSuccess(null);

        if (tipoAjuste !== 'NINGUNO' && tipoAjuste !== 'BONIFICACION' && importeAjuste <= 0) {
            setActionError('Debes ingresar un importe de ajuste mayor a 0');
            return;
        }

        setProcesando(true);
        try {
            const res = await fetch('/api/admin/eventos-planes/aprobar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_evento_plan_cambio: detalle.id_evento_plan_cambio,
                    tipo_ajuste: tipoAjuste !== 'NINGUNO' ? tipoAjuste : null,
                    importe_ajuste: tipoAjuste !== 'NINGUNO' ? importeAjuste : undefined,
                    motivo_ajuste: motivoAjuste || undefined,
                    descripcion_ajuste: descripcionAjuste || undefined,
                    importe_pagado: importePagado,
                    medio_pago: codigoMedioPago || undefined,
                    referencia_pago: referenciaPago || undefined,
                    observacion_admin: observacionAdmin || undefined
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al aprobar');
            }
            setActionSuccess('Solicitud APROBADA correctamente');
            setSelectedId(null);
            loadSolicitudes();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Error al procesar');
        } finally {
            setProcesando(false);
        }
    };

    const handleRechazar = async () => {
        if (!detalle) return;
        setActionError(null);
        setActionSuccess(null);

        if (!observacionAdmin.trim()) {
            setActionError('Debes ingresar un motivo de rechazo en Observaciones');
            return;
        }

        setProcesando(true);
        try {
            const res = await fetch('/api/admin/eventos-planes/rechazar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_evento_plan_cambio: detalle.id_evento_plan_cambio,
                    observacion_admin: observacionAdmin
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al rechazar');
            }
            setActionSuccess('Solicitud RECHAZADA correctamente');
            setSelectedId(null);
            loadSolicitudes();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Error al procesar');
        } finally {
            setProcesando(false);
        }
    };

    // Calculation for "Importe Final Sugerido"
    let importeSugerido = detalle?.diferencia_base || 0;
    if (tipoAjuste === 'BONIFICACION') {
        importeSugerido = 0;
    } else if (tipoAjuste === 'DESCUENTO') {
        importeSugerido = Math.max(0, importeSugerido - importeAjuste);
    } else if (tipoAjuste === 'RECARGO') {
        importeSugerido += importeAjuste;
    }

    useEffect(() => {
        setImportePagado(importeSugerido);
    }, [importeSugerido]);

    const isPending = detalle?.estado === 'PENDIENTE';

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-foreground">Cambios de Plan</h1>
                    <p className="text-muted text-sm">Gestioná las solicitudes de cambio de plan (Upgrades B2C)</p>
                </div>
                <button
                    onClick={loadSolicitudes}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card-bg border border-card-border hover:text-indigo-400 transition-all font-medium text-sm"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Actualizar
                </button>
            </header>

            {/* Alertas Globales */}
            {actionError && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center justify-between text-red-400 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{actionError}</p>
                    </div>
                    <button onClick={() => setActionError(null)} className="opacity-70 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {actionSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center justify-between text-emerald-400 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{actionSuccess}</p>
                    </div>
                    <button onClick={() => setActionSuccess(null)} className="opacity-70 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Grilla */}
            <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-background/50 border-b border-card-border text-xs font-bold text-muted uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Evento</th>
                                <th className="px-6 py-4">Plan Solicitado</th>
                                <th className="px-6 py-4">Mercado / Moneda</th>
                                <th className="px-6 py-4 text-right">Diferencia</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border text-foreground">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                            Cargando solicitudes...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-red-400 bg-red-500/5">
                                        {error}
                                    </td>
                                </tr>
                            ) : solicitudes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted italic">
                                        No hay solicitudes pendientes en este momento.
                                    </td>
                                </tr>
                            ) : (
                                solicitudes.map(sol => (
                                    <tr key={sol.id_evento_plan_cambio} className="hover:bg-background/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(sol.fecha_solicitud).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-indigo-400">#{sol.id_evento}</div>
                                            <div className="text-xs text-muted truncate max-w-[200px]">{sol.evento_anfitriones}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted line-through text-xs">{sol.plan_actual_nombre}</span>
                                                <ArrowRight className="w-3 h-3 text-muted" />
                                                <span className="font-bold text-foreground">{sol.plan_solicitado_nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Globe className="w-3 h-3 text-muted" /> {sol.codigo_mercado}
                                                <span className="text-muted mx-1">|</span>
                                                <DollarSign className="w-3 h-3 text-muted" /> {sol.codigo_moneda}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-sm">
                                            {sol.diferencia_base !== null && sol.diferencia_base > 0
                                                ? <span className="text-amber-400">+{sol.diferencia_base.toFixed(2)}</span>
                                                : <span className="text-muted">0.00</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                                {sol.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openModal(sol.id_evento_plan_cambio)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-bold"
                                            >
                                                Gestionar <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ════ MODAL GESTIONAR ════ */}
            {selectedId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-2xl bg-card-bg border border-card-border shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
                        {loadingDetalle || !detalle ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-4">
                                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                <p className="text-muted font-medium">Cargando detalles...</p>
                            </div>
                        ) : (
                            <>
                                {/* Modal Header */}
                                <div className="flex items-start justify-between p-6 border-b border-card-border bg-background/50 rounded-t-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                                Solicitud #{detalle.id_evento_plan_cambio}
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                                    {detalle.estado}
                                                </span>
                                            </h3>
                                            <p className="text-sm text-muted">Evento: <strong className="text-indigo-400">#{detalle.id_evento}</strong> - {detalle.evento_anfitriones}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => !procesando && setSelectedId(null)} className="text-muted hover:text-foreground p-1">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-8">
                                    {/* Resumen Comercial */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-background border border-card-border space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Plan Actual (Reconocido)</p>
                                            <p className="text-sm font-bold text-foreground">{detalle.plan_actual_nombre}</p>
                                            <p className="text-xs font-mono text-muted">{detalle.codigo_moneda} {detalle.precio_plan_actual_reconocido?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Plan Solicitado (Publicado)</p>
                                            <p className="text-sm font-bold text-foreground">{detalle.plan_solicitado_nombre}</p>
                                            <p className="text-xs font-mono text-indigo-400">{detalle.codigo_moneda} {detalle.precio_plan_solicitado_publicado?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>

                                    {/* Diferencia y Motivo */}
                                    <div className="flex gap-4 p-4 rounded-xl border border-dashed border-card-border bg-background/30">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Motivo del Cliente</p>
                                            <p className="text-sm text-foreground italic">{detalle.motivo_solicitud || 'No se indicó motivo'}</p>
                                        </div>
                                        <div className="w-px bg-card-border" />
                                        <div className="flex-1 space-y-1 text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Diferencia Base a Cobrar</p>
                                            <p className="text-2xl font-black font-mono text-foreground">
                                                {detalle.codigo_moneda} {detalle.diferencia_base?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Controles de Resolución */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-foreground border-b border-card-border pb-2">Resolución Comercial</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Ajuste */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-muted uppercase tracking-widest">Ajuste Comercial</label>
                                                <select
                                                    value={tipoAjuste}
                                                    onChange={e => setTipoAjuste(e.target.value as any)}
                                                    disabled={!isPending}
                                                    className="w-full p-2.5 rounded-lg bg-background border border-card-border focus:border-indigo-500/50 text-sm disabled:opacity-50"
                                                >
                                                    <option value="NINGUNO">Ninguno (Cobrar dif. base)</option>
                                                    <option value="DESCUENTO">Aplicar Descuento</option>
                                                    <option value="RECARGO">Aplicar Recargo</option>
                                                    <option value="BONIFICACION">100% Bonificado (Gratis)</option>
                                                </select>
                                            </div>
                                            {/* Importe Ajuste */}
                                            {tipoAjuste !== 'NINGUNO' && tipoAjuste !== 'BONIFICACION' && (
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-muted uppercase tracking-widest">Importe Ajuste ({detalle.codigo_moneda})</label>
                                                    <input
                                                        type="number"
                                                        value={importeAjuste || ''}
                                                        onChange={e => setImporteAjuste(parseFloat(e.target.value) || 0)}
                                                        disabled={!isPending}
                                                        className="w-full p-2.5 rounded-lg bg-background border border-card-border focus:border-indigo-500/50 text-sm font-mono disabled:opacity-50"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Motivo Ajuste */}
                                            {tipoAjuste !== 'NINGUNO' && (
                                                <div className="space-y-2 col-span-2">
                                                    <label className="block text-xs font-bold text-muted uppercase tracking-widest">Motivo de Ajuste</label>
                                                    <input
                                                        type="text"
                                                        value={motivoAjuste}
                                                        onChange={e => setMotivoAjuste(e.target.value)}
                                                        disabled={!isPending}
                                                        className="w-full p-2.5 rounded-lg bg-background border border-card-border focus:border-indigo-500/50 text-sm disabled:opacity-50"
                                                        placeholder="Ej. Promoción especial..."
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Medio Pago */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-muted uppercase tracking-widest">Link Pago / Medio Sugerido</label>
                                                <select
                                                    value={codigoMedioPago}
                                                    onChange={e => setCodigoMedioPago(e.target.value)}
                                                    disabled={!isPending}
                                                    className="w-full p-2.5 rounded-lg bg-background border border-card-border focus:border-indigo-500/50 text-sm disabled:opacity-50"
                                                >
                                                    <option value="">Sin link (Generar luego)</option>
                                                    {mediosPago.map(mp => (
                                                        <option key={mp.id_medio_pago} value={mp.codigo}>{mp.texto}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Referencia Pago */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-muted uppercase tracking-widest">Referencia de Pago</label>
                                                <input
                                                    type="text"
                                                    value={referenciaPago}
                                                    onChange={e => setReferenciaPago(e.target.value)}
                                                    disabled={!isPending}
                                                    className="w-full p-2.5 rounded-lg bg-background border border-card-border focus:border-indigo-500/50 text-sm disabled:opacity-50"
                                                    placeholder="# Transacción, Comprobante..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 items-end">
                                            {/* Importe Pagado */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest">Importe Pagado / A Cobrar</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-muted font-bold text-sm">{detalle.codigo_moneda}</span>
                                                    <input
                                                        type="number"
                                                        value={importePagado || ''}
                                                        onChange={e => setImportePagado(parseFloat(e.target.value) || 0)}
                                                        disabled={!isPending}
                                                        className="w-full pl-12 pr-4 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 focus:border-indigo-500/50 text-sm font-mono font-bold text-foreground disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            {/* Final Sugerido */}
                                            <div className="space-y-2 text-right flex flex-col justify-end pb-2">
                                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest">Importe Final Sugerido</label>
                                                <p className="text-xl font-black font-mono text-emerald-400">
                                                    {detalle.codigo_moneda} {importeSugerido.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Observaciones Admin */}
                                        <div className="space-y-2 pt-2">
                                            <label className="block text-xs font-bold text-muted uppercase tracking-widest">Observaciones / Motivo de Resolución</label>
                                            <textarea
                                                value={observacionAdmin}
                                                onChange={e => setObservacionAdmin(e.target.value)}
                                                disabled={!isPending}
                                                placeholder="Notas internas para el equipo o motivo de rechazo..."
                                                rows={2}
                                                className="w-full p-2.5 rounded-lg bg-background border border-card-border focus:border-indigo-500/50 text-sm resize-none disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 border-t border-card-border bg-background/50 rounded-b-2xl flex items-center justify-between gap-4">
                                    {isPending ? (
                                        <>
                                            <button
                                                onClick={handleRechazar}
                                                disabled={procesando}
                                                className="px-6 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" /> Rechazar
                                            </button>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setSelectedId(null)}
                                                    disabled={procesando}
                                                    className="px-6 py-2.5 rounded-xl text-muted hover:text-foreground text-sm font-bold transition-colors disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleAprobar}
                                                    disabled={procesando}
                                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                                >
                                                    {procesando ? (
                                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                                                    ) : (
                                                        <><CheckCircle2 className="w-4 h-4" /> Aprobar y Liquidar</>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full flex justify-end">
                                            <button
                                                onClick={() => setSelectedId(null)}
                                                className="px-6 py-2.5 rounded-xl bg-card-border hover:bg-neutral-800 text-foreground text-sm font-bold transition-colors"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
