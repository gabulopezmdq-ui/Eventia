import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante } from '../../types/inscripcion.types';
import { DaySelector } from './DaySelector';
import { Copy } from 'lucide-react';

export function TabServicios({ participante }: { participante: Participante }) {
    const { state, actualizarParticipante, copiarServiciosDeHermano } = useInscripcion();
    const { programaData } = state;

    if (!programaData) return null;

    const handleServiceToggle = (idProgramaServicio: number) => {
        const existe = participante.servicios.find(s => s.id_programa_servicio === idProgramaServicio);
        let nuevosServicios;
        if (existe) {
            nuevosServicios = participante.servicios.filter(s => s.id_programa_servicio !== idProgramaServicio);
        } else {
            nuevosServicios = [...participante.servicios, {
                id_programa_servicio: idProgramaServicio,
                id_programa_periodo: null,
                fechas: [],
                cantidad: 1,
                campos_extra: null
            }];
        }
        actualizarParticipante(participante._clientId, { servicios: nuevosServicios });
    };

    const handleFechasChange = (idProgramaServicio: number, fechas: string[]) => {
        const nuevos = participante.servicios.map(s => 
            s.id_programa_servicio === idProgramaServicio ? { ...s, fechas } : s
        );
        actualizarParticipante(participante._clientId, { servicios: nuevos });
    };

    const hermanos = state.participantes.filter(p => p._clientId !== participante._clientId && p.servicios.length > 0);

    return (
        <div className="space-y-6 animate-in fade-in">
            {hermanos.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copiar servicios de:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {hermanos.map(h => (
                            <button 
                                key={h._clientId} 
                                onClick={() => copiarServiciosDeHermano(h._clientId, participante._clientId)}
                                className="bg-white dark:bg-card-bg text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                            >
                                {h.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {programaData.servicios.map(servicio => {
                    const svcSel = participante.servicios.find(s => s.id_programa_servicio === servicio.idProgramaServicio);
                    const checked = !!svcSel;

                    return (
                        <div 
                            key={servicio.idProgramaServicio}
                            className={`
                                p-5 border rounded-xl transition-all
                                ${checked 
                                    ? 'border-accent bg-accent/5 shadow-sm' 
                                    : 'border-gray-200 dark:border-card-border bg-white dark:bg-card-bg hover:border-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <label className="flex items-start sm:items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={checked} 
                                    onChange={() => handleServiceToggle(servicio.idProgramaServicio)}
                                    className="w-5 h-5 mt-1 sm:mt-0 text-accent border-gray-300 rounded focus:ring-accent"
                                />
                                <div className="ml-4 flex-1">
                                    <span className={`block font-medium ${checked ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                        {servicio.nombre}
                                    </span>
                                    {servicio.descripcion && (
                                        <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {servicio.descripcion}
                                        </span>
                                    )}
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white mt-2 sm:mt-0 ml-4 whitespace-nowrap">
                                    {servicio.precio} <span className="text-sm font-normal text-gray-500">{servicio.moneda}</span>
                                    {servicio.tipoCalculo === 'POR_DIA' && <span className="text-sm font-normal text-gray-500 ml-1">/día</span>}
                                </div>
                            </label>

                            {checked && servicio.tipoCalculo === 'POR_DIA' && (
                                <DaySelector 
                                    periodos={programaData.periodos}
                                    periodosSeleccionadosIds={participante.periodos.map(p => p.id_programa_periodo)}
                                    fechasSeleccionadas={svcSel?.fechas || []}
                                    onChange={(fechas) => handleFechasChange(servicio.idProgramaServicio, fechas)}
                                />
                            )}
                        </div>
                    );
                })}
                
                {programaData.servicios.length === 0 && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
                        No hay servicios adicionales configurados.
                    </div>
                )}
            </div>
        </div>
    );
}
