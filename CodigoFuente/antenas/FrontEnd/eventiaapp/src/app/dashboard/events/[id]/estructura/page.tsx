'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    getEstructuraEvento,
    updateTramo,
    updateAcceso,
    setAccesoDefault,
    createRelacionAccesoTramo,
    deleteRelacionAccesoTramo,
} from '@/src/features/events/event.service';
import type {
    EstructuraEvento,
    TramoEvento,
    AccesoEvento,
} from '@/src/features/events/types';
import {
    ArrowLeft, Clock, Users, LayoutGrid, Save, CheckCircle2,
    MapPin, AlignLeft, Sparkles, Globe, Hash, Power,
    Star, MessageSquare, Check, X,
} from 'lucide-react';

/* ═══════════ TABS ═══════════ */
const TABS = [
    { id: 'tramos' as const, label: 'Agenda / Tramos', icon: Clock, color: 'indigo' },
    { id: 'accesos' as const, label: 'Accesos / Invitaciones', icon: Users, color: 'purple' },
    { id: 'matriz' as const, label: 'Matriz Acceso-Tramo', icon: LayoutGrid, color: 'emerald' },
];

type TabId = typeof TABS[number]['id'];

/* ═══════════ HELPERS ═══════════ */
const toDatetimeLocal = (iso: string | null): string => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ''; }
};

const fromDatetimeLocal = (val: string): string | null => {
    if (!val) return null;
    try { return new Date(val).toISOString(); } catch { return null; }
};

