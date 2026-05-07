import { useState, useEffect } from 'react';
import { ProgramaServicio, CampoExtra } from '@/src/features/programas/types';
import { upsertServicio } from '@/src/features/programas/programas.service';
import { Loader2, X, LayoutList, Plus, Trash2 } from 'lucide-react';

interface Props {
    idEvento: number;
    servicioToEdit: ProgramaServicio | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpsertServicioDrawer({ idEvento, servicioToEdit, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProgramaServicio>({
        id_programa_servicio: 0,
        id_evento: idEvento,
        id_servicio_base: null,
        codigo: '',
        nombre: '',
        descripcion: '',
        tipo_calculo: 'POR_PROGRAMA',
        precio: 0,
        moneda: 'ARS',
        obligatorio: false,
        permite_cantidad: false,
        requiere_seleccion_dias: false,
        cupo: null,
        orden: 1,
        activo: true,
        config_json: null
    });

    // Estado local para los campos extra dinámicos
    const [camposExtra, setCamposExtra] = useState<CampoExtra[]>([]);

    useEffect(() => {
        if (servicioToEdit) {
            setFormData(servicioToEdit);
            if (servicioToEdit.config_json) {
                try {
                    const parsed = JSON.parse(servicioToEdit.config_json);
                    if (parsed.campos_extra) {
                        setCamposExtra(parsed.campos_extra);
                    }
                } catch (e) {
                    console.error("Error parseando config_json", e);
                }
            }
        }
    }, [servicioToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'precio' || name === 'orden') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else if (name === 'cupo') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Manejo de Campos Extra Dinámicos ---
    const addCampoExtra = () => {
        setCamposExtra(prev => [
            ...prev, 
            { codigo: `campo_${Date.now()}`, label: 'Nuevo Campo', tipo: 'TEXT', obligatorio: false }
        ]);
    };

    const updateCampoExtra = (index: number, field: keyof CampoExtra, value: any) => {
        const newCampos = [...camposExtra];
        newCampos[index] = { ...newCampos[index], [field]: value };
        setCamposExtra(newCampos);
    };

    const removeCampoExtra = (index: number) => {
        setCamposExtra(prev => prev.filter((_, i) => i !== index));
    };

    const updateOpciones = (index: number, value: string) => {
        // Asume opciones separadas por coma
        const opciones = value.split(',').map(s => s.trim()).filter(s => s);
        updateCampoExtra(index, 'opciones', opciones);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payloadToSave = { ...formData };
            
            // Si hay campos extras, inyectarlos en config_json
            if (camposExtra.length > 0) {
                payloadToSave.config_json = JSON.stringify({ campos_extra: camposExtra });
            } else {
                payloadToSave.config_json = null;
            }

            await upsertServicio(idEvento, payloadToSave);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el servicio');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <LayoutList className="w-5 h-5 text-emerald-500" />
                            {servicioToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
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

                    <form id="servicio-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. DATOS BÁSICOS */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">1. Datos Básicos</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Nombre</label>
                                    <input
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Remera oficial"
                                        required
                                        className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Código</label>
                                    <input
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        placeholder="Ej: SVC-REM"
                                        required
                                        className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Detalle del servicio que verá el padre..."
                                    rows={2}
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"
                                />
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
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Precio</label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
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
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Tipo de Cálculo</label>
                                    <select
                                        name="tipo_calculo"
                                        value={formData.tipo_calculo}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                    >
                                        <option value="POR_PROGRAMA">Único por Programa</option>
                                        <option value="POR_PERIODO">Por Período Inscrito</option>
                                        <option value="DIARIO">Diario</option>
                                    </select>
                                </div>
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
                            </div>
                        </div>

                        {/* 2. REGLAS Y COMPORTAMIENTO */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">2. Reglas</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                    <input type="checkbox" name="obligatorio" checked={formData.obligatorio} onChange={handleChange} className="accent-emerald-600" />
                                    <span className="text-sm font-medium">Es Obligatorio</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                    <input type="checkbox" name="permite_cantidad" checked={formData.permite_cantidad} onChange={handleChange} className="accent-emerald-600" />
                                    <span className="text-sm font-medium">Permite elegir cantidad</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                    <input type="checkbox" name="requiere_seleccion_dias" checked={formData.requiere_seleccion_dias} onChange={handleChange} className="accent-emerald-600" />
                                    <span className="text-sm font-medium">Requiere elegir días</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                    <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="accent-emerald-600" />
                                    <span className="text-sm font-medium">Servicio Activo</span>
                                </label>
                            </div>
                        </div>

                        {/* 3. CAMPOS DINÁMICOS */}
                        <div className="space-y-4 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">3. Datos Adicionales (Campos Extra)</h4>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Ej: Talle de remera, Nombre de quien retira, etc.</p>
                                </div>
                                <button type="button" onClick={addCampoExtra} className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {camposExtra.length === 0 ? (
                                <div className="text-center py-4 text-xs text-emerald-600/70 font-medium italic">
                                    No hay campos adicionales configurados.
                                </div>
                            ) : (
                                <div className="space-y-3 mt-4">
                                    {camposExtra.map((campo, index) => (
                                        <div key={index} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 relative">
                                            <button type="button" onClick={() => removeCampoExtra(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid grid-cols-2 gap-3 pr-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Pregunta/Etiqueta</label>
                                                    <input 
                                                        value={campo.label}
                                                        onChange={(e) => updateCampoExtra(index, 'label', e.target.value)}
                                                        className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs outline-none bg-neutral-50 dark:bg-neutral-800/50"
                                                        placeholder="Ej: Selecciona tu talle"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Tipo de Campo</label>
                                                    <select 
                                                        value={campo.tipo}
                                                        onChange={(e) => updateCampoExtra(index, 'tipo', e.target.value)}
                                                        className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs outline-none bg-neutral-50 dark:bg-neutral-800/50"
                                                    >
                                                        <option value="TEXT">Texto</option>
                                                        <option value="NUMBER">Número</option>
                                                        <option value="SELECT">Opciones (Desplegable)</option>
                                                        <option value="BOOLEAN">Checkbox (Sí/No)</option>
                                                    </select>
                                                </div>
                                                {campo.tipo === 'SELECT' && (
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Opciones (Separadas por coma)</label>
                                                        <input 
                                                            value={campo.opciones?.join(', ') || ''}
                                                            onChange={(e) => updateOpciones(index, e.target.value)}
                                                            className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs outline-none bg-neutral-50 dark:bg-neutral-800/50"
                                                            placeholder="Ej: S, M, L, XL"
                                                        />
                                                    </div>
                                                )}
                                                <div className="col-span-2 mt-1">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={campo.obligatorio} 
                                                            onChange={(e) => updateCampoExtra(index, 'obligatorio', e.target.checked)}
                                                            className="accent-emerald-600"
                                                        />
                                                        <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">Obligatorio de responder al seleccionar el servicio</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                        form="servicio-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar Servicio
                    </button>
                </div>
            </div>
        </div>
    );
}
