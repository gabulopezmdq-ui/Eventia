'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Loader2,
    Mail,
    ArrowLeft,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    Sparkles,
    LayoutDashboard,
} from 'lucide-react';
import {
    solicitarRecuperacionMiEventia,
    validarRecuperacionMiEventia,
    guardarTokenPortal,
} from '@/src/features/portal/portal.service';
import { useToast } from '@/src/context/ToastContext';

type RecoveryStep = 'INPUT_EMAIL' | 'INPUT_OTP';

function FormularioRecuperacion() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();

    // Leer tokens opcionales desde query parameters (ej: ?token=abc123xyz...)
    const tokenQuery = searchParams.get('token') || searchParams.get('token_recuperacion');

    const [step, setStep] = useState<RecoveryStep>('INPUT_EMAIL');
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [tokenRecuperacion, setTokenRecuperacion] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Si viene el token por la URL, saltamos directamente a pedir el código OTP
    useEffect(() => {
        if (tokenQuery) {
            setTokenRecuperacion(tokenQuery);
            setStep('INPUT_OTP');
            addToast('Código de recuperación detectado. Por favor ingresá el código de seguridad recibido.', 'info');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenQuery]);

    const handleSolicitar = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailTrimmed = email.trim().toLowerCase();

        if (!emailTrimmed || !emailTrimmed.includes('@')) {
            setError('Por favor ingresá un correo electrónico válido.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await solicitarRecuperacionMiEventia(emailTrimmed);
            if (res.ok) {
                addToast(res.mensaje || 'Si tu email está registrado, te enviaremos las instrucciones.', 'success');
                if (res.token_recuperacion) {
                    setTokenRecuperacion(res.token_recuperacion);
                }
                setStep('INPUT_OTP');
            }
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Error al enviar la solicitud.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleValidar = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeTrimmed = codigo.trim();

        if (!tokenRecuperacion) {
            setError('Falta el token de recuperación. Vuelve a iniciar el proceso.');
            setStep('INPUT_EMAIL');
            return;
        }

        if (codeTrimmed.length !== 6) {
            setError('El código debe tener 6 dígitos.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await validarRecuperacionMiEventia(tokenRecuperacion, codeTrimmed);
            if (res.ok) {
                addToast('¡Identidad validada con éxito!', 'success');
                
                // Guardar token persistente en localStorage
                guardarTokenPortal(res.token_portal);
                
                // Redirigir al dashboard persistente
                if (res.url_mi_eventia.startsWith('http://') || res.url_mi_eventia.startsWith('https://') || res.url_mi_eventia.startsWith('//')) {
                    window.location.href = res.url_mi_eventia;
                } else {
                    router.push(res.url_mi_eventia);
                }
            }
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'El código de recuperación es incorrecto o venció.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white dark:bg-card-bg rounded-3xl shadow-2xl border border-gray-200 dark:border-card-border overflow-hidden">
            {/* Header del formulario */}
            <div className="p-8 pb-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-5">
                    <LayoutDashboard className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Acceder a Mi-Eventia
                </h1>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                    {step === 'INPUT_EMAIL'
                        ? 'Ingresá tu correo para recuperar el acceso a todas tus inscripciones y pases del evento.'
                        : 'Ingresá el código de 6 dígitos que enviamos a tu bandeja de correo.'}
                </p>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="p-8 pt-0">
                {step === 'INPUT_EMAIL' ? (
                    <form onSubmit={handleSolicitar} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="input-email-recuperar" className="text-xs font-semibold text-muted uppercase tracking-wider">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                <input
                                    id="input-email-recuperar"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                    placeholder="ejemplo@correo.com"
                                    autoComplete="email"
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-3.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-card-border rounded-xl text-gray-900 dark:text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="font-medium text-xs leading-snug">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !email}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                            ) : (
                                <><ShieldCheck className="w-4 h-4" /> Solicitar enlace de acceso <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleValidar} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                                Código de seguridad (OTP)
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={codigo}
                                onChange={(e) => {
                                    setCodigo(e.target.value.replace(/\D/g, ''));
                                    setError(null);
                                }}
                                placeholder="000000"
                                autoFocus
                                className="w-full text-center tracking-[1em] text-lg font-bold py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-card-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="font-medium text-xs leading-snug">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('INPUT_EMAIL');
                                    setCodigo('');
                                    setError(null);
                                }}
                                className="flex-1 py-3.5 border border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-black/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition text-sm text-center"
                            >
                                Cambiar correo
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || codigo.length !== 6}
                                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                                ) : (
                                    'Ingresar'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function IngresarPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col justify-between relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            {/* Cabecera / Navegación */}
            <header className="max-w-4xl w-full mx-auto px-4 py-6 relative z-10">
                <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </button>
            </header>

            {/* Centro */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
                <Suspense fallback={
                    <div className="w-full max-w-md bg-white dark:bg-card-bg rounded-3xl border border-gray-200 dark:border-card-border p-12 text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="text-sm text-muted">Cargando...</p>
                    </div>
                }>
                    <FormularioRecuperacion />
                </Suspense>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 text-center text-xs text-muted relative z-10">
                <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Eventia Premium Access App</span>
                </div>
            </footer>
        </main>
    );
}
