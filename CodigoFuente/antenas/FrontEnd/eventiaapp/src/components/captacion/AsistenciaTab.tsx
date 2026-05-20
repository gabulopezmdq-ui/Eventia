'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Search, Info } from 'lucide-react';
import { getAsistencia } from '@/src/features/captacion/captacion.service';
import type { CheckinEvento } from '@/src/features/captacion/types';

export default function AsistenciaTab({ idEvento }: { idEvento: number }) {
    const [asistencias, setAsistencias] = useState<CheckinEvento[]>([]);
    const [filteredAsistencias, setFilteredAsistencias] = useState<CheckinEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadAsistenciaData = async () => {
            try {
                setLoading(true);
                const data = await getAsistencia(idEvento);
                // Sort by date descending so latest check-ins appear first
                const sortedData = data.sort(
                    (a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
                );
                setAsistencias(sortedData);
                setFilteredAsistencias(sortedData);
            } catch (error) {
                console.error('Error al cargar la asistencia:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAsistenciaData();
    }, [idEvento]);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            setFilteredAsistencias(asistencias);
        } else {
            const filtered = asistencias.filter(
                item =>
                    item.nombre.toLowerCase().includes(query) ||
                    item.apellido.toLowerCase().includes(query) ||
                    (item.campania && item.campania.toLowerCase().includes(query)) ||
                    item.acceso_nombre.toLowerCase().includes(query)
            );
            setFilteredAsistencias(filtered);
        }
    }, [searchQuery, asistencias]);

    const formatFecha = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center p-12 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted text-sm font-medium">Cargando lista de asistencia...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + Search bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Control de Asistencia Real</h2>
                    <p className="text-muted text-xs mt-1">
                        Historial de personas que realizaron su check-in en puerta.
                    </p>
                </div>

                {asistencias.length > 0 && (
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, campaña..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-card-bg border border-card-border rounded-xl focus:outline-none focus:border-indigo-500 text-foreground placeholder:text-muted transition-colors"
                        />
                    </div>
                )}
            </div>

            {asistencias.length === 0 ? (
                <div className="text-center p-16 bg-card-bg/50 border border-card-border rounded-2xl animate-in fade-in duration-500">
                    <CalendarCheck className="w-12 h-12 text-muted mx-auto mb-4 opacity-50 animate-pulse" />
                    <h3 className="text-lg font-bold text-foreground">Sin ingresos registrados</h3>
                    <p className="text-muted text-sm mt-1 max-w-sm mx-auto">
                        Aún no se ha realizado ningún control de ingreso en puerta para este evento.
                    </p>
                </div>
            ) : filteredAsistencias.length === 0 ? (
                <div className="text-center p-12 bg-card-bg/50 border border-card-border rounded-2xl">
                    <Info className="w-10 h-10 text-muted mx-auto mb-3 opacity-50" />
                    <h3 className="text-base font-bold text-foreground">Sin resultados</h3>
                    <p className="text-muted text-xs mt-1">
                        No encontramos coincidencias para "{searchQuery}".
                    </p>
                </div>
            ) : (
                <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background/40 border-b border-card-border text-[10px] uppercase tracking-widest text-muted font-bold font-mono">
                                <tr>
                                    <th className="px-6 py-4">Fecha y Hora</th>
                                    <th className="px-6 py-4">Asistente</th>
                                    <th className="px-6 py-4 text-center">Tipo</th>
                                    <th className="px-6 py-4">Acceso</th>
                                    <th className="px-6 py-4">Campaña / Origen</th>
                                    <th className="px-6 py-4">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border text-sm">
                                {filteredAsistencias.map((item) => (
                                    <tr
                                        key={item.id_checkin}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-muted">
                                            {formatFecha(item.fecha_hora)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                                            {item.nombre} {item.apellido}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                                    item.tipo === 'INGRESO'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                }`}
                                            >
                                                {item.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted text-xs">
                                            {item.acceso_nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-foreground text-xs">
                                                    {item.campania || 'Sin campaña'}
                                                </span>
                                                {item.id_acceso_link ? (
                                                    <span className="text-[10px] text-muted font-mono">
                                                        ID Link: #{item.id_acceso_link}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted max-w-xs truncate">
                                            {item.observaciones || (
                                                <span className="italic text-muted/50">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-background/20 border-t border-card-border flex justify-between items-center text-xs text-muted">
                        <span>Mostrando {filteredAsistencias.length} de {asistencias.length} ingresos</span>
                    </div>
                </div>
            )}
        </div>
    );
}
