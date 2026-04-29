'use client';

import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import {
    Plus,
    CalendarHeart,
    UserCircle,
    Briefcase,
    ChevronRight,
    Loader2,
    PartyPopper,
    Users,
    Building2,
    LayoutDashboard,
    ArrowUpRight,
    Star
} from 'lucide-react';

export default function DashboardPage() {
    const { authMe, ui, eventos, cuenta, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-sm text-muted animate-pulse">Sincronizando tu espacio...</p>
                </div>
            </div>
        );
    }

    const userName = authMe?.usuario?.email?.split('@')[0] || authMe?.email?.split('@')[0] || 'Invitado';
    const isB2B = ui?.mostrar_menu_cuenta;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* ─── Hero / Greeting ─── */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-500/10 bg-white dark:bg-neutral-900 shadow-xl shadow-indigo-500/5 dark:shadow-none">
                {/* Background Blobs */}
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 p-8 sm:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <Star className="w-3" /> Dashboard
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                ¡Hola, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 capitalize">{userName}</span>! 👋
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl text-lg leading-relaxed">
                                {isB2B
                                    ? `Liderando la gestión en ${cuenta?.nombre_cuenta || 'tu cuenta empresarial'}. Tenés todo listo para que tu próximo evento sea un éxito.`
                                    : "Bienvenido a tu panel de control. Acá vas a poder gestionar todos tus eventos y herramientas diseñadas para vos."
                                }
                            </p>
                        </div>

                        {/* Summary Stats (Desktop Only) */}
                        <div className="hidden lg:flex items-center gap-8 border-l border-neutral-100 dark:border-neutral-800 pl-10">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{eventos?.cantidad_propios || 0}</p>
                                <p className="text-xs text-muted uppercase tracking-widest font-bold">Eventos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{eventos?.cantidad_compartidos || 0}</p>
                                <p className="text-xs text-muted uppercase tracking-widest font-bold">Compartidos</p>
                            </div>
                            {isB2B && (
                                <div className="text-center">
                                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black mb-1 uppercase">Pro</div>
                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{cuenta?.plan_codigo || 'Activo'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Upgrade Banner ─── */}
            {ui?.mostrar_solicitar_cuenta && !isB2B && (
                <div className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-500/30">
                    <div className="relative z-10 text-white text-center sm:text-left">
                        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-3">
                            <PartyPopper className="w-6 h-6 text-indigo-200" />
                            Potenciá tu negocio con Eventia B2B
                        </h2>
                        <p className="text-indigo-100/80 max-w-xl">
                            Accedé a herramientas exclusivas para profesionales: gestión de unidades, base de clientes corporativos, métricas en tiempo real y más.
                        </p>
                    </div>
                    <a
                        href="/dashboard/cuenta/solicitar"
                        className="relative z-10 whitespace-nowrap px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-neutral-50 hover:scale-105 active:scale-95 transition-all shadow-xl group-hover:shadow-white/20"
                    >
                        Solicitar Acceso PRO
                    </a>

                    {/* Abstract background shape */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                </div>
            )}

            {/* ─── Main Sections ─── */}
            <div className="space-y-12">

                {/* Section: Mi Espacio Personal */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                            <UserCircle className="w-5 h-5 text-indigo-500" />
                            Mi Espacio Personal
                        </h2>
                        <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card: Crear Evento */}
                        <Link href="/dashboard/events/new" className="group">
                            <div className="relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-start hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Crear Evento</h3>
                                <p className="text-muted text-sm flex-grow leading-relaxed">
                                    Comenzá a planificar. Elegí una estructura, personalizá el diseño y gestioná tus invitados fácilmente.
                                </p>
                                <div className="mt-8 pt-6 border-t border-neutral-50 dark:border-neutral-800 w-full text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                                    <span>Empezar ahora</span>
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Card: Mis Eventos */}
                        <Link href="/dashboard/events" className="group">
                            <div className="relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-start hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                    <CalendarHeart className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Mis Eventos</h3>
                                <p className="text-muted text-sm flex-grow leading-relaxed">
                                    Accedé al panel de control, estadísticas y edición de todas tus celebraciones actuales.
                                </p>

                                {eventos?.cantidad_propios !== undefined && (
                                    <div className="absolute top-8 right-8 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-tighter">
                                        {eventos.cantidad_propios} Total
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-neutral-50 dark:border-neutral-800 w-full text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                                    <span>Ver listado</span>
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Card: Mi Perfil */}
                        <Link href="/dashboard/perfil" className="group">
                            <div className="relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-start hover:border-sky-400 dark:hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6 group-hover:rotate-12 transition-all duration-500">
                                    <UserCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Mi Perfil</h3>
                                <p className="text-muted text-sm flex-grow leading-relaxed">
                                    Actualizá tu información personal, configurá notificaciones y revisá tu actividad general.
                                </p>
                                <div className="mt-8 pt-6 border-t border-neutral-50 dark:border-neutral-800 w-full text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center justify-between">
                                    <span>Gestionar perfil</span>
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Section: Gestión Business B2B (Solo si aplica) */}
                {isB2B && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                Panel Corporativo ({cuenta?.nombre_cuenta})
                            </h2>
                            <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* B2B Dashboard Card */}
                            <Link href="/dashboard/cuenta" className="group lg:col-span-1">
                                <div className="h-full bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-neutral-900 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-8 flex flex-col items-start hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                        <LayoutDashboard className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Resumen de Cuenta</h3>
                                    <p className="text-muted text-sm flex-grow">
                                        Dashboard central para el control de todas tus operaciones profesionales.
                                    </p>
                                    <div className="mt-8 text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                        Acceder <ArrowUpRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            {/* B2B Acceso Rápido: Unidades */}
                            <Link href="/dashboard/cuenta/unidades" className="group">
                                <div className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-start hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-100 transition-colors">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Unidades</h3>
                                    <p className="text-xs text-muted leading-relaxed">
                                        Administrá tus salones, sucursales o puntos de venta independientes.
                                    </p>
                                </div>
                            </Link>

                            {/* B2B Acceso Rápido: Clientes */}
                            <Link href="/dashboard/cuenta/clientes" className="group">
                                <div className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-start hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-100 transition-colors">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Clientes</h3>
                                    <p className="text-xs text-muted leading-relaxed">
                                        Base de datos unificada de clientes corporativos y sus historial de eventos.
                                    </p>
                                </div>
                            </Link>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
