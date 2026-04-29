'use client';

import { useEffect, useState } from 'react';
import { getCuentaEventos } from '@/src/features/cuenta/cuenta.service';
import { CalendarHeart, Loader2, MapPin, LayoutList, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EventosCuentaPage() {
    const [eventos, setEventos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI states
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        getCuentaEventos()
            .then(setEventos)
            .catch(() => setError('No se pudieron cargar los eventos de la cuenta'))
            .finally(() => setLoading(false));
    }, []);

    const formatearFecha = (fechaHora: string) => {
        try {
            return new Intl.DateTimeFormat('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(new Date(fechaHora));
        } catch { return fechaHora; }
    };

    const formatearMesAnio = (fecha: Date) => {
        const nombre = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(fecha);
        return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    };

    // Utils para calendario
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1; // Empezando el Lunes
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate) === -1 ? 6 : getFirstDayOfMonth(currentDate); // Handle cases seamlessly

    const getEventsForDay = (day: number) => {
        return eventos.filter(ev => {
            if (!ev.fecha_hora) return false;
            const evDate = new Date(ev.fecha_hora);
            return evDate.getDate() === day &&
                evDate.getMonth() === currentDate.getMonth() &&
                evDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <CalendarHeart className="w-6 h-6 text-purple-600" />
                        Eventos de la Cuenta
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Todos los eventos creados dentro del ecosistema B2B (para clientes o unidades).
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/events/new?context=cuenta"
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-500/20 transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Evento
                    </Link>

                    {/* View Toggles */}
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900/50 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list'
                                ? 'bg-white text-purple-700 shadow-sm dark:bg-neutral-800 dark:text-purple-400'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                            }`}
                    >
                        <LayoutList className="w-4 h-4" />
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'calendar'
                                ? 'bg-white text-purple-700 shadow-sm dark:bg-neutral-800 dark:text-purple-400'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                            }`}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        Calendario
                    </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                    <p className="text-neutral-500 font-medium animate-pulse">Cargando eventos...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-semibold flex items-center justify-center text-center">
                    {error}
                </div>
            ) : eventos.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col items-center justify-center">
                    <div className="p-5 bg-white dark:bg-neutral-800 rounded-full shadow-sm mb-5 border border-neutral-100 dark:border-neutral-700">
                        <CalendarHeart className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aún no hay eventos</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-sm mb-6">No parece haber eventos programados ni borradores en tu cuenta.</p>
                    <Link
                        href="/dashboard/events/new?context=cuenta"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-500/20 transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        Crear primer evento
                    </Link>
                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Información del Evento</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Contexto / Entorno</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Estado / Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {eventos.map((ev) => (
                                        <tr key={ev.id_evento} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-all duration-200 group">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-neutral-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                                                    {ev.anfitriones_texto || 'Sin título'}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-neutral-500">
                                                    <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {ev.lugar || 'Lugar por definir'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 space-y-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-bold text-[10px] tracking-wide border border-neutral-200 dark:border-neutral-700">
                                                        {ev.unidad_nombre || 'Principal'}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    {ev.cliente_nombre ? (
                                                        <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 opacity-80"></div>
                                                            {ev.cliente_nombre}
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400 italic text-xs font-medium">Evento propio / corporativo</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ev.estado === 'A' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                            ev.estado === 'B' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                                'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                                        }`}>
                                                        {ev.estado === 'A' ? 'Activo' : ev.estado === 'B' ? 'Borrador' : ev.estado}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 opacity-70" />
                                                    {ev.fecha_hora ? formatearFecha(ev.fecha_hora) : 'Sin fecha'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
                            {/* Calendar Navigation Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                <h2 className="text-xl font-black text-neutral-800 dark:text-neutral-200 capitalize tracking-tight">
                                    {formatearMesAnio(currentDate)}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prevMonth}
                                        className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid Header */}
                            <div className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30">
                                {diasSemana.map(dia => (
                                    <div key={dia} className="py-3.5 text-center text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-r border-neutral-100 dark:border-neutral-800 last:border-0">
                                        {dia}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid Body */}
                            <div className="grid grid-cols-7 auto-rows-[130px] bg-neutral-100 dark:bg-neutral-800 gap-[1px]">
                                {/* Celdas vacías */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`blank-${i}`} className="bg-white dark:bg-neutral-900/80 p-2 opacity-50"></div>
                                ))}

                                {/* Celdas del mes */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const diaNumero = i + 1;
                                    const isToday = diaNumero === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                                    const eventosDelDia = getEventsForDay(diaNumero);

                                    return (
                                        <div key={diaNumero} className={`bg-white dark:bg-neutral-900 p-2.5 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors group relative flex flex-col ${isToday ? 'ring-inset ring-2 ring-purple-500/60 z-10' : ''}`}>
                                            <span className={`self-end flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-2 transition-all ${isToday ? 'bg-purple-600 text-white shadow-md' : 'text-neutral-500 group-hover:text-purple-600 dark:text-neutral-400'}`}>
                                                {diaNumero}
                                            </span>

                                            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                                {eventosDelDia.map(ev => (
                                                    <div
                                                        key={ev.id_evento}
                                                        title={ev.anfitriones_texto}
                                                        className={`px-2 py-1.5 rounded-md text-[10px] font-bold truncate transition-all cursor-pointer hover:shadow-sm ${ev.estado === 'A'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30'
                                                            }`}
                                                    >
                                                        {ev.anfitriones_texto || 'Sin título'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
