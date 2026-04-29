"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    Sparkles,
    X,
    Database,
    FileCheck2,
    Building2,
    Users,
    CreditCard,
    UserCircle,
    CalendarRange,
    ChevronDown,
    Bell,
    FileSearch,
    UserCog,
    BadgeDollarSign,
    HeartHandshake,
    Briefcase,
} from "lucide-react";
import { SidebarItem } from "@/src/components/layout/SidebarItem";
import { DashboardHeader } from "@/src/components/layout/DashboardHeader";
import { useRouter } from "next/navigation";
import { logout } from "@/src/features/auth/auth.service";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";

// ─────────────────────────────────────────────────────────────
// Inner layout (necesita estar dentro del AuthProvider)
// ─────────────────────────────────────────────────────────────

function DashboardInner({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [cuentaExpanded, setCuentaExpanded] = useState(true);
    const { ui, cuenta, isSuperAdmin, loading } = useAuth();
    const router = useRouter();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem("access_token");
        } finally {
            router.replace("/login");
        }
    };

    return (
        <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex overflow-hidden font-sans transition-colors">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 border-r border-neutral-200 dark:border-neutral-800/50 flex flex-col bg-white dark:bg-neutral-950 transition-transform duration-300 lg:static lg:translate-x-0
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                backdrop-blur-3xl
            `}>
                {/* Close button mobile */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-6 right-4 lg:hidden p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Decorative blur */}
                <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/5 blur-[100px] pointer-events-none" />

                {/* Logo */}
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Eventia</h2>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">
                            {cuenta?.nombre_cuenta ?? "Manager Pro"}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">

                    {/* ══════════════════════════════
                        SECCIÓN: MI ESPACIO (B2C)
                        Visible si ui.puede_crear_evento_b2c = true
                    ══════════════════════════════ */}
                    {(!loading && ui?.puede_crear_evento_b2c) && (
                        <>
                            <div className="px-4 mb-4">
                                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                                    Mi Espacio
                                </span>
                            </div>
                            <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Panel General" />
                            <SidebarItem href="/dashboard/events" icon={Calendar} label="Mis Eventos" />
                            <SidebarItem href="/dashboard/perfil" icon={UserCircle} label="Mi Perfil" />
                        </>
                    )}

                    {/* ══════════════════════════════
                        SECCIÓN: CUENTA (B2B)
                        Visible si ui.mostrar_menu_cuenta = true
                    ══════════════════════════════ */}
                    {(!loading && ui?.mostrar_menu_cuenta) && (
                        <>
                            <div className="px-4 mt-8 mb-2 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                                    Cuenta
                                </span>
                                <button
                                    onClick={() => setCuentaExpanded(!cuentaExpanded)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${cuentaExpanded ? '' : '-rotate-90'}`} />
                                </button>
                            </div>
                            {cuentaExpanded && (
                                <>
                                    <SidebarItem href="/dashboard/cuenta" icon={LayoutDashboard} label="Dashboard Cuenta" />
                                    <SidebarItem href="/dashboard/cuenta/unidades" icon={Building2} label="Unidades" />
                                    <SidebarItem href="/dashboard/cuenta/clientes" icon={Users} label="Clientes" />
                                    <SidebarItem href="/dashboard/audiencia" icon={Sparkles} label="Audiencias (CRM)" />
                                    <SidebarItem href="/dashboard/cuenta/eventos" icon={CalendarRange} label="Eventos de Cuenta" />
                                    <SidebarItem href="/dashboard/cuenta/plan" icon={CreditCard} label="Plan y Facturación" />
                                </>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════════
                        BANNER: SOLICITAR CUENTA
                        Visible si ui.mostrar_solicitar_cuenta = true
                    ══════════════════════════════ */}
                    {(!loading && ui?.mostrar_solicitar_cuenta) && (
                        <div className="mx-2 mt-6 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20">
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                ¿Tenés un salón o empresa?
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2">
                                Accedé a funciones profesionales con una cuenta B2B.
                            </p>
                            <a
                                href="/dashboard/cuenta/solicitar"
                                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Solicitar cuenta →
                            </a>
                        </div>
                    )}

                    {/* ══════════════════════════════
                        BANNER: CUENTA PENDIENTE
                        Visible si ui.mostrar_estado_cuenta_pendiente = true
                    ══════════════════════════════ */}
                    {(!loading && ui?.mostrar_estado_cuenta_pendiente) && (
                        <div className="mx-2 mt-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex gap-2">
                            <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                    Cuenta en revisión
                                </p>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                                    Tu solicitud está siendo procesada. Te notificaremos cuando esté activa.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════
                        SECCIÓN: ADMIN (Superadmin)
                        Visible si ui.mostrar_admin = true (o isSuperAdmin legacy)
                    ══════════════════════════════ */}
                    {(!loading && (ui?.mostrar_admin || isSuperAdmin)) && (
                        <>
                            <div className="px-4 mt-8 mb-4">
                                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                                    Administración
                                </span>
                            </div>
                            <SidebarItem href="/dashboard/parametricas" icon={Database} label="Altas Paramétricas" />
                            <SidebarItem href="/dashboard/admin/solicitudes-plantillas" icon={FileCheck2} label="Solicitudes Plantillas" />
                            <SidebarItem href="/dashboard/admin/prospectos-b2b" icon={FileSearch} label="Prospectos B2B" />
                            <SidebarItem href="/dashboard/admin/cuentas-b2b" icon={UserCog} label="Cuentas B2B" />
                            <SidebarItem href="/dashboard/admin/pagos-eventos" icon={BadgeDollarSign} label="Pagos Eventos (B2C)" />
                            <SidebarItem href="/dashboard/admin/oportunidades" icon={HeartHandshake} label="Oportunidades Free/Trial" />
                            <SidebarItem href="/dashboard/admin/cobranzas-cuentas" icon={Briefcase} label="Cobranzas Cuentas (B2B)" />
                        </>
                    )}

                    {/* ══════════════════════════════
                        CONFIGURACIÓN (siempre visible)
                    ══════════════════════════════ */}
                    <div className="px-4 mt-8 mb-4">
                        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                            Configuración
                        </span>
                    </div>
                    <SidebarItem href="/dashboard/settings" icon={Settings} label="Ajustes" />
                </nav>

                {/* Footer del Sidebar */}
                <div className="p-4 mt-auto border-t border-neutral-100 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-all group"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>

                    {/* Card de plan */}
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-100 dark:from-indigo-600/20 to-purple-50 dark:to-purple-600/5 border border-indigo-200/50 dark:border-indigo-500/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-1">
                                {cuenta?.plan_codigo ?? "Plan Free"}
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                {cuenta?.nombre_cuenta
                                    ? `Cuenta: ${cuenta.nombre_cuenta}`
                                    : "Disfruta de todas las funciones."}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-8 h-8 text-indigo-400 rotate-12" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-100/50 dark:from-neutral-900/50 via-neutral-50 dark:via-neutral-950 to-neutral-50 dark:to-neutral-950 overflow-hidden transition-colors">
                <DashboardHeader onMenuClick={toggleSidebar} />
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #404040; }
                .light .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .light .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}</style>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Export: envuelve DashboardInner con AuthProvider
// ─────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardInner>{children}</DashboardInner>
        </AuthProvider>
    );
}
