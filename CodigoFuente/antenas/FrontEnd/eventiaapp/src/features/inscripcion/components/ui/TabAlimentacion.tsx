import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, RestriccionAlimentaria, RestriccionAlimentariaConfig } from '../../types/inscripcion.types';
import { AlertCircle, CheckCircle2, Utensils } from 'lucide-react';

interface Props {
    participante: Participante;
    restriccionesConfig: RestriccionAlimentariaConfig[];
}

const FIELD_CLASS = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none';
const LABEL_CLASS = 'text-xs font-medium text-gray-700 dark:text-gray-300';

export function TabAlimentacion({ participante, restriccionesConfig }: Props) {
    const { actualizarParticipante } = useInscripcion();

    const restricciones = participante.restricciones_alimentarias;

    // Obtener valores mapeados de una restricción del catálogo
    const getCatalogValues = (cfg: any) => {
        const id = Number(cfg.id_restriccion ?? cfg.id ?? 0);
        const nombre = String(cfg.descripcion ?? cfg.nombre ?? '');
        return { id, nombre };
    };

    const handleToggle = (cfgId: number) => {
        const existeIndex = restricciones.findIndex(r => r.id_restriccion_alimentaria === cfgId);
        let nuevasRestricciones;

        if (existeIndex !== -1) {
            // Desmarcar: remover de la lista
            nuevasRestricciones = restricciones.filter((_, idx) => idx !== existeIndex);
        } else {
            // Marcar: agregar nuevo registro con valores por defecto
            const nueva: RestriccionAlimentaria = {
                id_restriccion_alimentaria: cfgId,
                severidad: 'Leve',
                observacion: '',
            };
            nuevasRestricciones = [...restricciones, nueva];
        }

        actualizarParticipante(participante._clientId, { restricciones_alimentarias: nuevasRegistraciones(nuevasRestricciones) });
    };

    // Filtra duplicados o nulos y devuelve sanitizada la lista
    const nuevasRegistraciones = (lista: RestriccionAlimentaria[]) => {
        return lista.filter(r => r.id_restriccion_alimentaria !== undefined);
    };

    const handleSeverityChange = (cfgId: number, severidad: 'Leve' | 'Moderada' | 'Severa') => {
        const nuevas = restricciones.map(r => 
            r.id_restriccion_alimentaria === cfgId ? { ...r, severidad } : r
        );
        actualizarParticipante(participante._clientId, { restricciones_alimentarias: nuevas });
    };

    const handleObservacionChange = (cfgId: number, observacion: string) => {
        const nuevas = restricciones.map(r => 
            r.id_restriccion_alimentaria === cfgId ? { ...r, observacion } : r
        );
        actualizarParticipante(participante._clientId, { restricciones_alimentarias: nuevas });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                    <Utensils className="w-4 h-4 text-accent" />
                    Restricciones Alimentarias
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                    Indicá si el participante sigue alguna dieta especial o tiene alguna alergia alimentaria.
                </p>
            </div>

            {restriccionesConfig.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 dark:border-card-border rounded-xl">
                    <p className="text-gray-500 text-sm">No hay catálogo de restricciones alimentarias disponible.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {restriccionesConfig.map(cfg => {
                        const { id: cfgId, nombre: cfgNombre } = getCatalogValues(cfg);
                        const restSel = restricciones.find(r => r.id_restriccion_alimentaria === cfgId);
                        const isChecked = !!restSel;
                        const isOtra = cfgNombre.toLowerCase().includes('otra') || cfgNombre.toLowerCase().includes('otro');

                        return (
                            <div 
                                key={cfgId}
                                className={`p-5 border rounded-2xl transition-all bg-white dark:bg-card-bg ${
                                    isChecked 
                                        ? 'border-accent shadow-sm ring-1 ring-accent/10' 
                                        : 'border-gray-200 dark:border-card-border hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                            >
                                <label className="flex items-center cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={isChecked} 
                                        onChange={() => handleToggle(cfgId)}
                                        className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent accent-accent"
                                    />
                                    <span className={`ml-4 font-semibold text-sm ${isChecked ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                        {cfgNombre}
                                    </span>
                                </label>

                                {isChecked && restSel && (
                                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        
                                        {/* Severidad Selector de Botones Premium */}
                                        <div className="space-y-2">
                                            <label className={LABEL_CLASS}>Severidad *</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(['Leve', 'Moderada', 'Severa'] as const).map(sev => {
                                                    const isSelected = restSel.severidad === sev;
                                                    
                                                    // Colores basados en severidad
                                                    const colorClasses = 
                                                        sev === 'Leve' 
                                                            ? isSelected ? 'bg-green-600 border-green-600 text-white' : 'hover:bg-green-50 dark:hover:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                                            : sev === 'Moderada'
                                                            ? isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                            : isSelected ? 'bg-red-600 border-red-600 text-white' : 'hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';

                                                    return (
                                                        <button
                                                            key={sev}
                                                            type="button"
                                                            onClick={() => handleSeverityChange(cfgId, sev)}
                                                            className={`px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase transition-all shadow-sm ${colorClasses}`}
                                                        >
                                                            {sev}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Observación */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                Observaciones 
                                                {isOtra ? (
                                                    <span className="text-red-500 font-bold flex items-center gap-1">
                                                        * <span className="text-[10px] text-red-400 font-normal">(Requerido para "Otra")</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 font-normal text-[10px]">(Opcional)</span>
                                                )}
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder={isOtra ? "Por favor detallá la restricción alimentaria aquí..." : "Ej: Evitar contaminación cruzada, trazas, etc."}
                                                value={restSel.observacion}
                                                onChange={e => handleObservacionChange(cfgId, e.target.value)}
                                                className={`${FIELD_CLASS} resize-none`}
                                            />
                                            {isOtra && !restSel.observacion.trim() && (
                                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    El detalle de observaciones es obligatorio al seleccionar esta opción.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