/* ═══════════ COMPONENT ═══════════ */
export default function EstructuraPage() {
    const router = useRouter();
    const params = useParams();
    const idEvento = Number(params.id);

    // ── State ──
    const [estructura, setEstructura] = useState<EstructuraEvento | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('tramos');

    // Tramo editing
    const [tramoEdits, setTramoEdits] = useState<Record<number, Partial<TramoEvento>>>({});
    const [savingTramoId, setSavingTramoId] = useState<number | null>(null);
    const [savedTramoIds, setSavedTramoIds] = useState<Set<number>>(new Set());

    // Acceso editing
    const [accesoEdits, setAccesoEdits] = useState<Record<number, Partial<AccesoEvento>>>({});
    const [savingAccesoId, setSavingAccesoId] = useState<number | null>(null);
    const [savedAccesoIds, setSavedAccesoIds] = useState<Set<number>>(new Set());
    const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

    // Matrix editing state
    const [togglingRelation, setTogglingRelation] = useState<string | null>(null); // "idAcceso-idTramo"

    // ── Load structure ──
    useEffect(() => {
        if (!idEvento || isNaN(idEvento)) return;
        async function load() {
            setLoading(true);
            try {
                const data = await getEstructuraEvento(idEvento);
                setEstructura(data);
            } catch {
                setError('No se pudo cargar la estructura del evento.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [idEvento]);

    // ── Tramo handlers ──
    const handleTramoChange = (id: number, field: string, value: unknown) => {
        setTramoEdits(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value },
        }));
    };

    const handleSaveTramo = async (tramo: TramoEvento) => {
        const edits = tramoEdits[tramo.id_tramo];
        if (!edits || Object.keys(edits).length === 0) return;
        setSavingTramoId(tramo.id_tramo);
        try {
            // Enviar objeto completo (original + edits) para evitar que el backend
            // use defaults para campos faltantes (ej: orden=0 viola constraint unique)
            const { id_tramo, id_evento, ...tramoData } = tramo;
            void id_tramo; void id_evento;
            const payload = { ...tramoData, ...edits };
            const updated = await updateTramo(tramo.id_tramo, payload);
            setEstructura(prev => prev ? {
                ...prev,
                tramos: prev.tramos.map(t => t.id_tramo === tramo.id_tramo ? { ...t, ...updated } : t),
            } : prev);
            setTramoEdits(prev => { const n = { ...prev }; delete n[tramo.id_tramo]; return n; });
            setSavedTramoIds(prev => new Set(prev).add(tramo.id_tramo));
            setTimeout(() => setSavedTramoIds(prev => { const n = new Set(prev); n.delete(tramo.id_tramo); return n; }), 2500);
        } catch {
            setError('Error al guardar el tramo. Intenta de nuevo.');
        } finally {
            setSavingTramoId(null);
        }
    };

    // ── Acceso handlers ──
    const handleAccesoChange = (id: number, field: string, value: unknown) => {
        setAccesoEdits(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value },
        }));
    };

    const handleSaveAcceso = async (acceso: AccesoEvento) => {
        const edits = accesoEdits[acceso.id_acceso];
        if (!edits || Object.keys(edits).length === 0) return;
        setSavingAccesoId(acceso.id_acceso);
        try {
            // Enviar objeto completo (original + edits) — mismo patrón que tramos
            const { id_acceso, id_evento, ...accesoData } = acceso;
            void id_acceso; void id_evento;
            const payload = { ...accesoData, ...edits };
            const updated = await updateAcceso(acceso.id_acceso, payload);
            setEstructura(prev => prev ? {
                ...prev,
                accesos: prev.accesos.map(a => a.id_acceso === acceso.id_acceso ? { ...a, ...updated } : a),
            } : prev);
            setAccesoEdits(prev => { const n = { ...prev }; delete n[acceso.id_acceso]; return n; });
            setSavedAccesoIds(prev => new Set(prev).add(acceso.id_acceso));
            setTimeout(() => setSavedAccesoIds(prev => { const n = new Set(prev); n.delete(acceso.id_acceso); return n; }), 2500);
        } catch {
            setError('Error al guardar el acceso. Intenta de nuevo.');
        } finally {
            setSavingAccesoId(null);
        }
    };

    const handleSetDefault = async (idAcceso: number) => {
        if (!estructura) return;
        setSettingDefaultId(idAcceso);
        try {
            await setAccesoDefault(idEvento, idAcceso);
            setEstructura(prev => prev ? { ...prev, id_acceso_default: idAcceso } : prev);
        } catch {
            setError('Error al cambiar el acceso default.');
        } finally {
            setSettingDefaultId(null);
        }
    };

    const handleToggleRelation = async (idAcceso: number, idTramo: number, currentStatus: boolean) => {
        if (!estructura) return;
        const key = `${idAcceso}-${idTramo}`;
        setTogglingRelation(key);
        try {
            if (currentStatus) {
                // Remove relation
                await deleteRelacionAccesoTramo(idAcceso, idTramo);
                setEstructura(prev => prev ? {
                    ...prev,
                    relaciones: prev.relaciones.filter(r => !(r.id_acceso === idAcceso && r.id_tramo === idTramo))
                } : prev);
            } else {
                // Add relation
                await createRelacionAccesoTramo(idAcceso, idTramo);
                setEstructura(prev => prev ? {
                    ...prev,
                    relaciones: [...prev.relaciones, { id_acceso: idAcceso, id_tramo: idTramo }]
                } : prev);
            }
        } catch {
            setError('Error al actualizar la relación en la matriz.');
        } finally {
            setTogglingRelation(null);
        }
    };

    // ── Value helpers ──
    const tv = (tramo: TramoEvento, field: keyof TramoEvento) =>
        tramoEdits[tramo.id_tramo]?.[field] ?? tramo[field];
    const av = (acceso: AccesoEvento, field: keyof AccesoEvento) =>
        accesoEdits[acceso.id_acceso]?.[field] ?? acceso[field];
    const isTramoEdited = (id: number) => tramoEdits[id] && Object.keys(tramoEdits[id]).length > 0;
    const isAccesoEdited = (id: number) => accesoEdits[id] && Object.keys(accesoEdits[id]).length > 0;

    const sortedTramos = estructura?.tramos.slice().sort((a, b) => a.orden - b.orden) || [];
    const sortedAccesos = estructura?.accesos.slice().sort((a, b) => a.orden - b.orden) || [];

    // ── RENDER ──
    if (loading) {
        return (
            <section className="max-w-5xl mx-auto py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-muted text-sm">Cargando estructura del evento...</p>
            </section>
        );
    }

    if (error && !estructura) {
        return (
            <section className="max-w-5xl mx-auto py-20 text-center">
                <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
                <p className="text-muted text-sm mb-6">{error}</p>
                <button onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-card-border text-muted hover:text-foreground transition-all text-sm">
                    Volver
                </button>
            </section>
        );
    }

    return (
        <section className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <button onClick={() => router.push('/dashboard/events')} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-2 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver a eventos</span>
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">Editor de Estructura</h1>
                    <p className="text-muted text-xs mt-0.5">Evento #{idEvento} — Editá tramos, accesos y revisá la matriz</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                        {sortedTramos.length} tramos · {sortedAccesos.length} accesos
                    </span>
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" /> {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
                </div>
            )}

            {/* ── Tab Bar ── */}
            <div className="flex border-b border-card-border mb-8 gap-1 overflow-x-auto">
                {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${active
                                ? `border-${tab.color}-500 text-${tab.color}-400`
                                : 'border-transparent text-muted hover:text-foreground hover:border-muted/30'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === 'tramos' && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-500/15 text-indigo-300' : 'bg-card-bg text-muted'}`}>{sortedTramos.length}</span>}
                            {tab.id === 'accesos' && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-purple-500/15 text-purple-300' : 'bg-card-bg text-muted'}`}>{sortedAccesos.length}</span>}
                        </button>
                    );
                })}
            </div>

            {/* ═══════════ TAB 1: TRAMOS ═══════════ */}
            {activeTab === 'tramos' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                    {sortedTramos.map((tramo, idx) => {
                        const isSaving = savingTramoId === tramo.id_tramo;
                        const isSaved = savedTramoIds.has(tramo.id_tramo);
                        const isEdited = isTramoEdited(tramo.id_tramo);
                        return (
                            <div key={tramo.id_tramo} className="p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border transition-all hover:border-muted/50">
                                {/* Card header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">{idx + 1}</span>
                                        <h3 className="font-semibold text-foreground text-sm">{tramo.nombre}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isSaved && <span className="text-xs text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200"><CheckCircle2 className="w-3 h-3" />Guardado</span>}
                                        <label className="relative inline-flex items-center cursor-pointer" title={tv(tramo, 'activo') ? 'Activo' : 'Inactivo'}>
                                            <input type="checkbox" checked={tv(tramo, 'activo') as boolean} onChange={e => handleTramoChange(tramo.id_tramo, 'activo', e.target.checked)} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                        </label>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="space-y-4">
                                    {/* Nombre */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><AlignLeft className="w-3 h-3" />Nombre</label>
                                        <input value={tv(tramo, 'nombre') as string} onChange={e => handleTramoChange(tramo.id_tramo, 'nombre', e.target.value)}
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm" />
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><Clock className="w-3 h-3" />Fecha/Hora Inicio</label>
                                            <input type="datetime-local" value={toDatetimeLocal(tv(tramo, 'fecha_hora_inicio') as string | null)} onChange={e => handleTramoChange(tramo.id_tramo, 'fecha_hora_inicio', fromDatetimeLocal(e.target.value))}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><Clock className="w-3 h-3" />Fecha/Hora Fin <span className="text-muted/50 font-normal lowercase">(opc.)</span></label>
                                            <input type="datetime-local" value={toDatetimeLocal(tv(tramo, 'fecha_hora_fin') as string | null)} onChange={e => handleTramoChange(tramo.id_tramo, 'fecha_hora_fin', fromDatetimeLocal(e.target.value))}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm" />
                                        </div>
                                    </div>

                                    {/* Lugar / Dirección */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><MapPin className="w-3 h-3" />Lugar</label>
                                            <input value={(tv(tramo, 'lugar') as string) || ''} onChange={e => handleTramoChange(tramo.id_tramo, 'lugar', e.target.value)}
                                                placeholder="Nombre del lugar" className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm placeholder:text-muted" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><MapPin className="w-3 h-3" />Dirección</label>
                                            <input value={(tv(tramo, 'direccion') as string) || ''} onChange={e => handleTramoChange(tramo.id_tramo, 'direccion', e.target.value)}
                                                placeholder="Calle, número, ciudad" className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm placeholder:text-muted" />
                                        </div>
                                    </div>

                                    {/* Lat / Long */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><Globe className="w-3 h-3" />Latitud</label>
                                            <input type="number" step="any" value={(tv(tramo, 'latitud') as number) ?? ''} onChange={e => handleTramoChange(tramo.id_tramo, 'latitud', e.target.value ? parseFloat(e.target.value) : null)}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><Globe className="w-3 h-3" />Longitud</label>
                                            <input type="number" step="any" value={(tv(tramo, 'longitud') as number) ?? ''} onChange={e => handleTramoChange(tramo.id_tramo, 'longitud', e.target.value ? parseFloat(e.target.value) : null)}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm" />
                                        </div>
                                    </div>

                                    {/* Leyenda visible */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><Sparkles className="w-3 h-3" />Leyenda visible</label>
                                        <input value={(tv(tramo, 'leyenda_visible') as string) || ''} onChange={e => handleTramoChange(tramo.id_tramo, 'leyenda_visible', e.target.value)}
                                            placeholder="Texto visible para invitados" className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm placeholder:text-muted" />
                                    </div>

                                    {/* Orden + Save */}
                                    <div className="flex items-center justify-between pt-3 border-t border-card-border">
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest"><Hash className="w-3 h-3" />Orden</label>
                                            <input type="number" min={0} value={tv(tramo, 'orden') as number} onChange={e => handleTramoChange(tramo.id_tramo, 'orden', parseInt(e.target.value) || 0)}
                                                className="w-16 p-2 rounded-lg bg-background border border-card-border text-foreground outline-none text-sm text-center" />
                                        </div>
                                        <button onClick={() => handleSaveTramo(tramo)} disabled={!isEdited || isSaving}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all">
                                            {isSaving ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                                                : <><Save className="w-3.5 h-3.5" />Guardar Tramo</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {sortedTramos.length === 0 && (
                        <div className="text-center py-16 text-muted text-sm">No hay tramos en este evento.</div>
                    )}
                </div>
            )}

            {/* ═══════════ TAB 2: ACCESOS ═══════════ */}
            {activeTab === 'accesos' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                    {sortedAccesos.map(acceso => {
                        const isSaving = savingAccesoId === acceso.id_acceso;
                        const isSaved = savedAccesoIds.has(acceso.id_acceso);
                        const isEdited = isAccesoEdited(acceso.id_acceso);
                        const isDefault = estructura?.id_acceso_default === acceso.id_acceso;
                        const isSettingDefault = settingDefaultId === acceso.id_acceso;
                        return (
                            <div key={acceso.id_acceso} className={`p-5 sm:p-6 rounded-2xl bg-card-bg border-2 transition-all hover:border-muted/50 ${isDefault ? 'border-purple-500/50 shadow-lg shadow-purple-500/5' : 'border-card-border'}`}>
                                {/* Card header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isDefault ? 'bg-purple-500/15 border-purple-500/30' : 'bg-purple-500/10 border-purple-500/20'}`}>
                                            <Users className={`w-4 h-4 ${isDefault ? 'text-purple-300' : 'text-purple-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-sm">{acceso.nombre}</h3>
                                            {isDefault && <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1"><Star className="w-2.5 h-2.5" />Default</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isSaved && <span className="text-xs text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200"><CheckCircle2 className="w-3 h-3" />Guardado</span>}
                                        {/* Default radio */}
                                        <button onClick={() => handleSetDefault(acceso.id_acceso)} disabled={isDefault || isSettingDefault}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isDefault
                                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 cursor-default'
                                                : 'border border-card-border text-muted hover:text-purple-300 hover:border-purple-500/30'}`}>
                                            {isSettingDefault ? <div className="w-3 h-3 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                                                : isDefault ? <Check className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                                            {isDefault ? 'Default' : 'Marcar Default'}
                                        </button>
                                        {/* Activo toggle */}
                                        <label className="relative inline-flex items-center cursor-pointer" title={av(acceso, 'activo') ? 'Activo' : 'Inactivo'}>
                                            <input type="checkbox" checked={av(acceso, 'activo') as boolean} onChange={e => handleAccesoChange(acceso.id_acceso, 'activo', e.target.checked)} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-purple-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                        </label>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><AlignLeft className="w-3 h-3" />Nombre</label>
                                        <input value={av(acceso, 'nombre') as string} onChange={e => handleAccesoChange(acceso.id_acceso, 'nombre', e.target.value)}
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-foreground outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5"><MessageSquare className="w-3 h-3" />Mensaje RSVP</label>
                                        <textarea value={(av(acceso, 'mensaje_rsvp') as string) || ''} onChange={e => handleAccesoChange(acceso.id_acceso, 'mensaje_rsvp', e.target.value)}
                                            rows={2} placeholder="Mensaje que verán los invitados al confirmar asistencia"
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-foreground outline-none text-sm placeholder:text-muted resize-none" />
                                    </div>

                                    {/* Orden + Save */}
                                    <div className="flex items-center justify-between pt-3 border-t border-card-border">
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest"><Hash className="w-3 h-3" />Orden</label>
                                            <input type="number" min={0} value={av(acceso, 'orden') as number} onChange={e => handleAccesoChange(acceso.id_acceso, 'orden', parseInt(e.target.value) || 0)}
                                                className="w-16 p-2 rounded-lg bg-background border border-card-border text-foreground outline-none text-sm text-center" />
                                        </div>
                                        <button onClick={() => handleSaveAcceso(acceso)} disabled={!isEdited || isSaving}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all">
                                            {isSaving ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                                                : <><Save className="w-3.5 h-3.5" />Guardar Acceso</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {sortedAccesos.length === 0 && (
                        <div className="text-center py-16 text-muted text-sm">No hay accesos en este evento.</div>
                    )}
                </div>
            )}

            {/* ═══════════ TAB 3: MATRIZ ═══════════ */}
            {activeTab === 'matriz' && (
                <div className="animate-in fade-in duration-300">
                    <div className="p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground text-sm">Matriz Acceso — Tramo</h3>
                                <p className="text-[10px] text-muted">Las relaciones se definieron automáticamente desde la plantilla</p>
                            </div>
                        </div>

                        {sortedTramos.length > 0 && sortedAccesos.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-card-border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-background/50">
                                            <th className="p-3 text-left text-[10px] font-bold text-muted uppercase tracking-widest border-b border-r border-card-border min-w-[140px]">
                                                Acceso \ Tramo
                                            </th>
                                            {sortedTramos.map(tramo => (
                                                <th key={tramo.id_tramo} className="p-3 text-center text-[10px] font-bold text-muted uppercase tracking-widest border-b border-card-border min-w-[100px]">
                                                    {tramo.nombre}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedAccesos.map((acceso, idx) => {
                                            const isDefaultRow = estructura?.id_acceso_default === acceso.id_acceso;
                                            return (
                                                <tr key={acceso.id_acceso} className={`${isDefaultRow ? 'bg-purple-500/5' : idx % 2 === 0 ? 'bg-transparent' : 'bg-background/30'}`}>
                                                    <td className="p-3 border-r border-card-border">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-foreground text-xs font-medium">{acceso.nombre}</span>
                                                            {isDefaultRow && <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold uppercase">default</span>}
                                                        </div>
                                                    </td>
                                                    {sortedTramos.map(tramo => {
                                                        const hasRelation = estructura?.relaciones.some(r => r.id_acceso === acceso.id_acceso && r.id_tramo === tramo.id_tramo);
                                                        const isToggling = togglingRelation === `${acceso.id_acceso}-${tramo.id_tramo}`;
                                                        return (
                                                            <td key={tramo.id_tramo} className="p-3 text-center border-card-border">
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        onClick={() => handleToggleRelation(acceso.id_acceso, tramo.id_tramo, !!hasRelation)}
                                                                        disabled={isToggling}
                                                                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${isToggling ? 'opacity-50 cursor-wait' :
                                                                                hasRelation
                                                                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                                                                                    : 'bg-background border-card-border hover:border-muted'
                                                                            }`}
                                                                        title={hasRelation ? 'Quitar acceso a este tramo' : 'Dar acceso a este tramo'}
                                                                    >
                                                                        {isToggling ? (
                                                                            <div className="w-3.5 h-3.5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
                                                                        ) : hasRelation ? (
                                                                            <Check className="w-4 h-4" />
                                                                        ) : (
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-card-border" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted text-sm">No hay datos para mostrar la matriz.</div>
                        )}

                        <div className="mt-4 px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-muted flex items-start gap-2">
                            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
                            <p>Podés habilitar o deshabilitar tramos para cada tipo de acceso haciendo clic en las celdas de la matriz. Los cambios se guardan automáticamente.</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
