'use client';

import { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Calendar, MapPin, Info, Clock,
    Sparkles, Settings2, Users, LayoutGrid,
    ArrowRight, MessageSquare, Tag, Globe, CheckCircle2,
    Link as LinkIcon, DollarSign
} from 'lucide-react';

import {
    getEventById,
    getAdminEventById,
    activateEvent,
    getEstructuraEvento
} from '@/src/features/events/event.service';
import type { Event, EstructuraEvento } from '@/src/features/events/types';
import FeaturesEventoManager from './components/FeaturesEventoManager';

function EventDetailContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const scope = searchParams.get('scope');

    const [event, setEvent] = useState<Event | null>(null);
    const [estructura, setEstructura] = useState<EstructuraEvento | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activating, setActivating] = useState(false);

    const isAdmin = scope === 'admin';
    const idEventoLong = Number(id);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const request = isAdmin ? getAdminEventById(id) : getEventById(id);
                const eventData = await request;
                setEvent(eventData);

                // Intentar cargar la estructura para mostrar estadísticas
                try {
                    const structData = await getEstructuraEvento(idEventoLong);
                    console.log('STRUCT DATA', structData);
                    console.log('TRAMOS', structData?.tramos);
                    console.log('ACCESOS', structData?.accesos);
                    setEstructura(structData);
                } catch (e) {
                    console.warn('No se pudo cargar la estructura para el resumen', e);
                }
            } catch (err) {
                setError('No se pudo cargar el detalle del evento');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, scope, isAdmin, idEventoLong]);

    const handleActivate = async () => {
        if (!confirm('¿Estás seguro de que deseas activar este evento?')) return;

        setActivating(true);
        try {
            await activateEvent(id);
            alert('Evento activado correctamente');
            window.location.reload();
        } catch (err) {
            alert('Error al activar el evento');
        } finally {
            setActivating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-muted text-sm font-medium">Sincronizando detalles del evento...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Info className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">¡Ups! Algo salió mal</h2>
                    <p className="text-muted">{error || 'No pudimos encontrar el evento que buscás.'}</p>
                </div>
                <Link href="/dashboard/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card-bg border border-card-border hover:text-indigo-400 transition-all font-medium">
                    <ChevronLeft className="w-4 h-4" />
                    Volver a mis eventos
                </Link>
            </div>
        );
    }

    const eventDate = new Date(event.fecha_hora);
    const isBorrador = event.estado === 'B';

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs & Back ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <span className="text-foreground/50">Detalle</span>
                <span>/</span>
                <span className="text-indigo-400">#{event.id_evento}</span>
            </nav>

            {/* ── Main Header ── */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground">{event.anfitriones_texto}</h1>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isBorrador
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                            {isBorrador ? 'Borrador' : 'Activo'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin && isBorrador && (
                        <button
                            onClick={handleActivate}
                            disabled={activating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                            {activating ? 'Activando...' : <><CheckCircle2 className="w-4 h-4" /> Activar Evento</>}
                        </button>
                    )}
                    <button
                        onClick={() => router.push(`/dashboard/events/${event.id_evento}/estructura`)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        <Settings2 className="w-4 h-4" />
                        Gestionar Estructura
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Main Content Area ── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Estructura Summary Card */}
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 border border-card-border shadow-2xl">
                        <div className="p-8 rounded-[1.4rem] bg-card-bg/80 backdrop-blur-xl space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-foreground">Estructura del Evento</h2>
                                    <p className="text-muted text-sm">Resumen de la agenda y accesos configurados</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-background border border-card-border hover:border-indigo-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="w-5 h-5 text-indigo-400" />
                                        <span className="text-2xl font-bold text-foreground">{estructura?.tramos.length || 0}</span>
                                    </div>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest">Tramos de Agenda</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-background border border-card-border hover:border-purple-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        <span className="text-2xl font-bold text-foreground">{estructura?.accesos.length || 0}</span>
                                    </div>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest">Tipos de Acceso</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Próximos Tramos</h3>
                                <div className="space-y-2">
                                    {estructura?.tramos.slice(0, 3).map((tramo, idx) => (
                                        <div key={tramo.id_tramo} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-card-border/50 text-sm gap-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted/50 font-mono text-xs">{idx + 1}.</span>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{tramo.nombre}</span>
                                                    <span className="text-muted text-xs">
                                                        {tramo.fecha_hora_inicio ? new Date(tramo.fecha_hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '--:--'} hs
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => alert('Próximamente: Link masivo para ' + tramo.nombre)}
                                                className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
                                                title="Link Invitación Masiva"
                                            >
                                                <LinkIcon className="w-3 h-3" /> Masivo
                                            </button>
                                        </div>
                                    ))}
                                    {(!estructura || estructura.tramos.length === 0) && (
                                        <p className="text-sm text-muted italic">No hay tramos configurados aún.</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => router.push(`/dashboard/events/${event.id_evento}/estructura`)}
                                    className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group"
                                >
                                    Ir al Editor de Estructura Completo
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Accesos Rápidos (Módulos de Gestión) ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Quick Link Card - Gestión de Invitados */}
                        <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                                <Users className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Gestión de Invitados</h4>
                            <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                Administrá la lista de invitados, controlá RSVPs y generá invitaciones 1-a-1.
                            </p>
                            <button
                                onClick={() => router.push(`/dashboard/events/${event.id_evento}/invitados`)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all"
                            >
                                <Users className="w-3.5 h-3.5" />
                                Ver Invitados
                            </button>
                        </div>

                        {/* Quick Link Card - Audiencias */}
                        <div className="p-5 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Captación y Audiencias</h4>
                            <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                Gestioná campañas públicas, inscripciones masivas y control de beneficios.
                            </p>
                            <button
                                onClick={() => router.push(`/dashboard/events/${event.id_evento}/audiencias`)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:bg-purple-400 transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Ver Audiencias
                            </button>
                        </div>

                        {/* Quick Link Card - Gestión Inscripciones / Pagos */}
                        <div className="p-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Inscripciones y Pagos</h4>
                            <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                Controlá saldos, registrá pagos parciales y aplicá ajustes manuales.
                            </p>
                            <button
                                onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscripciones/pagos`)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                            >
                                <DollarSign className="w-3.5 h-3.5" />
                                Ver Pagos
                            </button>
                        </div>
                    </div>

                    {/* Basic Info & Messages */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-6">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> Mensajes del Evento
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-muted uppercase block mb-1">Saludo</label>
                                    <p className="text-sm text-foreground">{event.saludo || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted uppercase block mb-1">Mensaje Bienvenida</label>
                                    <p className="text-sm text-foreground leading-relaxed">{event.mensaje_bienvenida || '—'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-6">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" /> Notas Internas
                            </h3>
                            <p className="text-sm text-muted leading-relaxed italic">
                                {event.notas || 'No hay notas registradas para este evento.'}
                            </p>
                        </section>
                    </div>

                    {/* Features / Modulos Toggles */}
                    <FeaturesEventoManager idEvento={idEventoLong} />
                </div>

                {/* ── Sidebar ── */}
                <aside className="space-y-6">
                    {/* Details Panel */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-6">
                        <h3 className="text-sm font-bold text-foreground">Detalles Técnicos</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-card-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Globe className="w-3.5 h-3.5" /> Idioma
                                </div>
                                <span className="text-xs font-bold text-foreground">{event.id_idioma === 2 ? 'Español' : 'Otro'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-card-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Tag className="w-3.5 h-3.5" /> Tipo Evento
                                </div>
                                <span className="text-xs font-bold text-foreground">ID #{event.id_tipo_evento}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-card-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Clock className="w-3.5 h-3.5" /> Fecha Alta
                                </div>
                                <span className="text-xs font-bold text-foreground">{new Date(event.fecha_alta).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <LayoutGrid className="w-3.5 h-3.5" /> ID Interno
                                </div>
                                <span className="font-mono text-[10px] text-foreground underline decoration-indigo-500/30">EVT-{event.id_evento}</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Actions */}
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-card-bg transition-all text-xs font-bold uppercase tracking-widest">
                            Duplicar Evento
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        }>
            <EventDetailContent params={params} />
        </Suspense>
    );
}
