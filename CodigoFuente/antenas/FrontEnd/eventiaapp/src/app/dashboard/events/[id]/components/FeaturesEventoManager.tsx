'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Loader2, Save, Crown, Sparkles, CheckCircle2,
    MessageSquare, Camera, Music, Bus, ChefHat, Users,
    Home, Gift, Bell, Baby, Calendar, Layers, ArrowUpRight,
    ChevronDown
} from 'lucide-react';

interface FeatureEfectiva {
    id_feature: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    incluida_en_plan: boolean;
    incluida_por_addon: boolean;
    activo_evento: boolean | null;
    activo_resuelto: boolean;
    // Visibilidad
    visible_acceso_evento?: boolean;
    visible_centro_evento?: boolean;
    visible_acceso_programa?: boolean;
    visible_centro_programa?: boolean;
    // Permisos
    permite_acceso_evento?: boolean;
    permite_centro_evento?: boolean;
    permite_acceso_programa?: boolean;
    permite_centro_programa?: boolean;
}

interface FeaturesEfectivasResponse {
    id_evento: number;
    id_plan: number;
    plan_codigo: string;
    plan_nombre: string;
    features: FeatureEfectiva[];
}

interface FeaturesEventoProps {
    idEvento: number;
    tipoOperacion?: 'EVENTO' | 'PROGRAMA';
}

function getCategoryIcon(category: string) {
    switch (category.toUpperCase()) {
        case 'COMUNICACION':
        case 'COMUNICACIÓN':
            return <MessageSquare className="w-3.5 h-3.5 text-accent" />;
        case 'FOTOS':
        case 'GALERIA':
            return <Camera className="w-3.5 h-3.5 text-accent" />;
        case 'MUSICA':
        case 'MÚSICA':
            return <Music className="w-3.5 h-3.5 text-accent" />;
        case 'LOGISTICA':
        case 'LOGÍSTICA':
        case 'TRANSPORTE':
            return <Bus className="w-3.5 h-3.5 text-accent" />;
        default:
            return <Sparkles className="w-3.5 h-3.5 text-accent" />;
    }
}

function getFeatureIcon(codigo: string) {
    const code = codigo.toUpperCase();
    if (code.includes('MUSICA') || code.includes('PLAYLIST')) {
        return <Music className="w-4 h-4 text-accent" />;
    }
    if (code.includes('ALIMENTAR') || code.includes('RESTRICCION') || code.includes('COMIDA') || code.includes('COMEDOR') || code.includes('DIETA')) {
        return <ChefHat className="w-4 h-4 text-accent" />;
    }
    if (code.includes('ACOMPA') || code.includes('INVITADO') || code.includes('GRUPO')) {
        return <Users className="w-4 h-4 text-accent" />;
    }
    if (code.includes('TRANSPORTE') || code.includes('TRASLADO') || code.includes('COLECTIVO')) {
        return <Bus className="w-4 h-4 text-accent" />;
    }
    if (code.includes('HOSPEDAJE') || code.includes('HOTEL')) {
        return <Home className="w-4 h-4 text-accent" />;
    }
    if (code.includes('REGALO') || code.includes('CBU') || code.includes('TRANSFERENCIA')) {
        return <Gift className="w-4 h-4 text-accent" />;
    }
    if (code.includes('NOVEDAD') || code.includes('AVISO') || code.includes('NOTIFICACION')) {
        return <Bell className="w-4 h-4 text-accent" />;
    }
    if (code.includes('RETIRO') || code.includes('INFANTIL') || code.includes('MENOR')) {
        return <Baby className="w-4 h-4 text-accent" />;
    }
    if (code.includes('AGENDA') || code.includes('CRONOGRAMA') || code.includes('HORARIO')) {
        return <Calendar className="w-4 h-4 text-accent" />;
    }
    if (code.includes('FOTO') || code.includes('ALBUM') || code.includes('GALERIA')) {
        return <Camera className="w-4 h-4 text-accent" />;
    }
    return <Layers className="w-4 h-4 text-muted" />;
}

