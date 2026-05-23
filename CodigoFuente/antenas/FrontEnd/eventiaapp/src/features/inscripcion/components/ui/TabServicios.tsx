import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, ServicioSeleccionado } from '../../types/inscripcion.types';
import { DaySelector } from './DaySelector';
import { Copy, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CampoExtra {
    codigo: string;
    label: string;
    tipo: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE' | 'BOOLEAN';
    obligatorio: boolean;
    opciones?: string[];
}

function getCamposExtra(configJson: any): CampoExtra[] {
    if (!configJson) return [];
    let parsed = configJson;
    if (typeof configJson === 'string') {
        try {
            parsed = JSON.parse(configJson);
        } catch {
            return [];
        }
    }
    const campos = parsed?.campos_extra;
    if (Array.isArray(campos)) {
        return campos as CampoExtra[];
    }
    return [];
}

function getConfigJson(servicio: any): any {
    return servicio?.configJson ?? servicio?.config_json ?? null;
}

export function TabServicios({ participante }: { participante: Participante }) {
    const { state, actualizarParticipante, copiarServiciosDeHermano } = useInscripcion();
    const { programaData } = state;

    if (!programaData) return null;

    // Filtrar periodos seleccionados por el participante
    const periodosSeleccionadosIds = participante.periodos.map(p => p.id_programa_periodo);
    const periodosActivos = programaData.periodos.filter(p => 
        periodosSeleccionadosIds.includes(p.id_programa_periodo)
    );

    // Separar los servicios disponibles en el programa
    const serviciosDiarios = programaData.servicios.filter(s => s.tipoCalculo === 'POR_DIA');
    const serviciosUnicos = programaData.servicios.filter(s => s.tipoCalculo !== 'POR_DIA');

    // ── Servicios Diarios ─────────────────────────────────────────────

    const handleDailyServiceToggle = (idProgramaServicio: number, idProgramaPeriodo: number) => {
        const existeIndex = participante.servicios.findIndex(s => 
            s.id_programa_servicio === idProgramaServicio && 
            s.id_programa_periodo === idProgramaPeriodo
        );

        let nuevosServicios;
        if (existeIndex !== -1) {
            // Eliminar servicio de esta semana
            nuevosServicios = participante.servicios.filter((_, idx) => idx !== existeIndex);
        } else {
            // Agregar servicio para esta semana
            const nuevoServicio: ServicioSeleccionado = {
                id_programa_servicio: idProgramaServicio,
                id_programa_periodo: idProgramaPeriodo,
                fechas: [],
                cantidad: null,
                campos_extra: null
            };
            nuevosServicios = [...participante.servicios, nuevoServicio];
        }
        actualizarParticipante(participante._clientId, { servicios: nuevosServicios });
    };

    const handleDailyFechasChange = (idProgramaServicio: number, idProgramaPeriodo: number, fechas: string[]) => {
        const nuevos = participante.servicios.map(s => 
            s.id_programa_servicio === idProgramaServicio && s.id_programa_periodo === idProgramaPeriodo
                ? { ...s, fechas }
                : s
        );
        actualizarParticipante(participante._clientId, { servicios: nuevos });
    };

    // ── Servicios Únicos ──────────────────────────────────────────────

    const handleUniqueServiceToggle = (idProgramaServicio: number) => {
        const existeIndex = participante.servicios.findIndex(s => 
            s.id_programa_servicio === idProgramaServicio && 
            s.id_programa_periodo === null
        );

        let nuevosServicios;
        if (existeIndex !== -1) {
            // Eliminar servicio único
            nuevosServicios = participante.servicios.filter((_, idx) => idx !== existeIndex);
        } else {
            // Inicializar campos extra
            const servicioDef = programaData.servicios.find(s => s.idProgramaServicio === idProgramaServicio);
            const campos = getCamposExtra(getConfigJson(servicioDef));
            const initialCamposExtra: Record<string, string> = {};
            campos.forEach(c => {
                initialCamposExtra[c.codigo] = '';
            });

            const nuevoServicio: ServicioSeleccionado = {
                id_programa_servicio: idProgramaServicio,
                id_programa_periodo: null,
                fechas: [],
                cantidad: 1,
                campos_extra: Object.keys(initialCamposExtra).length > 0 ? initialCamposExtra : null
            };
            nuevosServicios = [...participante.servicios, nuevoServicio];
        }
        actualizarParticipante(participante._clientId, { servicios: nuevosServicios });
    };

    const handleUniqueCampoExtraChange = (idProgramaServicio: number, codigo: string, valor: string) => {
        const nuevos = participante.servicios.map(s => {
            if (s.id_programa_servicio === idProgramaServicio && s.id_programa_periodo === null) {
                return {
                    ...s,
                    campos_extra: {
                        ...(s.campos_extra || {}),
                        [codigo]: valor
                    }
                };
            }
            return s;
        });
        actualizarParticipante(participante._clientId, { servicios: nuevos });
    };

    const hermanos = state.participantes.filter(p => p._clientId !== participante._clientId && p.servicios.length > 0);

    // Si no ha seleccionado semanas en la pestaña correspondiente
    if (periodosSeleccionadosIds.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl animate-in fade-in duration-300">
                <p className="text-amber-800 dark:text-amber-400 font-semibold text-base">
                    ⚠ No hay semanas seleccionadas
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    Por favor, seleccioná al menos una semana en la pestaña <strong>Semanas</strong> para poder configurar los servicios correspondientes de cada una.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
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

            {/* ── SECCIÓN 1: Servicios Diarios agrupados por Semana ── */}
            {serviciosDiarios.length > 0 && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                            <Calendar className="w-4 h-4 text-accent" />
                            Servicios Diarios por Semana
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Seleccioná qué días de cada semana utilizará el participante estos servicios.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {periodosActivos.map(periodo => (
                            <div 
                                key={periodo.id_programa_periodo}
                                className="p-5 bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-card-border space-y-4"
                            >
                                <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-200/60 dark:border-card-border pb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                                    {periodo.nombre}
                                </h5>

                                <div className="space-y-4">
                                    {serviciosDiarios.map(servicio => {
                                        const svcSel = participante.servicios.find(s => 
                                            s.id_programa_servicio === servicio.idProgramaServicio && 
                                            s.id_programa_periodo === periodo.id_programa_periodo
                                        );
                                        const checked = !!svcSel;

                                        return (
                                            <div 
                                                key={servicio.idProgramaServicio}
                                                className={`p-4 border rounded-xl bg-white dark:bg-card-bg transition-all ${
                                                    checked ? 'border-accent ring-1 ring-accent/10 shadow-sm' : 'border-gray-200 dark:border-card-border hover:border-gray-300 dark:hover:border-gray-700'
                                                }`}
                                            >
                                                <label className="flex items-start sm:items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={checked} 
                                                        onChange={() => handleDailyServiceToggle(servicio.idProgramaServicio, periodo.id_programa_periodo)}
                                                        className="w-5 h-5 mt-1 sm:mt-0 text-accent border-gray-300 rounded focus:ring-accent accent-accent"
                                                    />
                                                    <div className="ml-4 flex-1">
                                                        <span className={`block font-semibold text-sm ${checked ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                                            {servicio.nombre}
                                                        </span>
                                                        {servicio.descripcion && (
                                                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                {servicio.descripcion}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-semibold text-sm text-gray-900 dark:text-white ml-4 whitespace-nowrap">
                                                        {servicio.precio} <span className="text-xs font-normal text-gray-500">{servicio.moneda}/día</span>
                                                    </div>
                                                </label>

                                                {checked && (
                                                    <DaySelector 
                                                        periodos={[periodo]}
                                                        periodosSeleccionadosIds={[periodo.id_programa_periodo]}
                                                        fechasSeleccionadas={svcSel.fechas}
                                                        onChange={(fechas) => handleDailyFechasChange(servicio.idProgramaServicio, periodo.id_programa_periodo, fechas)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECCIÓN 2: Servicios Únicos (Samarreta/Camisetas, etc.) ── */}
            {serviciosUnicos.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-card-border">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                            <ShieldCheck className="w-4 h-4 text-purple-500" />
                            Servicios Únicos
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Estos servicios se contratan una sola vez para todo el periodo de inscripción.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {serviciosUnicos.map(servicio => {
                            const svcSel = participante.servicios.find(s => 
                                s.id_programa_servicio === servicio.idProgramaServicio && 
                                s.id_programa_periodo === null
                            );
                            const checked = !!svcSel;
                            const camposExtra = getCamposExtra(getConfigJson(servicio));

                            return (
                                <div 
                                    key={servicio.idProgramaServicio}
                                    className={`p-5 border rounded-xl transition-all bg-white dark:bg-card-bg ${
                                        checked ? 'border-accent shadow-sm ring-1 ring-accent/10' : 'border-gray-200 dark:border-card-border hover:border-gray-300 dark:hover:border-gray-700'
                                    }`}
                                >
                                    <label className="flex items-start sm:items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={checked} 
                                            onChange={() => handleUniqueServiceToggle(servicio.idProgramaServicio)}
                                            className="w-5 h-5 mt-1 sm:mt-0 text-accent border-gray-300 rounded focus:ring-accent accent-accent"
                                        />
                                        <div className="ml-4 flex-1">
                                            <span className={`block font-semibold text-sm ${checked ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                                {servicio.nombre}
                                            </span>
                                            {servicio.descripcion && (
                                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {servicio.descripcion}
                                                </span>
                                            )}
                                        </div>
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white ml-4 whitespace-nowrap">
                                            {servicio.precio > 0 ? `+${servicio.precio} ${servicio.moneda}` : 'Gratis'}
                                        </div>
                                    </label>

                                    {checked && camposExtra.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                                            <h6 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                Datos requeridos para el servicio
                                            </h6>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {camposExtra.map((campo) => {
                                                    const valor = svcSel.campos_extra?.[campo.codigo] || '';
                                                    
                                                    return (
                                                        <div key={campo.codigo} className="space-y-1.5">
                                                            {campo.tipo !== 'BOOLEAN' && (
                                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                    {campo.label} {campo.obligatorio && <span className="text-red-500">*</span>}
                                                                </label>
                                                            )}

                                                            {campo.tipo === 'SELECT' ? (
                                                                <select
                                                                    value={valor}
                                                                    onChange={(e) => handleUniqueCampoExtraChange(servicio.idProgramaServicio, campo.codigo, e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                                                >
                                                                    <option value="">-- Seleccionar --</option>
                                                                    {campo.opciones?.map((opc) => (
                                                                        <option key={opc} value={opc}>
                                                                            {opc}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : campo.tipo === 'BOOLEAN' ? (
                                                                <div className="flex items-center gap-2 pt-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${participante._clientId}-${campo.codigo}`}
                                                                        checked={valor === 'true'}
                                                                        onChange={(e) => handleUniqueCampoExtraChange(servicio.idProgramaServicio, campo.codigo, e.target.checked ? 'true' : 'false')}
                                                                        className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                                                                    />
                                                                    <label htmlFor={`${participante._clientId}-${campo.codigo}`} className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                                        {campo.label} {campo.obligatorio && <span className="text-red-500">*</span>}
                                                                    </label>
                                                                </div>
                                                            ) : campo.tipo === 'NUMBER' ? (
                                                                <input
                                                                    type="number"
                                                                    value={valor}
                                                                    onChange={(e) => handleUniqueCampoExtraChange(servicio.idProgramaServicio, campo.codigo, e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={valor}
                                                                    onChange={(e) => handleUniqueCampoExtraChange(servicio.idProgramaServicio, campo.codigo, e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
