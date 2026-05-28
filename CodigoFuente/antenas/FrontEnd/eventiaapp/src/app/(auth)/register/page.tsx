'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { register } from '@/src/features/auth/auth.service';
import { GoogleSignInButton } from '@/src/features/auth/GoogleSignInButton';
import { 
    User, 
    Mail, 
    Lock, 
    ArrowRight, 
    Eye, 
    EyeOff, 
    Briefcase, 
    Star, 
    PartyPopper, 
    Building2, 
    HelpCircle, 
    Sparkles, 
    AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl text-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Query params context
    const flow = searchParams.get('flow'); // 'b2c' | 'cuenta'
    const plan = searchParams.get('plan'); // 'FREE', 'PRO', etc.
    const isB2B = flow === 'cuenta';

    // Si no viene ?flow= en la URL, el usuario debe elegir manualmente
    const [selectedFlow, setSelectedFlow] = useState<string>(flow || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    // Estados para invitación
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteData, setInviteData] = useState<{
        nombre_cuenta: string;
        email_invitado: string;
        rol_codigo: string;
    } | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteToken, setInviteToken] = useState<string | null>(null);

    const [form, setForm] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
    });

    useEffect(() => {
        const queryToken = searchParams.get('token');
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
                    setForm(f => ({ ...f, email: data.email_invitado }));
                    setSelectedFlow('cuenta'); // Si viene por invitación, es flujo corporativo
                    sessionStorage.setItem('eventia_invite_token', token);
                    sessionStorage.setItem('eventia_invite_data', JSON.stringify(data));
                } else {
                    setInviteError(data.mensaje || 'La invitación es inválida o ha expirado.');
                }
            } catch (err) {
                setInviteError('No se pudo validar la invitación.');
            } finally {
                setInviteLoading(false);
            }
        };

        validate();
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        // Limpiar error al escribir
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validación básica de contraseña
        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            await register(form);

            // Flujo A: si el usuario vino de la landing con un plan elegido,
            // lo guardamos para que el wizard de Nuevo Evento lo pre-seleccione
            if (plan) {
                localStorage.setItem('eventia_plan_seleccionado', plan);
            }

            // Guardar el flow elegido para que el login haga la redirección inteligente
            const finalFlow = inviteData ? 'cuenta' : (flow || selectedFlow || 'b2c');
            sessionStorage.setItem('eventia_flow', finalFlow);

            setSuccess(true);
            setTimeout(() => {
                router.replace('/login');
            }, 2000);
        } catch {
            setError('No se pudo completar el registro. Intenta con otro email.');
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de éxito
    if (success) {
        return (
            <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">
                    ¡Cuenta creada!
                </h1>
                <p className="text-neutral-400 mb-4">
                    Redirigiendo al login...
                </p>
                <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-indigo-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl">
            {/* Header / Context */}
            <div className="text-center mb-8 space-y-2">
                {plan && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2 animate-bounce">
                        <Star className="w-3 h-3" /> Plan {plan} Seleccionado
                    </div>
                )}

                <h1 className="text-2xl font-semibold text-white">
                    {inviteData ? (
                        <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                            Invitación de Cuenta
                        </span>
                    ) : isB2B || selectedFlow === 'cuenta' ? (
                        <span className="flex items-center justify-center gap-2">
                            <Briefcase className="w-6 h-6 text-indigo-500" />
                            Cuenta profesional
                        </span>
                    ) : (
                        'Crear cuenta'
                    )}
                </h1>
                <p className="text-neutral-400 text-sm">
                    {inviteData
                        ? `Sumate al equipo de ${inviteData.nombre_cuenta}`
                        : isB2B || selectedFlow === 'cuenta'
                        ? 'Gestioná tus unidades y eventos corporativos'
                        : 'Empezá a organizar tus eventos hoy mismo'
                    }
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
                        <p>Registrate para sumarte a la cuenta <strong className="text-indigo-300 font-semibold">{inviteData.nombre_cuenta}</strong>.</p>
                        <p className="mt-1 text-[11px] text-neutral-400">Registrate usando el email precargado <span className="underline decoration-indigo-400/50">{inviteData.email_invitado}</span>.</p>
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

            {/* Google Sign Up - Primero para mejor conversión */}
            <GoogleSignInButton text="signup" />

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-neutral-900 px-4 text-neutral-500">o registrate con email</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* ═══ Combo "¿Cómo querés empezar?" (solo si no viene ?flow= ni por invitación) ═══ */}
                {!flow && !inviteData && (
                    <div className="mb-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                            <HelpCircle className="w-3 h-3" />
                            ¿Cómo querés empezar en Eventia?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {([
                                { value: 'b2c', label: 'Quiero crear mi evento', icon: PartyPopper, color: 'indigo' },
                                { value: 'cuenta', label: 'Tengo un salón o empresa', icon: Building2, color: 'emerald' },
                            ] as const).map(({ value, label, icon: Icon, color }) => {
                                const isSelected = selectedFlow === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSelectedFlow(value)}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                                            isSelected
                                                ? `border-${color}-500 bg-${color}-500/10`
                                                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            isSelected ? `bg-${color}-500/20` : 'bg-neutral-700'
                                        }`}>
                                            <Icon className={`w-4 h-4 ${isSelected ? `text-${color}-400` : 'text-neutral-400'}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${
                                            isSelected ? `text-${color}-300` : 'text-neutral-300'
                                        }`}>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-2 ml-0.5">
                            Podrás usar ambas opciones más adelante con el mismo usuario.
                        </p>
                    </div>
                )}

                {/* Nombre y Apellido en una fila */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            name="nombre"
                            placeholder="Nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            name="apellido"
                            placeholder="Apellido"
                            value={form.apellido}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
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
                        name="password"
                        placeholder="Contraseña (mín. 6 caracteres)"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
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
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Creando cuenta...</span>
                        </>
                    ) : (
                        <>
                            <span>Crear cuenta</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-neutral-500 text-sm mt-6">
                ¿Ya tenés cuenta?{' '}
                <Link
                    href={inviteToken ? `/login?invite=account&token=${inviteToken}` : '/login'}
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                    Iniciá sesión
                </Link>
            </p>
        </div>
    );
}
