'use client';

import { useState } from 'react';
import { login } from './auth.service';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg bg-neutral-800 p-3 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Contraseña"
                className="w-full rounded-lg bg-neutral-800 p-3 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white text-black py-3 font-medium disabled:opacity-50"
            >
                {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
        </form>
    );
}
