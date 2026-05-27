'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { getMiPlan, getMisClientes, getMisUnidades, getCuentaEventos, CuentaPlan } from '@/src/features/cuenta/cuenta.service';
import { Briefcase, Building2, Users, CalendarHeart, CreditCard, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react';

export default function CuentaDashboardPage() {
    const { cuenta, loading: authLoading } = useAuth();
    
    const [plan, setPlan] = useState<CuentaPlan | null>(null);
    const [clientesCount, setClientesCount] = useState<number>(0);
    const [unidadesCount, setUnidadesCount] = useState<number>(0);
    const [eventosCount, setEventosCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const fetchData = async () => {
            try {
                // Hacemos las peticiones en paralelo
                const [planData, clientesData, unidadesData, eventosData] = await Promise.all([
                    getMiPlan().catch(() => null),
                    getMisClientes().catch(() => []),
                    getMisUnidades().catch(() => []),
                    getCuentaEventos(cuenta?.id_cuenta).catch(() => [])
                ]);

                setPlan(planData);
                setClientesCount(clientesData.length);
                setUnidadesCount(unidadesData.length);
                setEventosCount(eventosData.length);
            } catch (error) {
                console.error("Error cargando dashboard B2B", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, cuenta?.id_cuenta]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-emerald-600" />
                    B2B Workspace
                </h1>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                    Panel central para organizar tu empresa: {cuenta?.nombre_cuenta || 'Tu Agencia'}
                </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Unidades</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{unidadesCount}</p>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Clientes</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{clientesCount}</p>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <CalendarHeart className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Eventos</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{eventosCount}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-200" />
                            <p className="text-sm font-medium text-emerald-100">Plan Actual</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                            {plan?.estado || 'Activo'}
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white mb-1">{plan?.plan_nombre || cuenta?.plan_codigo || 'B2B Standard'}</p>
                        <Link href="/dashboard/cuenta/plan" className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 group w-max">
                            Ver detalles de facturación <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Accesos de Módulo */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Módulos de Gestión</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Unidades */}
                    <Link href="/dashboard/cuenta/unidades" className="group">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 h-full flex flex-col hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-md">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-2">
                                Unidades de Negocio
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex-grow mb-6">
                                Administrá tus diferentes salones, marcas o sucursales de organización.
                            </p>
                            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center mt-auto">
                                Ver unidades <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Clientes */}
                    <Link href="/dashboard/cuenta/clientes" className="group">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 h-full flex flex-col hover:border-sky-300 dark:hover:border-sky-600 transition-all hover:shadow-md">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-2">
                                Directorio de Clientes
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex-grow mb-6">
                                Gestioná los organizadores e individuos para los cuales creás eventos.
                            </p>
                            <div className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex items-center mt-auto">
                                Ver clientes <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Eventos B2B */}
                    <Link href="/dashboard/cuenta/eventos" className="group">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 h-full flex flex-col hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-md">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-2">
                                Eventos de la Cuenta
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex-grow mb-6">
                                Todos los eventos vinculados a tus unidades y clientes en un solo lugar.
                            </p>
                            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center mt-auto">
                                Ver eventos globales <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    );
}
