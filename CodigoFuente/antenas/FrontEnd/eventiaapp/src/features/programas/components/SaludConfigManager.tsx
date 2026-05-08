import { useState, useEffect } from 'react';
import { getSaludConfig, upsertSaludConfig } from '@/src/features/programas/programas.service';
import { SaludConfig } from '@/src/features/programas/types';
import { Loader2, BriefcaseMedical, Save, CheckCircle2 } from 'lucide-react';

interface Props {
    idEvento: number;
}

export default function SaludConfigManager({ idEvento }: Props) {
    const [config, setConfig] = useState<SaludConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getSaludConfig(idEvento);
                setConfig(data);
            } catch (err: any) {
                // If it fails, maybe it doesn't exist yet, we initialize a default one
                setConfig({
                    id_evento: idEvento,
                    pedir_problema_medico: false,
                    problema_medico_obligatorio: false,
                    pedir_alergias_no_alimentarias: false,
                    alergias_no_alimentarias_obligatorio: false,
                    pedir_necesidad_especial: false,
                    necesidad_especial_obligatorio: false,
                    pedir_cobertura_medica: false,
                    cobertura_medica_obligatorio: false,
                    pedir_contacto_emergencia: true,
                    contacto_emergencia_obligatorio: true,
                    pedir_autoriza_emergencia_medica: true,
                    autoriza_emergencia_medica_obligatorio: true,
                    pedir_observaciones_familia: false,
                    observaciones_familia_obligatorio: false,
                    pedir_medicaciones: false,
                    medicaciones_obligatorio: false,
                    activo: true
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [idEvento]);

    const handleToggle = (field: keyof SaludConfig) => {
        if (!config) return;

        setConfig(prev => {
            if (!prev) return prev;
            const newValue = !prev[field];
            const updates = { [field]: newValue } as Partial<SaludConfig>;

            // Si desactivo el "pedir", automáticamente desactivo el "obligatorio"
            if (field.startsWith('pedir_') && !newValue) {
                const requiredField = field.replace('pedir_', '') + '_obligatorio';
                updates[requiredField as keyof SaludConfig] = false as any;
            }

            return { ...prev, ...updates };
        });
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await upsertSaludConfig(idEvento, config);
            setConfig(result);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Error al guardar la configuración de salud.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!config) return null;

    const OptionRow = ({ label, description, baseField, requiredField }: { label: string, description: string, baseField: keyof SaludConfig, requiredField: keyof SaludConfig }) => {
        const isPedir = Boolean(config[baseField]);
        const isRequired = Boolean(config[requiredField]);

        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                <div className="mb-3 sm:mb-0">
                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">{label}</span>
                    <span className="block text-xs text-neutral-500 mt-0.5">{description}</span>
                </div>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPedir}
                            onChange={() => handleToggle(baseField)}
                            className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">Solicitar</span>
                    </label>

                    <label className={`flex items-center gap-2 ${!isPedir ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="checkbox"
                            checked={isRequired}
                            disabled={!isPedir}
                            onChange={() => handleToggle(requiredField)}
                            className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">Obligatorio</span>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <BriefcaseMedical className="w-5 h-5 text-emerald-500" />
                        Ficha Médica (Health Tracker)
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Selecciona qué información médica le pedirás a las familias al momento de inscribir.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition-all whitespace-nowrap"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>
            )}

            {success && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Configuración médica guardada correctamente.
                </div>
            )}

            <div className="space-y-3">
                <OptionRow
                    label="Problemas Médicos"
                    description="Permite que la familia declare enfermedades, condiciones o afecciones."
                    baseField="pedir_problema_medico"
                    requiredField="problema_medico_obligatorio"
                />
                <OptionRow
                    label="Alergias (No alimentarias)"
                    description="Alergias a medicamentos, picaduras, ambientales, etc. (Las alimentarias se configuran aparte en restricciones)."
                    baseField="pedir_alergias_no_alimentarias"
                    requiredField="alergias_no_alimentarias_obligatorio"
                />
                <OptionRow
                    label="Necesidades Especiales"
                    description="Condiciones neurodivergentes, motrices o de aprendizaje que el staff deba conocer."
                    baseField="pedir_necesidad_especial"
                    requiredField="necesidad_especial_obligatorio"
                />
                <OptionRow
                    label="Cobertura Médica (Obra Social / Prepaga)"
                    description="Pide la credencial, nombre y número de socio de la cobertura."
                    baseField="pedir_cobertura_medica"
                    requiredField="cobertura_medica_obligatorio"
                />
                <OptionRow
                    label="Medicaciones"
                    description="Permite informar si el menor está tomando alguna medicación actualmente."
                    baseField="pedir_medicaciones"
                    requiredField="medicaciones_obligatorio"
                />
                <OptionRow
                    label="Contacto de Emergencia"
                    description="Solicita el nombre, parentesco y teléfono de un tercero en caso de emergencia."
                    baseField="pedir_contacto_emergencia"
                    requiredField="contacto_emergencia_obligatorio"
                />
                <OptionRow
                    label="Autorización para Emergencia Médica"
                    description="Texto legal donde el padre autoriza a la organización a llamar al SAME/Emergencias."
                    baseField="pedir_autoriza_emergencia_medica"
                    requiredField="autoriza_emergencia_medica_obligatorio"
                />
                <OptionRow
                    label="Observaciones Generales"
                    description="Un campo de texto libre para que la familia aclare cualquier otra cuestión."
                    baseField="pedir_observaciones_familia"
                    requiredField="observaciones_familia_obligatorio"
                />
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.activo}
                        onChange={() => setConfig(prev => prev ? { ...prev, activo: !prev.activo } : null)}
                        className="w-5 h-5 accent-emerald-600 rounded"
                    />
                    <div>
                        <span className="block text-sm font-bold text-emerald-900 dark:text-emerald-400">Módulo de Salud Activo</span>
                        <span className="block text-xs text-emerald-700/80 dark:text-emerald-500 mt-0.5">Si se desactiva, no se pedirá ninguna información médica en el flujo de inscripción.</span>
                    </div>
                </label>
            </div>

            {config.activo && (
                <div className="mt-8 bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-inner space-y-6">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700 pb-2">
                        Vista Previa del Formulario
                    </h4>

                    <div className="space-y-4 opacity-80 pointer-events-none">
                        {config.pedir_cobertura_medica && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Cobertura Médica {config.cobertura_medica_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center px-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Obra Social / Prepaga</div>
                                    <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center px-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Número de Socio</div>
                                </div>
                            </div>
                        )}

                        {config.pedir_contacto_emergencia && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Contacto de Emergencia {config.contacto_emergencia_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center px-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Nombre Completo</div>
                                    <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center px-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Teléfono</div>
                                    <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center px-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Parentesco</div>
                                </div>
                            </div>
                        )}

                        {config.pedir_problema_medico && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Problemas Médicos {config.problema_medico_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-start p-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Describa la condición médica...</div>
                            </div>
                        )}

                        {config.pedir_alergias_no_alimentarias && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Alergias (No alimentarias) {config.alergias_no_alimentarias_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-start p-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Describa alergias (ej. Picaduras, Medicamentos)...</div>
                            </div>
                        )}

                        {config.pedir_necesidad_especial && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Necesidades Especiales {config.necesidad_especial_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-start p-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Describa necesidades (TEA, TDAH, Motriz, etc)...</div>
                            </div>
                        )}

                        {config.pedir_medicaciones && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Medicaciones {config.medicaciones_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-start p-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Indique medicación, dosis y horarios...</div>
                            </div>
                        )}

                        {config.pedir_observaciones_familia && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <span className="block text-xs font-bold text-neutral-500 mb-2">Observaciones Generales {config.observaciones_familia_obligatorio && <span className="text-red-500">*</span>}</span>
                                <div className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-start p-3 text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700">Otras aclaraciones...</div>
                            </div>
                        )}

                        {config.pedir_autoriza_emergencia_medica && (
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-start gap-3">
                                <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-neutral-700 mt-0.5"></div>
                                <div>
                                    <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">Autorización de Emergencia {config.autoriza_emergencia_medica_obligatorio && <span className="text-red-500">*</span>}</span>
                                    <span className="block text-[10px] text-neutral-500">Autorizo al personal a tomar las decisiones médicas de emergencia necesarias...</span>
                                </div>
                            </div>
                        )}

                        {!config.pedir_cobertura_medica && !config.pedir_contacto_emergencia && !config.pedir_problema_medico && !config.pedir_alergias_no_alimentarias && !config.pedir_necesidad_especial && !config.pedir_medicaciones && !config.pedir_observaciones_familia && !config.pedir_autoriza_emergencia_medica && (
                            <div className="text-center py-6 text-sm text-neutral-500 italic">
                                No se solicitará información médica adicional.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
