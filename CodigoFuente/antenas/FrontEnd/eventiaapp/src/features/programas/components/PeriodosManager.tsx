import { useState, useEffect } from 'react';
import { getPeriodos, upsertPeriodo } from '@/src/features/programas/programas.service';
import { ProgramaPeriodo } from '@/src/features/programas/types';
import { Plus, Loader2, CalendarClock, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import UpsertPeriodoDrawer from './UpsertPeriodoDrawer';

interface Props {
    idEvento: number;
}

export default function PeriodosManager({ idEvento }: Props) {
    const [periodos, setPeriodos] = useState<ProgramaPeriodo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para el Drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPeriodo, setSelectedPeriodo] = useState<ProgramaPeriodo | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getPeriodos(idEvento);
            setPeriodos(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error cargando los períodos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idEvento]);

    const handleOpenDrawer = (periodo?: ProgramaPeriodo) => {
        setSelectedPeriodo(periodo || null);
        setIsDrawerOpen(true);
    };

    const formatearFecha = (fecha: string) => {
        if (!fecha) return '-';
        try {
            // Evitar desvío de huso horario para fechas en formato YYYY-MM-DD
            const partes = fecha.split('T')[0].split('-');
            if (partes.length === 3) {
                const [anio, mes, dia] = partes.map(Number);
                return new Intl.DateTimeFormat('es-AR', {
                    day: 'numeric', month: 'short', year: 'numeric'
                }).format(new Date(anio, mes - 1, dia));
            }
            return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(fecha));
        } catch {
            return fecha;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-emerald-500" />
                        Períodos (Semanas/Quincenas)
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Configura las semanas o bloques de tiempo disponibles para inscripción.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenDrawer()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Período
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">{error}</div>
            ) : periodos.length === 0 ? (
                <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <CalendarClock className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">Sin períodos configurados</h4>
                    <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">No has creado ningún bloque de tiempo aún. Crea el primero para comenzar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {periodos.map(periodo => (
                        <div key={periodo.id_programa_periodo} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Estado badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                {periodo.activo ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        <CheckCircle2 className="w-3 h-3" /> Activo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        <XCircle className="w-3 h-3" /> Inactivo
                                    </span>
                                )}
                            </div>

                            <h4 className="font-bold text-neutral-900 dark:text-white pr-20">{periodo.nombre}</h4>
                            <p className="text-xs text-neutral-500 font-mono mt-1 mb-4">{periodo.codigo}</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
                                    <span className="text-neutral-500">Fechas:</span>
                                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{formatearFecha(periodo.fecha_desde)} al {formatearFecha(periodo.fecha_hasta)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
                                    <span className="text-neutral-500">Precio Base:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{periodo.moneda} {periodo.precio_base}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-neutral-500">Cupo:</span>
                                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{periodo.cupo ? `${periodo.cupo} lugares` : 'Ilimitado'}</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                                <button
                                    onClick={() => handleOpenDrawer(periodo)}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isDrawerOpen && (
                <UpsertPeriodoDrawer
                    idEvento={idEvento}
                    periodoToEdit={selectedPeriodo}
                    onClose={() => setIsDrawerOpen(false)}
                    onSuccess={() => {
                        setIsDrawerOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
