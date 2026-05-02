import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, AutorizadoRetiro } from '../../types/inscripcion.types';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

interface Props {
    participante: Participante;
}

export function TabRetiro({ participante }: Props) {
    const { actualizarParticipante } = useInscripcion();

    const handleChangeAutorizado = (index: number, campo: keyof AutorizadoRetiro, valor: string) => {
        const nuevos = [...participante.autorizados_retiro];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        actualizarParticipante(participante._clientId, { autorizados_retiro: nuevos });
    };

    const handleEliminarAutorizado = (index: number) => {
        const nuevos = participante.autorizados_retiro.filter((_, i) => i !== index);
        actualizarParticipante(participante._clientId, { autorizados_retiro: nuevos });
    };

    const handleAgregarAutorizado = () => {
        const nuevo: AutorizadoRetiro = { nombre: '', apellido: '', documento: '', relacion: '', telefono: '' };
        actualizarParticipante(participante._clientId, { 
            autorizados_retiro: [...participante.autorizados_retiro, nuevo] 
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Autorizados de Retiro
                </h4>
                <p className="text-sm text-gray-500">¿Quiénes están autorizados a retirar al niño/a al finalizar la jornada?</p>
            </div>

            {participante.autorizados_retiro.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-card-border rounded-xl">
                    <p className="text-gray-500 text-sm mb-4">No hay personas autorizadas cargadas.</p>
                    <button 
                        onClick={handleAgregarAutorizado}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar autorizado
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {participante.autorizados_retiro.map((aut, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-card-border relative">
                            <button 
                                onClick={() => handleEliminarAutorizado(index)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                                    <input 
                                        type="text"
                                        value={aut.nombre}
                                        onChange={e => handleChangeAutorizado(index, 'nombre', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Apellido *</label>
                                    <input 
                                        type="text"
                                        value={aut.apellido}
                                        onChange={e => handleChangeAutorizado(index, 'apellido', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Documento / Pasaporte *</label>
                                    <input 
                                        type="text"
                                        value={aut.documento}
                                        onChange={e => handleChangeAutorizado(index, 'documento', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Relación (Tío, Abuela, etc.)</label>
                                    <input 
                                        type="text"
                                        value={aut.relacion}
                                        onChange={e => handleChangeAutorizado(index, 'relacion', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Teléfono (opcional)</label>
                                    <input 
                                        type="tel"
                                        value={aut.telefono}
                                        onChange={e => handleChangeAutorizado(index, 'telefono', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={handleAgregarAutorizado}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                    >
                        <Plus className="w-4 h-4" /> Agregar otro autorizado
                    </button>
                </div>
            )}
        </div>
    );
}
