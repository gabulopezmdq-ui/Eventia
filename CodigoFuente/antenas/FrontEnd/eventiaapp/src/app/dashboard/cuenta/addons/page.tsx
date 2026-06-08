'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { getMiPlan, CuentaPlan } from '@/src/features/cuenta/cuenta.service';
import { Loader2, CheckCircle2, ShoppingBag, BadgeInfo, Crown } from 'lucide-react';

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

export default function AccountAddonsPage() {
    const { cuenta } = useAuth();
    const [plan, setPlan] = useState<CuentaPlan | null>(null);
    const [catalogo, setCatalogo] = useState<AddonCatalogItem[]>([]);
    const [contratados, setContratados] = useState<AddonContratado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [solicitandoId, setSolicitandoId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        if (!cuenta?.id_cuenta) return;
        setLoading(true);
        try {
            // Fetch current plan to determine market/currency
            const planData = await getMiPlan();
            setPlan(planData);

            const moneda = planData.moneda || 'ARS';
            const mercado = moneda === 'ARS' ? 'AR' : (moneda === 'EUR' ? 'ES' : 'US');

            // 1. Fetch account addons catalogue
            const resCat = await fetch(`/api/cuenta-addons/catalogo?mercado=${mercado}&moneda=${moneda}`);
            let catData = [];
            if (resCat.ok) {
                catData = await resCat.json();
            }

            // 2. Fetch contratados
            const resContratados = await fetch('/api/cuenta-addons');
            let contratadosData = [];
            if (resContratados.ok) {
                contratadosData = await resContratados.json();
            }

            setCatalogo(catData);
            setContratados(contratadosData);
        } catch (err) {
            console.error('Error al cargar addons de cuenta:', err);
            setError('No se pudo cargar la información de add-ons.');
        } finally {
            setLoading(false);
        }
    }, [cuenta]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSolicitar = async (addonId: number) => {
        if (!plan) return;
        setSolicitandoId(addonId);
        try {
            const moneda = plan.moneda || 'ARS';
            const mercado = moneda === 'ARS' ? 'AR' : (moneda === 'EUR' ? 'ES' : 'US');

            const res = await fetch('/api/cuenta-addons', {
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
                <p className="text-muted text-sm font-medium">Cargando add-ons de tu cuenta...</p>
            </div>
        );
    }

    if (error || !cuenta) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
                {error || 'Debes haber iniciado sesión con una cuenta para ver esta página.'}
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
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-indigo-500" />
                        Add-ons de Cuenta
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Potenciá tu cuenta empresarial adquiriendo complementos profesionales.
                    </p>
                </div>
                {plan && (
                    <div className="shrink-0 px-3 py-1.5 rounded-xl border border-card-border bg-card-bg text-xs font-bold text-muted flex items-center gap-2">
                        Plan Actual: <span className="text-indigo-400 font-extrabold uppercase">{plan.plan_nombre}</span>
                    </div>
                )}
            </header>

            {/* List of Add-ons */}
            {addonsEnriquecidos.length === 0 ? (
                <div className="p-12 text-center bg-card-bg rounded-3xl border border-card-border space-y-4">
                    <ShoppingBag className="w-12 h-12 text-muted/50 mx-auto" />
                    <p className="text-muted text-sm">No hay add-ons de cuenta disponibles en este momento.</p>
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
                                className={`group p-6 rounded-3xl bg-card-bg/65 border border-card-border transition-all duration-300 flex flex-col justify-between h-full min-h-[300px] shadow-sm ${
                                    isActive
                                        ? 'border-emerald-500/30 dark:border-emerald-500/25'
                                        : isPending
                                            ? 'border-amber-500/30 dark:border-amber-500/25'
                                            : 'hover:border-accent/30 hover:-translate-y-1'
                                }`}
                            >
                                <div className="space-y-4">
                                    {/* Cabecera Card */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                                {addon.nombre}
                                            </h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                                                {addon.descripcion}
                                            </p>
                                        </div>

                                        {/* Badges de Estado */}
                                        {isActive && (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3" /> Activo
                                            </span>
                                        )}
                                        {isPending && (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Pendiente
                                            </span>
                                        )}
                                    </div>

                                    {/* Features Desbloqueadas */}
                                    {addon.features && addon.features.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                                <Crown className="w-3 h-3 text-indigo-400" /> Habilita características:
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {addon.features.map(feat => (
                                                    <span
                                                        key={feat.id_feature}
                                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                                                    >
                                                        {feat.nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botón / Bloque de Pago */}
                                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                            Importe estimado
                                        </span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                                            {addon.precio != null && addon.precio > 0
                                                ? new Intl.NumberFormat('es-AR', {
                                                    style: 'currency',
                                                    currency: plan?.moneda || 'ARS'
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
                                        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex items-start gap-2.5">
                                            <BadgeInfo className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-600 dark:text-amber-400/80 leading-relaxed font-semibold">
                                                Activaremos este módulo en cuanto registremos el pago de la transferencia en administración.
                                            </p>
                                        </div>
                                    )}

                                    {isActive && (
                                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 leading-relaxed font-semibold">
                                                Este add-on ya se encuentra activo para tu cuenta. Sus características aplican de forma inmediata a todos tus eventos.
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
