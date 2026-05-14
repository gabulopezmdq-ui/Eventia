'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, ScanLine } from 'lucide-react';
import { useStaffAuth } from '@/src/context/StaffAuthContext';

export default function StaffUnidadesPage() {
    const { token, user, isLoading } = useStaffAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/staff/login');
        }
    }, [isLoading, token, router]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500">Cargando tus puestos...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                    Puestos de Trabajo
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Hola <strong>{user.nombre}</strong>, acá tenés los sectores en los que estás asignado. Seleccioná el puesto en el que vas a operar.
                </p>
            </div>

            {user.unidades.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <MapPin className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        Sin puestos asignados
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                        No tenés ningún sector o unidad asignada. Por favor, comunícate con tu administrador.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.unidades.map(unidad => (
                        <button 
                            key={unidad.id_unidad}
                            onClick={() => {
                                // TODO: Redirigir al flujo de escaneo o trabajo
                                alert(`Iniciar jornada en: ${unidad.nombre}`);
                            }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all text-left flex flex-col justify-between group"
                        >
                            <div className="flex items-start justify-between w-full mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                                        <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        {unidad.nombre}
                                    </h3>
                                </div>
                            </div>

                            <div className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-indigo-600 group-hover:text-white text-neutral-700 dark:text-neutral-300 font-bold rounded-2xl transition-colors">
                                <ScanLine className="w-5 h-5" />
                                <span>Operar en este puesto</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
