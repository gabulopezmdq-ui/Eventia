import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, AutorizadoRetiro, ModalidadRetiro } from '../../types/inscripcion.types';
import { Plus, Trash2, ShieldCheck, UserPlus, Info, CheckCircle2, UserCheck } from 'lucide-react';

interface Props {
    participante: Participante;
}

const FIELD_CLASS = 'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all';
const LABEL_CLASS = 'text-xs font-medium text-gray-700 dark:text-gray-300';

export function TabRetiro({ participante }: Props) {
    const { state, actualizarParticipante } = useInscripcion();
    const { responsable } = state;

    const autorizados = participante.autorizados_retiro;
    const modalidad = participante.modalidad_retiro;

    const handleModalidadChange = (valor: ModalidadRetiro) => {
        // Si no es REQUIERE_AUTORIZADO, vaciamos la lista de personas autorizadas
        const nuevosAut = valor === 'REQUIERE_AUTORIZADO' ? (autorizados.length > 0 ? autorizados : []) : [];
        actualizarParticipante(participante._clientId, {
            modalidad_retiro: valor,
            autorizados_retiro: nuevosAut
        });
    };

    const handleChangeAutorizado = (
        index: number,
        campo: keyof AutorizadoRetiro,
        valor: string
    ) => {
        const nuevos = [...autorizados];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        actualizarParticipante(participante._clientId, { autorizados_retiro: nuevos });
    };

    const handleEliminar = (index: number) => {
        const nuevos = autorizados.filter((_, i) => i !== index);
        actualizarParticipante(participante._clientId, { autorizados_retiro: nuevos });
    };

    const handleAgregar = () => {
        const nuevo: AutorizadoRetiro = {
            nombre_autorizado: '',
            telefono_autorizado: '',
            relacion: '',
            observaciones: '',
        };
        actualizarParticipante(participante._clientId, {
            autorizados_retiro: [...autorizados, nuevo],
        });
    };

    // Autocompletar con los datos del responsable
    const handleAutocompletarResponsable = () => {
        if (!responsable.nombre) {
            alert('Debe completar primero los datos del responsable.');
            return;
        }

        const nombreCompleto = `${responsable.nombre} ${responsable.apellido || ''}`.trim();

        // Evitar duplicados del responsable
        const yaExiste = autorizados.some(
            a => a.nombre_autorizado.toLowerCase() === nombreCompleto.toLowerCase()
        );
        if (yaExiste) {
            alert('El responsable ya está en la lista de autorizados.');
            return;
        }

        const nuevo: AutorizadoRetiro = {
            nombre_autorizado: nombreCompleto,
            telefono_autorizado: responsable.telefono || '',
            relacion: responsable.relacion || 'Responsable',
            observaciones: 'Responsable de la inscripción',
        };
        actualizarParticipante(participante._clientId, {
            autorizados_retiro: [...autorizados, nuevo],
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Modalidad de Retiro Header */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Modalidad de Retiro
                </h4>
                <p className="text-xs text-gray-500">
                    Definí cómo se retirará el participante al finalizar la jornada del casal.
                </p>
            </div>

            {/* Selector de Modalidad */}
            <div className="space-y-2">
                <label className={LABEL_CLASS}>Seleccionar Modalidad *</label>
                <select
                    value={modalidad || ''}
                    onChange={e => handleModalidadChange(e.target.value as ModalidadRetiro)}
                    className={FIELD_CLASS}
                >
                    <option value="">-- Elegir modalidad --</option>
                    <option value="REQUIERE_AUTORIZADO">Lo retira una persona autorizada</option>
                    <option value="SE_RETIRA_SOLO">Se retira solo/a</option>
                    <option value="NO_APLICA">No aplica</option>
                </select>
            </div>

            {/* Renderizado Condicional de Personas Autorizadas */}
            {modalidad === 'REQUIERE_AUTORIZADO' && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                                Personas Autorizadas a Retirar
                            </h5>
                            <p className="text-xs text-gray-500">
                                Debe agregar al menos una persona con nombre y teléfono.
                            </p>
                        </div>

                        {responsable.nombre && (
                            <button
                                type="button"
                                onClick={handleAutocompletarResponsable}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent px-3 py-2 rounded-lg transition-colors self-start"
                            >
                                <UserCheck className="w-3.5 h-3.5" />
                                Autocompletar con mis datos
                            </button>
                        )}
                    </div>

                    {autorizados.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/5 rounded-2xl">
                            <p className="text-red-800 dark:text-red-400 text-sm font-semibold mb-3">
                                ⚠ No hay personas autorizadas cargadas
                            </p>
                            <button
                                type="button"
                                onClick={handleAgregar}
                                className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80"
                            >
                                <Plus className="w-4 h-4" /> Agregar primer autorizado
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {autorizados.map((aut, index) => (
                                <div
                                    key={index}
                                    className="p-5 bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-card-border relative animate-in zoom-in-95 duration-200"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleEliminar(index)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                                        aria-label="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-6">
                                        <div className="space-y-1.5">
                                            <label className={LABEL_CLASS}>Nombre completo *</label>
                                            <input
                                                type="text"
                                                required
                                                value={aut.nombre_autorizado}
                                                onChange={e => handleChangeAutorizado(index, 'nombre_autorizado', e.target.value)}
                                                className={FIELD_CLASS}
                                                placeholder="Nombre y apellido"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={LABEL_CLASS}>Teléfono *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={aut.telefono_autorizado}
                                                onChange={e => handleChangeAutorizado(index, 'telefono_autorizado', e.target.value)}
                                                className={FIELD_CLASS}
                                                placeholder="+34600111222"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={LABEL_CLASS}>Relación (Tío, Abuela, etc.)</label>
                                            <input
                                                type="text"
                                                value={aut.relacion}
                                                onChange={e => handleChangeAutorizado(index, 'relacion', e.target.value)}
                                                className={FIELD_CLASS}
                                                placeholder="Parentesco o vínculo"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={LABEL_CLASS}>Observaciones / Notas</label>
                                            <input
                                                type="text"
                                                value={aut.observaciones}
                                                onChange={e => handleChangeAutorizado(index, 'observaciones', e.target.value)}
                                                className={FIELD_CLASS}
                                                placeholder="Lunes y miércoles, solo con documento..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAgregar}
                                className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Agregar otro autorizado
                            </button>
                        </div>
                    )}
                </div>
            )}

            {modalidad && modalidad !== 'REQUIERE_AUTORIZADO' && (
                <div className="p-5 rounded-2xl bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-800/40 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                    <Info className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                            Modalidad Seleccionada: {modalidad === 'SE_RETIRA_SOLO' ? 'Se retira solo/a' : 'No aplica'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Bajo esta modalidad, no es obligatorio declarar personas autorizadas a retirar al participante.
                            El sistema generará el token y QR de control del responsable principal de manera automática al confirmar.
                        </p>
                    </div>
                </div>
            )}

            {!modalidad && (
                <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/20 text-center text-xs text-gray-500">
                    Por favor, seleccioná una modalidad de retiro para continuar con la validación de esta pestaña.
                </div>
            )}
        </div>
    );
}
