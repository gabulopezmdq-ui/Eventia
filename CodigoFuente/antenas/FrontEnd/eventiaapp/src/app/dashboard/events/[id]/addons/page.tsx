'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, AlertCircle, ShoppingBag, Loader2, Crown, BadgeInfo } from 'lucide-react';
import { getEventById } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';

interface FeatureCatalogItem {
    id_feature: number;
    codigo: string;
    nombre: string;
    categoria: string;
}

interface AddonCatalogItem {
    id_addon: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    scope: 'EVENTO' | 'CUENTA';
    precio: number | null;
    features: FeatureCatalogItem[];
}

interface AddonContratado {
    id_scope_addon: number;
    id_addon: number;
    codigo: string;
    nombre: string;
    estado: 'PENDIENTE' | 'ACTIVO' | 'SUSPENDIDO' | 'EXPIRADO' | string;
    activo: boolean;
    fecha_desde: string;
    fecha_hasta: string | null;
}

export default function EventAddonsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const idEventoLong = Number(id);

    const [event, setEvent] = useState<Event | null>(null);
    const [catalogo, setCatalogo] = useState<AddonCatalogItem[]>([]);
    const [contratados, setContratados] = useState<AddonContratado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [solicitandoId, setSolicitandoId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const eventData = await getEventById(id);
            setEvent(eventData);

            const mercado = eventData.codigoMercado || 'AR';
            const moneda = mercado === 'AR' ? 'ARS' : (mercado === 'ES' ? 'EUR' : 'USD');

            // 1. Fetch catalog
            const resCat = await fetch(`/api/evento-addons/catalogo?mercado=${mercado}&moneda=${moneda}`);
            let catData = [];
            if (resCat.ok) {
                catData = await resCat.json();
            }

            // 2. Fetch contratados
            const resContratados = await fetch(`/api/evento-addons?idEvento=${idEventoLong}`);
            let contratadosData = [];
            if (resContratados.ok) {
                contratadosData = await resContratados.json();
            }

            setCatalogo(catData);
            setContratados(contratadosData);
        } catch (err) {
            console.error('Error al cargar datos de addons:', err);
            setError('No se pudo cargar la información de add-ons.');
        } finally {
            setLoading(false);
        }
    }, [id, idEventoLong]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSolicitar = async (addonId: number) => {
        if (!event) return;
        setSolicitandoId(addonId);
        try {
            const mercado = event.codigoMercado || 'AR';
            const moneda = mercado === 'AR' ? 'ARS' : (mercado === 'ES' ? 'EUR' : 'USD');

            const res = await fetch(`/api/evento-addons?idEvento=${idEventoLong}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_addon: addonId,
                    mercado,
                    moneda
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al solicitar el addon.');
            }

            alert('¡Solicitud registrada con éxito! Queda pendiente de activación tras el pago.');
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
            alert(message);
        } finally {
            setSolicitandoId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-muted text-sm font-medium">Cargando catálogo de add-ons...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">¡Ups! Algo salió mal</h2>
                <p className="text-muted">{error || 'No pudimos encontrar el evento.'}</p>
                <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card-bg border border-card-border hover:text-indigo-400 transition-all font-medium">
                    <ChevronLeft className="w-4 h-4" />
                    Volver al detalle
                </Link>
            </div>
        );
    }

    // Cruce de catálogo y contratados
    const contratadoByAddonId = new Map<number, AddonContratado>();
    contratados.forEach(c => contratadoByAddonId.set(c.id_addon, c));

    const addonsEnriquecidos = catalogo.map(item => {
        const c = contratadoByAddonId.get(item.id_addon);
        let estado_ui = 'DISPONIBLE';
        if (c?.estado === 'PENDIENTE') estado_ui = 'PENDIENTE';
        if (c?.estado === 'ACTIVO') estado_ui = 'ACTIVO';
        return {
            ...item,
            contratado: c ?? null,
            estado_ui
        };
    });

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Nav */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">{event.anfitriones_texto}</Link>
                <span>/</span>
                <span className="text-indigo-400">Add-ons</span>
            </nav>

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-card-border pb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-foreground">Add-ons de Evento</h1>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                            Plan {event.planNombre || 'Borrador'}
                        </span>
                    </div>
                    <p className="text-muted text-sm max-w-2xl leading-relaxed">
                        Personalizá tu evento {event.anfitriones_texto} contratando módulos especiales. Podés solicitarlos individualmente y los habilitaremos cuando registremos tu pago.
                    </p>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/events/${id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-card-border/30 hover:text-indigo-400 text-foreground font-bold text-xs transition-all shadow-md shrink-0"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver al Dashboard
                </button>
            </header>

            {/* List of Add-ons */}
            {addonsEnriquecidos.length === 0 ? (
                <div className="p-12 text-center bg-card-bg rounded-3xl border border-card-border space-y-4">
                    <ShoppingBag className="w-12 h-12 text-muted/50 mx-auto" />
                    <p className="text-muted text-sm">No hay add-ons adicionales disponibles en este momento para tu mercado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addonsEnriquecidos.map(addon => {
                        const isPending = addon.estado_ui === 'PENDIENTE';
                        const isActive = addon.estado_ui === 'ACTIVO';
                        const isAvailable = addon.estado_ui === 'DISPONIBLE';

                        return (
                            <div
                                key={addon.id_addon}
                                className={`group p-6 rounded-3xl bg-card-bg/60 border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[300px] ${
                                    isActive
                                        ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                                        : isPending
                                            ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
                                            : 'border-card-border hover:border-indigo-500/30 hover:-translate-y-1'
                                }`}
                            >
                                <div className="space-y-4">
                                    {/* Cabecera Card */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-foreground group-hover:text-indigo-400 transition-colors">
                                                {addon.nombre}
                                            </h3>
                                            <p className="text-muted text-xs leading-relaxed">
                                                {addon.descripcion}
                                            </p>
                                        </div>

                                        {/* Badges de Estado */}
                                        {isActive && (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <CheckCircle2 className="w-3 h-3" /> Activo
                                            </span>
                                        )}
                                        {isPending && (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Pendiente
                                            </span>
                                        )}
                                    </div>

                                    {/* Features Desbloqueadas */}
                                    {addon.features && addon.features.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-card-border/50">
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                                                <Crown className="w-3 h-3 text-indigo-400" /> Habilita características:
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {addon.features.map(feat => (
                                                    <span
                                                        key={feat.id_feature}
                                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-background border border-card-border text-foreground/80"
                                                    >
                                                        {feat.nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botón / Bloque de Pago */}
                                <div className="mt-6 pt-4 border-t border-card-border/50 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                                            Importe estimado
                                        </span>
                                        <span className="font-extrabold text-foreground text-sm">
                                            {addon.precio != null && addon.precio > 0
                                                ? new Intl.NumberFormat(event.codigoMercado === 'AR' ? 'es-AR' : 'en-US', {
                                                    style: 'currency',
                                                    currency: event.codigoMercado === 'AR' ? 'ARS' : 'USD'
                                                }).format(addon.precio)
                                                : 'Consultar precio'}
                                        </span>
                                    </div>

                                    {isAvailable && (
                                        <button
                                            onClick={() => handleSolicitar(addon.id_addon)}
                                            disabled={solicitandoId !== null}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {solicitandoId === addon.id_addon ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                                            ) : (
                                                'Solicitar Add-on'
                                            )}
                                        </button>
                                    )}

                                    {isPending && (
                                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2.5">
                                            <BadgeInfo className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-400/80 leading-relaxed font-semibold">
                                                Activaremos este módulo en cuanto registremos el pago de la transferencia en administración.
                                            </p>
                                        </div>
                                    )}

                                    {isActive && (
                                        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-emerald-400/80 leading-relaxed font-semibold">
                                                Este add-on ya se encuentra disponible para su uso en tu evento. Podés encender sus características desde la sección General.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
