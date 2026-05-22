'use client';

import { StaffAuthProvider } from '@/src/context/StaffAuthContext';
import { LogOut, Sparkles } from 'lucide-react';
import { useStaffAuth } from '@/src/context/StaffAuthContext';

function StaffHeader() {
    const { token, logout, user, activeRol } = useStaffAuth();

    if (!token) return null;

    const displayRol = activeRol?.rol_codigo || user?.rolCodigo || '';

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                            Eventia Staff
                        </h1>
                        {displayRol && (
                            <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                                {displayRol.replace('STAFF_', '')}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Salir</span>
                </button>
            </div>
        </header>
    );
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffAuthProvider>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans transition-colors flex flex-col">
                <StaffHeader />
                <main className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 dark:from-indigo-900/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex-1 p-4 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </StaffAuthProvider>
    );
}
