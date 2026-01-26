'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { getMyEvents } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';

export default function DashboardEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMyEvents()
            .then(setEvents)
            .catch(() => setError('No se pudieron cargar los eventos'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Mis eventos
                </h1>

                <Link
                    href="/dashboard/events/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Crear evento
                </Link>
            </header>

            {/* Loading */}
            {loading && (
                <p className="text-neutral-400">
                    Cargando eventos…
                </p>
            )}

            {/* Error */}
            {error && (
                <p className="text-red-400">
                    {error}
                </p>
            )}

            {/* Empty state */}
            {!loading && !error && events.length === 0 && (
                <div className="p-8 rounded-xl border border-dashed border-neutral-800 text-center">
                    <p className="text-neutral-400 mb-4">
                        Todavía no tenés eventos creados.
                    </p>

                    <Link
                        href="/dashboard/events/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Crear mi primer evento
                    </Link>
                </div>
            )}

            {/* Events list */}
            {!loading && !error && events.length > 0 && (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <Link
                            key={event.id_evento}
                            href={`/dashboard/events/${event.id_evento}`}
                            className="block"
                        >
                            <article
                                className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-lg">
                                            {event.anfitriones_texto}
                                        </h3>

                                        <p className="text-sm text-neutral-400">
                                            {event.lugar}
                                        </p>
                                    </div>

                                    <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-300">
                                        {new Date(event.fecha_hora).toLocaleDateString()}
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
