'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
    BadgeDollarSign,
    AlertTriangle,
    Search,
    Loader2,
    CheckCircle2,
    X,
} from 'lucide-react';

interface PagoInfo {
    id_evento: number;
    fecha_alta: string;
    anfitriones_texto: string;
    tipo_evento: string;
    plan_nombre: string;
    importe_plan: number;
    moneda_plan: string;
    estado_comercial: string;
    pago_pendiente: boolean;
    plan_codigo: string;
}

interface PagosData {
    pendientes: PagoInfo[];
    inconsistencias: PagoInfo[];
}

export default function PagosEventosAdminPage() {
    const { ui, isSuperAdmin } = useAuth();
    const [data, setData] = useState<PagosData>({ pendientes: [], inconsistencias: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'pendientes' | 'inconsistencias'>('pendientes');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvento, setSelectedEvento] = useState<PagoInfo | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [monto, setMonto] = useState('');
    const [moneda, setMoneda] = useState('ARS');
    const [concepto, setConcepto] = useState('Pago manual de evento B2C');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/pagos-eventos');
            if (!res.ok) throw new Error('Error al cargar datos');
            const result = await res.json();
            // Mapear camelCase a snake_case si el backend los devuelve así
            const mapPagoInfo = (item: any): PagoInfo => ({
                id_evento: item.id_evento ?? item.idEvento,
                fecha_alta: item.fecha_alta ?? item.fechaAlta,
                anfitriones_texto: item.anfitriones_texto ?? item.anfitrionesTexto,
                tipo_evento: item.tipo_evento ?? item.tipoEvento,
                plan_nombre: item.plan_nombre ?? item.planNombre,
                importe_plan: item.importe_plan ?? item.importePlan,
                moneda_plan: item.moneda_plan ?? item.monedaPlan ?? 'ARS',
                estado_comercial: item.estado_comercial ?? item.estadoComercial,
                pago_pendiente: item.pago_pendiente ?? item.pagoPendiente,
                plan_codigo: item.plan_codigo ?? item.planCodigo ?? '',
            });
            setData({
                pendientes: (result.pendientes || []).map(mapPagoInfo),
                inconsistencias: (result.inconsistencias || []).map(mapPagoInfo)
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openRegistrarModal = (pago: PagoInfo) => {
        setSelectedEvento(pago);
        setMonto(pago.importe_plan?.toString() || '');
        setMoneda(pago.moneda_plan || 'ARS');
        setConcepto('Pago manual de evento B2C');
        setIsModalOpen(true);
    };

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvento) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/pagos-eventos/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_evento: selectedEvento.id_evento,
                    codigo_plan: selectedEvento.plan_codigo,// era CodigoPlan
                    importe: Number(monto),                   // era monto
                    moneda,
                    concepto
                })
            });
            if (!res.ok) throw new Error('Error al registrar pago');
            setIsModalOpen(false);
            await fetchData();
        } catch (err) {
            alert('Error al registrar el pago');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCorregirInconsistencia = async (idEvento: number) => {
        if (!confirm('¿Marcar este evento como pagado y corregir la inconsistencia?')) return;
        try {
            const res = await fetch(`/api/admin/pagos-eventos/corregir?idEvento=${idEvento}`, { method: 'POST' });
            if (!res.ok) throw new Error('Error');
            await fetchData();
        } catch (err) {
            alert('Error al corregir inconsistencia');
        }
    };

    const handleCorregirTodas = async () => {
        if (!confirm('¿Corregir TODAS las inconsistencias? Esta acción es irreversible.')) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/pagos-eventos/corregir-todas', { method: 'POST' });
            if (!res.ok) throw new Error('Error');
            await fetchData();
        } catch (err) {
            alert('Error al corregir inconsistencias');
        } finally {
            setSubmitting(false);
        }
    };

    if (ui === null) return null;
    if (!ui.mostrar_admin && !isSuperAdmin) {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
    }

    const currentList = tab === 'pendientes' ? data.pendientes : data.inconsistencias;
    const filteredList = currentList.filter(p =>
        p.anfitriones_texto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id_evento.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <BadgeDollarSign className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Pagos Eventos B2C
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Gestión de cobranzas de eventos pago único
                        </p>
                    </div>
                </div>
                {tab === 'inconsistencias' && data.inconsistencias.length > 0 && (
                    <button
                        onClick={handleCorregirTodas}
                        disabled={submitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Procesando...' : 'Corregir todas (Bulk)'}
                    </button>
                )}
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {/* Tabs & Search */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl">
                        <button
                            onClick={() => setTab('pendientes')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'pendientes'
                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                        >
                            Pendientes ({data.pendientes.length})
                        </button>
                        <button
                            onClick={() => setTab('inconsistencias')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'inconsistencias'
                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                        >
                            Inconsistencias ({data.inconsistencias.length})
                            {data.inconsistencias.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar anfitrión o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                            <p>Cargando datos...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-red-500">
                            <AlertTriangle className="w-8 h-8 mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <CheckCircle2 className="w-12 h-12 mb-3 text-neutral-300 dark:text-neutral-700" />
                            <p className="text-lg font-medium">No hay registros</p>
                            <p className="text-sm">No se encontraron eventos en esta categoría.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/30">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">ID</th>
                                    <th className="px-6 py-4 font-semibold">Fecha / Anfitriones</th>
                                    <th className="px-6 py-4 font-semibold">Plan</th>
                                    <th className="px-6 py-4 font-semibold text-right">Importe</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {filteredList.map((pago) => (
                                    <tr key={pago.id_evento} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                            #{pago.id_evento}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-neutral-900 dark:text-white">{pago.anfitriones_texto}</p>
                                            <p className="text-xs text-neutral-500">{new Date(pago.fecha_alta).toLocaleDateString()} · {pago.tipo_evento}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                                                {pago.plan_nombre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                ${pago.importe_plan?.toLocaleString() || 0}
                                            </p>
                                            <p className="text-xs text-neutral-500">{pago.moneda_plan}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {tab === 'pendientes' ? (
                                                <button
                                                    onClick={() => openRegistrarModal(pago)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Registrar Pago
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleCorregirInconsistencia(pago.id_evento)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Corregir
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Registrar Pago */}
            {isModalOpen && selectedEvento && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                Registrar Pago B2C
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRegistrarPago} className="p-6 space-y-4">
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl mb-4 border border-neutral-200 dark:border-neutral-700/50">
                                <p className="text-xs text-neutral-500">Evento #{selectedEvento.id_evento}</p>
                                <p className="font-medium text-neutral-900 dark:text-white">{selectedEvento.anfitriones_texto}</p>
                                <p className="text-xs text-neutral-500 mt-1">Plan: {selectedEvento.plan_nombre}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Monto</label>
                                    <input
                                        type="number"
                                        required
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Moneda</label>
                                    <select
                                        value={moneda}
                                        onChange={(e) => setMoneda(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="ARS">ARS</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Concepto</label>
                                <input
                                    type="text"
                                    required
                                    value={concepto}
                                    onChange={(e) => setConcepto(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
