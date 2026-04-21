'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { getMiPerfil, updateMiPerfil, PerfilData } from '@/src/features/perfil/perfil.service';
import { UserCircle, Save, Mail, Calendar, ShieldCheck, Loader2 } from 'lucide-react';

export default function MiPerfilPage() {
    const { authMe, loading: authLoading } = useAuth();
    const [perfil, setPerfil] = useState<PerfilData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form fields
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [pais, setPais] = useState('');

    useEffect(() => {
        if (authLoading) return;

        getMiPerfil()
            .then(data => {
                setPerfil(data);
                setNombre(data.nombre || '');
                setApellido(data.apellido || '');
                setTelefono(data.telefono || '');
                setPais(data.pais || '');
            })
            .catch(err => {
                console.error(err);
                // Fallback para al menos mostrar el email de authContext si falla el backend
                if (authMe) {
                   setPerfil({
                       email: authMe.email,
                       nombre: '',
                       apellido: '',
                       telefono: '',
                       pais: '',
                   });
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [authLoading, authMe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        try {
            await updateMiPerfil({
                nombre,
                apellido,
                telefono,
                pais,
            });
            setSuccessMsg('Perfil actualizado correctamente.');

            // Ocultar mensaje de exito luego de unos segundos
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError('Error al intentar guardar los cambios. Por favor, intente de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-indigo-600" />
                    Mi Perfil
                </h1>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                    Administrá tu información personal y cómo te comunicás con Eventia.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Tarjetas Informativas */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Access Card */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                            Datos de Acceso
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                                </label>
                                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                    {perfil?.email}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Nivel de Acceso
                                </label>
                                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                                    {authMe?.rol || 'Usuario'}
                                </p>
                            </div>

                            {perfil?.fecha_alta && (
                                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Miembro desde
                                    </label>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {formatDate(perfil.fecha_alta)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-4">
                            Resumen de Actividad
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {authMe?.eventos?.cantidad_propios || 0}
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                    Eventos Propios
                                </p>
                            </div>
                            <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {authMe?.eventos?.cantidad_compartidos || 0}
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                    Colaboraciones
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="lg:col-span-2">
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-start"
                    >
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                            Información Personal
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-2">
                                <label htmlFor="nombre" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Nombre
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. Juan"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="apellido" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Apellido
                                </label>
                                <input
                                    id="apellido"
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    placeholder="Ej. Pérez"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="telefono" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Teléfono Móvil
                                </label>
                                <input
                                    id="telefono"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="+54 9 11 1234-5678"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="pais" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    País de Residencia
                                </label>
                                <select
                                    id="pais"
                                    value={pais}
                                    onChange={(e) => setPais(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-neutral-900 dark:text-white appearance-none"
                                >
                                    <option value="" disabled>Seleccione un país</option>
                                    <option value="AR">Argentina</option>
                                    <option value="CL">Chile</option>
                                    <option value="UY">Uruguay</option>
                                    <option value="MX">México</option>
                                    <option value="ES">España</option>
                                    <option value="OT">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* Mensajes de Feedback */}
                        {error && (
                            <div className="mt-6 w-full p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="mt-6 w-full p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {successMsg}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 w-full flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex flex-shrink-0 items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-md shadow-indigo-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
