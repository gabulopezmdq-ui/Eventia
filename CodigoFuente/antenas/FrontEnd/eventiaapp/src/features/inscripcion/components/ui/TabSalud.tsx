import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante } from '../../types/inscripcion.types';

export function TabSalud({ participante }: { participante: Participante }) {
    const { actualizarParticipante } = useInscripcion();

    const handleChangeSalud = (field: string, value: string) => {
        actualizarParticipante(participante._clientId, {
            salud: { ...participante.salud, [field]: value }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grupo Sanguíneo</label>
                    <input 
                        type="text" 
                        placeholder="Ej. A+, O-"
                        value={participante.salud?.grupo_sanguineo || ''} 
                        onChange={e => handleChangeSalud('grupo_sanguineo', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alergias</label>
                    <input 
                        type="text" 
                        placeholder="Ej. Penicilina, Maní"
                        value={participante.salud?.alergias || ''} 
                        onChange={e => handleChangeSalud('alergias', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medicación actual</label>
                    <input 
                        type="text" 
                        placeholder="Detalle medicación (si no toma, dejar en blanco)"
                        value={participante.salud?.medicacion || ''} 
                        onChange={e => handleChangeSalud('medicacion', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones médicas</label>
                    <textarea 
                        placeholder="Cualquier información de salud relevante para los monitores..."
                        value={participante.salud?.observaciones || ''} 
                        onChange={e => handleChangeSalud('observaciones', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
