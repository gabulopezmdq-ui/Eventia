"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, Settings, LogOut, Sparkles, X, Database } from "lucide-react";
import { SidebarItem } from "@/src/components/layout/SidebarItem";
import { DashboardHeader } from "@/src/components/layout/DashboardHeader";
import { useRouter } from "next/navigation";
import { logout } from "@/src/features/auth/auth.service";
import { getCurrentUser } from "@/src/features/events/event.service";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        getCurrentUser()
            .then(user => {
                if (user.rol === 'superadmin') {
                    setIsSuperAdmin(true);
                }
            })
            .catch(() => {
                // Silently fail if user fetch fails (auth middleware should handle access anyway)
            });
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const router = useRouter();
    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('access_token');
        } finally {
            router.replace('/login');
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
                {/* Close button for mobile */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-6 right-4 lg:hidden p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Decorative background element for sidebar */}
                <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/5 blur-[100px] pointer-events-none" />

                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Eventia</h2>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">Manager Pro</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-4">
                        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Menú Principal</span>
                    </div>
                    <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Panel General" />
                    <SidebarItem href="/dashboard/events" icon={Calendar} label="Mis Eventos" />

                    {isSuperAdmin && (
                        <>
                            <div className="px-4 mt-8 mb-4">
                                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Administración</span>
                            </div>
                            <SidebarItem href="/dashboard/parametricas" icon={Database} label="Altas Paramétricas" />
                        </>
                    )}

                    <div className="px-4 mt-8 mb-4">
                        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Configuración</span>
                    </div>
                    <SidebarItem href="/dashboard/settings" icon={Settings} label="Ajustes" />
                </nav>

                <div className="p-4 mt-auto border-t border-neutral-100 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-all group" onClick={handleLogout}>
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>

                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-100 dark:from-indigo-600/20 to-purple-50 dark:to-purple-600/5 border border-indigo-200/50 dark:border-indigo-500/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-1">Plan Premium</p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">Disfruta de todas las funciones ilimitadas.</p>
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #262626;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #404040;
                }
                .light .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .light .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </section>
    );
}

