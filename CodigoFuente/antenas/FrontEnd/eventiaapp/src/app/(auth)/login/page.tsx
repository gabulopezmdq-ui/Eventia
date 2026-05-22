'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { login } from '@/src/features/auth/auth.service';
import { GoogleSignInButton } from '@/src/features/auth/GoogleSignInButton';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl text-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Estados para invitación
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteData, setInviteData] = useState<{
        nombre_cuenta: string;
        email_invitado: string;
        rol_codigo: string;
    } | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteToken, setInviteToken] = useState<string | null>(null);

    useEffect(() => {
        const queryToken = searchParams.get('token');
        const isInviteFlow = searchParams.get('invite') === 'account' || !!queryToken;
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
                    // Limpiamos sessionStorage si no es válido
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
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login({ email, password });
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }

            // Si hay un token de invitación activo, lo aceptamos
            const activeToken = inviteToken || sessionStorage.getItem('eventia_invite_token');
            if (activeToken) {
                try {
                    const acceptRes = await fetch('/api/cuenta_usuarios/AceptarInvitacion', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: activeToken }),
                    });
                    
                    if (acceptRes.ok) {
                        const acceptData = await acceptRes.json();
                        // Guardar la nueva cuenta B2B como la seleccionada para ingresar de una!
                        if (acceptData.id_cuenta) {
                            localStorage.setItem('eventia_selected_cuenta_id', String(acceptData.id_cuenta));
                        }
                        
                        // Limpiar sessionStorage de invitaciones
                        sessionStorage.removeItem('eventia_invite_token');
                        sessionStorage.removeItem('eventia_invite_data');
                    } else {
                        const errData = await acceptRes.json();
                        // Si el error indica que el email es incorrecto u otro error, se lo mostramos al usuario
                        setError(errData.message || 'Error al vincular con la cuenta corporativa.');
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('Error en la llamada a AceptarInvitacion:', err);
                }
            }

            // ── Redirección inteligente según flow del registro o multi-cuenta ──
            const flow = sessionStorage.getItem('eventia_flow');
            sessionStorage.removeItem('eventia_flow'); // consumir una sola vez

            try {
                const meRes = await fetch('/api/auth/me');
                if (meRes.ok) {
                    const me = await meRes.json();
                    
                    // Si el usuario tiene múltiples espacios de trabajo, redirigir al selector
                    const espacios = me.espacios ?? [];
                    if (espacios.length > 1) {
                        window.location.href = '/dashboard/select-space';
                        return;
                    }

                    // Si solo tiene un espacio y el flujo es cuenta (B2B)
                    if (flow === 'cuenta' || activeToken) {
                        const estadoUI = me.cuenta?.estado_ui;
                        if (estadoUI === 'CUENTA_ACTIVA') {
                            window.location.href = '/dashboard/cuenta';
                            return;
                        } else if (estadoUI === 'CUENTA_PENDIENTE') {
                            window.location.href = '/dashboard/cuenta';
                            return;
                        } else {
                            // SIN_CUENTA → solicitar
                            window.location.href = '/dashboard/cuenta/solicitar';
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error('Error al verificar espacios en el login:', err);
            }

            if (flow === 'b2c') {
                // B2C: ir directo a crear evento
                window.location.href = '/dashboard/events/new';
                return;
            }

            // Default: dashboard general
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Email o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-white mb-2">
                    Bienvenido de nuevo
                </h1>
                <p className="text-neutral-400">
                    Tus eventos siguen vivos acá
                </p>
            </div>

            {/* Banner de invitación */}
            {inviteLoading && (
                <div className="mb-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center gap-3 animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-indigo-400 font-medium">Validando invitación a cuenta B2B...</span>
                </div>
            )}

            {inviteData && !inviteLoading && (
                <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs leading-relaxed flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-white mb-1">¡Tenés una invitación activa!</p>
                        <p>Te invitaron a sumarte a la cuenta <strong className="text-indigo-300 font-semibold">{inviteData.nombre_cuenta}</strong>.</p>
                        <p className="mt-1 text-[11px] text-neutral-400">Ingresá con el email <span className="underline decoration-indigo-400/50">{inviteData.email_invitado}</span> para aceptar.</p>
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

            {/* Google Sign In - Primero para mejor conversión */}
            <GoogleSignInButton text="signin" />

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-neutral-900 px-4 text-neutral-500">o ingresá con email</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
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

                {/* Password con toggle visibility */}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-white hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
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

            {/* Footer */}
            <p className="text-center text-neutral-500 text-sm mt-6">
                ¿No tenés cuenta?{' '}
                <Link
                    href="/register"
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                    Registrate gratis
                </Link>
            </p>
        </div>
    );
}
