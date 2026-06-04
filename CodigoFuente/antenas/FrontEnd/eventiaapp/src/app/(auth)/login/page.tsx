'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { login } from '@/src/features/auth/auth.service';
import { GoogleSignInButton } from '@/src/features/auth/GoogleSignInButton';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { joinStaff } from '@/src/features/staff/staff.service';
import { useStaffAuth, isEventActiveToday, StaffAuthProvider } from '@/src/context/StaffAuthContext';
import {
    solicitarRecuperacionMiEventia,
    validarRecuperacionMiEventia,
    regenerarCodigoMiEventia,
    guardarTokenPortal,
} from '@/src/features/portal/portal.service';
import { useToast } from '@/src/context/ToastContext';

export default function LoginPage() {
    return (
        <StaffAuthProvider>
            <Suspense fallback={
                <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </StaffAuthProvider>
    );
}

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();

    // Contexto de Staff
    const { token: staffToken, login: staffLogin, isLoading: staffLoading, user: staffUser, activeRol: staffActiveRol } = useStaffAuth();

    // Tab activa
    const [activeTab, setActiveTab] = useState<'organizador' | 'staff' | 'invitado'>('organizador');

    // Estados de organizador (originales)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Estados para invitación (B2B original)
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteData, setInviteData] = useState<{
        nombre_cuenta: string;
        email_invitado: string;
        rol_codigo: string;
    } | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteToken, setInviteToken] = useState<string | null>(null);

    // Estados para el modal de invitación (B2B original)
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [acceptingInvite, setAcceptingInvite] = useState(false);
    const [acceptSuccess, setAcceptSuccess] = useState(false);

    // Estados de Staff
    const [staffCodigo, setStaffCodigo] = useState('');
    const [staffSubmitting, setStaffSubmitting] = useState(false);
    const [staffError, setStaffError] = useState<string | null>(null);

    // Estados de Invitado
    const [guestStep, setGuestStep] = useState<'INPUT_EMAIL' | 'INPUT_OTP'>('INPUT_EMAIL');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestCodigo, setGuestCodigo] = useState('');
    const [guestTokenRecuperacion, setGuestTokenRecuperacion] = useState<string | null>(null);
    const [guestSubmitting, setGuestSubmitting] = useState(false);
    const [guestError, setGuestError] = useState<string | null>(null);

    // Detectar tab y tokens desde la URL al montar o cambiar params
    useEffect(() => {
        const queryTab = searchParams.get('tab');
        if (queryTab === 'staff') {
            setActiveTab('staff');
        } else if (queryTab === 'invitado' || queryTab === 'guest') {
            setActiveTab('invitado');
        } else if (queryTab === 'organizador') {
            setActiveTab('organizador');
        }

        const tokenQuery = searchParams.get('token') || searchParams.get('token_recuperacion');
        if (tokenQuery) {
            const isGuestRecovery = searchParams.has('token_recuperacion') || queryTab === 'invitado';
            if (isGuestRecovery) {
                setActiveTab('invitado');
                setGuestTokenRecuperacion(tokenQuery);
                setGuestStep('INPUT_OTP');
            }
        }
    }, [searchParams]);

    // Redirección de Staff si ya tiene sesión iniciada
    useEffect(() => {
        if (activeTab === 'staff' && !staffLoading && staffToken && staffUser) {
            const allEvents = staffUser.eventosDisponibles || [];
            const activeEvents = allEvents.filter(e => isEventActiveToday(e));

            if (activeEvents.length === 0 || activeEvents.length > 1) {
                if (!staffUser.idEvento) {
                    router.replace('/staff/seleccionar-evento');
                    return;
                }
            }

            if (staffUser.rolesEvento && staffUser.rolesEvento.length > 1 && !staffActiveRol) {
                router.replace('/staff/seleccionar-funcion');
            } else {
                router.replace('/staff/home');
            }
        }
    }, [activeTab, staffLoading, staffToken, staffUser, staffActiveRol, router]);

    // Validación de invitación (B2B original)
    useEffect(() => {
        const queryToken = searchParams.get('token');
        if (activeTab !== 'organizador') return;

        const storedToken = sessionStorage.getItem('eventia_invite_token');
        const token = queryToken || storedToken;
        if (!token) return;

        setInviteToken(token);

        const validate = async () => {
            setInviteLoading(true);
            setInviteError(null);
            try {
                const res = await fetch(`/api/cuenta_usuarios/ValidarInvitacion?token=${token}`);
                const data = await res.json();
                if (res.ok && data.valida) {
                    setInviteData(data);
                    setEmail(data.email_invitado);
                    sessionStorage.setItem('eventia_invite_token', token);
                    sessionStorage.setItem('eventia_invite_data', JSON.stringify(data));
                } else {
                    setInviteError(data.mensaje || 'La invitación es inválida o ha expirado.');
                    sessionStorage.removeItem('eventia_invite_token');
                    sessionStorage.removeItem('eventia_invite_data');
                }
            } catch (err) {
                setInviteError('No se pudo validar la invitación.');
            } finally {
                setInviteLoading(false);
            }
        };

        validate();
    }, [searchParams, activeTab]);

    const proceedRedirection = async (forcedSelectedCuentaId?: number) => {
        const flow = sessionStorage.getItem('eventia_flow');
        sessionStorage.removeItem('eventia_flow');

        try {
            const meRes = await fetch('/api/auth/me');
            if (meRes.ok) {
                const me = await meRes.json();
                const espacios = me.espacios ?? [];
                const hasActiveToken = inviteToken || sessionStorage.getItem('eventia_invite_token') || forcedSelectedCuentaId;
                
                if (espacios.length > 1) {
                    window.location.href = '/dashboard/select-space';
                    return;
                }

                if (flow === 'cuenta' || hasActiveToken) {
                    const estadoUI = me.cuenta?.estado_ui;
                    if (estadoUI === 'CUENTA_ACTIVA' || estadoUI === 'CUENTA_PENDIENTE') {
                        window.location.href = '/dashboard/cuenta';
                        return;
                    } else {
                        window.location.href = '/dashboard/cuenta/solicitar';
                        return;
                    }
                }
            }
        } catch (err) {
            console.error('Error al verificar espacios en el login:', err);
        }

        if (flow === 'b2c') {
            window.location.href = '/dashboard/events/new';
            return;
        }

        window.location.href = '/dashboard';
    };

    const handleAcceptInvitation = async () => {
        const activeToken = inviteToken || sessionStorage.getItem('eventia_invite_token');
        if (!activeToken) return;

        setAcceptingInvite(true);
        setError(null);

        try {
            const acceptRes = await fetch('/api/cuenta_usuarios/AceptarInvitacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: activeToken }),
            });
            
            if (acceptRes.ok) {
                const acceptData = await acceptRes.json();
                if (acceptData.id_cuenta) {
                    localStorage.setItem('eventia_selected_cuenta_id', String(acceptData.id_cuenta));
                }
                
                setAcceptSuccess(true);
                sessionStorage.removeItem('eventia_invite_token');
                sessionStorage.removeItem('eventia_invite_data');

                setTimeout(async () => {
                    await proceedRedirection(acceptData.id_cuenta);
                }, 1500);
            } else {
                const errData = await acceptRes.json();
                setError(errData.message || 'Error al vincular con la cuenta corporativa.');
                setShowAcceptModal(false);
            }
        } catch (err) {
            console.error('Error en la llamada a AceptarInvitacion:', err);
            setError('Error al vincular con la cuenta corporativa.');
            setShowAcceptModal(false);
        } finally {
            setAcceptingInvite(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login({ email, password });
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }

            const activeToken = inviteToken || sessionStorage.getItem('eventia_invite_token');
            if (activeToken) {
                setShowAcceptModal(true);
                setLoading(false);
                return;
            }

            await proceedRedirection();
        } catch (err) {
            if (inviteData) {
                setError('Email o contraseña incorrectos. Si todavía no creaste tu cuenta, por favor registrate primero usando el botón de arriba.');
            } else {
                setError('Email o contraseña incorrectos');
            }
            setLoading(false);
        }
    };

    // Control de formulario Staff
    const handleStaffInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 10) val = val.substring(0, 10);
        setStaffCodigo(val);
        setStaffError(null);
    };

    const handleStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (staffCodigo.length < 4) {
            setStaffError('El código debe tener al menos 4 caracteres.');
            return;
        }

        setStaffSubmitting(true);
        setStaffError(null);

        try {
            const joinResponse = await joinStaff(staffCodigo);
            staffLogin(joinResponse);
            
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
            setStaffError(err.message ?? 'Código inválido o expirado.');
        } finally {
            setStaffSubmitting(false);
        }
    };

    // Control de formulario Invitado (Mi-Eventia)
    const handleGuestSolicitar = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailTrimmed = guestEmail.trim().toLowerCase();
        if (!emailTrimmed || !emailTrimmed.includes('@')) {
            setGuestError('Por favor ingresá un correo electrónico válido.');
            return;
        }

        setGuestSubmitting(true);
        setGuestError(null);

        try {
            const res = await solicitarRecuperacionMiEventia(emailTrimmed);
            if (res.ok) {
                addToast(res.mensaje || 'Si tu email está registrado, te enviaremos las instrucciones.', 'success');
                if (res.token_recuperacion) {
                    setGuestTokenRecuperacion(res.token_recuperacion);
                }
                setGuestStep('INPUT_OTP');
            }
        } catch (err: any) {
            setGuestError(err instanceof Error ? err.message : 'Error al enviar la solicitud.');
        } finally {
            setGuestSubmitting(false);
        }
    };

    const handleGuestValidar = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeTrimmed = guestCodigo.trim();

        if (!guestTokenRecuperacion) {
            setGuestError('Falta el token de recuperación. Vuelve a iniciar el proceso.');
            setGuestStep('INPUT_EMAIL');
            return;
        }

        if (codeTrimmed.length !== 6) {
            setGuestError('El código debe tener 6 dígitos.');
            return;
        }

        setGuestSubmitting(true);
        setGuestError(null);

        try {
            const res = await validarRecuperacionMiEventia(guestTokenRecuperacion, codeTrimmed);
            if (res.ok) {
                addToast('¡Identidad validada con éxito!', 'success');
                guardarTokenPortal(res.token_portal);
                
                if (res.url_mi_eventia.startsWith('http://') || res.url_mi_eventia.startsWith('https://') || res.url_mi_eventia.startsWith('//')) {
                    window.location.href = res.url_mi_eventia;
                } else {
                    router.push(res.url_mi_eventia);
                }
            }
        } catch (err: any) {
            setGuestError(err instanceof Error ? err.message : 'El código de recuperación es incorrecto o venció.');
        } finally {
            setGuestSubmitting(false);
        }
    };

    const handleRegenerarCodigo = async () => {
        setGuestSubmitting(true);
        setGuestError(null);
        try {
            const res = await regenerarCodigoMiEventia(guestEmail.trim().toLowerCase());
            if (res.ok) {
                addToast('Te enviamos un nuevo código a tu correo.', 'success');
                if (res.token_recuperacion) {
                    setGuestTokenRecuperacion(res.token_recuperacion);
                }
            }
        } catch (err: any) {
            setGuestError(err instanceof Error ? err.message : 'Error al regenerar código.');
        } finally {
            setGuestSubmitting(false);
        }
    };

    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl border border-neutral-800 animate-in fade-in zoom-in-95 duration-300">
            {/* Header dinámico */}
            <div className="text-center mb-6">
                {activeTab === 'organizador' && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Tus eventos siguen vivos acá
                        </p>
                    </>
                )}
                {activeTab === 'staff' && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Portal de Staff
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Ingresá tu código de acceso para ver tus eventos asignados.
                        </p>
                    </>
                )}
                {activeTab === 'invitado' && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Acceder a Mi-Eventia
                        </h1>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            {guestStep === 'INPUT_EMAIL'
                                ? 'Ingresá tu correo para recuperar el acceso a tus inscripciones.'
                                : 'Ingresá el código de 6 dígitos que enviamos a tu bandeja de correo.'}
                        </p>
                    </>
                )}
            </div>

            {/* Selector de Pestañas (Tabs) */}
            <div className="flex border-b border-neutral-800 mb-6 p-1 bg-neutral-950/60 rounded-xl">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('organizador');
                        router.replace('/login?tab=organizador');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'organizador'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    Organizador
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('staff');
                        router.replace('/login?tab=staff');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'staff'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    Personal Staff
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('invitado');
                        router.replace('/login?tab=invitado');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'invitado'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    Invitado
                </button>
            </div>

            {/* Contenido según Pestaña Activa */}

            {/* 1. Tab Organizador */}
            {activeTab === 'organizador' && (
                <>
                    {inviteLoading && (
                        <div className="mb-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center gap-3 animate-pulse">
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                            <span className="text-xs text-indigo-400 font-medium">Validando invitación a cuenta B2B...</span>
                        </div>
                    )}

                    {inviteData && !inviteLoading && (
                        <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs leading-relaxed flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <div className="w-full">
                                <p className="font-bold text-white mb-1">¡Tenés una invitación activa!</p>
                                <p>Te invitaron a sumarte a la cuenta <strong className="text-indigo-300 font-semibold">{inviteData.nombre_cuenta}</strong>.</p>
                                <p className="mt-1 text-[11px] text-neutral-400">Ingresá con el email <span className="underline decoration-indigo-400/50">{inviteData.email_invitado}</span> para aceptar.</p>
                                
                                <div className="mt-3 pt-2.5 border-t border-indigo-500/10 flex flex-col gap-1.5">
                                    <p className="font-bold text-indigo-300">¿Es tu primera vez en Eventia?</p>
                                    <p className="text-neutral-400 text-[11px]">Si aún no estás registrado o no tenés contraseña, primero debes crear tu cuenta.</p>
                                    <Link 
                                        href={`/register?invite=account&token=${inviteToken}`}
                                        className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition w-fit mt-1 cursor-pointer font-bold"
                                    >
                                        Registrarme ahora
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {inviteError && !inviteLoading && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-white mb-1">Invitación inválida</p>
                                <p>{inviteError}</p>
                                <p className="mt-1 text-[11px] text-neutral-400">Por favor, solicitá un nuevo enlace al administrador de la cuenta.</p>
                            </div>
                        </div>
                    )}

                    <GoogleSignInButton 
                        text="signin" 
                        onSuccess={async () => {
                            const activeToken = inviteToken || sessionStorage.getItem('eventia_invite_token');
                            if (activeToken) {
                                setShowAcceptModal(true);
                            } else {
                                await proceedRedirection();
                            }
                        }}
                    />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-neutral-900 px-4 text-neutral-500">o ingresá con email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    if (!inviteData) {
                                        setEmail(e.target.value);
                                    }
                                    if (error) setError(null);
                                }}
                                readOnly={!!inviteData}
                                required
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                    inviteData 
                                        ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-400 cursor-not-allowed select-none' 
                                        : 'bg-neutral-800 border-neutral-700 placeholder:text-neutral-500'
                                }`}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(null);
                                }}
                                required
                                className="w-full pl-10 pr-12 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-white hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ingresar</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-neutral-500 text-sm mt-6">
                        ¿No tenés cuenta?{' '}
                        <Link
                            href={inviteToken ? `/register?invite=account&token=${inviteToken}` : '/register'}
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Registrate gratis
                        </Link>
                    </p>
                </>
            )}

            {/* 2. Tab Staff */}
            {activeTab === 'staff' && (
                <form onSubmit={handleStaffSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={staffCodigo}
                            onChange={handleStaffInput}
                            placeholder="Ej: X8Y2Z1"
                            className="w-full px-6 py-4 text-center text-3xl font-mono tracking-[0.2em] font-bold text-indigo-400 bg-neutral-950 border border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase text-white placeholder:text-neutral-700"
                            autoComplete="off"
                            spellCheck="false"
                        />
                        <div className="flex justify-between items-center px-1 text-xs text-neutral-500">
                            <span>Solo letras y números</span>
                            <span className={staffCodigo.length >= 4 ? 'text-green-500' : ''}>
                                {staffCodigo.length} car.
                            </span>
                        </div>
                    </div>

                    {staffError && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl border border-red-500/20 text-left">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {staffError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={staffSubmitting || staffCodigo.length < 4}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
                    >
                        {staffSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                        {staffSubmitting ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            )}

            {/* 3. Tab Invitado */}
            {activeTab === 'invitado' && (
                <>
                    {guestStep === 'INPUT_EMAIL' ? (
                        <form onSubmit={handleGuestSolicitar} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="input-email-recuperar" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                                    <input
                                        id="input-email-recuperar"
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => { setGuestEmail(e.target.value); setGuestError(null); }}
                                        placeholder="ejemplo@correo.com"
                                        autoComplete="email"
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                                    />
                                </div>
                            </div>

                            {guestError && (
                                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="font-medium text-xs leading-snug">{guestError}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={guestSubmitting || !guestEmail}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm cursor-pointer"
                            >
                                {guestSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                ) : (
                                    <><ShieldCheck className="w-4 h-4" /> Solicitar enlace de acceso <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleGuestValidar} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Código de seguridad (OTP)
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={guestCodigo}
                                    onChange={(e) => {
                                        setGuestCodigo(e.target.value.replace(/\D/g, ''));
                                        setGuestError(null);
                                    }}
                                    placeholder="000000"
                                    autoFocus
                                    className="w-full text-center tracking-[1em] text-lg font-bold py-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            {guestError && (
                                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="font-medium text-xs leading-snug">{guestError}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setGuestStep('INPUT_EMAIL');
                                        setGuestCodigo('');
                                        setGuestError(null);
                                    }}
                                    className="flex-1 py-3 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold rounded-xl transition text-sm text-center cursor-pointer"
                                >
                                    Cambiar correo
                                </button>
                                <button
                                    type="submit"
                                    disabled={guestSubmitting || guestCodigo.length !== 6}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {guestSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                                    ) : (
                                        'Ingresar'
                                    )}
                                </button>
                            </div>
                            </div>
                        </form>
                    )}
                </>
            )}

            {/* ═══ MODAL INTERACTIVO DE CONFIRMACIÓN DE INVITACIÓN (B2B original) ═══ */}
            {showAcceptModal && inviteData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md mx-4 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
                        {acceptSuccess ? (
                            <div className="space-y-4 py-4 animate-in zoom-in-90 duration-300">
                                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/35 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                                    <Check className="w-10 h-10 animate-bounce" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white">¡Bienvenido al Equipo!</h3>
                                    <p className="text-neutral-400 text-sm">
                                        Te vinculaste exitosamente a la cuenta <strong className="text-indigo-400 font-semibold">{inviteData.nombre_cuenta}</strong>.
                                    </p>
                                </div>
                                <p className="text-xs text-neutral-500 animate-pulse pt-2">
                                    Ingresando al panel de control...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                                    <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">¡Ingreso Exitoso!</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">
                                        Estás a un clic de sumarte a la cuenta corporativa de <br />
                                        <strong className="text-white text-base font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full inline-block mt-2">
                                            {inviteData.nombre_cuenta}
                                        </strong>
                                    </p>
                                    <div className="text-xs text-neutral-500 mt-2 bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl inline-flex flex-col gap-1 items-center">
                                        <span>Rol que se te asignará:</span>
                                        <span className="font-bold text-indigo-300 uppercase tracking-widest text-[10px]">
                                            {inviteData.rol_codigo === 'ACCOUNT_ADMIN' ? 'Administrador de Cuenta' : 'Colaborador (Staff)'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={handleAcceptInvitation}
                                        disabled={acceptingInvite}
                                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {acceptingInvite ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Vinculando cuenta...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Aceptar Invitación y Entrar</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setShowAcceptModal(false);
                                            await proceedRedirection();
                                        }}
                                        disabled={acceptingInvite}
                                        className="w-full py-3 rounded-xl border border-neutral-800 text-neutral-500 hover:text-neutral-300 text-xs font-semibold hover:bg-neutral-800/50 transition cursor-pointer"
                                    >
                                        Omitir por ahora (Ir a mi espacio personal)
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
