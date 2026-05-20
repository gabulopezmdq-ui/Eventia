'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    CheckCircle2,
    UserX,
    TrendingUp,
    Gift,
    BadgePercent,
    Share2,
    Compass,
    Music,
    Flame,
} from 'lucide-react';
import { getMetricasEvento } from '@/src/features/captacion/captacion.service';
import type { MetricasEvento } from '@/src/features/captacion/types';

export default function MetricasTab({ idEvento }: { idEvento: number }) {
    const [metrics, setMetrics] = useState<MetricasEvento | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                setLoading(true);
                const data = await getMetricasEvento(idEvento);
                setMetrics(data);
            } catch (error) {
                console.error('Error al cargar métricas:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, [idEvento]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center p-12 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted text-sm font-medium">Cargando estadísticas de captación...</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="text-center p-12 bg-card-bg border border-card-border rounded-2xl">
                <p className="text-muted text-sm">No se pudieron cargar las métricas de este evento.</p>
            </div>
        );
    }

    const {
        resumen,
        por_campania = [],
        por_origen = [],
        por_perfil_asistencia = [],
        top_intereses = [],
        top_preferencias_musicales = [],
    } = metrics;

    // Calculate benefit conversion rate
    const convBeneficioPct = resumen.beneficios_otorgados > 0
        ? Math.round((resumen.beneficios_canjeados * 100) / resumen.beneficios_otorgados)
        : 0;

    // Calculate maximum attendee count to draw horizontal profile bars relatively
    const maxPerfilCantidad = Math.max(...por_perfil_asistencia.map(p => p.cantidad), 1);
    const totalPerfilPersonas = por_perfil_asistencia.reduce((acc, p) => acc + p.cantidad, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ── Section Title ── */}
            <div>
                <h2 className="text-xl font-bold text-foreground">Estadísticas y Rendimiento</h2>
                <p className="text-muted text-xs mt-1">
                    Análisis de conversión, procedencia de registros y gustos de tu audiencia.
                </p>
            </div>

            {/* ── Bloque 1: Tarjetas Resumen (6 Cards) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {/* 1. Registrados */}
                <div className="p-4 bg-card-bg border border-card-border rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] uppercase text-muted font-bold tracking-wider">Registrados</p>
                    <p className="text-2xl font-black text-foreground">{resumen.registrados}</p>
                    <p className="text-[10px] text-muted">Personas captadas</p>
                </div>

                {/* 2. Asistieron */}
                <div className="p-4 bg-card-bg border border-card-border rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] uppercase text-muted font-bold tracking-wider">Asistieron</p>
                    <p className="text-2xl font-black text-emerald-500">{resumen.asistieron}</p>
                    <p className="text-[10px] text-muted">Check-ins reales</p>
                </div>

                {/* 3. No Show */}
                <div className="p-4 bg-card-bg border border-card-border rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                        <UserX className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] uppercase text-muted font-bold tracking-wider">No Show (Ausentes)</p>
                    <p className="text-2xl font-black text-rose-500">{resumen.no_show}</p>
                    <p className="text-[10px] text-muted">Faltaron al evento</p>
                </div>

                {/* 4. Conversión Asistencia */}
                <div className="p-4 bg-card-bg border border-card-border rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] uppercase text-muted font-bold tracking-wider">Conv. Asistencia</p>
                    <p className="text-2xl font-black text-amber-500">{resumen.conversion_asistencia_pct}%</p>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${resumen.conversion_asistencia_pct}%` }}
                        />
                    </div>
                </div>

                {/* 5. Beneficios Otorgados */}
                <div className="p-4 bg-card-bg border border-card-border rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                        <Gift className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] uppercase text-muted font-bold tracking-wider">Ben. Otorgados</p>
                    <p className="text-2xl font-black text-purple-500">{resumen.beneficios_otorgados}</p>
                    <p className="text-[10px] text-muted">Incentivos asignados</p>
                </div>

                {/* 6. Beneficios Canjeados */}
                <div className="p-4 bg-card-bg border border-card-border rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                        <BadgePercent className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] uppercase text-muted font-bold tracking-wider">Ben. Canjeados</p>
                    <p className="text-2xl font-black text-indigo-400">{resumen.beneficios_canjeados}</p>
                    <p className="text-[10px] text-muted font-medium">Tasa de Canje: <span className="text-indigo-300">{convBeneficioPct}%</span></p>
                </div>
            </div>

            {/* ── Bloque 2: Rendimiento por Campaña ── */}
            <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-card-border flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted">Rendimiento por Campaña</h3>
                </div>
                {por_campania.length === 0 ? (
                    <p className="p-6 text-center text-xs text-muted">No hay campañas registradas para este evento.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-background/40 border-b border-card-border text-[9px] uppercase tracking-widest text-muted font-bold font-mono">
                                <tr>
                                    <th className="px-6 py-3">Campaña</th>
                                    <th className="px-6 py-3 text-right">Registrados</th>
                                    <th className="px-6 py-3 text-right">Asistieron</th>
                                    <th className="px-6 py-3 text-right">No Show</th>
                                    <th className="px-6 py-3 text-right">Ben. Otorgados</th>
                                    <th className="px-6 py-3 text-right">Ben. Canjeados</th>
                                    <th className="px-6 py-3 text-right">Conv. Asistencia</th>
                                    <th className="px-6 py-3 text-right">Conv. Beneficio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border text-xs">
                                {por_campania.map((c) => {
                                    const noAsistio = c.registrados - c.asistieron;
                                    const convAsistencia = c.registrados > 0
                                        ? Math.round((c.asistieron * 100) / c.registrados)
                                        : 0;
                                    const convBeneficio = c.beneficios_otorgados > 0
                                        ? Math.round((c.beneficios_canjeados * 100) / c.beneficios_otorgados)
                                        : 0;
                                    return (
                                        <tr key={c.id_acceso_link} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">{c.campania}</td>
                                            <td className="px-6 py-4 text-right text-muted font-semibold">{c.registrados}</td>
                                            <td className="px-6 py-4 text-right text-emerald-500 font-semibold">{c.asistieron}</td>
                                            <td className="px-6 py-4 text-right text-rose-500/80 font-mono">{noAsistio}</td>
                                            <td className="px-6 py-4 text-right text-muted font-mono">{c.beneficios_otorgados}</td>
                                            <td className="px-6 py-4 text-right text-indigo-400 font-semibold">{c.beneficios_canjeados}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex px-2 py-0.5 rounded font-black font-mono ${
                                                    convAsistencia >= 70
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : convAsistencia >= 40
                                                        ? 'bg-amber-500/10 text-amber-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {convAsistencia}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-indigo-300 font-mono">{convBeneficio}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Grid: Orígenes & Perfiles de Asistencia ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bloque 3: Rendimiento por Origen */}
                <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-card-border flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted">Rendimiento por Canal / Origen</h3>
                    </div>
                    {por_origen.length === 0 ? (
                        <p className="p-6 text-center text-xs text-muted">No hay datos por origen de registro.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-background/40 border-b border-card-border text-[9px] uppercase tracking-widest text-muted font-bold font-mono">
                                    <tr>
                                        <th className="px-6 py-3">Canal (Origen)</th>
                                        <th className="px-6 py-3 text-right">Registrados</th>
                                        <th className="px-6 py-3 text-right">Asistieron</th>
                                        <th className="px-6 py-3 text-right">Ben. Otorgados</th>
                                        <th className="px-6 py-3 text-right">Ben. Canjeados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border text-xs">
                                    {por_origen.map((o, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs tracking-wider">
                                                    {o.origen_registro || 'DIRECTO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-muted font-semibold">{o.registrados}</td>
                                            <td className="px-6 py-4 text-right text-emerald-500 font-semibold">{o.asistieron}</td>
                                            <td className="px-6 py-4 text-right text-muted font-mono">{o.beneficios_otorgados}</td>
                                            <td className="px-6 py-4 text-right text-indigo-400 font-semibold">{o.beneficios_canjeados}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Bloque 4: Perfil de Asistencia */}
                <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-card-border/50 pb-3">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted">¿Cómo planea asistir la gente?</h3>
                        </div>
                        {por_perfil_asistencia.length === 0 ? (
                            <p className="text-center text-xs text-muted py-6">No hay datos de perfiles de asistencia.</p>
                        ) : (
                            <div className="space-y-4 py-2">
                                {por_perfil_asistencia.map((p) => {
                                    const pct = totalPerfilPersonas > 0
                                        ? Math.round((p.cantidad * 100) / totalPerfilPersonas)
                                        : 0;
                                    return (
                                        <div key={p.id_perfil_asistencia} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-foreground">
                                                    {p.perfil_texto === 'SOLO'
                                                        ? 'Solo/a'
                                                        : p.perfil_texto === 'PAREJA'
                                                        ? 'En pareja'
                                                        : p.perfil_texto === 'AMIGOS'
                                                        ? 'Con amigos'
                                                        : p.perfil_texto === 'GRUPO'
                                                        ? 'En grupo'
                                                        : p.perfil_texto}
                                                </span>
                                                <span className="text-muted font-mono">
                                                    {p.cantidad} personas ({pct}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${(p.cantidad * 100) / maxPerfilCantidad}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="border-t border-card-border/50 pt-3 text-[10px] text-muted text-right uppercase tracking-wider font-bold">
                        Total Respuestas: {totalPerfilPersonas}
                    </div>
                </div>
            </div>

            {/* ── Grid: Intereses & Preferencias Musicales ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bloque 5: Intereses más elegidos */}
                <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-card-border pb-3 mb-4">
                        <Compass className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted">Tipos de Evento Favoritos</h3>
                    </div>
                    {top_intereses.length === 0 ? (
                        <p className="text-center text-xs text-muted py-6">No hay datos de intereses registrados.</p>
                    ) : (
                        <div className="space-y-3">
                            {top_intereses.map((item, index) => (
                                <div
                                    key={item.codigo}
                                    className="flex items-center justify-between p-3 rounded-xl bg-background border border-card-border/60 hover:border-indigo-500/20 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-foreground capitalize">
                                            {item.texto.toLowerCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted font-bold font-mono">
                                        <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                        <span>{item.cantidad} votos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bloque 6: Preferencias Musicales */}
                <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-card-border pb-3 mb-4">
                        <Music className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted">Géneros Musicales Más Elegidos</h3>
                    </div>
                    {top_preferencias_musicales.length === 0 ? (
                        <p className="text-center text-xs text-muted py-6">No hay datos de preferencias musicales.</p>
                    ) : (
                        <div className="space-y-3">
                            {top_preferencias_musicales.map((item, index) => (
                                <div
                                    key={item.codigo}
                                    className="flex items-center justify-between p-3 rounded-xl bg-background border border-card-border/60 hover:border-indigo-500/20 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-foreground">
                                            {item.texto}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted font-bold font-mono">
                                        <Music className="w-3.5 h-3.5 text-purple-400" />
                                        <span>{item.cantidad} votos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
