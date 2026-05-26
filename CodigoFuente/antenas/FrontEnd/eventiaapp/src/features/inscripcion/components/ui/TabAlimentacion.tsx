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

    const disponibles = restriccionesConfig.filter(cfg => {
        const { id } = getCatalogValues(cfg);
        return !restricciones.some(r => r.id_restriccion_alimentaria === id);
    });

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
                <div className="space-y-6">
                    {/* SELECT DE AGREGAR RESTRICCIÓN */}
                    <div className="space-y-1.5 max-w-md">
                        <label className={LABEL_CLASS}>Agregar Restricción Alimentaria</label>
                        <select
                            value=""
                            onChange={e => {
                                const val = e.target.value;
                                if (val) {
                                    handleToggle(Number(val));
                                }
                            }}
                            className={FIELD_CLASS}
                        >
                            <option value="" className="text-gray-400 dark:text-gray-500">
                                -- Seleccioná para agregar --
                            </option>
                            {disponibles.map(cfg => {
                                const { id: cfgId, nombre: cfgNombre } = getCatalogValues(cfg);
                                return (
                                    <option key={cfgId} value={cfgId} className="text-gray-900 dark:text-white dark:bg-black">
                                        {cfgNombre}
                                    </option>
                                );
                            })}
                        </select>
                        {disponibles.length === 0 && restriccionesConfig.length > 0 && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 animate-in fade-in">
                                Ya agregaste todas las restricciones disponibles.
                            </p>
                        )}
                    </div>

                    {/* DETALLES DE LAS SELECCIONES */}
                    <div className="space-y-4">
                        {restricciones.length === 0 ? (
                            /* BANNER DE DIETA ESTÁNDAR / SIN RESTRICCIONES */
                            <div className="p-4 rounded-xl bg-green-50/60 dark:bg-green-950/10 border border-green-100/80 dark:border-green-900/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h5 className="text-xs font-bold text-green-800 dark:text-green-400">
                                        Alimentación Estándar / Libre
                                    </h5>
                                    <p className="text-[11px] text-green-700/80 dark:text-green-400/70 mt-0.5 leading-relaxed">
                                        El participante no registra ninguna restricción alimentaria. Seguirá el menú regular del evento. Si posee alguna alergia o dieta especial, seleccionala arriba.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* LISTADO DE RESTRICCIONES ACTIVAS CON DETALLE COMPACTO EN GRILLA */
                            <div className="space-y-4">
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                                    Detalle de Restricciones Seleccionadas
                                </span>
                                <div className="space-y-3.5">
                                    {restriccionesConfig.map(cfg => {
                                        const { id: cfgId, nombre: cfgNombre } = getCatalogValues(cfg);
                                        const restSel = restricciones.find(r => r.id_restriccion_alimentaria === cfgId);
                                        if (!restSel) return null;

                                        const isOtra = cfgNombre.toLowerCase().includes('otra') || cfgNombre.toLowerCase().includes('otro');

                                        return (
                                            <div
                                                key={cfgId}
                                                className="p-4 border border-gray-200 dark:border-card-border bg-white dark:bg-card-bg rounded-xl shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                                            >
                                                {/* Header de la tarjeta de detalle */}
                                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                                    <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                                        {cfgNombre}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggle(cfgId)}
                                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-gray-50 dark:hover:bg-black/20"
                                                    >
                                                        ✕ Quitar
                                                    </button>
                                                </div>

                                                {/* Layout responsivo de 2 columnas para Severidad y Observaciones */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Severidad */}
                                                    <div className="space-y-2">
                                                        <label className={LABEL_CLASS}>Severidad *</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(['Leve', 'Moderada', 'Severa'] as const).map(sev => {
                                                                const isSelected = restSel.severidad === sev;
                                                                const colorClasses = 
                                                                    sev === 'Leve' 
                                                                        ? isSelected ? 'bg-green-600 border-green-600 text-white shadow-green-100 dark:shadow-none' : 'hover:bg-green-50 dark:hover:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-transparent'
                                                                        : sev === 'Moderada'
                                                                        ? isSelected ? 'bg-amber-500 border-amber-500 text-white shadow-amber-100 dark:shadow-none' : 'hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-transparent'
                                                                        : isSelected ? 'bg-red-600 border-red-600 text-white shadow-red-100 dark:shadow-none' : 'hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 bg-transparent';

                                                                return (
                                                                    <button
                                                                        key={sev}
                                                                        type="button"
                                                                        onClick={() => handleSeverityChange(cfgId, sev)}
                                                                        className={`px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm ${colorClasses}`}
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
                                                                    * <span className="text-[10px] text-red-400 font-normal">(Requerido)</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 font-normal text-[10px]">(Opcional)</span>
                                                            )}
                                                        </label>
                                                        <textarea
                                                            rows={1}
                                                            placeholder={isOtra ? "Detallá la restricción alimentaria aquí..." : "Evitar contaminación cruzada, trazas, etc."}
                                                            value={restSel.observacion}
                                                            onChange={e => handleObservacionChange(cfgId, e.target.value)}
                                                            className={`${FIELD_CLASS} resize-none min-h-[38px] py-1.5`}
                                                        />
                                                        {isOtra && !restSel.observacion.trim() && (
                                                            <p className="text-[10px] text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" />
                                                                El detalle de observaciones es obligatorio.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
