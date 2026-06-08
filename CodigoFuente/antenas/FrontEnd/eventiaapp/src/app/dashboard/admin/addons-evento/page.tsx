'use client';

import { useEffect, useState, useCallback } from 'react';
import { BadgeDollarSign, Loader2, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface AddonPendiente {
    id_scope_addon: number;
    scope: 'EVENTO';
    id_evento: number;
    addon_codigo: string;
    addon_nombre: string;
    evento_anfitriones: string;
    tipo_evento_codigo: string;
    estado: 'PENDIENTE';
    fecha_solicitud: string;
    mercado: string;
    moneda: string;
    importe_sugerido: number | null;
    inconsistente: boolean;
    detalle: string | null;
}

export default function AdminAddonsEventoPage() {
    const [mercado, setMercado] = useState('AR');
    const [moneda, setMoneda] = useState('ARS');
    const [solicitudes, setSolicitudes] = useState<AddonPendiente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [selectedRequest, setSelectedRequest] = useState<AddonPendiente | null>(null);
    const [importe, setImporte] = useState<number | string>('');
    const [concepto, setConcepto] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchSolicitudes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/addons-evento/pendientes?mercado=${mercado}&moneda=${moneda}`);
            if (!res.ok) throw new Error('Error al cargar solicitudes pendientes');
            const data = await res.json();
            setSolicitudes(data);
        } catch {
            setError('No se pudieron recuperar las solicitudes pendientes.');
        } finally {
            setLoading(false);
        }
    }, [mercado, moneda]);

    useEffect(() => {
        fetchSolicitudes();
    }, [fetchSolicitudes]);

    const handleOpenModal = (req: AddonPendiente) => {
        setSelectedRequest(req);
        setImporte(req.importe_sugerido !== null ? req.importe_sugerido : '');
        setConcepto('');
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/addons-evento/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_scope_addon: selectedRequest.id_scope_addon,
                    moneda: selectedRequest.moneda,
                    importe: Number(importe),
                    concepto: concepto.trim()
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al registrar el pago del addon.');
            }

            alert('¡Pago registrado con éxito! El add-on ahora está ACTIVO.');
            handleCloseModal();
            fetchSolicitudes();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al procesar la registración de pago.';
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <BadgeDollarSign className="w-6 h-6 text-indigo-500" />
                        Cobranzas: Add-ons de Evento (B2C)
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Visualizá y aprobá manualmente las solicitudes de add-ons recibidas por organizadores B2C.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {/* Filtro Mercado */}
                    <select
                        value={mercado}
                        onChange={(e) => {
                            const val = e.target.value;
                            setMercado(val);
                            setMoneda(val === 'AR' ? 'ARS' : (val === 'ES' ? 'EUR' : 'USD'));
                        }}
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        <option value="AR">Mercado: Argentina (AR)</option>
                        <option value="ES">Mercado: España (ES)</option>
                        <option value="US">Mercado: Internacional (US)</option>
                    </select>

                    <button
                        onClick={fetchSolicitudes}
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-indigo-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                        title="Refrescar lista"
                    >
                        <RefreshCw className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20">
                    {error}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
                    {solicitudes.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500 flex flex-col items-center gap-3">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            <p className="font-medium">¡Al día! No hay solicitudes pendientes de cobro para {mercado} ({moneda}).</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/30">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">ID Solicitud</th>
                                        <th className="px-6 py-4 font-semibold">Evento (Anfitriones)</th>
                                        <th className="px-6 py-4 font-semibold">Add-on</th>
                                        <th className="px-6 py-4 font-semibold">Fecha Solicitud</th>
                                        <th className="px-6 py-4 font-semibold text-right">Importe Sugerido</th>
                                        <th className="px-6 py-4 font-semibold text-center">Estado / Alertas</th>
                                        <th className="px-6 py-4 font-semibold text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {solicitudes.map((sol) => (
                                        <tr key={sol.id_scope_addon} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                                #{sol.id_scope_addon}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-neutral-900 dark:text-white">
                                                    {sol.evento_anfitriones}
                                                </div>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase tracking-widest font-black">
                                                    {sol.tipo_evento_codigo} (ID: {sol.id_evento})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                                {sol.addon_nombre}
                                                <div className="text-xs text-neutral-400 font-mono mt-0.5">{sol.addon_codigo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {new Date(sol.fecha_solicitud).toLocaleString('es-AR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-extrabold text-neutral-900 dark:text-white">
                                                    {sol.importe_sugerido !== null
                                                        ? new Intl.NumberFormat(mercado === 'AR' ? 'es-AR' : 'en-US', {
                                                            style: 'currency',
                                                            currency: sol.moneda
                                                        }).format(sol.importe_sugerido)
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {sol.inconsistente ? (
                                                    <div
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-500/20"
                                                        title={sol.detalle || 'Inconsistencia detectada'}
                                                    >
                                                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Inconsistente
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/20">
                                                        Pendiente Cobro
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenModal(sol)}
                                                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 active:scale-95 transition-all"
                                                >
                                                    Registrar Pago
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Cabecera */}
                        <div className="relative p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <button
                                onClick={handleCloseModal}
                                className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <BadgeDollarSign className="w-5 h-5 text-indigo-500" />
                                Registrar Pago de Add-on
                            </h2>
                            <p className="text-xs text-neutral-500 mt-1">
                                Confirmá el cobro para activar la funcionalidad en el evento de forma inmediata.
                            </p>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleRegistrarPago} className="p-6 space-y-4">
                            {/* Metadata */}
                            <div className="bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Evento:</span>
                                    <span className="font-bold text-neutral-900 dark:text-white">{selectedRequest.evento_anfitriones}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Add-on:</span>
                                    <span className="font-bold text-neutral-900 dark:text-white">{selectedRequest.addon_nombre}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Moneda contratada:</span>
                                    <span className="font-bold text-neutral-900 dark:text-white tracking-widest">{selectedRequest.moneda}</span>
                                </div>
                            </div>

                            {/* Inconsistente Warning */}
                            {selectedRequest.inconsistente && (
                                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex gap-2 text-xs leading-relaxed font-semibold">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>
                                        Alerta: {selectedRequest.detalle || 'No hay precio vigente asignado a este add-on.'} Ingresá el importe cobrado manualmente.
                                    </span>
                                </div>
                            )}

                            {/* Importe Input */}
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">
                                    Monto Cobrado ({selectedRequest.moneda})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={importe}
                                    onChange={(e) => setImporte(e.target.value)}
                                    placeholder="Ej: 15000"
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-foreground"
                                    disabled={submitting}
                                />
                            </div>

                            {/* Concepto Input */}
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">
                                    Concepto / Comprobante
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={concepto}
                                    onChange={(e) => setConcepto(e.target.value)}
                                    placeholder="Ej: Transferencia Santander - comp 000123"
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-foreground resize-none"
                                    disabled={submitting}
                                />
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold rounded-xl text-xs text-center transition-all"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 text-xs transition-all flex items-center justify-center gap-1.5"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Registrando...</>
                                    ) : (
                                        'Registrar y Activar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
