'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTramoTipos, crearEstructuraManual } from '@/src/features/events/event.service';
import type { TramoTipo, CrearEstructuraManualPayload, RelacionManualPayload } from '@/src/features/events/types';
import {
    Calendar, MapPin, Users, ArrowLeft,
    CheckCircle2, Clock, AlignLeft, Globe,
    LayoutGrid, Trash2, Plus, ArrowRight,
    Save, Check, AlertCircle, Bookmark,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TYPES LOCALES PARA EL WIZARD (UI STATE)
   ═══════════════════════════════════════════════════════════ */
interface LocalTramo {
    localId: string;
    id_tramo_tipo: number;
    nombre: string;
    leyenda_visible: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    lugar: string;
    direccion: string;
    latitud: string;
    longitud: string;
    activo: boolean;
}

interface LocalAcceso {
    localId: string;
    nombre: string;
    mensaje_rsvp: string;
    activo: boolean;
}

function generateLocalId() {
    return Math.random().toString(36).substr(2, 9);
}

const WIZARD_STEPS = [
    { id: 1, title: 'Agenda y Tramos' },
    { id: 2, title: 'Accesos e Invitaciones' },
    { id: 3, title: '¿Qué incluye cada acceso?' },
];

function ManualWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Contexto desde Query Params
    const idEvento = Number(searchParams.get('idEvento'));
    const draftId = Number(searchParams.get('draftId'));
    const idIdioma = Number(searchParams.get('idIdioma')) || 2;

    // Estado General
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data de Maestros
    const [tramoTipos, setTramoTipos] = useState<TramoTipo[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(true);

    // Estado de "Tramos"
    const [tramos, setTramos] = useState<LocalTramo[]>([{
        localId: generateLocalId(),
        id_tramo_tipo: 0,
        nombre: '',
        leyenda_visible: '',
        fecha_hora_inicio: '',
        fecha_hora_fin: '',
        lugar: '',
        direccion: '',
        latitud: '',
        longitud: '',
        activo: true,
    }]);

    // Estado de "Accesos"
    const [accesos, setAccesos] = useState<LocalAcceso[]>([{
        localId: generateLocalId(),
        nombre: 'Invitación Completa',
        mensaje_rsvp: '¡Te esperamos!',
        activo: true,
    }]);
    const [defaultAccesoLocalId, setDefaultAccesoLocalId] = useState<string>('');

    // Estado de "Relaciones" (Matriz) Set de strings: "accesoLocalId-tramoLocalId"
    const [relacionesSet, setRelacionesSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!idEvento || !draftId) {
            router.push('/dashboard/events');
            return;
        }

        async function fetchTipos() {
            try {
                const tipos = await getTramoTipos(idIdioma);
                setTramoTipos(tipos);
            } catch (err) {
                console.error("Error al obtener tramo tipos", err);
            } finally {
                setLoadingTipos(false);
            }
        }
        fetchTipos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEvento, draftId, idIdioma]);

    // Setear el primer acceso como default automático al arrancar
    useEffect(() => {
        if (accesos.length > 0 && !defaultAccesoLocalId) {
            setDefaultAccesoLocalId(accesos[0].localId);
        }
        // Validar que el default siga existiendo si se borró
        if (defaultAccesoLocalId && !accesos.find(a => a.localId === defaultAccesoLocalId)) {
            setDefaultAccesoLocalId(accesos[0]?.localId || '');
        }
    }, [accesos, defaultAccesoLocalId]);

    /* ═══════════════════════════════════════════════════════════
       HANDLERS: TRAMOS
       ═══════════════════════════════════════════════════════════ */
    const updateTramo = (localId: string, field: keyof LocalTramo, value: any) => {
        setTramos(prev => prev.map(t => t.localId === localId ? { ...t, [field]: value } : t));
    };

    const addTramo = () => {
        setTramos(prev => [...prev, {
            localId: generateLocalId(),
            id_tramo_tipo: 0,
            nombre: '',
            leyenda_visible: '',
            fecha_hora_inicio: '',
            fecha_hora_fin: '',
            lugar: '',
            direccion: '',
            latitud: '',
            longitud: '',
            activo: true,
        }]);
    };

    const removeTramo = (localId: string) => {
        if (tramos.length <= 1) return; // Mínimo 1 tramo
        setTramos(prev => prev.filter(t => t.localId !== localId));
        // Limpiar relaciones
        setRelacionesSet(prev => {
            const nuevo = new Set(prev);
            for (let item of nuevo) {
                if (item.endsWith(`-${localId}`)) nuevo.delete(item);
            }
            return nuevo;
        });
    };

    /* ═══════════════════════════════════════════════════════════
       HANDLERS: ACCESOS
       ═══════════════════════════════════════════════════════════ */
    const updateAcceso = (localId: string, field: keyof LocalAcceso, value: any) => {
        setAccesos(prev => prev.map(a => a.localId === localId ? { ...a, [field]: value } : a));
    };

    const addAcceso = () => {
        setAccesos(prev => [...prev, {
            localId: generateLocalId(),
            nombre: '',
            mensaje_rsvp: '',
            activo: true,
        }]);
    };

    const removeAcceso = (localId: string) => {
        if (accesos.length <= 1) return; // Mínimo 1 acceso
        setAccesos(prev => prev.filter(a => a.localId !== localId));
        // Limpiar correlaciones
        setRelacionesSet(prev => {
            const nuevo = new Set(prev);
            for (let item of nuevo) {
                if (item.startsWith(`${localId}-`)) nuevo.delete(item);
            }
            return nuevo;
        });
    };

    /* ═══════════════════════════════════════════════════════════
       HANDLERS: MATRIZ
       ═══════════════════════════════════════════════════════════ */
    const toggleRelacion = (accId: string, trId: string) => {
        const token = `${accId}-${trId}`;
        setRelacionesSet(prev => {
            const nuevo = new Set(prev);
            if (nuevo.has(token)) nuevo.delete(token);
            else nuevo.add(token);
            return nuevo;
        });
    };

    /* ═══════════════════════════════════════════════════════════
       VALIDACIONES Y NAVEGACIÓN
       ═══════════════════════════════════════════════════════════ */
    const isStep1Valid = () => {
        return tramos.every(t => t.id_tramo_tipo > 0 && t.nombre.trim() !== '' && t.leyenda_visible.trim() !== '' && t.fecha_hora_inicio !== '');
    };

    const isStep2Valid = () => {
        return accesos.every(a => a.nombre.trim() !== '') && !!defaultAccesoLocalId;
    };

    const isStep3Valid = () => {
        // Cada acceso debe tener al menos 1 tramo
        return accesos.every(a => {
            return tramos.some(t => relacionesSet.has(`${a.localId}-${t.localId}`));
        });
    };

    const handleNext = () => {
        if (currentStep === 1 && !isStep1Valid()) {
            setError('Faltan campos obligatorios en los tramos (Tipo, Nombre o Fecha Inicio).');
            return;
        }
        if (currentStep === 2 && !isStep2Valid()) {
            setError('Faltan campos obligatorios en los accesos (o no hay Default).');
            return;
        }
        setError(null);
        setCurrentStep(prev => prev + 1);
    };

    const handleSave = async () => {
        if (!isStep3Valid()) {
            setError('Todos los tipos de invitación deben tener al menos un tramo asignado en la matriz.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const payloadAccesos = accesos.map((a, idx) => ({
                localId: a.localId, // Temporal para mapeo cruzado
                nombre: a.nombre,
                mensaje_rsvp: a.mensaje_rsvp || null,
                es_publico: false, // Fijo por regla
                cupo: null, // Oculto/null por ahora
                orden: idx + 1,
                activo: a.activo,
                es_default: a.localId === defaultAccesoLocalId,
            }));

            const payloadTramos = tramos.map((t, idx) => ({
                localId: t.localId, // Temporal para mapeo
                id_tramo_tipo: t.id_tramo_tipo,
                nombre: t.nombre,
                leyenda_visible: t.leyenda_visible || null,
                fecha_hora_inicio: new Date(t.fecha_hora_inicio).toISOString(),
                fecha_hora_fin: t.fecha_hora_fin ? new Date(t.fecha_hora_fin).toISOString() : null,
                lugar: t.lugar || null,
                direccion: t.direccion || null,
                latitud: t.latitud ? parseFloat(t.latitud) : null,
                longitud: t.longitud ? parseFloat(t.longitud) : null,
                orden: idx + 1,
                cupo: null, // default nulo
                activo: t.activo
            }));

            // Construir JSON de Relaciones { acceso_orden, tramo_orden }
            const relacionesPayload: RelacionManualPayload[] = [];
            payloadAccesos.forEach(acc => {
                payloadTramos.forEach(tr => {
                    if (relacionesSet.has(`${acc.localId}-${tr.localId}`)) {
                        relacionesPayload.push({
                            acceso_orden: acc.orden,
                            tramo_orden: tr.orden
                        });
                    }
                });
            });

            const finalPayload: CrearEstructuraManualPayload = {
                borrar_existente: true,
                id_solicitud_draft: draftId,
                motivo: 'NO_HAY_PLANTILLAS',
                tramos: payloadTramos.map(({ localId, ...rest }) => rest), // Quitar el localId antes de enviar
                accesos: payloadAccesos.map(({ localId, ...rest }) => rest),
                relaciones: relacionesPayload,
            };

            const result = await crearEstructuraManual(idEvento, finalPayload);

            if (result) {
                // Redirigimos al editor de la estructura final
                router.push(`/dashboard/events/${idEvento}/estructura`);
            }
        } catch (err) {
            setError('Error al guardar la estructura manual.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       RENDERIZADO
       ═══════════════════════════════════════════════════════════ */
    return (
        <section className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/dashboard/events/new')}
                    className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-2 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Volver</span>
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Crear Estructura Manual</h1>
                        <p className="text-muted text-sm mt-1">Definí los tramos y los tipos de invitación desde cero.</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Wizard Steps Tabs UI */}
            <div className="flex gap-2 mb-8 border-b border-card-border pb-4 overflow-x-auto">
                {WIZARD_STEPS.map(step => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                        disabled={step.id > currentStep}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentStep === step.id
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : step.id < currentStep
                                ? 'text-foreground hover:bg-card-bg cursor-pointer'
                                : 'text-muted opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step.id < currentStep ? 'bg-emerald-500 text-black' : currentStep === step.id ? 'bg-purple-500 text-white' : 'bg-card-border'
                            }`}>
                            {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
                        </div>
                        {step.title}
                    </button>
                ))}
            </div>

            {/* Contenido Step 1: Tramos */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    {tramos.map((tramo, i) => (
                        <div key={tramo.localId} className="p-6 rounded-2xl bg-card-bg border border-card-border relative">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className="text-xs font-bold text-muted uppercase">Orden: {i + 1}</span>
                                {tramos.length > 1 && (
                                    <button onClick={() => removeTramo(tramo.localId)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" />
                                Tramo {i + 1}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">Tipo de Tramo *</label>
                                    <select
                                        value={tramo.id_tramo_tipo}
                                        onChange={e => updateTramo(tramo.localId, 'id_tramo_tipo', parseInt(e.target.value))}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    >
                                        <option value={0} disabled>Seleccione...</option>
                                        {tramoTipos.map(tt => <option key={tt.id} value={tt.id}>{tt.texto}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">Nombre Visible *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Recepción principal"
                                        value={tramo.nombre}
                                        onChange={e => updateTramo(tramo.localId, 'nombre', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">Fecha Inicio *</label>
                                    <input
                                        type="datetime-local"
                                        value={tramo.fecha_hora_inicio}
                                        onChange={e => updateTramo(tramo.localId, 'fecha_hora_inicio', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">Fecha Fin (Opcional)</label>
                                    <input
                                        type="datetime-local"
                                        value={tramo.fecha_hora_fin}
                                        onChange={e => updateTramo(tramo.localId, 'fecha_hora_fin', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block flex items-center gap-1">Leyenda Visible <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Llegar 20 min antes..."
                                        value={tramo.leyenda_visible}
                                        onChange={e => updateTramo(tramo.localId, 'leyenda_visible', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-muted mb-1 block">Lugar / Ubicación Corta</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Salón Las Palmas"
                                        value={tramo.lugar}
                                        onChange={e => updateTramo(tramo.localId, 'lugar', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center gap-4 pt-2">
                        <button onClick={addTramo} type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-medium text-sm transition-colors border border-purple-500/20">
                            <Plus className="w-4 h-4" /> Agregar Tramo
                        </button>
                    </div>
                </div>
            )}

            {/* Contenido Step 2: Accesos */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    {accesos.map((acceso, i) => (
                        <div key={acceso.localId} className={`p-6 rounded-2xl bg-card-bg border transition-all ${defaultAccesoLocalId === acceso.localId ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-card-border'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Bookmark className={`w-4 h-4 ${defaultAccesoLocalId === acceso.localId ? 'text-amber-400' : 'text-purple-400'}`} />
                                    Acceso/Invitación {i + 1}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="default_acceso"
                                            checked={defaultAccesoLocalId === acceso.localId}
                                            onChange={() => setDefaultAccesoLocalId(acceso.localId)}
                                            className="w-4 h-4 text-amber-500 focus:ring-amber-500 translate-y-[1px]"
                                        />
                                        <span className={`text-xs font-medium ${defaultAccesoLocalId === acceso.localId ? 'text-amber-300' : 'text-muted'}`}>Default</span>
                                    </label>

                                    {accesos.length > 1 && (
                                        <button onClick={() => removeAcceso(acceso.localId)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">Nombre *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Cena + Fiesta"
                                        value={acceso.nombre}
                                        onChange={e => updateAcceso(acceso.localId, 'nombre', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">Mensaje de Confirmación (RSVP)</label>
                                    <input
                                        type="text"
                                        placeholder="Que verá el usuario al aceptar"
                                        value={acceso.mensaje_rsvp}
                                        onChange={e => updateAcceso(acceso.localId, 'mensaje_rsvp', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border text-foreground outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center gap-4 pt-2">
                        <button onClick={addAcceso} type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-medium text-sm transition-colors border border-purple-500/20">
                            <Plus className="w-4 h-4" /> Agregar Acceso
                        </button>
                    </div>
                </div>
            )}

            {/* Contenido Step 3: Matriz */}
            {currentStep === 3 && (
                <div className="animate-in slide-in-from-right-4">
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-card-border text-sm font-semibold text-muted bg-background/50 rounded-tl-xl w-[200px]">
                                        Accesos \ Tramos
                                    </th>
                                    {tramos.map((tr, i) => (
                                        <th key={tr.localId} className="p-4 border-b border-l border-card-border text-center text-sm font-semibold text-foreground bg-background/50">
                                            <span className="text-xs text-muted block mb-1">Orden {i + 1}</span>
                                            {tr.nombre || 'Tramo sin nombre'}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {accesos.map(acc => {
                                    const isDefault = defaultAccesoLocalId === acc.localId;
                                    return (
                                        <tr key={acc.localId} className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 border-r border-card-border font-medium flex items-center gap-2">
                                                {isDefault && <Bookmark className="w-3.5 h-3.5 text-amber-500" />}
                                                <span className={isDefault ? 'text-amber-100' : 'text-foreground'}>
                                                    {acc.nombre || 'Acceso sin nombre'}
                                                </span>
                                            </td>
                                            {tramos.map(tr => {
                                                const checked = relacionesSet.has(`${acc.localId}-${tr.localId}`);
                                                return (
                                                    <td key={tr.localId} className="p-4 text-center border-l border-card-border hover:bg-purple-500/5 transition-colors" onClick={() => toggleRelacion(acc.localId, tr.localId)}>
                                                        <div className="flex items-center justify-center cursor-pointer w-full h-full min-h-[40px]">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${checked ? 'bg-purple-500 border-purple-500' : 'bg-background border-card-border'}`}>
                                                                {checked && <Check className="w-4 h-4 text-white" />}
                                                            </div>
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
                </div>
            )}

            {/* Acciones Globales (Next / Guardar) */}
            <div className="flex justify-end mt-12 pt-6 border-t border-card-border">
                {currentStep < 3 ? (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20 font-medium disabled:opacity-50"
                    >
                        Siguiente <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 font-medium disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Finalizar y Crear'}
                        {!loading && <Save className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </section>
    );
}

export default function ManualWizardPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>}>
            <ManualWizardContent />
        </Suspense>
    );
}
