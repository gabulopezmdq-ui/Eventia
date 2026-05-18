import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, RestriccionAlimentaria, RestriccionAlimentariaConfig } from '../../types/inscripcion.types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    participante: Participante;
    /** Catálogo de restricciones que viene del GET del programa */
    restriccionesConfig: RestriccionAlimentariaConfig[];
}

const FIELD_CLASS = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none';
const LABEL_CLASS = 'text-xs font-medium text-gray-700 dark:text-gray-300';

export function TabAlimentacion({ participante, restriccionesConfig }: Props) {
    const { actualizarParticipante } = useInscripcion();

    const restricciones = participante.restricciones_alimentarias;

    const handleChange = (
        index: number,
        campo: keyof RestriccionAlimentaria,
        valor: string | number
    ) => {
        const nuevas = [...restricciones];
        nuevas[index] = { ...nuevas[index], [campo]: valor };
        actualizarParticipante(participante._clientId, { restricciones_alimentarias: nuevas });
    };

    const handleEliminar = (index: number) => {
        const nuevas = restricciones.filter((_, i) => i !== index);
        actualizarParticipante(participante._clientId, { restricciones_alimentarias: nuevas });
    };

    const handleAgregar = () => {
        // Tomamos el primer id disponible o 0 si no hay catálogo
        const primerConfig = restriccionesConfig[0];
        const primerId = primerConfig ? ((primerConfig as any).id_restriccion ?? primerConfig.id) : 0;
        
        const nueva: RestriccionAlimentaria = {
            id_restriccion_alimentaria: primerId,
            severidad: 'Leve',
            observacion: '',
        };
        actualizarParticipante(participante._clientId, {
            restricciones_alimentarias: [...restricciones, nueva],
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Restricciones Alimentarias
                </h4>
                <p className="text-sm text-gray-500">
                    Indicá si el participante tiene alguna dieta especial o alergia alimentaria.
                </p>
            </div>

            {restricciones.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-card-border rounded-xl">
                    <p className="text-gray-500 text-sm mb-4">No hay restricciones registradas.</p>
                    <button
                        type="button"
                        onClick={handleAgregar}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar restricción
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {restricciones.map((rest, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-card-border relative"
                        >
                            <button
                                type="button"
                                onClick={() => handleEliminar(index)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                {/* Tipo — usa catálogo del GET */}
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Tipo de dieta / Alergia *</label>
                                    {restriccionesConfig.length > 0 ? (
                                        <select
                                            value={rest.id_restriccion_alimentaria}
                                            onChange={e =>
                                                handleChange(index, 'id_restriccion_alimentaria', Number(e.target.value))
                                            }
                                            className={FIELD_CLASS}
                                        >
                                            {restriccionesConfig.map(cfg => {
                                                const cfgId = (cfg as any).id_restriccion ?? cfg.id;
                                                const cfgNombre = (cfg as any).descripcion ?? cfg.nombre;
                                                return (
                                                    <option key={cfgId} value={cfgId}>
                                                        {cfgNombre}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    ) : (
                                        /* Fallback si el programa no trae catálogo */
                                        <select
                                            value={rest.id_restriccion_alimentaria}
                                            onChange={e =>
                                                handleChange(index, 'id_restriccion_alimentaria', Number(e.target.value))
                                            }
                                            className={FIELD_CLASS}
                                        >
                                            <option value={0}>Seleccionar...</option>
                                        </select>
                                    )}
                                </div>

                                {/* Severidad */}
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Severidad *</label>
                                    <select
                                        value={rest.severidad}
                                        onChange={e =>
                                            handleChange(index, 'severidad', e.target.value)
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        <option value="Leve">Leve</option>
                                        <option value="Moderada">Moderada</option>
                                        <option value="Severa">Severa — Alergia grave</option>
                                    </select>
                                </div>

                                {/* Observación */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={LABEL_CLASS}>
                                        Observaciones
                                        {rest.id_restriccion_alimentaria === 0 && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Contaminación cruzada, sin trazas..."
                                        value={rest.observacion}
                                        onChange={e =>
                                            handleChange(index, 'observacion', e.target.value)
                                        }
                                        className={FIELD_CLASS}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAgregar}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar otra restricción
                    </button>
                </div>
            )}
        </div>
    );
}
