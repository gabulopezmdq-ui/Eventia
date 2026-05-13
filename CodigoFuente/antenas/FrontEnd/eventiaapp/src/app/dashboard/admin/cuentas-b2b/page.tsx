'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
    UserCog,
    AlertTriangle,
    Search,
    Loader2,
    CheckCircle2,
    X,
} from 'lucide-react';

interface CuentaAdminInfo {
    id_cuenta: number;
    nombre_cuenta: string;
    tipo_texto: string;
    identificacion_fiscal: string;
    pais_nombre: string;
    estado: 'P' | 'A' | 'S';
    plan_nombre: string;
    plan_codigo: string;
    owner_email: string;
}

export default function CuentasB2BAdminPage() {
    const { ui, isSuperAdmin } = useAuth();
    const [data, setData] = useState<CuentaAdminInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'Aprobar' | 'Suspender' | 'Reactivar' | 'CambiarPlan' | null>(null);
    const [selectedCuenta, setSelectedCuenta] = useState<CuentaAdminInfo | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [observacion, setObservacion] = useState('');
    const [planCodigo, setPlanCodigo] = useState('');
    const [planesB2B, setPlanesB2B] = useState<any[]>([]);

    const fetchPlanes = async () => {
        try {
            const res = await fetch('/api/planesPublic/PublicCatalog?tipo=B2B');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPlanesB2B(data);
                }
            }
        } catch (error) {
            console.error('Error fetching planes:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/cuentas-b2b');
            if (!res.ok) throw new Error('Error al cargar datos');
            const result = await res.json();

            const list = Array.isArray(result) ? result : (result.cuentas || result.data || []);

            setData(list.map((item: any) => ({
                id_cuenta: item.id_cuenta ?? item.idCuenta,
                nombre_cuenta: item.nombre_cuenta ?? item.nombreCuenta,
                tipo_texto: item.tipo_texto ?? item.tipoTexto,
                identificacion_fiscal: item.identificacion_fiscal ?? item.identificacionFiscal,
                pais_nombre: item.pais_nombre ?? item.paisNombre,
                estado: item.estado,
                plan_nombre: item.plan_nombre ?? item.planNombre,
                plan_codigo: item.plan_codigo ?? item.planCodigo,
                owner_email: item.owner_email ?? item.ownerEmail,
            })));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchPlanes();
    }, []);

    const openModal = (cuenta: CuentaAdminInfo, action: 'Aprobar' | 'Suspender' | 'Reactivar' | 'CambiarPlan') => {
        setSelectedCuenta(cuenta);
        setModalAction(action);
        setObservacion('');
        setPlanCodigo(cuenta.plan_codigo || '');
        setIsModalOpen(true);
    };

    const handleActionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCuenta || !modalAction) return;
        setSubmitting(true);
        try {
            const payload: any = {
                id_cuenta: selectedCuenta.id_cuenta,
            };

            if (modalAction === 'CambiarPlan') {
                payload.codigo_plan_nuevo = planCodigo;
                payload.motivo = observacion;
            } else {
                payload.observacion = observacion;
                if (modalAction === 'Aprobar') {
                    payload.codigo_plan = planCodigo;
                }
            }

            const res = await fetch(`/api/admin/cuentas-b2b/actions?action=${modalAction}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                const backendMsg = err.details?.message || err.message;
                throw new Error(backendMsg || `Error al ${modalAction}`);
            }

            setIsModalOpen(false);
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (ui === null) return null;
    if (!ui.mostrar_admin && !isSuperAdmin) {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
    }

    const filteredList = data.filter(c =>
        c.nombre_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.identificacion_fiscal?.includes(searchTerm) ||
        c.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'P': return <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold">PENDIENTE</span>;
            case 'A': return <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">ACTIVA</span>;
            case 'S': return <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-bold">SUSPENDIDA</span>;
            default: return <span>{estado}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <UserCog className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Cuentas B2B
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Aprobación y gestión de cuentas comerciales
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {/* Search */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, CUIT o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
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
                            <p className="text-sm">No se encontraron cuentas que coincidan con la búsqueda.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/30">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">ID</th>
                                    <th className="px-6 py-4 font-semibold">Cuenta / Tipo</th>
                                    <th className="px-6 py-4 font-semibold">Contacto</th>
                                    <th className="px-6 py-4 font-semibold">Plan</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {filteredList.map((cuenta) => (
                                    <tr key={cuenta.id_cuenta} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                            #{cuenta.id_cuenta}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-neutral-900 dark:text-white">{cuenta.nombre_cuenta}</p>
                                            <p className="text-xs text-neutral-500">{cuenta.tipo_texto} · {cuenta.pais_nombre}</p>
                                            <p className="text-[10px] text-neutral-400">{cuenta.identificacion_fiscal}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-neutral-600 dark:text-neutral-300">{cuenta.owner_email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                                                {cuenta.plan_nombre || 'Sin Plan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getEstadoBadge(cuenta.estado)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {cuenta.estado === 'P' && (
                                                    <button
                                                        onClick={() => openModal(cuenta, 'Aprobar')}
                                                        className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded"
                                                    >
                                                        Aprobar
                                                    </button>
                                                )}
                                                {cuenta.estado === 'A' && (
                                                    <button
                                                        onClick={() => openModal(cuenta, 'Suspender')}
                                                        className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold rounded"
                                                    >
                                                        Suspender
                                                    </button>
                                                )}
                                                {cuenta.estado === 'S' && (
                                                    <button
                                                        onClick={() => openModal(cuenta, 'Reactivar')}
                                                        className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded"
                                                    >
                                                        Reactivar
                                                    </button>
                                                )}
                                                {cuenta.estado === 'A' && (
                                                    <button
                                                        onClick={() => openModal(cuenta, 'CambiarPlan')}
                                                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded"
                                                    >
                                                        Plan
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal de Acciones */}
            {isModalOpen && selectedCuenta && modalAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                {modalAction === 'Aprobar' && 'Aprobar Cuenta'}
                                {modalAction === 'Suspender' && 'Suspender Cuenta'}
                                {modalAction === 'Reactivar' && 'Reactivar Cuenta'}
                                {modalAction === 'CambiarPlan' && 'Cambiar Plan'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl mb-4 border border-neutral-200 dark:border-neutral-700/50">
                                <p className="font-medium text-neutral-900 dark:text-white">{selectedCuenta.nombre_cuenta}</p>
                                <p className="text-xs text-neutral-500 mt-1">Plan actual: {selectedCuenta.plan_nombre || 'Ninguno'}</p>
                            </div>

                            {(modalAction === 'Aprobar' || modalAction === 'CambiarPlan') && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Seleccionar Plan</label>
                                    <select
                                        required
                                        value={planCodigo}
                                        onChange={(e) => setPlanCodigo(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Seleccione un plan...</option>
                                        {planesB2B.map(plan => (
                                            <option key={plan.codigo} value={plan.codigo}>
                                                {plan.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">
                                    Observación / Motivo
                                    {modalAction === 'Suspender' && ' (Obligatorio)'}
                                </label>
                                <textarea
                                    required={modalAction === 'Suspender'}
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                                    placeholder="Ingrese un comentario interno..."
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
                                    className={`flex-1 py-2 rounded-xl text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${modalAction === 'Suspender' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
                                        }`}
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
