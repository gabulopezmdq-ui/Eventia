import { LogOut } from 'lucide-react';

interface Props {
    totalRetiros: number;
}

export default function RetirosSummaryCard({ totalRetiros }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Total */}
            <div className="border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <LogOut className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">Total Retiros Hoy</span>
                </div>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                    {totalRetiros}
                </p>
            </div>
        </div>
    );
}
