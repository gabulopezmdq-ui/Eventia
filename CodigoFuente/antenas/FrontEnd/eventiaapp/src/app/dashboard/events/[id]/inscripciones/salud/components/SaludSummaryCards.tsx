import { SaludPanelResponse } from '@/src/features/inscripcion/types/salud.types';
import { Stethoscope, BellRing, Pill, ClipboardList } from 'lucide-react';

interface Props {
    items: SaludPanelResponse[];
}

export default function SaludSummaryCards({ items }: Props) {
    const totalProblemasMedicos = items.filter(x => x.tiene_problema_medico).length;
    const totalAlertas = items.filter(x => x.alerta_visual).length;
    const totalMedicaciones = items.filter(x => x.tiene_medicacion).length;
    const totalSeguimientos = items.filter(x => x.requiere_seguimiento).length;

    const cards = [
        {
            label: 'Problemas médicos',
            value: totalProblemasMedicos,
            icon: Stethoscope,
            color: 'red',
        },
        {
            label: 'Participantes c/ Alertas',
            value: totalAlertas,
            icon: BellRing,
            color: 'amber',
        },
        {
            label: 'Con Medicación',
            value: totalMedicaciones,
            icon: Pill,
            color: 'blue',
        },
        {
            label: 'Con Seguimiento',
            value: totalSeguimientos,
            icon: ClipboardList,
            color: 'violet',
        },
    ];

    const colorMap: Record<string, { border: string; iconColor: string; labelColor: string; valueColor: string }> = {
        red: {
            border: 'border-red-500/20',
            iconColor: 'text-red-500',
            labelColor: 'text-red-600 dark:text-red-400',
            valueColor: 'text-red-700 dark:text-red-300',
        },
        amber: {
            border: 'border-amber-500/20',
            iconColor: 'text-amber-500',
            labelColor: 'text-amber-600 dark:text-amber-400',
            valueColor: 'text-amber-700 dark:text-amber-300',
        },
        blue: {
            border: 'border-blue-500/20',
            iconColor: 'text-blue-500',
            labelColor: 'text-blue-600 dark:text-blue-400',
            valueColor: 'text-blue-700 dark:text-blue-300',
        },
        violet: {
            border: 'border-violet-500/20',
            iconColor: 'text-violet-500',
            labelColor: 'text-violet-600 dark:text-violet-400',
            valueColor: 'text-violet-700 dark:text-violet-300',
        },
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {cards.map(({ label, value, icon: Icon, color }) => {
                const c = colorMap[color];
                return (
                    <div key={label} className={`border ${c.border} rounded-2xl p-5 flex flex-col justify-between`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-5 h-5 ${c.iconColor}`} />
                            <span className={`${c.labelColor} font-bold text-sm uppercase tracking-wider`}>{label}</span>
                        </div>
                        <p className={`text-3xl font-black ${c.valueColor}`}>{value}</p>
                    </div>
                );
            })}
        </div>
    );
}
