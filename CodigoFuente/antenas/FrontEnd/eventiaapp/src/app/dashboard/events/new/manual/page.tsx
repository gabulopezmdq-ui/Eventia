'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTramoTipos, crearEstructuraManual } from '@/src/features/events/event.service';
import { confirmarSolicitud } from '@/src/features/plantillas/solicitudes-plantilla.service';
import type { TramoTipo, CrearEstructuraManualPayload, RelacionManualPayload } from '@/src/features/events/types';
import {
    Calendar, MapPin, Users, ArrowLeft,
    CheckCircle2, Clock, AlignLeft, Globe,
    LayoutGrid, Trash2, Plus, ArrowRight,
    Save, Check, AlertCircle, Bookmark,
    ListChecks, Rocket, PartyPopper, Sparkles,
    Send, Eye, ShieldCheck
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
    { id: 1, title: 'Agenda y Tramos', icon: Clock, color: 'indigo' },
    { id: 2, title: 'Accesos e Invitaciones', icon: Users, color: 'emerald' },
    { id: 3, title: 'Checklist Final', icon: ListChecks, color: 'purple' },
    { id: 4, title: 'Confirmar Solicitud', icon: ShieldCheck, color: 'amber' },
];

/* ═══════════════════════════════════════════════════════════
   LOCALSTORAGE PERSISTENCE
   ═══════════════════════════════════════════════════════════ */
const STORAGE_KEY_PREFIX = 'eventia:wizardEstructura';
const DEBOUNCE_MS = 500;

