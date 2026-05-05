import { useState, useEffect } from 'react';
import { ProgramaPeriodo } from '@/src/features/programas/types';
import { upsertPeriodo } from '@/src/features/programas/programas.service';
import { Loader2, X, CalendarClock } from 'lucide-react';

interface Props {
    idEvento: number;
    periodoToEdit: ProgramaPeriodo | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpsertPeriodoDrawer({ idEvento, periodoToEdit, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProgramaPeriodo>({
        id_programa_periodo: 0,
        id_evento: idEvento,
        codigo: '',
        nombre: '',
        fecha_desde: '',
        fecha_hasta: '',
        precio_base: 0,
        moneda: 'ARS',
        cupo: null,
        orden: 1,
        activo: true
    });

    useEffect(() => {
        if (periodoToEdit) {
            setFormData({
                ...periodoToEdit,
                fecha_desde: periodoToEdit.fecha_desde ? periodoToEdit.fecha_desde.split('T')[0] : '',
                fecha_hasta: periodoToEdit.fecha_hasta ? periodoToEdit.fecha_hasta.split('T')[0] : '',
            });
        }
    }, [periodoToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'precio_base' || name === 'orden') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else if (name === 'cupo') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // El backend requiere el idEvento y el payload
            const payloadToSave = {
                ...formData,
                fecha_desde: new Date(formData.fecha_desde).toISOString(),
                fecha_hasta: new Date(formData.fecha_hasta).toISOString(),
            };
            
            await upsertPeriodo(idEvento, payloadToSave);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el período');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-emerald-500" />
                            {periodoToEdit ? 'Editar Período' : 'Nuevo Período'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form id="periodo-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Nombre visible</label>
                            <input
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Semana 1, Quincena Enero"
                                required
                                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Código interno</label>
                            <input
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                placeholder="Ej: SEM-1, ENE-Q1"
                                required
                                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Fecha Desde</label>
                                <input
                                    type="date"
                                    name="fecha_desde"
                                    value={formData.fecha_desde}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Fecha Hasta</label>
                                <input
                                    type="date"
                                    name="fecha_hasta"
                                    value={formData.fecha_hasta}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Moneda</label>
                                <select
                                    name="moneda"
                                    value={formData.moneda}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                >
                                    <option value="ARS">ARS</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Precio Base</label>
                                <input
                                    type="number"
                                    name="precio_base"
                                    value={formData.precio_base}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Cupo Total</label>
                                <input
                                    type="number"
                                    name="cupo"
                                    value={formData.cupo === null ? '' : formData.cupo}
                                    onChange={handleChange}
                                    placeholder="Ilimitado"
                                    min="1"
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Orden</label>
                                <input
                                    type="number"
                                    name="orden"
                                    value={formData.orden}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-emerald-600 rounded"
                                />
                                <div>
                                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">Período Activo</span>
                                    <span className="block text-xs text-neutral-500">Permitir inscripciones en este bloque de fechas.</span>
                                </div>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="periodo-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar Período
                    </button>
                </div>
            </div>
        </div>
    );
}
