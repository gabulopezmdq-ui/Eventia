'use client';

import { useEffect, useState } from 'react';
import { getMisUnidades, Unidad } from '@/src/features/cuenta/cuenta.service';
import { Building2, Plus, Loader2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function UnidadesPage() {
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMisUnidades()
            .then(setUnidades)
            .catch(() => setError('No se pudieron cargar las unidades de negocio'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-emerald-600" />
                        Unidades de Negocio
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Gestioná las sedes o marcas bajo tu cuenta organizadora.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {error}
                </div>
            ) : unidades.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center">
                    <Building2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aún no hay unidades registradas.</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Las unidades te permiten organizar eventos en distintas locaciones.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unidades.map(unidad => (
                        <div key={unidad.id_unidad} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-emerald-300 transition-colors relative overflow-hidden group">
                            {unidad.es_principal && (
                                <div className="absolute top-0 right-0 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                    PRINCIPAL
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                                    <Building2 className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                                </div>
                                <div className="pt-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-white leading-tight pr-12">
                                        {unidad.nombre}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{unidad.ciudad || 'Ubicación no especificada'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    {unidad.activa ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Activa</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-neutral-400" />
                                            <span className="text-xs font-medium text-neutral-500">Inactiva</span>
                                        </>
                                    )}
                                </div>
                                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
