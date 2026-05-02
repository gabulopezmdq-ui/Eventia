import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, RestriccionAlimentaria } from '../../types/inscripcion.types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    participante: Participante;
}

export function TabAlimentacion({ participante }: Props) {
    const { actualizarParticipante } = useInscripcion();

    const handleChangeRestriccion = (index: number, campo: keyof RestriccionAlimentaria, valor: string) => {
        const nuevas = [...participante.restricciones];
        nuevas[index] = { ...nuevas[index], [campo]: valor };
        actualizarParticipante(participante._clientId, { restricciones: nuevas });
    };

    const handleEliminarRestriccion = (index: number) => {
        const nuevas = participante.restricciones.filter((_, i) => i !== index);
        actualizarParticipante(participante._clientId, { restricciones: nuevas });
    };

    const handleAgregarRestriccion = () => {
        const nueva: RestriccionAlimentaria = { tipo: '', severidad: 'Leve', observaciones: '' };
        actualizarParticipante(participante._clientId, { 
            restricciones: [...participante.restricciones, nueva] 
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Restricciones Alimentarias</h4>
                <p className="text-sm text-gray-500">Indicá si el participante tiene alguna dieta especial o alergia alimentaria.</p>
            </div>

            {participante.restricciones.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-card-border rounded-xl">
                    <p className="text-gray-500 text-sm mb-4">No hay restricciones registradas.</p>
                    <button 
                        onClick={handleAgregarRestriccion}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar restricción
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {participante.restricciones.map((rest, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-card-border relative">
                            <button 
                                onClick={() => handleEliminarRestriccion(index)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de dieta / Alergia *</label>
                                    <select 
                                        value={rest.tipo}
                                        onChange={e => handleChangeRestriccion(index, 'tipo', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Sin gluten">Sin gluten / Celíaco</option>
                                        <option value="Sin lactosa">Sin lactosa</option>
                                        <option value="Vegetariano">Vegetariano</option>
                                        <option value="Vegano">Vegano</option>
                                        <option value="Frutos secos">Alergia a frutos secos</option>
                                        <option value="Otra">Otra</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Severidad *</label>
                                    <select 
                                        value={rest.severidad}
                                        onChange={e => handleChangeRestriccion(index, 'severidad', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    >
                                        <option value="Leve">Leve</option>
                                        <option value="Moderada">Moderada</option>
                                        <option value="Severa">Severa</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
                                    <input 
                                        type="text"
                                        placeholder="Ej: Contaminación cruzada..."
                                        value={rest.observaciones}
                                        onChange={e => handleChangeRestriccion(index, 'observaciones', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={handleAgregarRestriccion}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar otra restricción
                    </button>
                </div>
            )}
        </div>
    );
}
