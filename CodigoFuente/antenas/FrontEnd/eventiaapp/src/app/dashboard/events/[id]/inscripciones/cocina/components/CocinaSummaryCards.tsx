import { CocinaDiaResponse } from '@/src/features/inscripcion/types/cocina.types';
import { Users, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
    resumen: CocinaDiaResponse['resumen'];
}

export default function CocinaSummaryCards({ resumen }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Total */}
            <div className="border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">Total</span>
                </div>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                    {resumen.totalComedor}
                </p>
            </div>

            {/* Sin Restricciones */}
            <div className="border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">Sin Restricciones</span>
                </div>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                    {resumen.sinRestricciones}
                </p>
            </div>

            {/* Con Restricciones */}
            <div className="border border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">Especiales</span>
                </div>
                <p className="text-3xl font-black text-amber-700 dark:text-amber-300">
                    {resumen.conRestricciones}
                </p>
            </div>

            {/* Alertas */}
            <div className="border border-red-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wider">Alertas Rojas</span>
                </div>
                <p className="text-3xl font-black text-red-700 dark:text-red-300">
                    {resumen.alertasAltas}
                </p>
            </div>
        </div>
    );
}
