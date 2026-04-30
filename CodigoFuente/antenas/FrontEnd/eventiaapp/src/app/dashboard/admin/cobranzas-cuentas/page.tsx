'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
    Briefcase,
    AlertTriangle,
    Search,
    Loader2,
    CheckCircle2,
    X,
    CalendarDays
} from 'lucide-react';

interface CobranzaInfo {
    id_cuenta: number;
    nombre_cuenta: string;
    owner_email: string;
    id_suscripcion: string;
    plan_nombre: string;
    plan_codigo: string;
    vencida: boolean;
    dias_para_vencer: number;
    fecha_proximo_pago: string;
    importe_plan: number;
    moneda_plan: string;
    pago_pendiente: boolean;
}

interface CobranzasData {
    vencidas: CobranzaInfo[];
    por_vencer: CobranzaInfo[];
    inconsistencias: CobranzaInfo[];
}

export default function CobranzasAdminPage() {
    const { ui, isSuperAdmin } = useAuth();
    const [data, setData] = useState<CobranzasData>({ vencidas: [], por_vencer: [], inconsistencias: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [tab, setTab] = useState<'vencidas' | 'por_vencer' | 'todas' | 'inconsistencias'>('vencidas');
    const [searchTerm, setSearchTerm] = useState('');
    const [diasFiltro, setDiasFiltro] = useState<number>(30); // 7, 30, 60, 90

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCuenta, setSelectedCuenta] = useState<CobranzaInfo | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [monto, setMonto] = useState('');
    const [moneda, setMoneda] = useState('ARS');
    const [concepto, setConcepto] = useState('Pago mensual suscripción B2B');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/cobranzas-cuentas/pendientes?diasProximo=${diasFiltro}`);
            if (!res.ok) throw new Error('Error al cargar datos');
            const result = await res.json();
            
            const mapCobranza = (item: any): CobranzaInfo => ({
                id_cuenta: item.id_cuenta ?? item.idCuenta,
                nombre_cuenta: item.nombre_cuenta ?? item.nombreCuenta,
                owner_email: item.owner_email ?? item.ownerEmail ?? 'Sin email',
                id_suscripcion: item.id_suscripcion ?? item.idSuscripcion,
                plan_nombre: item.plan_nombre ?? item.planNombre ?? 'Sin Plan',
                plan_codigo: item.plan_codigo ?? item.planCodigo,
                vencida: item.vencida || (item.dias_para_vencer < 0),
                dias_para_vencer: item.dias_para_vencer ?? item.diasParaVencer ?? 0,
                // Usamos current_period_end o fecha_proximo_pago. Si es null (como en inconsistencias), ponemos una cadena vacía.
                fecha_proximo_pago: item.current_period_end ?? item.fecha_proximo_pago ?? item.fechaProximoPago ?? '',
                importe_plan: item.importe_plan ?? item.importePlan ?? 0,
                moneda_plan: item.moneda_plan ?? item.monedaPlan ?? 'ARS',
                pago_pendiente: item.pago_pendiente ?? item.pagoPendiente ?? false,
            });

            setData({
                vencidas: (result.vencidas || []).map(mapCobranza),
                por_vencer: (result.por_vencer || []).map(mapCobranza),
                inconsistencias: (result.inconsistencias || []).map(mapCobranza)
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [diasFiltro]);

    const openRegistrarModal = (cobranza: CobranzaInfo) => {
        setSelectedCuenta(cobranza);
        setMonto(cobranza.importe_plan?.toString() || '');
        setMoneda(cobranza.moneda_plan || 'ARS');
        setConcepto(`Pago suscripción B2B - ${cobranza.plan_nombre}`);
        setIsModalOpen(true);
    };

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCuenta) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/cobranzas-cuentas/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_cuenta: selectedCuenta.id_cuenta,
                    id_suscripcion: selectedCuenta.id_suscripcion,
                    monto: Number(monto),
                    moneda,
                    concepto
                })
            });
            if (!res.ok) throw new Error('Error al registrar pago');
            
            const payload = await res.json();
            if (payload.next_due) {
                alert(`Pago registrado. Próximo vencimiento: ${new Date(payload.next_due).toLocaleDateString()}`);
            }
            
            setIsModalOpen(false);
            await fetchData();
        } catch (err) {
            alert('Error al registrar el cobro de la suscripción');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCorregirInconsistencia = async (idCuenta: number) => {
        if (!confirm('¿Marcar la suscripción de esta cuenta como pagada y corregir la inconsistencia?')) return;
        try {
            const res = await fetch(`/api/admin/cobranzas-cuentas/corregir?idCuenta=${idCuenta}`, { method: 'POST' });
            if (!res.ok) throw new Error('Error');
            await fetchData();
        } catch (err) {
            alert('Error al corregir inconsistencia');
        }
    };

    const handleCorregirTodas = async () => {
        if (!confirm('¿Corregir TODAS las inconsistencias de suscripciones B2B?')) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/cobranzas-cuentas/corregir-todas', { method: 'POST' });
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

    let currentList: CobranzaInfo[] = [];
    if (tab === 'vencidas') currentList = data.vencidas;
    if (tab === 'por_vencer') currentList = data.por_vencer;
    if (tab === 'inconsistencias') currentList = data.inconsistencias;
    if (tab === 'todas') currentList = [...data.vencidas, ...data.por_vencer];

    const filteredList = currentList.filter(c =>
        c.nombre_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Cobranzas B2B
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Gestión de suscripciones y facturación de cuentas
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
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
                        <button onClick={() => setTab('vencidas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'vencidas' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Vencidas <span className="ml-1 text-red-500 font-bold">({data.vencidas.length})</span>
                        </button>
                        <button onClick={() => setTab('por_vencer')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'por_vencer' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Por Vencer <span className="ml-1 font-bold">({data.por_vencer.length})</span>
                        </button>
                        <button onClick={() => setTab('todas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'todas' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Todas
                        </button>
                        <button onClick={() => setTab('inconsistencias')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'inconsistencias' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Inconsistencias
                            {data.inconsistencias.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        </button>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {tab === 'por_vencer' && (
                            <select 
                                value={diasFiltro} 
                                onChange={(e) => setDiasFiltro(Number(e.target.value))}
                                className="pl-3 pr-8 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value={7}>Próx. 7 días</option>
                                <option value={30}>Próx. 30 días</option>
                                <option value={60}>Próx. 60 días</option>
                            </select>
                        )}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Buscar cuenta o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
                            <p>Cargando suscripciones...</p>
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
                            <p className="text-sm">Todo está al día en esta vista.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/30">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Cuenta / Email</th>
                                    <th className="px-6 py-4 font-semibold">Plan</th>
                                    <th className="px-6 py-4 font-semibold">Vencimiento</th>
                                    <th className="px-6 py-4 font-semibold text-right">Importe</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {filteredList.map((cob) => (
                                    <tr key={cob.id_cuenta} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                                {cob.nombre_cuenta}
                                            </p>
                                            <p className="text-xs text-neutral-500">{cob.owner_email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 uppercase tracking-wider">
                                                {cob.plan_nombre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className={`w-4 h-4 ${cob.vencida ? 'text-red-500' : 'text-neutral-400'}`} />
                                                <div>
                                                    <p className={`font-medium ${cob.vencida ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
                                                        {cob.fecha_proximo_pago ? new Date(cob.fecha_proximo_pago).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                    <p className={`text-xs ${cob.vencida ? 'text-red-400 font-bold' : 'text-neutral-500'}`}>
                                                        {cob.vencida ? 'VENCIDA' : (cob.fecha_proximo_pago ? `En ${cob.dias_para_vencer} días` : 'Revisar suscripción')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                ${cob.importe_plan?.toLocaleString() || 0}
                                            </p>
                                            <p className="text-xs text-neutral-500">{cob.moneda_plan}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {tab === 'inconsistencias' ? (
                                                <button
                                                    onClick={() => handleCorregirInconsistencia(cob.id_cuenta)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Corregir
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openRegistrarModal(cob)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Registrar Cobro
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

            {/* Modal Registrar Cobro */}
            {isModalOpen && selectedCuenta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                Registrar Cobro B2B
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRegistrarPago} className="p-6 space-y-4">
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl mb-4 border border-neutral-200 dark:border-neutral-700/50">
                                <p className="text-xs text-neutral-500">Cuenta #{selectedCuenta.id_cuenta}</p>
                                <p className="font-medium text-neutral-900 dark:text-white">{selectedCuenta.nombre_cuenta}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-neutral-500">Plan: {selectedCuenta.plan_nombre}</p>
                                    <p className={`text-xs font-bold ${selectedCuenta.vencida ? 'text-red-500' : 'text-amber-500'}`}>
                                        Vence: {new Date(selectedCuenta.fecha_proximo_pago).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Monto Cobrado</label>
                                    <input
                                        type="number"
                                        required
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Moneda</label>
                                    <select
                                        value={moneda}
                                        onChange={(e) => setMoneda(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="ARS">ARS</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Concepto / Referencia</label>
                                <input
                                    type="text"
                                    required
                                    value={concepto}
                                    onChange={(e) => setConcepto(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-purple-500 outline-none"
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
                                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Registrar Cobro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
