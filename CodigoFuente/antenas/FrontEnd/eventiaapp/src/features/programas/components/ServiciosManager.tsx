import { useState, useEffect } from 'react';
import { getServicios } from '@/src/features/programas/programas.service';
import { ProgramaServicio } from '@/src/features/programas/types';
import { Plus, Loader2, LayoutList, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import UpsertServicioDrawer from './UpsertServicioDrawer';

interface Props {
    idEvento: number;
}

export default function ServiciosManager({ idEvento }: Props) {
    const [servicios, setServicios] = useState<ProgramaServicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState<ProgramaServicio | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getServicios(idEvento);
            setServicios(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error cargando los servicios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idEvento]);

    const handleOpenDrawer = (servicio?: ProgramaServicio) => {
        setSelectedServicio(servicio || null);
        setIsDrawerOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <LayoutList className="w-5 h-5 text-emerald-500" />
                        Servicios Adicionales
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Comedor, transporte, remera, seguros, etc. Configura con campos extras dinámicos.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenDrawer()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Servicio
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">{error}</div>
            ) : servicios.length === 0 ? (
                <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <LayoutList className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">Sin servicios configurados</h4>
                    <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">Agrega servicios adicionales que los padres podrán elegir al inscribir.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {servicios.map(servicio => {
                        let configJsonObj = null;
                        if (servicio.config_json) {
                            try { configJsonObj = JSON.parse(servicio.config_json); } catch(e){}
                        }
                        const hasCamposExtra = configJsonObj && configJsonObj.campos_extra && configJsonObj.campos_extra.length > 0;

                        return (
                            <div key={servicio.id_programa_servicio} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    {servicio.obligatorio && (
                                        <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Obligatorio</span>
                                    )}
                                    {servicio.activo ? (
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Activo</span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full uppercase">Inactivo</span>
                                    )}
                                </div>

                                <h4 className="font-bold text-neutral-900 dark:text-white pr-24">{servicio.nombre}</h4>
                                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{servicio.descripcion}</p>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <span className="block text-[10px] font-bold text-neutral-400 uppercase">Costo</span>
                                        <span className="font-semibold text-neutral-900 dark:text-white">{servicio.moneda} {servicio.precio}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-neutral-400 uppercase">Cálculo</span>
                                        <span className="font-semibold text-neutral-900 dark:text-white capitalize">{servicio.tipo_calculo.replace('_', ' ').toLowerCase()}</span>
                                    </div>
                                </div>

                                {hasCamposExtra && (
                                    <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        Configurado con campos dinámicos ({configJsonObj.campos_extra.length})
                                    </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                                    <button
                                        onClick={() => handleOpenDrawer(servicio)}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Editar
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

             {isDrawerOpen && (
                <UpsertServicioDrawer
                    idEvento={idEvento}
                    servicioToEdit={selectedServicio}
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
