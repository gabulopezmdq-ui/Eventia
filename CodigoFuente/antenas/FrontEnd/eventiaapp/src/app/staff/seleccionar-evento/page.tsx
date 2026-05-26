'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffAuth, isEventActiveToday } from '@/src/context/StaffAuthContext';
import { 
    Loader2, 
    Calendar, 
    Sparkles, 
    ArrowRight, 
    ShieldAlert, 
    CalendarRange,
    UserCheck,
    LogOut,
    Flame,
    Clock,
    Info
} from 'lucide-react';

export default function SeleccionarEventoPage() {
    const { token, user, isLoading, selectEvento, logout } = useStaffAuth();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    // Evitar deshidratación en server-side-rendering para Date
    useEffect(() => {
        setCurrentTime(new Date());
    }, []);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/staff/login');
        }
    }, [isLoading, token, router]);

    if (isLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">Cargando eventos asignados...</p>
            </div>
        );
    }

    const allEvents = user.eventosDisponibles || [];
    
    // Filtrar eventos activos hoy
    const activeEventsToday = allEvents.filter(e => isEventActiveToday(e));

    // Determinar eventos a futuro
    const today = currentTime || new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

    const futureEvents = allEvents.filter(e => {
        if (isEventActiveToday(e)) return false;
        const dateStr = e.fecha_inicio || e.fecha_inicio_operativa;
        if (!dateStr) return false;
        
        const start = new Date(dateStr);
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        return startDay > startOfToday;
    }).sort((a, b) => {
        const dateA = new Date(a.fecha_inicio || a.fecha_inicio_operativa || '');
        const dateB = new Date(b.fecha_inicio || b.fecha_inicio_operativa || '');
        return dateA.getTime() - dateB.getTime();
    });

    const handleSelectEvent = (evento: typeof allEvents[0]) => {
        selectEvento(evento.id_evento);
        
        // Si el evento tiene un solo rol, selectEvento ya lo pone como activo. Redirigimos a home
        if (evento.roles_evento && evento.roles_evento.length === 1) {
            router.push('/staff/home');
        } else if (evento.roles_evento && evento.roles_evento.length > 1) {
            // Si tiene múltiples roles, lo enviamos a elegir su función para este evento
            router.push('/staff/seleccionar-funcion');
        } else {
            router.push('/staff/home');
        }
    };

    // Helper para formatear fechas
    const formatDateStr = (dateStr?: string | null) => {
        if (!dateStr) return '';
        try {
            const eventDate = new Date(dateStr);
            return eventDate.toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Helper para calcular días restantes
    const getDaysRemainingText = (dateStr?: string | null) => {
        if (!dateStr) return '';
        try {
            const eventDate = new Date(dateStr);
            const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0, 0);
            const diffTime = eventDay.getTime() - startOfToday.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Comienza mañana';
            if (diffDays === 0) return 'Comienza hoy';
            return `Comienza en ${diffDays} días`;
        } catch {
            return '';
        }
    };

    // Helper para estilo de badges según tipo de operación
    const getBadgeStyle = (tipo: string) => {
        const t = tipo.toUpperCase();
        if (t === 'PROGRAMA') {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20';
        }
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header decorativo con gradient glow */}
            <div className="text-center space-y-3 relative py-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-[80px] rounded-full -z-10" />
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                    <Calendar className="w-3.5 h-3.5" /> Agenda de Trabajo de Staff
                </span>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Selecciona tu evento operativo
                </h1>
                
                <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-sm sm:text-base">
                    Hola <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{user.nombre}</strong>. Aquí tienes tus asignaciones vigentes. Selecciona el evento en el que vas a operar en la jornada actual.
                </p>
            </div>

            {/* EVENTOS ACTIVOS HOY */}
            <div className="space-y-4">
                <h2 className="text-sm uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Eventos de la fecha (Disponibles hoy)
                </h2>

                {activeEventsToday.length === 0 ? (
                    <div className="text-center p-8 sm:p-12 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-md rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-2 animate-pulse" />
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Sin eventos disponibles hoy</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto">
                            No posees eventos activos o programas semanales transcurriendo en el día de la fecha en tus unidades asignadas.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeEventsToday.map((evento) => {
                            const isPrograma = evento.tipo_operacion?.toUpperCase() === 'PROGRAMA';
                            const Icon = isPrograma ? CalendarRange : Flame;
                            
                            return (
                                <button
                                    key={evento.id_evento}
                                    onClick={() => handleSelectEvent(evento)}
                                    className="group relative bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden hover:border-indigo-500/50 hover:shadow-indigo-500/5"
                                >
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-indigo-500/10" />

                                    <div className="space-y-4 relative z-10 w-full">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3.5 rounded-2xl transition-colors duration-300 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getBadgeStyle(evento.tipo_operacion)}`}>
                                                {evento.tipo_operacion}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                                {evento.nombre_evento}
                                            </h3>
                                            
                                            {/* Fechas */}
                                            {isPrograma ? (
                                                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-2">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        Al: {formatDateStr(evento.fecha_fin_operativa)}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-2">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>Activo Hoy y Mañana (Nocturno)</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/50 w-full flex items-center justify-between relative z-10">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                            {evento.roles_evento?.length === 1 
                                                ? `Ingresar como ${evento.roles_evento[0].rol_texto.replace('STAFF_', '')}`
                                                : `${evento.roles_evento?.length} funciones disponibles`
                                            }
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SECCIÓN EVENTOS FUTUROS (SIEMPRE VISIBLE O DESTACADA SI NO HAY HOY) */}
            {futureEvents.length > 0 && (
                <div className="space-y-4 pt-4">
                    <h2 className="text-sm uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        Próximas asignaciones agendadas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {futureEvents.map((evento) => {
                            const isPrograma = evento.tipo_operacion?.toUpperCase() === 'PROGRAMA';
                            const Icon = isPrograma ? CalendarRange : Calendar;
                            const dateToUse = isPrograma ? evento.fecha_inicio_operativa : (evento.fecha_inicio || evento.fecha_inicio_operativa);
                            
                            return (
                                <div
                                    key={evento.id_evento}
                                    className="relative bg-white/40 dark:bg-neutral-900/30 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/40 rounded-3xl p-5 flex flex-col justify-between opacity-70 saturate-75 select-none"
                                >
                                    <div className="space-y-3 w-full">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 rounded-2xl text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            
                                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200/20">
                                                {getDaysRemainingText(dateToUse) || 'Próximamente'}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
                                                {evento.nombre_evento}
                                            </h3>
                                            
                                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-1">
                                                <Info className="w-3 h-3" />
                                                <span>
                                                    Inicio: {formatDateStr(dateToUse)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between text-[11px] text-neutral-400">
                                        <span>Roles programados: {evento.roles_evento?.map(r => r.rol_texto.replace('STAFF_', '')).join(', ')}</span>
                                        <span className="font-semibold text-neutral-400/80 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg text-[9px]">
                                            Cerrado
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="text-center pt-8">
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
