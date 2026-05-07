import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, AutorizadoRetiro } from '../../types/inscripcion.types';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

interface Props {
    participante: Participante;
}

const FIELD_CLASS = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none';
const LABEL_CLASS = 'text-xs font-medium text-gray-700 dark:text-gray-300';

export function TabRetiro({ participante }: Props) {
    const { actualizarParticipante } = useInscripcion();

    const autorizados = participante.autorizados_retiro;

    const handleChange = (
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

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Autorizados de Retiro *
                </h4>
                <p className="text-sm text-gray-500">
                    ¿Quiénes están autorizados a retirar al niño/a al finalizar la jornada?
                    <br />
                    <span className="text-red-500 font-medium">Requerido al menos 1.</span>
                </p>
            </div>

            {autorizados.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-gray-500 text-sm mb-4">No hay personas autorizadas cargadas.</p>
                    <button
                        type="button"
                        onClick={handleAgregar}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar autorizado
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {autorizados.map((aut, index) => (
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
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Nombre completo *</label>
                                    <input
                                        type="text"
                                        value={aut.nombre_autorizado}
                                        onChange={e => handleChange(index, 'nombre_autorizado', e.target.value)}
                                        className={FIELD_CLASS}
                                        placeholder="Nombre y apellido"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Teléfono *</label>
                                    <input
                                        type="tel"
                                        value={aut.telefono_autorizado}
                                        onChange={e => handleChange(index, 'telefono_autorizado', e.target.value)}
                                        className={FIELD_CLASS}
                                        placeholder="+54 9 11..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Relación (Tío, Abuela, etc.)</label>
                                    <input
                                        type="text"
                                        value={aut.relacion}
                                        onChange={e => handleChange(index, 'relacion', e.target.value)}
                                        className={FIELD_CLASS}
                                        placeholder="Parentesco o vínculo"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Observaciones</label>
                                    <input
                                        type="text"
                                        value={aut.observaciones}
                                        onChange={e => handleChange(index, 'observaciones', e.target.value)}
                                        className={FIELD_CLASS}
                                        placeholder="Contraseña de retiro, etc."
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
                        <Plus className="w-4 h-4" /> Agregar otro autorizado
                    </button>
                </div>
            )}
        </div>
    );
}
