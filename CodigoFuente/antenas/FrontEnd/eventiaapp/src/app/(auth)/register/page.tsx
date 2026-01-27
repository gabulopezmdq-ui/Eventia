'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/src/features/auth/auth.service';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await register(form);
            router.replace('/login');
        } catch {
            setError('No se pudo completar el registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-md mx-auto mt-16">
            <h1 className="text-2xl font-semibold mb-6">
                Crear cuenta
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="nombre"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-neutral-800"
                />

                <input
                    name="apellido"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-neutral-800"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-neutral-800"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-neutral-800"
                />

                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Creando cuenta…' : 'Registrarme'}
                </button>
            </form>
        </section>
    );
}
