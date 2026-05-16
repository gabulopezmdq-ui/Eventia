'use client';

import { useEffect, useState } from 'react';
import { getMisProgramas } from '@/src/features/programas/programas.service';
import { CalendarDays, Loader2, MapPin, Plus, Clock, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { Programa } from '@/src/features/programas/types';

export default function ProgramasCuentaPage() {
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMisProgramas()
            .then(setProgramas)
            .catch(() => setError('No se pudieron cargar los programas de la cuenta'))
            .finally(() => setLoading(false));
    }, []);

    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'Sin fecha';
        try {
            return new Intl.DateTimeFormat('es-AR', {
                day: 'numeric', month: 'short', year: 'numeric'
            }).format(new Date(fecha));
        } catch { return fecha; }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-emerald-600" />
                        Programas y Casales
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Gestiona colonias de vacaciones, casales, campus deportivos y más.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/cuenta/programas/nuevo"
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Programa
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="text-neutral-500 font-medium animate-pulse">Cargando programas...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-semibold flex items-center justify-center text-center">
                    {error}
                </div>
            ) : programas.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col items-center justify-center">
                    <div className="p-5 bg-white dark:bg-neutral-800 rounded-full shadow-sm mb-5 border border-neutral-100 dark:border-neutral-700">
                        <CalendarDays className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aún no hay programas</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-sm mb-6">No tienes programas configurados en esta cuenta.</p>
                    <Link
                        href="/dashboard/cuenta/programas/nuevo"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        Crear primer programa
                    </Link>
                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                                <tr>
                                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Anfitriones</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Información del Programa</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Tipo de evento</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Fechas</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {programas.map((prog, index) => (
                                    <tr key={(prog as any).id_evento || (prog as any).idEvento || index} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-all duration-200 group">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-neutral-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                {prog.anfitriones_texto || 'Sin título'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-neutral-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                {prog.saludo || prog.anfitriones_texto || 'Sin título'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-neutral-500">
                                                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                                {prog.lugar || 'Unidad Principal'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                                                {prog.tipo_evento_codigo?.replace(/_/g, ' ') || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5 mb-1">
                                                <Clock className="w-3.5 h-3.5 opacity-70 text-emerald-500" />
                                                Inicio: {formatearFecha(prog.fecha_inicio)}
                                            </div>
                                            <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                                                Fin: {formatearFecha(prog.fecha_fin)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/events/${(prog as any).id_evento ?? (prog as any).idEvento ?? (prog as any).id}`}
                                                    title="Ver panel del evento"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-600 dark:hover:text-white rounded-lg transition-colors font-semibold text-xs"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Ver Panel
                                                </Link>
                                                <Link
                                                    href={`/dashboard/cuenta/programas/${(prog as any).id_evento ?? (prog as any).idEvento ?? (prog as any).id}`}
                                                    title="Configuración del programa"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg transition-colors font-semibold text-xs"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                    Configuración
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
