'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin, Info, Clock } from 'lucide-react';

import { getEventById } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getEventById(id)
            .then(setEvent)
            .catch(() => setError('No se pudo cargar el detalle del evento'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-neutral-400">Cargando detalles del evento...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="space-y-4 text-center py-12">
                <p className="text-red-400">{error || 'Evento no encontrado'}</p>
                <Link href="/dashboard/events" className="text-indigo-400 hover:text-indigo-300">
                    Volver a mis eventos
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Navigation */}
            <header className="flex items-center gap-4">
                <Link
                    href="/dashboard/events"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">{event.anfitriones_texto}</h1>
                    <p className="text-neutral-400 text-sm">Detalles técnicos del evento</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <section className="md:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-neutral-200">Fecha y Hora</h3>
                                <p className="text-lg">
                                    {new Date(event.fecha_hora).toLocaleDateString('es-AR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="text-neutral-400">
                                    {new Date(event.fecha_hora).toLocaleTimeString('es-AR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })} hs
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-neutral-200">Ubicación</h3>
                                <p className="text-lg">{event.lugar || 'Lugar no especificado'}</p>
                                <p className="text-neutral-400">{event.direccion || 'Sin dirección registrada'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-neutral-400" />
                            Información adicional
                        </h3>
                        <div className="grid gap-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                <span className="text-neutral-400">Estado</span>
                                <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-200 uppercase tracking-wider text-[10px] font-bold">
                                    {event.estado === 'B' ? 'Borrador' : event.estado}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                <span className="text-neutral-400">Creado el</span>
                                <span>{new Date(event.fecha_alta).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                <span className="text-neutral-400">ID del Evento</span>
                                <span className="font-mono">{event.id_evento}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sidebar Info */}
                <aside className="space-y-6">
                    <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
                        <h4 className="font-medium mb-2">Acciones rápidas</h4>
                        <div className="space-y-3">
                            <button className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium">
                                Editar evento
                            </button>
                            <button className="w-full px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium border border-neutral-700">
                                Ver invitados
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
