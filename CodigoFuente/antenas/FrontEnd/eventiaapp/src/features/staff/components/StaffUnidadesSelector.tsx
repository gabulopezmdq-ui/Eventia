'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getMisUnidades, Unidad } from '@/src/features/cuenta/cuenta.service';

interface StaffUnidadesSelectorProps {
    value: number[];
    onChange: (unidades: number[]) => void;
}

export function StaffUnidadesSelector({ value, onChange }: StaffUnidadesSelectorProps) {
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMisUnidades(true)
            .then(setUnidades)
            .catch(() => setUnidades([]))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (idUnidad: number) => {
        if (value.includes(idUnidad)) {
            onChange(value.filter(id => id !== idUnidad));
        } else {
            onChange([...value, idUnidad]);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando unidades...
            </div>
        );
    }

    if (unidades.length === 0) {
        return (
            <div className="text-sm text-neutral-500 italic">
                No hay unidades activas en esta cuenta.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            {unidades.map(u => {
                const isSelected = value.includes(u.id_unidad);
                return (
                    <label
                        key={u.id_unidad}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10' 
                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-sky-300'
                        }`}
                    >
                        <div className="flex items-center h-5">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggle(u.id_unidad)}
                                className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-sm font-medium ${isSelected ? 'text-sky-900 dark:text-sky-100' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                {u.nombre}
                            </span>
                            {u.codigo && (
                                <span className={`text-xs ${isSelected ? 'text-sky-600/80 dark:text-sky-300/80' : 'text-neutral-400'}`}>
                                    {u.codigo}
                                </span>
                            )}
                        </div>
                    </label>
                );
            })}
        </div>
    );
}