interface WizardStorageData {
    currentStep: number;
    tramos: LocalTramo[];
    accesos: LocalAcceso[];
    defaultAccesoLocalId: string;
    relaciones: string[]; // Set serializado como array
    savedAt: string;
}

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
    const [structureSaved, setStructureSaved] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [storageLoaded, setStorageLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

    /* ═══════════════════════════════════════════════════════════
       LOCALSTORAGE: HELPERS
       ═══════════════════════════════════════════════════════════ */
    const getStorageKey = useCallback(() => {
        return `${STORAGE_KEY_PREFIX}:${idEvento}`;
    }, [idEvento]);

    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(getStorageKey());
        } catch (e) {
            console.warn('Error al limpiar localStorage:', e);
        }
    }, [getStorageKey]);

    const loadFromStorage = useCallback((): WizardStorageData | null => {
        try {
            const raw = localStorage.getItem(getStorageKey());
            if (!raw) return null;
            return JSON.parse(raw) as WizardStorageData;
        } catch (e) {
            console.warn('Error al leer localStorage:', e);
            return null;
        }
    }, [getStorageKey]);

    const restoreFromStorage = useCallback((data: WizardStorageData) => {
        setTramos(data.tramos);
        setAccesos(data.accesos);
        setDefaultAccesoLocalId(data.defaultAccesoLocalId);
        setRelacionesSet(new Set(data.relaciones));
        setCurrentStep(data.currentStep);
        setShowResumePrompt(false);
    }, []);

    /* ═══════════════════════════════════════════════════════════
       INIT: Cargar maestros + detectar datos en localStorage
       ═══════════════════════════════════════════════════════════ */
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

        // Verificar si hay datos guardados en localStorage
        const savedData = loadFromStorage();
        if (savedData && savedData.tramos.length > 0) {
            setShowResumePrompt(true);
        }
        setStorageLoaded(true);

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
       LOCALSTORAGE: Auto-guardar con debounce
       ═══════════════════════════════════════════════════════════ */
    useEffect(() => {
        // No guardar si todavía no se cargó, si ya se confirmó, o si ya se guardó la estructura
        if (!storageLoaded || confirmed || structureSaved || !idEvento) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            try {
                const data: WizardStorageData = {
                    currentStep,
                    tramos,
                    accesos,
                    defaultAccesoLocalId,
                    relaciones: Array.from(relacionesSet),
                    savedAt: new Date().toISOString(),
                };
                localStorage.setItem(getStorageKey(), JSON.stringify(data));
            } catch (e) {
                console.warn('Error al guardar en localStorage:', e);
            }
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [currentStep, tramos, accesos, defaultAccesoLocalId, relacionesSet, storageLoaded, confirmed, structureSaved, idEvento, getStorageKey]);

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

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
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
                // Avanzar al paso de confirmación (Step 4)
                setStructureSaved(true);
                setError(null);
                setCurrentStep(4);
            }
        } catch (err) {
            setError('Error al guardar la estructura manual.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       CONFIRMAR SOLICITUD (D → P)
       ═══════════════════════════════════════════════════════════ */
    const handleConfirmar = async () => {
        setLoading(true);
        setError(null);
        try {
            await confirmarSolicitud(draftId);
            setConfirmed(true);
            // Limpiar localStorage al confirmar exitosamente
            clearStorage();
        } catch (err) {
            setError('Error al confirmar la solicitud. Intentá de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       RENDERIZADO
       ═══════════════════════════════════════════════════════════ */
    return (
        <section className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.push('/dashboard/events/new')}
                        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver a eventos</span>
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Crear Estructura Manual
                    </h1>
                    <p className="text-muted text-sm mt-1">Definí los tramos y los tipos de invitación desde cero.</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                        Paso {currentStep} de {WIZARD_STEPS.length}
                    </span>
                </div>
            </div>

            {/* Banner: Continuar donde lo dejaste */}
            {showResumePrompt && (
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                                <Save className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Tenés un borrador guardado</p>
                                <p className="text-xs text-muted mt-0.5">
                                    {(() => {
                                        const data = loadFromStorage();
                                        if (data?.savedAt) {
                                            const saved = new Date(data.savedAt);
                                            return `Guardado el ${saved.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} — ${data.tramos.length} tramo(s), ${data.accesos.length} acceso(s)`;
                                        }
                                        return 'Progreso guardado anteriormente';
                                    })()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => {
                                    clearStorage();
                                    setShowResumePrompt(false);
                                }}
                                className="px-3 py-2 rounded-lg text-xs font-semibold text-muted hover:text-foreground border border-card-border hover:bg-card-bg transition-colors"
                            >
                                Empezar de cero
                            </button>
                            <button
                                onClick={() => {
                                    const data = loadFromStorage();
                                    if (data) restoreFromStorage(data);
                                }}
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-500/20"
                            >
                                Continuar donde lo dejaste
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 px-4 py-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
            )}

            {/* ─── Step Indicator ─── */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-card-border" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                        style={{ width: `${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100}%` }}
                    />

                    {WIZARD_STEPS.map((step) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const StepIcon = step.icon;

                        return (
                            <button
                                type="button"
                                key={step.id}
                                onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                                className="relative flex flex-col items-center gap-2 z-10 group cursor-pointer"
                                disabled={step.id > currentStep}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isCompleted
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-500 shadow-lg shadow-indigo-500/30 scale-100'
                                        : isCurrent
                                            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-110'
                                            : 'bg-card-bg border-card-border group-hover:border-muted/60'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 text-white" />
                                    ) : (
                                        <StepIcon className={`w-4 h-4 transition-colors ${isCurrent ? 'text-indigo-400' : 'text-muted'}`} />
                                    )}
                                </div>
                                <span className={`text-xs font-semibold tracking-wide transition-colors hidden sm:block ${isCurrent ? 'text-indigo-400' : isCompleted ? 'text-foreground' : 'text-muted'
                                    }`}>
                                    {step.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contenido Step 1: Tramos */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Clock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Configurar Tramos del Evento</h2>
                            <p className="text-xs text-muted">Ejemplo: Ceremonia, Recepción, Cena, Fiesta.</p>
                        </div>
                    </div>

                    {tramos.map((tramo, i) => (
                        <div key={tramo.localId} className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl relative transition-all hover:border-indigo-500/30">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className="text-xs font-bold text-muted uppercase">Orden: {i + 1}</span>
                                {tramos.length > 1 && (
                                    <button onClick={() => removeTramo(tramo.localId)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">{i + 1}</span>
                                Detalles del Tramo
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
                        <button onClick={addTramo} type="button" className="flex items-center w-full justify-center gap-2 px-4 py-4 rounded-xl bg-background/50 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 font-semibold text-sm transition-colors border border-dashed border-indigo-500/30 hover:border-indigo-500/50">
                            <Plus className="w-4 h-4" /> Agregar Otro Tramo
                        </button>
                    </div>
                </div>
            )}

            {/* Contenido Step 2: Accesos */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Accesos e Invitaciones</h2>
                            <p className="text-xs text-muted">Definí los grupos de invitados (Ej: Sólo Ceremonia, Fiesta, General).</p>
                        </div>
                    </div>

                    {accesos.map((acceso, i) => (
                        <div key={acceso.localId} className={`p-6 sm:p-8 rounded-2xl bg-card-bg border backdrop-blur-xl transition-all ${defaultAccesoLocalId === acceso.localId ? 'border-amber-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : 'border-card-border hover:border-emerald-500/30'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${defaultAccesoLocalId === acceso.localId ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'}`}>{i + 1}</span>
                                    Acceso/Invitación
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultAccesoLocalId(acceso.localId)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${defaultAccesoLocalId === acceso.localId
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            : 'bg-background hover:bg-amber-500/5 text-muted hover:text-amber-400 border-card-border hover:border-amber-500/20'
                                            }`}
                                    >
                                        <Bookmark className={`w-3.5 h-3.5 ${defaultAccesoLocalId === acceso.localId ? 'fill-current' : ''}`} />
                                        {defaultAccesoLocalId === acceso.localId ? 'Default' : 'Hacer Default'}
                                    </button>

                                    {accesos.length > 1 && (
                                        <button onClick={() => removeAcceso(acceso.localId)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
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
                        <button onClick={addAcceso} type="button" className="flex items-center w-full justify-center gap-2 px-4 py-4 rounded-xl bg-background/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-semibold text-sm transition-colors border border-dashed border-emerald-500/30 hover:border-emerald-500/50">
                            <Plus className="w-4 h-4" /> Agregar Otro Acceso
                        </button>
                    </div>
                </div>
            )}

            {/* Contenido Step 3: Matriz */}
            {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <ListChecks className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Matriz de Relaciones</h2>
                            <p className="text-xs text-muted">Hacé click en las casillas para definir qué tramos estarán incluidos en cada acceso.</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border overflow-x-auto backdrop-blur-xl hover:border-purple-500/30 transition-all">
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

            {/* Contenido Step 4: Confirmar Solicitud */}
            {currentStep === 4 && !confirmed && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Header + Badge de estructura guardada */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Eye className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-foreground">Revisá tu Estructura</h2>
                            <p className="text-xs text-muted">Verificá que todo esté correcto antes de enviar a revisión.</p>
                        </div>
                    </div>

                    {structureSaved && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">Estructura guardada correctamente en el servidor</span>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-card-bg border border-card-border text-center group hover:border-indigo-500/30 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto mb-2 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Clock className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{tramos.length}</p>
                            <p className="text-[11px] text-muted font-medium uppercase tracking-wider">{tramos.length === 1 ? 'Tramo' : 'Tramos'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-card-bg border border-card-border text-center group hover:border-emerald-500/30 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Users className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{accesos.length}</p>
                            <p className="text-[11px] text-muted font-medium uppercase tracking-wider">{accesos.length === 1 ? 'Acceso' : 'Accesos'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-card-bg border border-card-border text-center group hover:border-purple-500/30 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-2 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{relacionesSet.size}</p>
                            <p className="text-[11px] text-muted font-medium uppercase tracking-wider">{relacionesSet.size === 1 ? 'Relación' : 'Relaciones'}</p>
                        </div>
                    </div>

                    {/* Resumen de Tramos */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <h3 className="font-semibold text-foreground">Tramos del Evento</h3>
                            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {tramos.length} {tramos.length === 1 ? 'tramo' : 'tramos'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {tramos.map((t, i) => {
                                const tipo = tramoTipos.find(tt => tt.id === t.id_tramo_tipo);
                                return (
                                    <div key={t.localId} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-background/50 border border-card-border/50 hover:border-indigo-500/20 transition-colors">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground">{t.nombre || 'Sin nombre'}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                <span className="text-xs text-muted">{tipo?.texto || 'Tipo no seleccionado'}</span>
                                                {t.fecha_hora_inicio && (
                                                    <span className="text-xs text-muted flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(t.fecha_hora_inicio).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                )}
                                                {t.lugar && (
                                                    <span className="text-xs text-muted flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />{t.lugar}
                                                    </span>
                                                )}
                                            </div>
                                            {t.leyenda_visible && (
                                                <p className="text-xs text-indigo-400/70 mt-1.5 italic">"{t.leyenda_visible}"</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Resumen de Accesos */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-semibold text-foreground">Tipos de Invitación</h3>
                            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {accesos.length} {accesos.length === 1 ? 'acceso' : 'accesos'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {accesos.map((a, i) => {
                                const isDefault = a.localId === defaultAccesoLocalId;
                                const tramosCount = tramos.filter(t => relacionesSet.has(`${a.localId}-${t.localId}`)).length;
                                const tramoNames = tramos.filter(t => relacionesSet.has(`${a.localId}-${t.localId}`)).map(t => t.nombre || `Tramo ${tramos.indexOf(t) + 1}`);
                                return (
                                    <div key={a.localId} className={`px-4 py-3 rounded-xl border transition-colors ${isDefault ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50' : 'bg-background/50 border-card-border/50 hover:border-emerald-500/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${isDefault ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'}`}>{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {a.nombre || 'Sin nombre'}
                                                    {isDefault && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 uppercase">Default</span>
                                                    )}
                                                </p>
                                                {a.mensaje_rsvp && <p className="text-xs text-muted truncate mt-0.5">{a.mensaje_rsvp}</p>}
                                            </div>
                                            <span className="text-xs text-muted flex-shrink-0">
                                                {tramosCount} {tramosCount === 1 ? 'tramo' : 'tramos'}
                                            </span>
                                        </div>
                                        {tramoNames.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                                                {tramoNames.map((name, idx) => (
                                                    <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/15">
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Resumen de Matriz */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border overflow-x-auto backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <ListChecks className="w-4 h-4 text-purple-400" />
                            <h3 className="font-semibold text-foreground">Matriz de Relaciones</h3>
                        </div>
                        <table className="w-full min-w-[400px] text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 border-b border-card-border text-xs font-semibold text-muted bg-background/50 rounded-tl-xl">Acceso</th>
                                    {tramos.map((tr, i) => (
                                        <th key={tr.localId} className="p-3 border-b border-l border-card-border text-center text-xs font-semibold text-foreground bg-background/50">
                                            {tr.nombre || `Tramo ${i + 1}`}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {accesos.map(acc => (
                                    <tr key={acc.localId} className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-3 border-r border-card-border text-sm font-medium text-foreground">
                                            {acc.localId === defaultAccesoLocalId && <Bookmark className="w-3 h-3 text-amber-500 inline mr-1.5" />}
                                            {acc.nombre || 'Sin nombre'}
                                        </td>
                                        {tramos.map(tr => {
                                            const checked = relacionesSet.has(`${acc.localId}-${tr.localId}`);
                                            return (
                                                <td key={tr.localId} className="p-3 text-center border-l border-card-border">
                                                    {checked ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                                                    ) : (
                                                        <span className="text-muted/20">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Aviso importante */}
                    <div className="px-5 py-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-200">¿Todo listo?</p>
                            <p className="text-xs text-muted mt-1">
                                Al confirmar, tu estructura será enviada al equipo de revisión.
                                Un administrador la revisará y la aprobará o te pedirá modificaciones.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pantalla de Éxito post-confirmación */}
            {currentStep === 4 && confirmed && (
                <div className="animate-in fade-in zoom-in-95 duration-700">
                    {/* Hero de éxito */}
                    <div className="flex flex-col items-center justify-center text-center py-12">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                                <PartyPopper className="w-12 h-12 text-emerald-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-in zoom-in duration-500" style={{ animationDelay: '300ms' }}>
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-3">¡Estructura Enviada!</h2>
                        <p className="text-muted max-w-lg text-sm leading-relaxed">
                            Tu estructura con <span className="text-foreground font-semibold">{tramos.length} {tramos.length === 1 ? 'tramo' : 'tramos'}</span> y <span className="text-foreground font-semibold">{accesos.length} {accesos.length === 1 ? 'acceso' : 'accesos'}</span> fue enviada para revisión.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold mt-6">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Pendiente de Revisión
                        </div>
                    </div>

                    {/* Qué sigue — Timeline */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl mt-4 mb-8">
                        <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            ¿Qué sigue?
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Estructura creada', desc: 'Armaste tramos, accesos y relaciones', done: true, bgClass: 'bg-emerald-500/20', borderClass: 'border-emerald-500/50', textClass: 'text-emerald-400' },
                                { label: 'Enviada a revisión', desc: 'Un administrador revisará tu estructura', done: true, bgClass: 'bg-emerald-500/20', borderClass: 'border-emerald-500/50', textClass: 'text-emerald-400' },
                                { label: 'Aprobación', desc: 'El admin aprobará o solicitará cambios', done: false, bgClass: 'bg-amber-500/20', borderClass: 'border-amber-500/50', textClass: 'text-amber-400' },
                                { label: '¡Evento listo!', desc: 'Podrás empezar a invitar a tus invitados', done: false, bgClass: 'bg-indigo-500/20', borderClass: 'border-indigo-500/50', textClass: 'text-indigo-400' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${step.done
                                            ? `${step.bgClass} ${step.borderClass}`
                                            : 'bg-card-bg border-card-border'
                                            }`}>
                                            {step.done ? (
                                                <Check className={`w-3.5 h-3.5 ${step.textClass}`} />
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-muted/40" />
                                            )}
                                        </div>
                                        {i < 3 && <div className={`w-px h-6 ${step.done ? 'bg-emerald-500/30' : 'bg-card-border'}`} />}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className={`text-sm font-semibold ${step.done ? 'text-foreground' : 'text-muted'}`}>{step.label}</p>
                                        <p className="text-xs text-muted">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => router.push('/dashboard/events')}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-card-border text-muted font-semibold text-sm hover:text-foreground hover:bg-card-bg transition-colors w-full sm:w-auto justify-center"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/events/${idEvento}`)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg shadow-indigo-500/20 font-semibold w-full sm:w-auto justify-center"
                        >
                            Ver mi Evento <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Acciones Globales (Next / Guardar / Confirmar) */}
            {!confirmed && (
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-card-border">
                    {currentStep > 1 && currentStep <= 3 ? (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-muted font-semibold text-sm hover:text-foreground hover:bg-card-bg transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Anterior
                        </button>
                    ) : currentStep === 4 && !structureSaved ? (
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-muted font-semibold text-sm hover:text-foreground hover:bg-card-bg transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver a editar
                        </button>
                    ) : <div />}

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 font-semibold disabled:opacity-50"
                        >
                            Siguiente <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : currentStep === 3 ? (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-colors shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar y Revisar'}
                            {!loading && <Eye className="w-4 h-4" />}
                        </button>
                    ) : currentStep === 4 ? (
                        <button
                            onClick={handleConfirmar}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 transition-colors shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Solicitud'}
                            {!loading && <Send className="w-4 h-4" />}
                        </button>
                    ) : null}
                </div>
            )}
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
