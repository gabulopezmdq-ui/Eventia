'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/src/features/auth/auth.service';
import { GoogleSignInButton } from '@/src/features/auth/GoogleSignInButton';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login({ email, password });
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }
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
                            setEmail(e.target.value);
                            if (error) setError(null);
                        }}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

                {/* Forgot password link */}
                {/*<div className="flex justify-end">
                    <button
                        type="button"
                        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>*/}

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
