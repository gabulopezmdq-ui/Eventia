'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CalendarRange, MapPin, CheckCircle2 } from 'lucide-react';
import { useStaffAuth } from '@/src/context/StaffAuthContext';
import { getEventosAccesibles, registrarCheckin } from '@/src/features/staff/staff.service';
import { StaffEvento } from '@/src/features/staff/types';

export default function StaffEventosPage() {
    const { token, user, isLoading } = useStaffAuth();
    const router = useRouter();

    const [eventos, setEventos] = useState<StaffEvento[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingIn, setCheckingIn] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/staff/login');
        }
    }, [isLoading, token, router]);

    useEffect(() => {
        if (!user || !token) return;

        const loadEventos = async () => {
            setLoadingData(true);
            setError(null);
            try {
                let data: StaffEvento[] = [];
                
                if (user.role === 'STAFF_PROPIETARIO') {
                    // El propietario/organizador ve eventos asociados explícitamente a su usuario
                    // (aunque idealmente vería todos los de la cuenta, según la regla usa "personal")
                    data = await getEventosAccesibles('personal', { staffId: user.idStaff }, token);
                } else {
                    // Los demás roles ven eventos de las unidades que tienen asignadas
                    const unidadesIds = user.unidades.map((u: { id_unidad: number }) => u.id_unidad);
                    if (unidadesIds.length > 0) {
                        data = await getEventosAccesibles('cuenta', { 
                            cuentaId: user.idCuenta, 
                            unidades: unidadesIds 
                        }, token);
                    }
                }
                
                setEventos(data);
            } catch (err: any) {
                setError(err.message ?? 'No se pudieron cargar los eventos.');
            } finally {
                setLoadingData(false);
            }
        };

        loadEventos();
    }, [user, token]);

    const handleCheckin = async (idEvento: number) => {
        if (!token) return;
        setCheckingIn(idEvento);
        try {
            await registrarCheckin(idEvento, token);
            // Redirigir a pantalla de éxito
            router.push(`/staff/checkin/${idEvento}`);
        } catch (err: any) {
            alert(err.message ?? 'No se pudo registrar la presencia. Intentá nuevamente.');
            setCheckingIn(null);
        }
    };

    if (isLoading || loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500">Cargando eventos...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                    Eventos Asignados
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Acá podés ver los eventos a los que tenés acceso según tus unidades. Registrá tu llegada presionando "Hacer Check-in".
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-500/30">
                    {error}
                </div>
            )}

            {eventos.length === 0 && !error ? (
                <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CalendarRange className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        Sin eventos próximos
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                        No tenés eventos asignados para el día de hoy en tus unidades. Si creés que es un error, consultá con tu administrador.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventos.map(evento => (
                        <div 
                            key={evento.id_evento} 
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div className="mb-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                                        {evento.nombre}
                                    </h3>
                                    {evento.estado && (
                                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg whitespace-nowrap">
                                            {evento.estado}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <CalendarRange className="w-4 h-4 shrink-0 text-indigo-500" />
                                        <span>
                                            {new Date(evento.fecha_inicio).toLocaleDateString('es-AR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} hs
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <MapPin className="w-4 h-4 shrink-0 text-indigo-500" />
                                        <span>{evento.unidad}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCheckin(evento.id_evento)}
                                disabled={checkingIn !== null}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {checkingIn === evento.id_evento ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                {checkingIn === evento.id_evento ? 'Registrando...' : 'Hacer Check-in'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
