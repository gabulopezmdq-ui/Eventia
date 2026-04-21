'use client';

import { useEffect, useState } from 'react';
import { getMiPlan, CuentaPlan } from '@/src/features/cuenta/cuenta.service';
import { useAuth } from '@/src/context/AuthContext';
import { CreditCard, Loader2, Calendar, CheckCircle2, Package, Sparkles, Users } from 'lucide-react';

export default function PlanCuentaPage() {
    const { cuenta } = useAuth();
    const [plan, setPlan] = useState<CuentaPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMiPlan()
            .then(setPlan)
            .catch(() => setError('No se pudo cargar la información del plan de facturación'))
            .finally(() => setLoading(false));
    }, []);

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
                            <button className="w-full py-3 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-100 transition-colors">
                                Cambiar Plan
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
            ) : null}
        </div>
    );
}
