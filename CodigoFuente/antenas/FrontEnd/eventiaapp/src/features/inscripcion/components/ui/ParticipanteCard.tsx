import { useState } from 'react';
import type { Participante } from '../../types/inscripcion.types';
import { useInscripcion } from '../../hooks/useInscripcion';
import { TabSemanas } from './TabSemanas';
import { TabServicios } from './TabServicios';
import { TabSalud } from './TabSalud';
import { TabAlimentacion } from './TabAlimentacion';
import { TabRetiro } from './TabRetiro';
import { Trash2, Calendar, LayoutGrid, Activity, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { getParticipanteBadges } from '../../hooks/useInscripcionValida';

interface Props {
    participante: Participante;
}

export function ParticipanteCard({ participante }: Props) {
    const { quitarParticipante } = useInscripcion();
    const [tabActiva, setTabActiva] = useState<'semanas' | 'servicios' | 'alimentacion' | 'salud' | 'retiro'>('semanas');

    const handleEliminar = () => {
        if (confirm(`¿Seguro que querés eliminar a ${participante.nombre}?`)) {
            quitarParticipante(participante._clientId);
        }
    };

    const badges = getParticipanteBadges(participante);

    const tabs = [
        { id: 'semanas', label: 'Semanas', icon: Calendar },
        { id: 'servicios', label: 'Servicios', icon: LayoutGrid },
        { id: 'alimentacion', label: 'Alimentación', icon: UtensilsCrossed },
        { id: 'salud', label: 'Salud', icon: Activity },
        { id: 'retiro', label: 'Retiros', icon: ShieldCheck },
    ] as const;

    return (
        <div className="bg-white dark:bg-card-bg rounded-xl border border-gray-200 dark:border-card-border shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-card-border bg-gray-50/50 dark:bg-black/20 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">👦👧</span>
                    {participante.nombre} {participante.apellido}
                </h3>
                <button 
                    onClick={handleEliminar}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Eliminar"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="border-b border-gray-200 dark:border-card-border flex overflow-x-auto hide-scrollbar">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActiva = tabActiva === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setTabActiva(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                                ${isActiva 
                                    ? 'border-accent text-accent' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {badges[tab.id] === 'warn' && (
                                <span className="w-2 h-2 rounded-full bg-red-500 ml-1" title="Información requerida" />
                            )}
                            {badges[tab.id] === 'ok' && (
                                <span className="w-2 h-2 rounded-full bg-green-500 ml-1" title="Completo" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="p-6">
                {tabActiva === 'semanas' && <TabSemanas participante={participante} />}
                {tabActiva === 'servicios' && <TabServicios participante={participante} />}
                {tabActiva === 'alimentacion' && <TabAlimentacion participante={participante} />}
                {tabActiva === 'salud' && <TabSalud participante={participante} />}
                {tabActiva === 'retiro' && <TabRetiro participante={participante} />}
            </div>
        </div>
    );
}
