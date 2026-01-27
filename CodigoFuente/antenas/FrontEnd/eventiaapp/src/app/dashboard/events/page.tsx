'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ShieldCheck } from 'lucide-react';

import { getMyEvents, getAdminEvents, getCurrentUser } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';

export default function DashboardEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [adminEvents, setAdminEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminLoading, setAdminLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        // Obtener rol del usuario
        getCurrentUser()
            .then((user) => {
                if (user.rol === 'superadmin') {
                    setIsSuperAdmin(true);
                    // Cargar eventos de admin
                    setAdminLoading(true);
                    getAdminEvents()
                        .then(setAdminEvents)
                        .catch(() => setAdminError('No se pudieron cargar los eventos de administración'))
                        .finally(() => setAdminLoading(false));
                }
            })
            .catch(() => {
                // Si falla, el usuario no está logueado o el token es inválido
            });

        // Cargar mis eventos
        getMyEvents()
            .then(setEvents)
            .catch(() => setError('No se pudieron cargar los eventos'))
            .finally(() => setLoading(false));
    }, []);

    const EventCard = ({ event, isAdmin = false }: { event: Event; isAdmin?: boolean }) => (
        <Link
            key={event.id_evento}
            href={`/dashboard/events/${event.id_evento}`}
            className="block"
        >
            <article
                className={`p-5 rounded-xl border transition-colors ${isAdmin
                    ? 'border-amber-300 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-medium text-lg">
                            {event.anfitriones_texto}
                        </h3>

                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {event.lugar}
                        </p>
                    </div>

                    <span className={`text-xs px-2 py-1 rounded-full ${isAdmin
                        ? 'bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        }`}>
                        {new Date(event.fecha_hora).toLocaleDateString()}
                    </span>
                </div>
            </article>
        </Link>
    );

    return (
        <section className="space-y-8">
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

            {/* My Events list */}
            {!loading && !error && events.length > 0 && (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <EventCard key={event.id_evento} event={event} />
                    ))}
                </div>
            )}

            {/* Sección de Eventos de Admin (solo superadmin) */}
            {isSuperAdmin && (
                <div className="pt-6 border-t border-neutral-800">
                    <header className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-6 h-6 text-amber-500" />
                        <h2 className="text-xl font-semibold text-amber-100">
                            Eventos del Sistema (Admin)
                        </h2>
                    </header>

                    {/* Admin Loading */}
                    {adminLoading && (
                        <p className="text-neutral-400">
                            Cargando eventos de administración…
                        </p>
                    )}

                    {/* Admin Error */}
                    {adminError && (
                        <p className="text-red-400">
                            {adminError}
                        </p>
                    )}

                    {/* Admin Empty state */}
                    {!adminLoading && !adminError && adminEvents.length === 0 && (
                        <div className="p-6 rounded-xl border border-dashed border-amber-800/50 text-center">
                            <p className="text-neutral-400">
                                No hay eventos en el sistema.
                            </p>
                        </div>
                    )}

                    {/* Admin Events list */}
                    {!adminLoading && !adminError && adminEvents.length > 0 && (
                        <div className="grid gap-4">
                            {adminEvents.map((event) => (
                                <EventCard key={`admin-${event.id_evento}`} event={event} isAdmin />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

