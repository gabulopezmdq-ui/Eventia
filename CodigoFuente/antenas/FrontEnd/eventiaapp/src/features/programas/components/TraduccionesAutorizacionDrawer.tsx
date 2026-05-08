import { useState, useEffect } from 'react';
import { TraduccionAutorizacion } from '@/src/features/programas/types';
import { getTraducciones, updateTraducciones } from '@/src/features/programas/programas.service';
import { Loader2, X, Globe } from 'lucide-react';

interface Props {
    idConfig: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TraduccionesAutorizacionDrawer({ idConfig, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [traducciones, setTraducciones] = useState<TraduccionAutorizacion[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getTraducciones(idConfig);
                // Si viene vacío (no debería si el backend rellena los idiomas activos, pero por las dudas)
                setTraducciones(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Error cargando las traducciones');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [idConfig]);

    const handleChange = (index: number, field: keyof TraduccionAutorizacion, value: any) => {
        const newTrad = [...traducciones];
        newTrad[index] = { ...newTrad[index], [field]: value };
        setTraducciones(newTrad);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await updateTraducciones(idConfig, traducciones);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al guardar las traducciones');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-500" />
                            Traducciones del Documento
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

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <form id="trad-form" onSubmit={handleSubmit} className="space-y-8">
                            {traducciones.map((trad, index) => (
                                <div key={trad.id_idioma} className="bg-neutral-50 dark:bg-neutral-800/30 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
                                    <h4 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                                        <Globe className="w-4 h-4 text-neutral-400" />
                                        Idioma ID: {trad.id_idioma}
                                        {trad.id_idioma === 3 && ' (Español)'}
                                        {trad.id_idioma === 1 && ' (Inglés)'}
                                        {trad.id_idioma === 4 && ' (Portugués)'}
                                    </h4>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Título del Documento</label>
                                        <input
                                            value={trad.titulo || ''}
                                            onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                                            placeholder="Ej: Reglamento Interno"
                                            required
                                            className="w-full p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Contenido Legal</label>
                                        <textarea
                                            value={trad.texto || ''}
                                            onChange={(e) => handleChange(index, 'texto', e.target.value)}
                                            placeholder="Escribe el contenido legal en este idioma..."
                                            rows={6}
                                            required
                                            className="w-full p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono text-xs resize-y"
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer w-max">
                                        <input
                                            type="checkbox"
                                            checked={trad.activo}
                                            onChange={(e) => handleChange(index, 'activo', e.target.checked)}
                                            className="w-4 h-4 accent-blue-600 rounded"
                                        />
                                        <span className="block text-sm font-bold text-neutral-900 dark:text-white">Traducción Activa</span>
                                    </label>
                                </div>
                            ))}

                            {traducciones.length === 0 && (
                                <div className="text-center text-sm text-neutral-500">
                                    No se encontraron idiomas activos para traducir.
                                </div>
                            )}
                        </form>
                    )}
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
                        form="trad-form"
                        type="submit"
                        disabled={saving || loading || traducciones.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar Traducciones
                    </button>
                </div>
            </div>
        </div>
    );
}
