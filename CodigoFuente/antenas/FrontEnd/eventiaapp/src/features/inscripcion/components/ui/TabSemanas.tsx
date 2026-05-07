import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante } from '../../types/inscripcion.types';
import { Copy } from 'lucide-react';

export function TabSemanas({ participante }: { participante: Participante }) {
    const { state, actualizarParticipante, copiarSemanasDeHermano } = useInscripcion();
    const { programaData } = state;

    if (!programaData) return null;

    const seleccionados = new Set(participante.periodos.map(p => p.id_programa_periodo));

    const handleToggle = (id_programa_periodo: number) => {
        let nuevosPeriodos;
        if (seleccionados.has(id_programa_periodo)) {
            nuevosPeriodos = participante.periodos.filter(p => p.id_programa_periodo !== id_programa_periodo);
        } else {
            nuevosPeriodos = [...participante.periodos, { id_programa_periodo }];
        }
        actualizarParticipante(participante._clientId, { periodos: nuevosPeriodos });
    };

    const hermanos = state.participantes.filter(p => p._clientId !== participante._clientId && p.periodos.length > 0);

    return (
        <div className="space-y-6 animate-in fade-in">
            {hermanos.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copiar semanas de:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {hermanos.map(h => (
                            <button 
                                key={h._clientId} 
                                onClick={() => copiarSemanasDeHermano(h._clientId, participante._clientId)}
                                className="bg-white dark:bg-card-bg text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                            >
                                {h.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {programaData.periodos.map(periodo => {
                    const checked = seleccionados.has(periodo.id_programa_periodo);
                    return (
                        <label 
                            key={periodo.id_programa_periodo}
                            className={`
                                flex items-center p-4 border rounded-xl cursor-pointer transition-all
                                ${checked 
                                    ? 'border-accent bg-accent/5 shadow-sm' 
                                    : 'border-gray-200 dark:border-card-border bg-white dark:bg-card-bg hover:border-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <input 
                                type="checkbox" 
                                checked={checked} 
                                onChange={() => handleToggle(periodo.id_programa_periodo)}
                                className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent"
                            />
                            <div className="ml-4 flex-1">
                                <span className={`block font-medium ${checked ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                    {periodo.nombre}
                                </span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {periodo.fecha_desde} al {periodo.fecha_hasta}
                                </span>
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {periodo.precio_base} <span className="text-sm font-normal text-gray-500">{periodo.moneda}</span>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
