import { useState, useEffect } from 'react';
import { AutorizacionConfig } from '@/src/features/programas/types';
import { upsertAutorizacionConfig } from '@/src/features/programas/programas.service';
import { Loader2, X, CheckSquare } from 'lucide-react';

interface Props {
    idEvento: number;
    autorizacionToEdit: AutorizacionConfig | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpsertAutorizacionDrawer({ idEvento, autorizacionToEdit, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<AutorizacionConfig>({
        id_programa_autorizacion_config: 0,
        id_evento: idEvento,
        id_autorizacion_base: null,
        codigo: '',
        titulo: '',
        texto: '',
        obligatoria: true,
        requiere_aceptacion: true,
        requiere_datos_responsable: false,
        orden: 1,
        activo: true
    });

    useEffect(() => {
        if (autorizacionToEdit) {
            setFormData(autorizacionToEdit);
        }
    }, [autorizacionToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'orden') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await upsertAutorizacionConfig(idEvento, formData);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al guardar la autorización');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                            {autorizacionToEdit ? 'Editar Documento' : 'Nueva Autorización / Acuerdo'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form id="auth-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Código Interno</label>
                                <input
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                    placeholder="Ej: REGLAMENTO, IMAGEN"
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm uppercase"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Orden de aparición</label>
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

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Título del Documento</label>
                            <input
                                name="titulo"
                                value={formData.titulo || ''}
                                onChange={handleChange}
                                placeholder="Ej: Reglamento Interno 2026, Autorización de Uso de Imagen"
                                required
                                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5 flex justify-between">
                                Contenido Legal (Markdown / Texto)
                                <span className="text-[10px] font-normal text-neutral-400 normal-case">En un futuro aquí habrá un editor wysiwyg</span>
                            </label>
                            <textarea
                                name="texto"
                                value={formData.texto || ''}
                                onChange={handleChange}
                                placeholder="Escribe o pega aquí el contenido del documento, términos o reglamento..."
                                rows={8}
                                required
                                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono text-xs resize-y"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                <input type="checkbox" name="obligatoria" checked={formData.obligatoria} onChange={handleChange} className="w-4 h-4 accent-emerald-600 rounded" />
                                <div>
                                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">Lectura/Acción Obligatoria</span>
                                    <span className="block text-xs text-neutral-500">El usuario no podrá inscribirse si no completa esta sección.</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                <input type="checkbox" name="requiere_aceptacion" checked={formData.requiere_aceptacion} onChange={handleChange} className="w-4 h-4 accent-emerald-600 rounded" />
                                <div>
                                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">Requiere Checkbox de Aceptación explícita</span>
                                    <span className="block text-xs text-neutral-500">"He leído y acepto los términos..."</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                <input type="checkbox" name="requiere_datos_responsable" checked={formData.requiere_datos_responsable} onChange={handleChange} className="w-4 h-4 accent-emerald-600 rounded" />
                                <div>
                                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">Pedir firma/datos del responsable legal</span>
                                    <span className="block text-xs text-neutral-500">Añade campos para Nombre, Apellido y DNI como firma digital.</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                                <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="w-4 h-4 accent-emerald-600 rounded" />
                                <div>
                                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">Documento Activo</span>
                                    <span className="block text-xs text-neutral-500">Mostrar este documento en el flujo actual.</span>
                                </div>
                            </label>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="auth-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar Documento
                    </button>
                </div>
            </div>
        </div>
    );
}
