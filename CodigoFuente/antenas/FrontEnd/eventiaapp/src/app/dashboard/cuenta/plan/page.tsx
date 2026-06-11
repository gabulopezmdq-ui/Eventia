'use client';

import { useEffect, useState } from 'react';
import { getMiPlan, CuentaPlan } from '@/src/features/cuenta/cuenta.service';
import { useAuth } from '@/src/context/AuthContext';
import { CreditCard, Loader2, Calendar, CheckCircle2, Package, Sparkles, Users, AlertTriangle, History, Receipt, X } from 'lucide-react';

export default function PlanCuentaPage() {
    const { cuenta } = useAuth();
    const [plan, setPlan] = useState<CuentaPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [comercialData, setComercialData] = useState<any>(null);
    const [pagos, setPagos] = useState<any[]>([]);

    // Change plan flow states
    const [solicitudPendiente, setSolicitudPendiente] = useState<any>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [planesDisponibles, setPlanesDisponibles] = useState<any[]>([]);
    const [loadingPlanes, setLoadingPlanes] = useState(false);
    const [planSeleccionado, setPlanSeleccionado] = useState('');
    const [motivoSolicitud, setMotivoSolicitud] = useState('');
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

    useEffect(() => {
        if (!cuenta?.id_cuenta) return;

        setLoading(true);
        Promise.all([
            getMiPlan(),
            fetch(`/api/cuentas-comercial?idCuenta=${cuenta.id_cuenta}`).then(r => r.ok ? r.json() : null),
            fetch(`/api/cuentas-comercial/pagos?idCuenta=${cuenta.id_cuenta}&take=10`).then(r => r.ok ? r.json() : []),
            fetch(`/api/cuentas/${cuenta.id_cuenta}/plan-cambios/pendiente`).then(r => r.ok ? r.json() : null)
        ])
            .then(([planRes, comRes, pagosRes, pendienteRes]) => {
                setPlan(planRes);
                setComercialData(comRes?.data || comRes);
                setPagos(pagosRes?.pagos || pagosRes?.data || Array.isArray(pagosRes) ? pagosRes : []);
                if (pendienteRes?.tiene_pendiente) {
                    setSolicitudPendiente(pendienteRes.solicitud);
                } else {
                    setSolicitudPendiente(null);
                }
            })
            .catch(() => setError('No se pudo cargar la información de facturación'))
            .finally(() => setLoading(false));
    }, [cuenta]);

    const handleCambiarPlanClick = async () => {
        if (!cuenta?.id_cuenta || !plan) return;

        setLoadingPlanes(true);
        try {
            // Re-verify pending status
            const resPendiente = await fetch(`/api/cuentas/${cuenta.id_cuenta}/plan-cambios/pendiente`);
            const dataPendiente = await resPendiente.json();

            if (dataPendiente.tiene_pendiente) {
                setSolicitudPendiente(dataPendiente.solicitud);
                alert('Ya tenés una solicitud de cambio pendiente de revisión.');
                return;
            }

            // Fetch B2B plans available
            const mercado = comercialData?.codigo_mercado || 
                            comercialData?.codigoMercado || 
                            comercialData?.mercado || 
                            (plan.moneda === 'EUR' ? 'EU' : 'AR');

            const resPlanes = await fetch(`/api/precios/planes?tipo=B2B&mercado=${mercado}`);
            if (!resPlanes.ok) throw new Error('Error al obtener planes disponibles');

            const planes = await resPlanes.json();
            // Filter out the current active plan
            const planesFiltrados = planes.filter((p: any) => {
                const pCodigo = p.codigo_plan || p.codigoPlan || p.codigo;
                return pCodigo !== plan.plan_codigo;
            });
            setPlanesDisponibles(planesFiltrados);
            if (planesFiltrados.length > 0) {
                const firstCodigo = planesFiltrados[0].codigo_plan || planesFiltrados[0].codigoPlan || planesFiltrados[0].codigo;
                setPlanSeleccionado(firstCodigo);
            }
            setMotivoSolicitud('');
            setShowRequestModal(true);
        } catch (err) {
            console.error('Error opening plan change modal:', err);
            alert('No se pudieron obtener los planes disponibles. Intentá nuevamente.');
        } finally {
            setLoadingPlanes(false);
        }
    };

    const handleEnviarSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cuenta?.id_cuenta || !planSeleccionado) return;

        setEnviandoSolicitud(true);
        try {
            const res = await fetch(`/api/cuentas/${cuenta.id_cuenta}/plan-cambios/solicitar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    codigo_plan_solicitado: planSeleccionado,
                    motivo_solicitud: motivoSolicitud || undefined
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Error al enviar la solicitud');
            }

            alert('¡Solicitud de cambio enviada con éxito! Queda pendiente de aprobación.');
            setShowRequestModal(false);
            
            // Reload the page to reflect the new pending status
            window.location.reload();
        } catch (err: any) {
            console.error('Error submitting plan change request:', err);
            alert(err.message || 'Ocurrió un error al enviar la solicitud. Intentá de nuevo.');
        } finally {
            setEnviandoSolicitud(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                        Plan y Facturación
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Administrá la suscripción de tu agencia y revisá los límites de uso.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {error}
                </div>
            ) : plan ? (
                <div className="space-y-8">
                    {/* Banner de Solicitud de Cambio Pendiente */}
                    {solicitudPendiente && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1 relative z-10 flex-1">
                                <h3 className="text-amber-800 dark:text-amber-300 font-bold text-base">Solicitud de Cambio de Plan Pendiente</h3>
                                <p className="text-amber-700 dark:text-amber-400 text-sm">
                                    Ya tenés una solicitud de cambio pendiente de revisión. Nuestro equipo de administración está revisando los detalles. No se permite realizar una segunda solicitud.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-amber-600 dark:text-amber-400/80 bg-white/40 dark:bg-neutral-900/30 p-3 rounded-xl border border-amber-200/50 dark:border-amber-500/10 w-fit">
                                    <div>
                                        <span className="font-bold">Plan Actual:</span> {solicitudPendiente.plan_actual_codigo?.replace('B2B_', '') || plan?.plan_nombre}
                                    </div>
                                    <div>
                                        <span className="font-bold">Plan Solicitado:</span> {solicitudPendiente.plan_solicitado_codigo?.replace('B2B_', '')}
                                    </div>
                                    {solicitudPendiente.codigo_moneda && (
                                        <div>
                                            <span className="font-bold">Moneda:</span> {solicitudPendiente.codigo_moneda}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-bold">Estado:</span> <span className="uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-200/50 text-amber-800 text-[10px]">{solicitudPendiente.estado}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Banner de Vencimiento */}
                    {comercialData && comercialData.pago_pendiente && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                                <h3 className="text-red-800 dark:text-red-300 font-bold">Cuenta vencida / Pago pendiente</h3>
                                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                    Tu suscripción registra un pago pendiente o rechazado. Por favor, regularizá tu situación o contactá a soporte técnico.
                                </p>
                            </div>
                        </div>
                    )}
                    {comercialData && !comercialData.pago_pendiente && comercialData.dias_para_vencer <= 3 && !comercialData.vencida && (
                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex items-start gap-4">
                            <Calendar className="w-6 h-6 text-amber-500 shrink-0" />
                            <div>
                                <h3 className="text-amber-800 dark:text-amber-300 font-bold">Vencimiento próximo</h3>
                                <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                                    Tu suscripción vence en {comercialData.dias_para_vencer} días ({new Date(comercialData.fecha_proximo_pago).toLocaleDateString()}).
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* Tarjeta Plan Actual */}
                        <div className="md:col-span-8">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-neutral-900 relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-900/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
                                                {plan.estado === 'Activo' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                                                {plan.estado}
                                            </div>
                                            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">
                                                {plan.plan_nombre}
                                            </h2>
                                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                                Facturado en forma {plan.periodo.toLowerCase()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {plan.precio > 0 ? (
                                                <>
                                                    <span className="text-4xl font-black text-neutral-900 dark:text-white">${plan.precio}</span>
                                                    <span className="text-sm font-semibold text-neutral-400 uppercase ml-1">{plan.moneda}</span>
                                                    <p className="text-xs text-neutral-500 mt-1">por mes</p>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Gratis</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-6">Límites y Características</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex gap-4">
                                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 h-max">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Límite de Eventos</p>
                                                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                                                    {plan.limite_eventos ? plan.limite_eventos : 'Ilimitado'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 h-max">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Usuarios Asignados</p>
                                                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                                                    {plan.limite_usuarios ? plan.limite_usuarios : 'Ilimitado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Upgrades */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-6 text-white shadow-xl">
                                <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">¿Necesitás más capacidad?</h3>
                                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                                    Hacé un upgrade a Enterprise y desbloqueá facturación dividida, marca blanca y API access.
                                </p>
                                <button 
                                    onClick={handleCambiarPlanClick}
                                    disabled={loadingPlanes || !!solicitudPendiente}
                                    className="w-full py-3 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingPlanes ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                                            Verificando...
                                        </>
                                    ) : (
                                        'Cambiar Plan'
                                    )}
                                </button>
                            </div>

                            {plan.renovacion && (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Calendar className="w-4 h-4 text-emerald-600" /> Próxima facturación
                                    </h3>
                                    <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                                        {new Date(plan.renovacion).toLocaleDateString('es-AR', { dateStyle: 'long' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Historial de Pagos */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm mt-8">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400">
                                <History className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Historial de Pagos</h3>
                        </div>

                        {pagos.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
                                <Receipt className="w-12 h-12 mb-3 text-neutral-300 dark:text-neutral-700" />
                                <p>No se registran pagos en esta cuenta.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/30">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Fecha</th>
                                            <th className="px-6 py-4 font-semibold">Concepto</th>
                                            <th className="px-6 py-4 font-semibold text-right">Importe</th>
                                            <th className="px-6 py-4 font-semibold">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {pagos.map((pago: any) => (
                                            <tr key={pago.id_pago || pago.idPago || Math.random()} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                    {new Date(pago.fecha_alta || pago.fecha_alta).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                                    {pago.concepto || 'Suscripción B2B'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-neutral-900 dark:text-white">
                                                        ${(pago.monto || pago.importe || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-neutral-500 ml-1">
                                                        {pago.moneda || 'ARS'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold rounded">
                                                        APROBADO
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            ) : null}

            {/* Modal de Cambio de Plan */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 dark:bg-emerald-950/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Solicitar Cambio de Plan
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1">Mejorá tu capacidad y habilitá nuevas características.</p>
                            </div>
                            <button 
                                onClick={() => setShowRequestModal(false)} 
                                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEnviarSolicitud} className="p-6 space-y-6 relative z-10">
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Plan Actual</p>
                                <p className="text-lg font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{plan?.plan_nombre}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">${plan?.precio} {plan?.moneda} por mes</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    Seleccionar Plan Destino
                                </label>
                                {planesDisponibles.length === 0 ? (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600">
                                        No hay planes B2B disponibles para el mercado {comercialData?.codigo_mercado || 'AR'}.
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={planSeleccionado}
                                        onChange={(e) => setPlanSeleccionado(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-neutral-900 dark:text-white cursor-pointer transition-all shadow-sm"
                                    >
                                        {planesDisponibles.map((p) => {
                                            const pCodigo = p.codigo_plan || p.codigoPlan || p.codigo;
                                            const pNombre = p.nombre_plan || p.nombrePlan || p.nombre;
                                            const pPrecio = p.precio_publicado ?? p.precio;
                                            const pMoneda = p.codigo_moneda || p.codigoMoneda || p.moneda || 'ARS';
                                            return (
                                                <option key={pCodigo} value={pCodigo}>
                                                    {pNombre} {pPrecio !== undefined ? `($${pPrecio.toLocaleString()} ${pMoneda})` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    Motivo / Comentarios de la solicitud
                                </label>
                                <textarea
                                    value={motivoSolicitud}
                                    onChange={(e) => setMotivoSolicitud(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-28 text-sm placeholder:text-neutral-400"
                                    placeholder="Detallá por qué solicitás el cambio de plan o si necesitás un límite personalizado..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={enviandoSolicitud || planesDisponibles.length === 0}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    {enviandoSolicitud ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Solicitud'
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
