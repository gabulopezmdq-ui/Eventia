'use client';

import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
    Sparkles, 
    Building2, 
    User, 
    ArrowRight, 
    LogOut, 
    Loader2, 
    ShieldCheck, 
    UserCheck,
    Briefcase
} from 'lucide-react';
import { logout } from '@/src/features/auth/auth.service';

export default function SelectSpacePage() {
    const { authMe, espacios, loading, selectEspacio, refresh } = useAuth();
    const router = useRouter();
    const [selecting, setSelecting] = useState<number | null | string>(null);

    const handleSelect = async (idCuenta: number | null) => {
        setSelecting(idCuenta === null ? 'personal' : idCuenta);
        
        // Ejecutamos la selección en el contexto
        selectEspacio(idCuenta);
        
        // Pequeño retardo para dar feedback de transición premium
        setTimeout(() => {
            if (idCuenta === null) {
                router.replace('/dashboard');
            } else {
                router.replace('/dashboard/cuenta');
            }
        }, 800);
    };

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('access_token');
        } finally {
            router.replace('/login');
        }
    };

    // Si está cargando la sesión, mostramos spinner premium
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-neutral-400 text-sm animate-pulse">Sincronizando tus espacios...</p>
                </div>
            </div>
        );
    }

    const userName = authMe?.usuario?.nombre || 'Hola';

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
            {/* Background decorative effects */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="flex justify-between items-center z-10 w-full max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                        Eventia
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-white/5"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col justify-center items-center py-12 z-10 w-full max-w-4xl mx-auto">
                <div className="text-center mb-10 max-w-xl animate-in fade-in slide-in-from-top-4 duration-1000">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" /> Selección de Espacio
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                        ¡Hola, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 capitalize">{userName}</span>!
                    </h1>
                    <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                        ¿Con qué espacio de trabajo querés operar hoy? Seleccioná una de tus cuentas B2B o tu espacio personal.
                    </p>
                </div>

                {/* Spaces Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    
                    {/* Mi Espacio Personal (B2C) */}
                    <div 
                        onClick={() => !selecting && handleSelect(null)}
                        className={`group relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border rounded-3xl p-6 sm:p-8 cursor-pointer flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                            selecting === 'personal'
                                ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                                : 'border-neutral-800/80 hover:border-indigo-500/50 hover:bg-neutral-800/40'
                        }`}
                    >
                        {/* Decorative subtle light */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                        
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-300 transition-colors">
                                Mi espacio personal
                            </h2>
                            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-8">
                                Organizá tus celebraciones individuales, cumpleaños y eventos sociales sin estructura corporativa.
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800/40">
                            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                                {selecting === 'personal' ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Ingresando...
                                    </>
                                ) : (
                                    <>
                                        Ingresar <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </span>
                            <span className="text-[10px] font-black tracking-widest text-neutral-600 dark:text-neutral-500 bg-neutral-950 px-2.5 py-1 rounded-md uppercase">
                                Personal
                            </span>
                        </div>
                    </div>

                    {/* B2B Cuentas */}
                    {espacios
                        .filter(space => space.tipo === 'CUENTA' && space.id_cuenta !== null)
                        .map((space) => {
                            const isSelected = selecting === space.id_cuenta;
                            const isAdmin = space.rol_cuenta === 'ACCOUNT_ADMIN';
                            return (
                                <div 
                                    key={space.id_cuenta}
                                    onClick={() => !selecting && handleSelect(space.id_cuenta)}
                                    className={`group relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border rounded-3xl p-6 sm:p-8 cursor-pointer flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                                            : 'border-neutral-800/80 hover:border-emerald-500/50 hover:bg-neutral-800/40'
                                    }`}
                                >
                                    {/* Decorative subtle light */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-300 transition-colors truncate">
                                            {space.nombre_cuenta || space.nombre}
                                        </h2>
                                        <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-8">
                                            Workspace corporativo. Gestioná unidades, base de clientes, métricas PRO y eventos de negocio.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800/40">
                                        <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                                            {isSelected ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Ingresando...
                                                </>
                                            ) : (
                                                <>
                                                    Ingresar <ArrowRight className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </span>
                                        
                                        <span className={`text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-md uppercase flex items-center gap-1 bg-neutral-950 ${
                                            isAdmin ? 'text-emerald-400' : 'text-neutral-400'
                                        }`}>
                                            {isAdmin ? (
                                                <ShieldCheck className="w-3 h-3" />
                                            ) : (
                                                <UserCheck className="w-3 h-3" />
                                            )}
                                            {isAdmin ? 'ADMIN' : 'STAFF'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-xs text-neutral-600 dark:text-neutral-500 mt-12 w-full max-w-lg mx-auto">
                <p>© {new Date().getFullYear()} Eventia Pro. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
