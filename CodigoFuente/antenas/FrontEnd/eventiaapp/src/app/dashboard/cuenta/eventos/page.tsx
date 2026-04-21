'use client';

import { useEffect, useState } from 'react';
import { getCuentaEventos } from '@/src/features/cuenta/cuenta.service';
import { CalendarHeart, Loader2, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

export default function EventosCuentaPage() {
    const [eventos, setEventos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCuentaEventos()
            .then(setEventos)
            .catch(() => setError('No se pudieron cargar los eventos de la cuenta'))
            .finally(() => setLoading(false));
    }, []);

    const formatearFecha = (fechaHora: string) => {
        try {
            return new Intl.DateTimeFormat('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(fechaHora));
        } catch {
            return fechaHora;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
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
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                     <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {error}
                </div>
            ) : eventos.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center">
                    <CalendarHeart className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">No se registran eventos corporativos o para clientes.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Evento</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Unidad Encargada</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente Asignado</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado / Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {eventos.map((ev) => (
                                <tr key={ev.id_evento} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-neutral-900 dark:text-white line-clamp-1">{ev.anfitriones_texto || 'Sin título'}</p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                            <MapPin className="w-3 h-3" /> {ev.lugar || 'Lugar por definir'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-medium text-xs">
                                            {ev.unidad_nombre || 'Principal'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                        {ev.cliente_nombre ? (
                                             <span className="font-medium text-sky-600 dark:text-sky-400">{ev.cliente_nombre}</span>
                                        ) : (
                                            <span className="text-neutral-400 italic text-xs">Evento propio</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                ev.estado === 'A' ? 'bg-emerald-100 text-emerald-700' : 
                                                ev.estado === 'B' ? 'bg-amber-100 text-amber-700' : 
                                                'bg-neutral-100 text-neutral-600'
                                            }`}>
                                                {ev.estado === 'A' ? 'Activo' : ev.estado === 'B' ? 'Borrador' : ev.estado}
                                            </span>
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                           {ev.fecha_hora ? formatearFecha(ev.fecha_hora) : 'Sin fecha'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
