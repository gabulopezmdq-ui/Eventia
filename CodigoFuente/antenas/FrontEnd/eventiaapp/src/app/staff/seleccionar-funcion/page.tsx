'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffAuth, isEventActiveToday } from '@/src/context/StaffAuthContext';
import { 
    Loader2, 
    QrCode, 
    ChefHat, 
    Gift, 
    Sparkles, 
    ArrowRight, 
    ShieldAlert, 
    Utensils,
    UserCheck,
    LogOut,
    HeartPulse,
    Music,
    LayoutGrid,
    Activity
} from 'lucide-react';

export default function SeleccionarFuncionPage() {
    const { token, user, isLoading, selectRol, activeRol, logout } = useStaffAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/staff/login');
        }
    }, [isLoading, token, router]);

    // Redirigir si no tiene múltiples roles o si falta elegir evento
    useEffect(() => {
        if (!isLoading && user) {
            const allEvents = user.eventosDisponibles || [];
            const activeEvents = allEvents.filter(e => isEventActiveToday(e));

            if (activeEvents.length > 1 && !user.idEvento) {
                router.replace('/staff/seleccionar-evento');
                return;
            }

            if (!user.rolesEvento || user.rolesEvento.length === 0) {
                // Sin roles asignados
                return;
            }
            if (user.rolesEvento.length === 1) {
                // Si tiene uno solo, lo mandamos a su pantalla de inicio
                const singleRol = user.rolesEvento[0];
                selectRol(singleRol);
                router.replace('/staff/home');
            }
        }
    }, [isLoading, user, router, selectRol]);

    if (isLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">Cargando opciones...</p>
            </div>
        );
    }

    const roles = user.rolesEvento || [];

    // Helper para obtener estilo de color e íconos dinámicamente según el código de rol
    const getRoleStyling = (codigo: string) => {
        const cod = codigo.toUpperCase();
        if (cod.includes('RECEPTOR') || cod.includes('CHECKIN') || cod.includes('PUERTA')) {
            return {
                icon: QrCode,
                bgGlow: 'bg-indigo-500/10 dark:bg-indigo-500/5',
                borderHover: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5',
                iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
                accentColor: 'from-indigo-600 to-blue-500',
                btnHover: 'group-hover:bg-indigo-600 group-hover:text-white',
                description: 'Control de accesos por QR y búsquedas manuales en puerta.'
            };
        }
        if (cod.includes('COCINA') || cod.includes('COMEDOR')) {
            return {
                icon: ChefHat,
                bgGlow: 'bg-amber-500/10 dark:bg-amber-500/5',
                borderHover: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
                iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
                accentColor: 'from-amber-600 to-orange-500',
                btnHover: 'group-hover:bg-amber-600 group-hover:text-white',
                description: 'Gestión del comedor diario, racionamiento y control de alergias.'
            };
        }
        if (cod.includes('OPERADOR') || cod.includes('BENEFICIO') || cod.includes('BAR') || cod.includes('BARTENDER')) {
            return {
                icon: Gift,
                bgGlow: 'bg-emerald-500/10 dark:bg-emerald-500/5',
                borderHover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
                iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
                accentColor: 'from-emerald-600 to-teal-500',
                btnHover: 'group-hover:bg-emerald-600 group-hover:text-white',
                description: 'Canje de beneficios, bebidas y productos mediante códigos QR.'
            };
        }
        if (cod.includes('SALUD') || cod.includes('MEDICO') || cod.includes('ENFERMERO') || cod.includes('AMBULANCIA')) {
            return {
                icon: HeartPulse,
                bgGlow: 'bg-red-500/10 dark:bg-red-500/5',
                borderHover: 'hover:border-red-500/50 hover:shadow-red-500/5',
                iconColor: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
                accentColor: 'from-red-600 to-rose-500',
                btnHover: 'group-hover:bg-red-600 group-hover:text-white',
                description: 'Fichas médicas de participantes, registro de incidentes y alergias.'
            };
        }
        if (cod.includes('MUSICA') || cod.includes('DJ') || cod.includes('PLAYLIST')) {
            return {
                icon: Music,
                bgGlow: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/5',
                borderHover: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/5',
                iconColor: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/50',
                accentColor: 'from-fuchsia-600 to-pink-500',
                btnHover: 'group-hover:bg-fuchsia-600 group-hover:text-white',
                description: 'Módulo DJ, control de playlist y sugerencias de temas en vivo.'
            };
        }
        if (cod.includes('MESAS') || cod.includes('SERVICIO') || cod.includes('MOZO')) {
            return {
                icon: LayoutGrid,
                bgGlow: 'bg-cyan-500/10 dark:bg-cyan-500/5',
                borderHover: 'hover:border-cyan-500/50 hover:shadow-cyan-500/5',
                iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50',
                accentColor: 'from-cyan-600 to-blue-500',
                btnHover: 'group-hover:bg-cyan-600 group-hover:text-white',
                description: 'Control y distribución de mesas, servicio de mozos y pedidos.'
            };
        }
        if (cod.includes('OPERACION_GENERAL') || cod.includes('GENERAL') || cod.includes('OPERACION')) {
            return {
                icon: Activity,
                bgGlow: 'bg-slate-500/10 dark:bg-slate-500/5',
                borderHover: 'hover:border-slate-500/50 hover:shadow-slate-500/5',
                iconColor: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50',
                accentColor: 'from-slate-600 to-zinc-500',
                btnHover: 'group-hover:bg-slate-600 group-hover:text-white',
                description: 'Home simplificado y panel operativo multifunción contextual.'
            };
        }
        // General o default
        return {
            icon: Sparkles,
            bgGlow: 'bg-violet-500/10 dark:bg-violet-500/5',
            borderHover: 'hover:border-violet-500/50 hover:shadow-violet-500/5',
            iconColor: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50',
            accentColor: 'from-violet-600 to-fuchsia-500',
            btnHover: 'group-hover:bg-violet-600 group-hover:text-white',
            description: 'Acceso a las herramientas generales de staff operativo.'
        };
    };

    const handleSelect = (rol: typeof roles[0]) => {
        selectRol(rol);
        router.push('/staff/home');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header decorativo con gradient glow */}
            <div className="text-center space-y-3 relative py-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-[80px] rounded-full -z-10" />
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                    <UserCheck className="w-3.5 h-3.5" /> Múltiples Funciones Detectadas
                </span>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    ¿Con qué rol vas a operar hoy?
                </h1>
                
                <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-sm sm:text-base">
                    Hola <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{user.nombre}</strong>. Tenés varios roles operativos asignados. Seleccioná una función para iniciar tu jornada laboral en el evento.
                </p>
            </div>

            {roles.length === 0 ? (
                <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
                    <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Sin funciones activas</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                        No tenés roles activos configurados en este evento. Comunícate con el administrador para que asigne tus permisos correspondientes.
                    </p>
                    <button
                        onClick={() => router.push('/staff/login')}
                        className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-bold rounded-xl transition"
                    >
                        Volver a ingresar
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {roles.map((rol, index) => {
                        const style = getRoleStyling(rol.rol_codigo);
                        const Icon = style.icon;

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelect(rol)}
                                className={`group relative bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${style.borderHover}`}
                            >
                                {/* Glow de fondo decorativo individual */}
                                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${style.bgGlow}`} />

                                <div className="space-y-4 relative z-10 w-full">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-3.5 rounded-2xl transition-colors duration-300 ${style.iconColor}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                                            {(rol.rol_codigo || '').replace('STAFF_', '')}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                            {rol.rol_texto}
                                        </h3>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                                            {style.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/50 w-full flex items-center justify-between relative z-10">
                                    <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                        Ingresar ahora
                                    </span>
                                    <div className={`w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-all duration-300 ${style.btnHover}`}>
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="text-center pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {user.eventosDisponibles && user.eventosDisponibles.filter(e => isEventActiveToday(e)).length > 1 && (
                    <button
                        onClick={() => router.push('/staff/seleccionar-evento')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                        Volver a eventos
                    </button>
                )}
                <button
                    onClick={() => {
                        logout();
                        router.push('/staff/login');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Cerrar sesión de staff
                </button>
            </div>
        </div>
    );
}
