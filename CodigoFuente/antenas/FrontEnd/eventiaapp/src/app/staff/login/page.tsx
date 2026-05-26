'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { joinStaff } from '@/src/features/staff/staff.service';
import { useStaffAuth, isEventActiveToday } from '@/src/context/StaffAuthContext';

export default function StaffLoginPage() {
    const { token, login, isLoading, user, activeRol } = useStaffAuth();
    const router = useRouter();

    const [codigo, setCodigo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && token && user) {
            const allEvents = user.eventosDisponibles || [];
            const activeEvents = allEvents.filter(e => isEventActiveToday(e));

            if (activeEvents.length === 0 || activeEvents.length > 1) {
                if (!user.idEvento) {
                    router.replace('/staff/seleccionar-evento');
                    return;
                }
            }

            if (user.rolesEvento && user.rolesEvento.length > 1 && !activeRol) {
                router.replace('/staff/seleccionar-funcion');
            } else if (activeRol) {
                router.replace('/staff/home');
            } else {
                router.replace('/staff/home');
            }
        }
    }, [isLoading, token, user, activeRol, router]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Acepta entre 4 y 10 caracteres alfanuméricos (flexible según backend)
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 10) val = val.substring(0, 10);
        setCodigo(val);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (codigo.length < 4) {
            setError('El código debe tener al menos 4 caracteres.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const joinResponse = await joinStaff(codigo);
            login(joinResponse); // Pasa el objeto completo al contexto
            
            const allEvents = joinResponse.eventos_disponibles || [];
            const activeEvents = allEvents.filter(e => isEventActiveToday(e));

            if (activeEvents.length === 1) {
                const singleEvent = activeEvents[0];
                if (singleEvent.roles_evento && singleEvent.roles_evento.length === 1) {
                    router.push('/staff/home');
                } else {
                    router.push('/staff/seleccionar-funcion');
                }
            } else {
                router.push('/staff/seleccionar-evento');
            }
        } catch (err: any) {
            setError(err.message ?? 'Código inválido o expirado.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading || token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">Verificando sesión...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-neutral-200 dark:border-neutral-800 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Portal de Staff
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                    Ingresá tu código de acceso para ver tus eventos asignados.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={codigo}
                            onChange={handleInput}
                            placeholder="Ej: X8Y2Z1"
                            className="w-full px-6 py-4 text-center text-3xl font-mono tracking-[0.2em] font-bold text-indigo-600 dark:text-indigo-400 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase"
                            autoComplete="off"
                            spellCheck="false"
                        />
                        <div className="flex justify-between items-center px-1 text-xs text-neutral-400">
                            <span>Solo letras y números</span>
                            <span className={codigo.length >= 4 ? 'text-green-500' : ''}>
                                {codigo.length} car.
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-500/20 text-left">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || codigo.length < 4}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                        {submitting ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            </div>

            <p className="text-xs text-neutral-400 mt-8">
                &copy; {new Date().getFullYear()} Eventia. Todos los derechos reservados.
            </p>
        </div>
    );
}
