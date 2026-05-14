'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffAuth } from '@/src/context/StaffAuthContext';
import { CheckCircle2, CalendarRange, Clock, MapPin, Loader2 } from 'lucide-react';
import { getEventosAccesibles } from '@/src/features/staff/staff.service';
import { StaffEvento } from '@/src/features/staff/types';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CheckinSuccessPage({ params }: PageProps) {
    const { token, user, isLoading } = useStaffAuth();
    const router = useRouter();

    const [eventoId, setEventoId] = useState<string | null>(null);
    const [evento, setEvento] = useState<StaffEvento | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        // Resolve promise from params
        params.then(p => setEventoId(p.id));
    }, [params]);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/staff/login');
        }
    }, [isLoading, token, router]);

    useEffect(() => {
        if (!user || !token || !eventoId) return;

        const fetchEventoInfo = async () => {
            try {
                // Buscamos de nuevo la lista de eventos para encontrar la info del evento de este checkin
                // Podríamos tener un endpoint getEventoById público o del staff, pero con la lista ya alcanza
                let data: StaffEvento[] = [];
                if (user.rolCodigo === 'PROPIETARIO') {
                    data = await getEventosAccesibles('personal', { staffId: user.idStaff }, token);
                } else {
                    const unidadesIds = user.unidades.map(u => u.id_unidad);
                    if (unidadesIds.length > 0) {
                        data = await getEventosAccesibles('cuenta', { cuentaId: user.idCuenta, unidades: unidadesIds }, token);
                    }
                }
                
                const found = data.find(e => e.id_evento === Number(eventoId));
                if (found) {
                    setEvento(found);
                }
            } catch (err) {
                console.error('Error al cargar info del evento:', err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchEventoInfo();
    }, [user, token, eventoId]);

    const currentTime = new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (isLoading || loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500">Cargando confirmación...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-green-500/10 p-8 text-center relative overflow-hidden">
                
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200 dark:border-green-500/30">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                        ¡Check-in exitoso!
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                        Tu presencia fue registrada correctamente para el evento.
                    </p>

                    {evento ? (
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 mb-8 text-left space-y-4 border border-neutral-100 dark:border-neutral-800">
                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
                                {evento.nombre}
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                    <MapPin className="w-4 h-4 text-neutral-400" />
                                    <span>{evento.unidad}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                    <CalendarRange className="w-4 h-4 text-neutral-400" />
                                    <span>
                                        {new Date(evento.fecha_inicio).toLocaleDateString('es-AR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 p-2.5 rounded-xl border border-green-100 dark:border-green-500/20">
                                    <Clock className="w-4 h-4" />
                                    <span>Hora de registro: {currentTime} hs</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-semibold rounded-2xl mb-8 border border-green-100 dark:border-green-500/20">
                            <Clock className="w-5 h-5" />
                            <span>Hora de registro: {currentTime} hs</span>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/staff/eventos')}
                        className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-2xl shadow-sm transition-colors"
                    >
                        Volver a mis eventos
                    </button>
                </div>
            </div>
        </div>
    );
}
