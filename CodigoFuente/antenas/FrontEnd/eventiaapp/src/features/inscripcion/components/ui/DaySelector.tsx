import type { ProgramaPeriodo } from '../../types/inscripcion.types';

interface Props {
    periodos: ProgramaPeriodo[];
    periodosSeleccionadosIds: number[];
    fechasSeleccionadas: string[];
    onChange: (fechas: string[]) => void;
}

function generarFechasLaborables(start: string, end: string): { fechaStr: string; label: string }[] {
    const dates = [];
    const curr = new Date(`${start}T12:00:00Z`);
    const limit = new Date(`${end}T12:00:00Z`);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    while (curr <= limit) {
        const dia = curr.getUTCDay();
        if (dia !== 0 && dia !== 6) {
            const fechaStr = curr.toISOString().split('T')[0];
            const label = `${diasSemana[dia]} ${curr.getUTCDate()}`;
            dates.push({ fechaStr, label });
        }
        curr.setUTCDate(curr.getUTCDate() + 1);
    }
    return dates;
}

export function DaySelector({ periodos, periodosSeleccionadosIds, fechasSeleccionadas, onChange }: Props) {
    const handleToggleDate = (dateStr: string) => {
        if (fechasSeleccionadas.includes(dateStr)) {
            onChange(fechasSeleccionadas.filter(d => d !== dateStr));
        } else {
            onChange([...fechasSeleccionadas, dateStr]);
        }
    };

    const periodosActivos = periodos.filter(p => periodosSeleccionadosIds.includes(p.id_programa_periodo));

    if (periodosSeleccionadosIds.length === 0) {
        return (
            <div className="mt-4 p-4 rounded-xl border border-dashed border-red-200 bg-red-50 dark:bg-red-900/10">
                <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠ Debe seleccionar semanas primero para elegir los días.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 p-5 rounded-xl border border-gray-200 dark:border-card-border bg-gray-50/50 dark:bg-black/10">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Días a utilizar el servicio:</p>
            
            <div className="space-y-4">
                {periodosActivos.map(p => {
                    const diasLaborables = generarFechasLaborables(p.fecha_desde, p.fecha_hasta);
                    
                    return (
                        <div key={p.id_programa_periodo}>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {p.nombre}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {diasLaborables.map(({ fechaStr, label }) => {
                                    const isChecked = fechasSeleccionadas.includes(fechaStr);
                                    return (
                                        <label 
                                            key={fechaStr} 
                                            className={`
                                                px-3 py-1.5 text-sm rounded-lg border cursor-pointer select-none transition-colors
                                                ${isChecked 
                                                    ? 'bg-accent text-white border-accent' 
                                                    : 'bg-white dark:bg-card-bg text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                }
                                            `}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked} 
                                                onChange={() => handleToggleDate(fechaStr)} 
                                                className="hidden"
                                            />
                                            {label}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