export default function FeaturesEventoManager({ idEvento, tipoOperacion = 'EVENTO' }: FeaturesEventoProps) {
    const [planNombre, setPlanNombre] = useState<string>('');
    const [features, setFeatures] = useState<FeatureEfectiva[]>([]);
    const [localActivas, setLocalActivas] = useState<Record<number, boolean>>({});
    const [localVisibilidadAcceso, setLocalVisibilidadAcceso] = useState<Record<number, boolean>>({});
    const [localVisibilidadCentro, setLocalVisibilidadCentro] = useState<Record<number, boolean>>({});
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/features-efectivas?idEvento=${idEvento}`);
            if (!res.ok) throw new Error('Error al cargar características efectivas del evento');
            const data: FeaturesEfectivasResponse = await res.json();

            setPlanNombre(data.plan_nombre || 'Plan Desconocido');
            const feats = data.features || [];
            setFeatures(feats);

            // Initialize local toggle state using active_resuelto and visibilities
            const initialMap: Record<number, boolean> = {};
            const initialAccesoMap: Record<number, boolean> = {};
            const initialCentroMap: Record<number, boolean> = {};
            feats.forEach((f) => {
                initialMap[f.id_feature] = f.activo_resuelto;
                if (tipoOperacion === 'EVENTO') {
                    initialAccesoMap[f.id_feature] = f.visible_acceso_evento ?? false;
                    initialCentroMap[f.id_feature] = f.visible_centro_evento ?? false;
                } else {
                    initialAccesoMap[f.id_feature] = f.visible_acceso_programa ?? false;
                    initialCentroMap[f.id_feature] = f.visible_centro_programa ?? false;
                }
            });
            setLocalActivas(initialMap);
            setLocalVisibilidadAcceso(initialAccesoMap);
            setLocalVisibilidadCentro(initialCentroMap);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al conectar con la API';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [idEvento, tipoOperacion]);

    useEffect(() => {
        if (idEvento) fetchData();
    }, [idEvento, fetchData]);

    const handleToggle = (idFeature: number, disponible: boolean) => {
        if (!disponible) return;

        setLocalActivas(prev => ({
            ...prev,
            [idFeature]: !prev[idFeature]
        }));
        setSaveSuccess(false);
    };

    const handleToggleVisibilidad = (type: 'acceso' | 'centro', idFeature: number) => {
        if (type === 'acceso') {
            setLocalVisibilidadAcceso(prev => ({
                ...prev,
                [idFeature]: !prev[idFeature]
            }));
        } else {
            setLocalVisibilidadCentro(prev => ({
                ...prev,
                [idFeature]: !prev[idFeature]
            }));
        }
        setSaveSuccess(false);
    };

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            // Bulk update payload requires mapping to items with visibilities
            const items = features
                .filter(f => f.incluida_en_plan || f.incluida_por_addon)
                .map(f => {
                    const isActivo = !!localActivas[f.id_feature];
                    return {
                        id_feature: f.id_feature,
                        activo: isActivo,
                        visible_acceso_evento: tipoOperacion === 'EVENTO' ? (isActivo && !!localVisibilidadAcceso[f.id_feature]) : false,
                        visible_centro_evento: tipoOperacion === 'EVENTO' ? (isActivo && !!localVisibilidadCentro[f.id_feature]) : false,
                        visible_acceso_programa: tipoOperacion === 'PROGRAMA' ? (isActivo && !!localVisibilidadAcceso[f.id_feature]) : false,
                        visible_centro_programa: tipoOperacion === 'PROGRAMA' ? (isActivo && !!localVisibilidadCentro[f.id_feature]) : false,
                    };
                });

            const res = await fetch(`/api/evento-features?idEvento=${idEvento}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (errData.detail) {
                    try {
                        const parsedDetail = JSON.parse(errData.detail);
                        if (parsedDetail.error === 'Dependencias incompletas.' && parsedDetail.dependencias_faltantes) {
                            const missingNames = parsedDetail.dependencias_faltantes.map((d: { nombre: string }) => d.nombre).join(', ');
                            const featObj = features.find(f => f.id_feature === parsedDetail.id_feature);
                            const featName = featObj ? `"${featObj.nombre}"` : 'esta característica';
                            throw new Error(`Inconsistencia en dependencias: Para activar ${featName}, tenés que habilitar también: ${missingNames}.`);
                        }
                    } catch (e) {
                        if (e instanceof Error) throw e;
                    }
                }
                throw new Error(errData.message || 'Error al guardar las características');
            }
            
            setSaveSuccess(true);
            // Refresh effective features from backend to resolve values
            await fetchData();
            
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudieron guardar los cambios. Intentá de nuevo.';
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card-bg border border-card-border rounded-2xl">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-xs text-muted font-medium">Sincronizando características...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 text-sm">
                {error}
            </div>
        );
    }

    // Group features by category
    const categories: Record<string, FeatureEfectiva[]> = {};
    features.forEach(f => {
        const catName = f.categoria || 'General';
        if (!categories[catName]) categories[catName] = [];
        categories[catName].push(f);
    });

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            {/* Cabecera */}
            <div className="p-6 border-b border-card-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-accent/[0.04] via-transparent to-transparent">
                <div>
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2.5">
                        Características del {tipoOperacion === 'EVENTO' ? 'Evento' : 'Programa'}
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-accent/10 text-accent border border-accent/20">
                            Plan: {planNombre}
                        </span>
                    </h3>
                    <p className="text-xs text-muted mt-1.5">
                        Activá o desactivá las funcionalidades que querés usar en este {tipoOperacion === 'EVENTO' ? 'evento' : 'programa'}.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {saveSuccess && (
                        <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 animate-in fade-in duration-200">
                            <CheckCircle2 className="w-4 h-4" /> ¡Guardado!
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-600/10 hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Guardar Características
                    </button>
                </div>
            </div>

            {/* Lista agrupada colapsable */}
            <div className="p-6 space-y-4">
                {Object.entries(categories).map(([category, itemsList]) => {
                    const isCollapsed = !!collapsedCategories[category];
                    const activeCount = itemsList.filter(f => localActivas[f.id_feature]).length;
                    const totalCount = itemsList.length;

                    return (
                        <div key={category} className="space-y-3">
                            {/* Encabezado Acordeón */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-3.5 bg-neutral-50/30 dark:bg-neutral-900/10 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 border border-card-border/60 rounded-xl transition-all duration-200 cursor-pointer text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="border-l-2 border-accent pl-2.5 flex items-center gap-2">
                                        {getCategoryIcon(category)}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
                                            {category.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border transition-colors ${
                                        activeCount > 0 
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border-neutral-200/50 dark:border-neutral-700/50'
                                    }`}>
                                        {activeCount} de {totalCount} activas
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-muted group-hover:text-foreground transition-transform duration-200 ${
                                    isCollapsed ? '-rotate-90' : ''
                                }`} />
                            </button>
                            
                            {/* Grilla de Tarjetas (Solo visible si no está colapsado) */}
                            {!isCollapsed && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 pl-1">
                                    {itemsList.map((feat) => {
                                        const isActiva = !!localActivas[feat.id_feature];
                                        const disponible = feat.incluida_en_plan || feat.incluida_por_addon;

                                        // Determinar permisos de visibilidad
                                        const permiteAcceso = tipoOperacion === 'EVENTO' 
                                            ? (feat.permite_acceso_evento !== false) 
                                            : (feat.permite_acceso_programa !== false);

                                        const permiteCentro = tipoOperacion === 'EVENTO' 
                                            ? (feat.permite_centro_evento !== false) 
                                            : (feat.permite_centro_programa !== false);

                                        // Determinar origen de la feature
                                        let originLabel = 'No incluido';
                                        let originClass = 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800/40 dark:text-neutral-500 border-neutral-200/50';
                                        
                                        if (feat.incluida_en_plan && feat.incluida_por_addon) {
                                            originLabel = 'Plan & Addon';
                                            originClass = 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
                                        } else if (feat.incluida_en_plan) {
                                            originLabel = 'Plan';
                                            originClass = 'bg-accent/10 text-accent dark:text-accent border-accent/20';
                                        } else if (feat.incluida_por_addon) {
                                            originLabel = 'Addon';
                                            originClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
                                        } else {
                                            originLabel = 'Upgrade Requerido';
                                            originClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                                        }

                                        return (
                                            <div
                                                key={feat.id_feature}
                                                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-full min-h-[160px] ${
                                                    isActiva && disponible
                                                        ? 'border-accent/30 bg-accent/[0.015] dark:border-accent/20 dark:bg-accent/[0.005] shadow-[0_0_15px_rgba(129,140,248,0.01)]'
                                                        : 'border-card-border bg-neutral-50/30 dark:bg-neutral-900/10 hover:border-card-border/80 dark:hover:border-neutral-800'
                                                } ${!disponible ? 'border-dashed border-amber-500/25 dark:border-amber-500/15 bg-amber-500/[0.01] dark:bg-amber-950/[0.005]' : ''}`}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex gap-3 items-start">
                                                        <div className={`p-2.5 rounded-xl border shrink-0 transition-colors duration-200 ${
                                                            isActiva && disponible
                                                                ? 'bg-accent/15 border-accent/25 text-accent'
                                                                : 'bg-neutral-100 dark:bg-neutral-800/60 border-card-border/50 text-muted'
                                                        }`}>
                                                            {getFeatureIcon(feat.codigo)}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h5 className="font-bold text-xs.5 text-foreground leading-none">
                                                                    {feat.nombre}
                                                                </h5>
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${originClass} flex items-center gap-0.5`}>
                                                                    {!disponible && <Crown className="w-2 h-2" />}
                                                                    {originLabel}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted/80 leading-relaxed pr-2">
                                                                {feat.descripcion}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {disponible ? (
                                                        <button
                                                            onClick={() => handleToggle(feat.id_feature, disponible)}
                                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                isActiva ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-850'
                                                            }`}
                                                            aria-label={`Toggle ${feat.nombre}`}
                                                        >
                                                            <span
                                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                                    isActiva ? 'translate-x-4' : 'translate-x-0'
                                                                }`}
                                                            />
                                                        </button>
                                                    ) : (
                                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20" title="Upgrade Requerido">
                                                            <Crown className="w-3.5 h-3.5 animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Visibilidad Toggles */}
                                                {disponible && (
                                                    <div className={`mt-4 pt-3 border-t border-card-border/30 flex flex-col gap-2.5 text-xs transition-opacity duration-200 ${isActiva ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                                        {/* Acceso Toggle */}
                                                        {permiteAcceso && (
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-semibold text-muted text-[11px]">
                                                                    {tipoOperacion === 'EVENTO' ? 'Mostrar en invitación / RSVP' : 'Mostrar en inscripción pública'}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleVisibilidad('acceso', feat.id_feature)}
                                                                    disabled={!isActiva}
                                                                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                        localVisibilidadAcceso[feat.id_feature] ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-800'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                                            localVisibilidadAcceso[feat.id_feature] ? 'translate-x-3.5' : 'translate-x-0'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Centro Toggle */}
                                                        {permiteCentro && (
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-semibold text-muted text-[11px]">
                                                                    {tipoOperacion === 'EVENTO' ? 'Mostrar en portal del invitado' : 'Mostrar en portal de responsable'}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleVisibilidad('centro', feat.id_feature)}
                                                                    disabled={!isActiva}
                                                                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                        localVisibilidadCentro[feat.id_feature] ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-850'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                                            localVisibilidadCentro[feat.id_feature] ? 'translate-x-3.5' : 'translate-x-0'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!disponible && (
                                                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-450 mt-3 bg-amber-50/5 p-2 rounded-xl border border-amber-500/10">
                                                        <div className="flex items-center gap-1.5">
                                                            <Sparkles className="w-3 h-3 shrink-0 animate-pulse" />
                                                            <span>Adquirible como Add-on.</span>
                                                        </div>
                                                        <Link
                                                            href={`/dashboard/events/${idEvento}/addons`}
                                                            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-[9px] uppercase tracking-wider transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                                                        >
                                                            Adquirir
                                                            <ArrowUpRight className="w-2.5 h-2.5" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
