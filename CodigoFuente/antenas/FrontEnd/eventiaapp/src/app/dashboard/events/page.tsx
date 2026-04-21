'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ShieldCheck, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import { getMyEvents, getAdminEvents } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';
import { useAuth } from '@/src/context/AuthContext';

export default function DashboardEventsPage() {
    const { isSuperAdmin, eventos: eventosContext } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [adminEvents, setAdminEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminLoading, setAdminLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);

    useEffect(() => {
        // Cargar eventos admin si corresponde
        if (isSuperAdmin) {
            setAdminLoading(true);
            getAdminEvents()
                .then(setAdminEvents)
                .catch(() => setAdminError('No se pudieron cargar los eventos de administración'))
                .finally(() => setAdminLoading(false));
        }

        // Cargar mis eventos
        getMyEvents()
            .then(setEvents)
            .catch(() => setError('No se pudieron cargar los eventos'))
            .finally(() => setLoading(false));
    }, [isSuperAdmin]);

    const EventCard = ({ event, isAdmin = false }: { event: Event; isAdmin?: boolean }) => {
        // Safe date parsing
        let dateString = 'Fecha pendiente';
        if (event.fecha_hora) {
            const dateObj = new Date(event.fecha_hora);
            if (!isNaN(dateObj.getTime())) {
                dateString = new Intl.DateTimeFormat('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(dateObj);
            }
        }

        const isActivo = event.estado === 'A';
        const isBorrador = event.estado === 'B';

        return (
            <Link
                href={{
                    pathname: `/dashboard/events/${event.id_evento}`,
                    query: isAdmin ? { scope: 'admin' } : {},
                }}
                className="group block h-full"
            >
                <article
                    className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isActivo
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : isBorrador
                                        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400'
                                        : 'bg-neutral-50 text-neutral-700 ring-1 ring-inset ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400'
                                    }`}>
                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isActivo ? 'bg-emerald-500' : isBorrador ? 'bg-amber-500' : 'bg-neutral-500'}`}></span>
                                    {isActivo ? 'Activo' : isBorrador ? 'Borrador' : String(event.estado)}
                                </span>
                                {Boolean(event.tipo_evento_codigo) && (
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400">
                                        {event.tipo_evento_codigo}
                                    </span>
                                )}
                            </div>
                        </div>

                        <h3 className="font-bold text-xl text-neutral-900 dark:text-white line-clamp-2 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {event.anfitriones_texto || 'Evento sin anfitriones'}
                        </h3>

                        <div className="space-y-2 mt-auto">
                            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                                <CalendarDays className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                                <span className="truncate">{dateString}</span>
                            </div>
                            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                                <MapPin className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                                <span className="truncate">{event.lugar || 'Lugar por definir'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            Ver detalles
                        </span>
                        <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                </article>
            </Link>
        );
    };

    return (
        <section className="space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Mis eventos
                </h1>

                <Link
                    href="/dashboard/events/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium text-white"
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
                <div className="p-8 text-center">
                    <p className="text-neutral-400 mb-4">
                        {eventosContext?.cantidad_compartidos && eventosContext.cantidad_compartidos > 0
                            ? `Todavía no tenés eventos propios, pero tenés ${eventosContext.cantidad_compartidos} evento${eventosContext.cantidad_compartidos > 1 ? 's' : ''} compartido${eventosContext.cantidad_compartidos > 1 ? 's' : ''}.`
                            : 'Todavía no tenés eventos creados. ¡Creá tu primer evento!'}
                    </p>
                </div>
            )}

            {/* My Events list */}
            {!loading && !error && events.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {events.map((event) => (
                        <EventCard key={event.id_evento} event={event} />
                    ))}
                </div>
            )}

            {/* Sección de Eventos de Admin (solo superadmin) */}
            {isSuperAdmin && (
                <div className="pt-8 mt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <header className="flex items-center gap-3 mb-8">
                        <ShieldCheck className="w-7 h-7 text-indigo-500" />
                        <h2 className="text-2xl font-bold">
                            Eventos del Sistema
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
                        <div className="p-10 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                            <p className="text-neutral-500">
                                No hay eventos en el sistema.
                            </p>
                        </div>
                    )}

                    {/* Admin Events list */}
                    {!adminLoading && !adminError && adminEvents.length > 0 && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {adminEvents.map((event) => (
                                <EventCard
                                    key={`admin-${event.id_evento}`}
                                    event={event}
                                    isAdmin
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

