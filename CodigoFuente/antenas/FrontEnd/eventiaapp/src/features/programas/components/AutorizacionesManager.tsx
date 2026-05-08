import { useState, useEffect } from 'react';
import { getAutorizacionesConfig } from '@/src/features/programas/programas.service';
import { AutorizacionConfig } from '@/src/features/programas/types';
import { Plus, Loader2, CheckSquare, Pencil, FileText, Globe } from 'lucide-react';
import UpsertAutorizacionDrawer from './UpsertAutorizacionDrawer';
import TraduccionesAutorizacionDrawer from './TraduccionesAutorizacionDrawer';

interface Props {
    idEvento: number;
}

export default function AutorizacionesManager({ idEvento }: Props) {
    const [autorizaciones, setAutorizaciones] = useState<AutorizacionConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedAuth, setSelectedAuth] = useState<AutorizacionConfig | null>(null);
    const [traduccionesAuthId, setTraduccionesAuthId] = useState<number | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAutorizacionesConfig(idEvento);
            setAutorizaciones(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error cargando las autorizaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idEvento]);

    const handleOpenDrawer = (auth?: AutorizacionConfig) => {
        setSelectedAuth(auth || null);
        setIsDrawerOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                        Autorizaciones y Reglamentos
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Configura los documentos legales (Reglamento, Derechos de Imagen) que el padre debe firmar o aceptar.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenDrawer()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Añadir Documento
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">{error}</div>
            ) : autorizaciones.length === 0 ? (
                <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">Sin autorizaciones</h4>
                    <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">Agrega los reglamentos o acuerdos de responsabilidad civil que la familia deba aceptar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {autorizaciones.map(auth => (
                        <div key={auth.id_programa_autorizacion_config} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                {auth.obligatoria && (
                                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Lectura Obligatoria</span>
                                )}
                                {auth.activo ? (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Activo</span>
                                ) : (
                                    <span className="text-[9px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full uppercase">Inactivo</span>
                                )}
                            </div>

                            <h4 className="font-bold text-neutral-900 dark:text-white pr-32">{auth.titulo || auth.codigo}</h4>
                            <p className="text-xs font-mono text-neutral-400 mb-3">{auth.codigo}</p>

                            <div className="text-xs text-neutral-500 line-clamp-2 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded border border-neutral-100 dark:border-neutral-800">
                                {auth.texto || <span className="italic">Sin contenido...</span>}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {auth.requiere_aceptacion && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                        <CheckSquare className="w-3 h-3" /> Checkbox de Aceptación
                                    </span>
                                )}
                                {auth.requiere_datos_responsable && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                        <FileText className="w-3 h-3" /> Firma Responsable Legal
                                    </span>
                                )}
                            </div>

                            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                                {auth.id_programa_autorizacion_config && (
                                    <button
                                        onClick={() => setTraduccionesAuthId(auth.id_programa_autorizacion_config!)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                    >
                                        <Globe className="w-3.5 h-3.5" /> Traducciones
                                    </button>
                                )}
                                <button
                                    onClick={() => handleOpenDrawer(auth)}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isDrawerOpen && (
                <UpsertAutorizacionDrawer
                    idEvento={idEvento}
                    autorizacionToEdit={selectedAuth}
                    onClose={() => setIsDrawerOpen(false)}
                    onSuccess={() => {
                        setIsDrawerOpen(false);
                        loadData();
                    }}
                />
            )}

            {traduccionesAuthId && (
                <TraduccionesAutorizacionDrawer
                    idConfig={traduccionesAuthId}
                    onClose={() => setTraduccionesAuthId(null)}
                    onSuccess={() => {
                        setTraduccionesAuthId(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
