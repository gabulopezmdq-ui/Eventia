'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/src/features/events/event.service';
import type { CreateEventPayload } from '@/src/features/events/types';
import {
    Calendar,
    MapPin,
    Users,
    MessageSquare,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Clock,
    AlignLeft
} from 'lucide-react';
import MapPicker from '@/src/components/ui/MapPicker';

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<CreateEventPayload>({
        idTipoEvento: 1,
        fechaHora: '',
        anfitrionesTexto: '',
        lugar: '',
        direccion: '',
        latitud: 0,
        longitud: 0,
        saludo: '',
        mensajeBienvenida: '',
        notas: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
        setForm({
            ...form,
            direccion: location.address,
            latitud: location.lat,
            longitud: location.lng
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createEvent(form);
            router.push('/dashboard/events');
        } catch {
            setError('No se pudo crear el evento. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver a eventos</span>
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                        Crear Nuevo Evento
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">Completa los detalles para tu próxima gran experiencia</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Modo Pro</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Sections */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Sección: Información General */}
                    <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl transition-all hover:border-neutral-700/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-lg font-semibold">Información General</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Anfitriones</label>
                                <input
                                    name="anfitrionesTexto"
                                    placeholder="Nombre de los protagonistas"
                                    value={form.anfitrionesTexto}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-white outline-none placeholder:text-neutral-600"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Fecha y Hora</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            name="fechaHora"
                                            value={form.fechaHora}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-white outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Tipo de Evento</label>
                                    <select
                                        className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500/50 transition-all text-white outline-none appearance-none"
                                        defaultValue="1"
                                    >
                                        <option value="1">Boda / Casamiento</option>
                                        <option value="2">Cumpleaños</option>
                                        <option value="3">Evento Corporativo</option>
                                        <option value="4">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Ubicación */}
                    <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl transition-all hover:border-neutral-700/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <MapPin className="w-5 h-5 text-purple-400" />
                            </div>
                            <h2 className="text-lg font-semibold">Ubicación</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Lugar</label>
                                <input
                                    name="lugar"
                                    placeholder="Nombre del salón, quinta, etc."
                                    value={form.lugar}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-white outline-none placeholder:text-neutral-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Dirección Exacta</label>
                                <input
                                    name="direccion"
                                    placeholder="Calle, Número, Ciudad"
                                    value={form.direccion}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-white outline-none placeholder:text-neutral-600"
                                />
                                {/* 
                                <MapPicker
                                    onLocationSelect={handleLocationSelect}
                                    initialAddress={form.direccion}
                                    initialLat={form.latitud || undefined}
                                    initialLng={form.longitud || undefined}
                                />
                                */}
                            </div>
                        </div>
                    </div>

                    {/* Sección: Mensajes */}
                    <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl transition-all hover:border-neutral-700/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <MessageSquare className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-semibold">Mensajes del Evento</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">
                                    <Sparkles className="w-3 h-3" />
                                    Mensaje de Bienvenida
                                </label>
                                <textarea
                                    name="mensajeBienvenida"
                                    placeholder="Un mensaje cálido para tus invitados al abrir la invitación..."
                                    value={form.mensajeBienvenida}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-white outline-none placeholder:text-neutral-600 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1 block">
                                    Saludo / Dedicatoria
                                </label>
                                <textarea
                                    name="saludo"
                                    placeholder="Alguna frase especial o saludo final..."
                                    value={form.saludo}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-white outline-none placeholder:text-neutral-600 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Options */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/20 backdrop-blur-xl sticky top-28">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <AlignLeft className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="font-semibold italic">Resumen y Publicación</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-sm text-neutral-400 p-2 rounded-lg bg-white/5 border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                <span>Invitación Digital Activa</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-400 p-2 rounded-lg bg-white/5 border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                <span>Gestión de Invitados</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-400 p-2 rounded-lg bg-white/5 border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                <span>QR de Acceso</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Notas Internas</label>
                            <textarea
                                name="notas"
                                placeholder="Solo visibles para ti..."
                                value={form.notas}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 focus:border-indigo-500/50 transition-all text-sm text-neutral-300 outline-none placeholder:text-neutral-700 resize-none mb-6"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs mb-4 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4" />
                                        Crear Evento
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full py-4 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/50 font-medium text-sm transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}
