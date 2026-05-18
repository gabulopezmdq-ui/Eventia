'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    createEvent,
    getTiposEvento,
    getIdiomasActivos,
    getPlantillasByTipo,
    getDressCodes,
    getPlantillaDetalle,
    aplicarPlantilla,
    iniciarSolicitudDraft,
    getPlanesCatalogB2C,
} from '@/src/features/events/event.service';
import type { PlanPublico } from '@/src/features/events/event.service';
import BannerEstadoComercial from '@/src/components/eventos/BannerEstadoComercial';
import type {
    TipoEvento,
    Idioma,
    DressCode,
    PlantillaEvento,
    PlantillaDetalle,
    AplicarPlantillaPayload,
    CreateEventPayload,
} from '@/src/features/events/types';
import { usePlanLimit } from '@/src/context/PlanLimitContext';
import {
    Calendar,
    MapPin,
    Users,
    MessageSquare,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Clock,
    AlignLeft,
    Globe,
    PartyPopper,
    Check,
    Layers,
    Shirt,
    Rocket,
    ListChecks,
    LayoutGrid,
    Building2,
    UserCheck,
    Lock,
    Link,
    ClipboardList,
    Star,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   STEPS — Nuevo flujo según documento "Crear Evento CON Plantilla"
   ═══════════════════════════════════════════════════════════ */
const STEPS = [
    { id: 1, title: 'Información Básica', icon: PartyPopper, color: 'indigo' },
    { id: 2, title: 'Elegir Estructura', icon: Layers, color: 'purple' },
    { id: 3, title: 'Datos Base', icon: MapPin, color: 'emerald' },
    { id: 4, title: 'Acceso y Confirmación', icon: Lock, color: 'violet' },
    { id: 5, title: '¡Listo!', icon: CheckCircle2, color: 'amber' },
];

/* ═══════════════════════════════════════════════════════════
   B2B — tipos auxiliares
   ═══════════════════════════════════════════════════════════ */
interface Unidad { id_unidad: number; nombre: string; }
interface Cliente { id_cliente: number; nombre_cliente: string; email?: string; unidad_principal?: string; }

function NewEventContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isB2BContext = searchParams.get('context') === 'cuenta';

    const { handlePlanLimitError } = usePlanLimit();

    // ── Estado general ──────────────────────────────────
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Step 1 — Selects ────────────────────────────────
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [dressCodes, setDressCodes] = useState<DressCode[]>([]);
    const [loadingSelects, setLoadingSelects] = useState(true);

    // ── Step 1 — Formulario ─────────────────────────────
    const [basicInfo, setBasicInfo] = useState({
        idTipoEvento: 0,
        idIdioma: 0,
        idDressCode: 0,
        dressCodeDescripcion: '',
        anfitrionesTexto: '',
        saludo: '',
        mensajeBienvenida: '',
        notas: '',
    });

    // ── idEvento retornado por POST /eventos ────────────
    const [idEvento, setIdEvento] = useState<number | null>(null);
    const [eventCreated, setEventCreated] = useState(false);

    // ── Step 2 — Plantillas ─────────────────────────────
    const [plantillas, setPlantillas] = useState<PlantillaEvento[]>([]);
    const [plantillaDetalles, setPlantillaDetalles] = useState<PlantillaDetalle[]>([]);
    const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | null>(null);
    const [loadingPlantillas, setLoadingPlantillas] = useState(false);
    const [loadingDetalles, setLoadingDetalles] = useState(false);

    // ── Step 3 — Datos base para aplicar plantilla ──────
    const [datosBase, setDatosBase] = useState({
        fechaBase: '',
        lugarBase: '',
        direccionBase: '',
        latitudBase: '',
        longitudBase: '',
    });

    // ── Step 4 — Acceso y Confirmación ──────────────────
    const [acceso, setAcceso] = useState<{
        esPublico: boolean;
        modoAcceso: 'I' | 'L';
        modoAsistencia: 'R' | 'C';
        infoPublica: string;
    }>({
        esPublico: false,
        modoAcceso: 'I',
        modoAsistencia: 'R',
        infoPublica: '',
    });

    // ── Step 5 — Plantilla aplicada ─────────────────────
    const [plantillaAplicada, setPlantillaAplicada] = useState(false);

    // ── Planes B2C ──────────────────────────────────────
    const [planes, setPlanes] = useState<PlanPublico[]>([]);
    const [codigoPlan, setCodigoPlan] = useState<string>('B2C_FREE');
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [loadingPlanes, setLoadingPlanes] = useState(false);

    // ── B2B — datos de contexto Cuenta ───────────────────
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingB2B, setLoadingB2B] = useState(false);
    const [b2bInfo, setB2bInfo] = useState<{
        idUnidad: number | '';
        destinatario: 'PROPIO' | 'CLIENTE';
        idCliente: number | '';
    }>({
        idUnidad: '',
        destinatario: 'PROPIO',
        idCliente: '',
    });

    /* ═══════════════════════════════════════════════════════════
       EFFECTS
       ═══════════════════════════════════════════════════════════ */

    // 1. Cargar idiomas + tipos al montar
    useEffect(() => {
        async function loadSelects() {
            setLoadingSelects(true);
            try {
                const [tipos, idiomasData] = await Promise.all([
                    getTiposEvento(2, 'EVENTO'),
                    getIdiomasActivos(),
                ]);
                setTiposEvento(tipos);
                setIdiomas(idiomasData);
                if (tipos.length > 0 && basicInfo.idTipoEvento === 0) {
                    setBasicInfo(prev => ({ ...prev, idTipoEvento: tipos[0].id }));
                }
                if (idiomasData.length > 0 && basicInfo.idIdioma === 0) {
                    setBasicInfo(prev => ({ ...prev, idIdioma: idiomasData[0].id_idioma }));
                }
            } catch {
                setError('No se pudieron cargar los datos necesarios.');
            } finally {
                setLoadingSelects(false);
            }

            // Cargar planes B2C y recuperar plan pre-seleccionado desde landing
            if (!isB2BContext) {
                setLoadingPlanes(true);
                const planesData = await getPlanesCatalogB2C();
                setPlanes(planesData);
                setLoadingPlanes(false);

                // Flujo A: el usuario vino de la landing y eligió un plan
                const planGuardado = localStorage.getItem('eventia_plan_seleccionado');
                if (planGuardado) {
                    setCodigoPlan(planGuardado);
                    localStorage.removeItem('eventia_plan_seleccionado');
                } else {
                    setCodigoPlan('B2C_FREE');
                }
            }
        }
        loadSelects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 5. Cargar unidades y clientes B2B al montar (solo si context=cuenta)
    useEffect(() => {
        if (!isB2BContext) return;
        async function loadB2BData() {
            setLoadingB2B(true);
            try {
                const [resUnidades, resClientes] = await Promise.all([
                    fetch('/api/cuenta-unidades'),
                    fetch('/api/clientes'),
                ]);
                if (resUnidades.ok) {
                    const data: Unidad[] = await resUnidades.json();
                    setUnidades(data);
                    if (data.length > 0) {
                        setB2bInfo(prev => ({ ...prev, idUnidad: data[0].id_unidad }));
                    }
                }
                if (resClientes.ok) {
                    const data: Cliente[] = await resClientes.json();
                    setClientes(data);
                }
            } catch (err) {
                console.error('Error cargando datos B2B:', err);
            } finally {
                setLoadingB2B(false);
            }
        }
        loadB2BData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isB2BContext]);

    // 2. Recargar tipos + dress codes cuando cambia el idioma
    useEffect(() => {
        if (basicInfo.idIdioma === 0) return;
        async function reloadByIdioma() {
            try {
                const [tipos, dressCodesData] = await Promise.all([
                    getTiposEvento(basicInfo.idIdioma, 'EVENTO'),
                    getDressCodes(basicInfo.idIdioma),
                ]);
                setTiposEvento(tipos);
                setDressCodes(dressCodesData);
                if (tipos.length > 0 && !tipos.find(t => t.id === basicInfo.idTipoEvento)) {
                    setBasicInfo(prev => ({ ...prev, idTipoEvento: tipos[0].id }));
                }
            } catch (err) {
                console.error('Error recargando datos por idioma:', err);
            }
        }
        reloadByIdioma();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [basicInfo.idIdioma]);

    // 3. Cargar plantillas cuando cambia el tipo de evento
    useEffect(() => {
        if (basicInfo.idTipoEvento === 0) return;
        async function loadPlantillas() {
            setLoadingPlantillas(true);
            try {
                const data = await getPlantillasByTipo(basicInfo.idTipoEvento);
                setPlantillas(data);
                setSelectedPlantillaId(null);
                setPlantillaDetalles([]);
            } catch {
                setPlantillas([]);
            } finally {
                setLoadingPlantillas(false);
            }
        }
        loadPlantillas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [basicInfo.idTipoEvento]);

    // 4. Cargar detalles de plantillas cuando se entra al step 2
    useEffect(() => {
        if (currentStep !== 2 || plantillas.length === 0) return;
        // Si ya tenemos detalles cargados para estas plantillas, no recargar
        if (plantillaDetalles.length === plantillas.length) return;

        async function loadDetalles() {
            setLoadingDetalles(true);
            try {
                const detalles = await Promise.all(
                    plantillas.map(p => getPlantillaDetalle(p.id_plantilla))
                );
                setPlantillaDetalles(detalles);
            } catch (err) {
                console.error('Error cargando detalles de plantillas:', err);
            } finally {
                setLoadingDetalles(false);
            }
        }
        loadDetalles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, plantillas]);

    /* ═══════════════════════════════════════════════════════════
       HANDLERS
       ═══════════════════════════════════════════════════════════ */

    const handleBasicInfoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'idTipoEvento' || name === 'idIdioma' || name === 'idDressCode') {
            setBasicInfo(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
            return;
        }
        setBasicInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleDatosBaseChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setDatosBase(prev => ({ ...prev, [name]: value }));
    };

    // Step 1 → 2: Crear evento base
    const handleCreateEvento = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload: CreateEventPayload = {
                idTipoEvento: basicInfo.idTipoEvento,
                idIdioma: basicInfo.idIdioma,
                idDressCode: basicInfo.idDressCode > 0 ? basicInfo.idDressCode : undefined,
                DressCodeDescripcion: basicInfo.dressCodeDescripcion || undefined,
                anfitrionesTexto: basicInfo.anfitrionesTexto,
                saludo: basicInfo.saludo || undefined,
                mensajeBienvenida: basicInfo.mensajeBienvenida || undefined,
                notas: basicInfo.notas || undefined,

                ...(isB2BContext
                    ? {
                        // Lógica para eventos de Cuenta (B2B)
                        modalidad: b2bInfo.destinatario, // 'PROPIO' | 'CLIENTE'
                        idUnidad: b2bInfo.idUnidad !== '' ? (b2bInfo.idUnidad as number) : null,
                        idCliente: b2bInfo.destinatario === 'CLIENTE' && b2bInfo.idCliente !== ''
                            ? (b2bInfo.idCliente as number)
                            : null,
                        codigoPlan: null,
                    }
                    : {
                        // Lógica para eventos Mi Espacio (B2C)
                        modalidad: null,
                        idUnidad: null,
                        idCliente: null,
                        codigoPlan: codigoPlan || null,
                    }
                ),
            };
            const result = await createEvent(payload);
            // El backend responde con camelCase (idEvento)
            const eventId = (result as unknown as { idEvento: number }).idEvento ?? result.id_evento;
            setIdEvento(eventId);
            setEventCreated(true);
            setCurrentStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo crear el evento. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3 → 4: Aplicar plantilla
    const handleAplicarPlantilla = async () => {
        if (!idEvento || !selectedPlantillaId) return;
        setLoading(true);
        setError(null);
        try {
            const payload: AplicarPlantillaPayload = {
                id_plantilla: selectedPlantillaId,
                borrar_existente: true,
                fecha_base: datosBase.fechaBase
                    ? new Date(datosBase.fechaBase).toISOString()
                    : '',
                lugar_base: datosBase.lugarBase || undefined,
                direccion_base: datosBase.direccionBase || undefined,
                latitud_base: datosBase.latitudBase ? parseFloat(datosBase.latitudBase) : undefined,
                longitud_base: datosBase.longitudBase ? parseFloat(datosBase.longitudBase) : undefined,
            };
            await aplicarPlantilla(idEvento, payload);
            setCurrentStep(4); // → Step 4: Acceso y Confirmación
        } catch (error) {
            try { handlePlanLimitError(error); }
            catch { setError('No se pudo aplicar la plantilla. Por favor, intenta de nuevo.'); }
        } finally {
            setLoading(false);
        }
    };

    // Step 4 → 5: Guardar configuración de acceso
    const handleGuardarAcceso = async () => {
        if (!idEvento) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/eventos/${idEvento}/configuracion`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    es_publico: acceso.esPublico,
                    modo_acceso: acceso.modoAcceso,
                    modo_asistencia: acceso.modoAsistencia,
                    info_publica: acceso.infoPublica,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || `Error ${res.status}`);
            }
            setPlantillaAplicada(true);
            setCurrentStep(5);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Alternar a Flujo Manual SIN Plantilla
    const handleIrAlWizardManual = async () => {
        if (!idEvento) return;
        setLoading(true);
        setError(null);
        try {
            const result = await iniciarSolicitudDraft(idEvento, 'NO_HAY_PLANTILLAS');
            if (result.ok && result.id_solicitud_draft) {
                router.push(`/dashboard/events/new/manual?idEvento=${idEvento}&draftId=${result.id_solicitud_draft}&idIdioma=${basicInfo.idIdioma}`);
            } else {
                setError('No se pudo iniciar el borrador manual.');
            }
        } catch {
            setError('Ocurrió un error al intentar crear la estructura manualmente.');
        } finally {
            setLoading(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       VALIDACIONES
       ═══════════════════════════════════════════════════════════ */

    const isStep1Valid = () => {
        const baseValid =
            basicInfo.idTipoEvento > 0 &&
            basicInfo.idIdioma > 0 &&
            basicInfo.anfitrionesTexto.trim() !== '';
        if (!isB2BContext) return baseValid;
        // Validaciones adicionales B2B
        const unidadOk = b2bInfo.idUnidad !== '';
        const clienteOk = b2bInfo.destinatario === 'PROPIO' || b2bInfo.idCliente !== '';
        return baseValid && unidadOk && clienteOk;
    };

    const isStep2Valid = () => selectedPlantillaId !== null;

    const isStep3Valid = () => datosBase.fechaBase !== '';

    const canProceed = () => {
        switch (currentStep) {
            case 1: return isStep1Valid();
            case 2: return isStep2Valid();
            case 3: return isStep3Valid();
            default: return true; // Step 4 no tiene validaciones (valores default siempre válidos)
        }
    };

    /* ═══════════════════════════════════════════════════════════
       NAVEGACIÓN
       ═══════════════════════════════════════════════════════════ */

    const prevStep = () => {
        if (currentStep > 1 && currentStep < 5) {
            // No permitir volver al step 1 si el evento ya fue creado
            if (currentStep === 2 && eventCreated) return;
            setCurrentStep(prev => prev - 1);
        }
    };

    const goToStep = (step: number) => {
        if (step >= currentStep) return; // Solo ir a steps anteriores
        if (step === 1 && eventCreated) return; // No volver a step 1 si evento creado
        if (step < 5) setCurrentStep(step);
    };

    /* ═══════════════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════════════ */

    const getTipoEventoTexto = () =>
        tiposEvento.find(t => t.id === basicInfo.idTipoEvento)?.texto || '—';

    const getIdiomaTexto = () => {
        const idioma = idiomas.find(i => i.id_idioma === basicInfo.idIdioma);
        return idioma ? idioma.nombre_largo : '—';
    };

    const getSelectedPlantilla = (): PlantillaDetalle | undefined =>
        plantillaDetalles.find(p => p.id_plantilla === selectedPlantillaId);

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */

    return (
        <section className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver a eventos</span>
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Crear Nuevo Evento
                    </h1>
                    <p className="text-muted text-sm mt-1">Completa los pasos para configurar tu evento</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                        Paso {currentStep} de {STEPS.length}
                    </span>
                </div>
            </div>

            {/* ─── Step Indicator ─── */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-card-border" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const StepIcon = step.icon;

                        return (
                            <button
                                type="button"
                                key={step.id}
                                onClick={() => goToStep(step.id)}
                                className="relative flex flex-col items-center gap-2 z-10 group"
                                disabled={step.id >= currentStep || (step.id === 1 && eventCreated)}
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

            {/* ═══════════ STEP 1: Información Básica ═══════════ */}
            {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <PartyPopper className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Información Básica</h2>
                                <p className="text-xs text-muted">Configura los datos principales de tu evento</p>
                            </div>
                        </div>

                        {loadingSelects ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    <span className="text-sm text-muted">Cargando opciones...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Idioma y Tipo de Evento */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                            <Globe className="w-3 h-3" />
                                            Idioma del Evento
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="idIdioma"
                                                value={basicInfo.idIdioma}
                                                onChange={handleBasicInfoChange}
                                                className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10"
                                            >
                                                {idiomas.map((idioma) => (
                                                    <option key={idioma.id_idioma} value={idioma.id_idioma}>
                                                        {idioma.bandera_iso2} {idioma.nombre_largo}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                            <Calendar className="w-3 h-3" />
                                            Tipo de Evento
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="idTipoEvento"
                                                value={basicInfo.idTipoEvento}
                                                onChange={handleBasicInfoChange}
                                                className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10"
                                            >
                                                {tiposEvento.map((tipo) => (
                                                    <option key={tipo.id} value={tipo.id}>
                                                        {tipo.texto}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dress Code */}
                                {dressCodes.length > 0 && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-400 space-y-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                                <Shirt className="w-3 h-3" />
                                                Dress Code
                                                <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="idDressCode"
                                                    value={basicInfo.idDressCode}
                                                    onChange={handleBasicInfoChange}
                                                    className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10"
                                                >
                                                    <option value={0}>Sin dress code</option>
                                                    {dressCodes.map((dc) => (
                                                        <option key={dc.id} value={dc.id}>
                                                            {dc.texto}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descripción Dress Code */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                                <AlignLeft className="w-3 h-3" />
                                                Descripción Dress Code
                                                <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                            </label>
                                            <textarea
                                                name="dressCodeDescripcion"
                                                placeholder="Describí las indicaciones o detalles del dress code para tus invitados..."
                                                value={basicInfo.dressCodeDescripcion}
                                                onChange={handleBasicInfoChange}
                                                rows={2}
                                                className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Anfitriones */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <Users className="w-3 h-3" />
                                        Anfitriones
                                    </label>
                                    <input
                                        name="anfitrionesTexto"
                                        placeholder="Ej: Familia Pérez, Juan y María..."
                                        value={basicInfo.anfitrionesTexto}
                                        onChange={handleBasicInfoChange}
                                        required
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>

                                {/* Saludo */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <Sparkles className="w-3 h-3" />
                                        Saludo / Dedicatoria
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <input
                                        name="saludo"
                                        placeholder="Ej: ¡Mis 15!, ¡Nos casamos!, Feliz Cumpleaños..."
                                        value={basicInfo.saludo}
                                        onChange={handleBasicInfoChange}
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>

                                {/* Mensaje de Bienvenida */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <MessageSquare className="w-3 h-3" />
                                        Mensaje de Bienvenida
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <textarea
                                        name="mensajeBienvenida"
                                        placeholder="Un mensaje cálido para tus invitados al abrir la invitación..."
                                        value={basicInfo.mensajeBienvenida}
                                        onChange={handleBasicInfoChange}
                                        rows={3}
                                        className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none"
                                    />
                                </div>

                                {/* Notas */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <AlignLeft className="w-3 h-3" />
                                        Notas Internas
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <textarea
                                        name="notas"
                                        placeholder="Notas solo visibles para ti..."
                                        value={basicInfo.notas}
                                        onChange={handleBasicInfoChange}
                                        rows={2}
                                        className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none"
                                    />
                                </div>

                                {/* ─── Selector de Plan (solo B2C) ─── */}
                                {!isB2BContext && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-400">
                                        <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                            <Star className="w-3 h-3" />
                                            Plan
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <select
                                                    value={codigoPlan}
                                                    onChange={e => setCodigoPlan(e.target.value)}
                                                    disabled={loadingPlanes}
                                                    className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10 disabled:opacity-60"
                                                >
                                                    {loadingPlanes ? (
                                                        <option>Cargando planes...</option>
                                                    ) : planes.length === 0 ? (
                                                        <option value="B2C_FREE">Free</option>
                                                    ) : (
                                                        planes.map(p => (
                                                            <option key={p.codigo} value={p.codigo}>
                                                                {p.nombre}{p.precio !== null ? ` — $${typeof p.precio === 'object' ? (p.precio as any).importe : p.precio}` : ''}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPlanModal(true)}
                                                className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 text-sm font-semibold transition-all whitespace-nowrap"
                                            >
                                                <LayoutGrid className="w-4 h-4" />
                                                Ver planes
                                            </button>
                                        </div>
                                        {codigoPlan && codigoPlan !== 'B2C_FREE' && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold animate-in fade-in">
                                                <Star className="w-3 h-3" />
                                                Plan {planes.find(p => p.codigo === codigoPlan)?.nombre ?? codigoPlan} seleccionado
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Campos B2B (solo si context=cuenta) ── */}
                        {isB2BContext && (
                            <div className="space-y-5 pt-4 border-t border-indigo-500/20 animate-in fade-in slide-in-from-top-2 duration-500">
                                {/* Separador con título */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                                        <Building2 className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Contexto de Cuenta</p>
                                        <p className="text-xs text-muted">Asociá este evento a tu cuenta empresarial</p>
                                    </div>
                                </div>

                                {loadingB2B ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                        <span className="text-sm text-muted">Cargando datos de cuenta...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Campo: Unidad */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                                <Building2 className="w-3 h-3" />
                                                Unidad
                                                <span className="text-red-400 font-normal normal-case tracking-normal">*requerido</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={b2bInfo.idUnidad}
                                                    onChange={e => setB2bInfo(prev => ({
                                                        ...prev,
                                                        idUnidad: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                                                    }))}
                                                    className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10"
                                                >
                                                    <option value="">Seleccioná una unidad...</option>
                                                    {unidades.map((u) => (
                                                        <option key={u.id_unidad} value={u.id_unidad}>
                                                            {u.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Campo: ¿Para quién? */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                                                <UserCheck className="w-3 h-3" />
                                                ¿Para quién es el evento?
                                                <span className="text-red-400 font-normal normal-case tracking-normal">*requerido</span>
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {([
                                                    { value: 'PROPIO', label: 'Para mi unidad/negocio', icon: Building2 },
                                                    { value: 'CLIENTE', label: 'Para un cliente', icon: Users },
                                                ] as const).map(({ value, label, icon: Icon }) => {
                                                    const isSelected = b2bInfo.destinatario === value;
                                                    return (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => setB2bInfo(prev => ({
                                                                ...prev,
                                                                destinatario: value,
                                                                idCliente: value === 'PROPIO' ? '' : prev.idCliente,
                                                            }))}
                                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                                ? 'border-indigo-500 bg-indigo-500/5 shadow-sm shadow-indigo-500/10'
                                                                : 'border-card-border bg-background/50 hover:border-indigo-500/30'
                                                                }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-500/20' : 'bg-card-bg'
                                                                }`}>
                                                                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-muted'}`} />
                                                            </div>
                                                            <span className={`text-sm font-medium ${isSelected ? 'text-indigo-300' : 'text-muted'
                                                                }`}>{label}</span>
                                                            {isSelected && (
                                                                <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Campo: Cliente (visible solo si destinatario = CLIENTE) */}
                                        {b2bInfo.destinatario === 'CLIENTE' && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                                    <Users className="w-3 h-3" />
                                                    Cliente
                                                    <span className="text-red-400 font-normal normal-case tracking-normal">*requerido</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={b2bInfo.idCliente}
                                                        onChange={e => setB2bInfo(prev => ({
                                                            ...prev,
                                                            idCliente: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                                                        }))}
                                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10"
                                                    >
                                                        <option value="">Seleccioná un cliente...</option>
                                                        {clientes.map((c) => (
                                                            <option key={c.id_cliente} value={c.id_cliente}>
                                                                {c.nombre_cliente}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════ STEP 2: Elegir Estructura ═══════════ */}
            {currentStep === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Layers className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Elegí una estructura para tu evento</h2>
                                <p className="text-xs text-muted">Después vas a poder editar horarios, lugares y accesos</p>
                            </div>
                        </div>

                        {/* Info del evento creado */}
                        {idEvento && (
                            <div className="mb-6 mt-4 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <p className="text-xs text-emerald-300">
                                    Evento creado exitosamente <span className="font-semibold">(ID: {idEvento})</span> — Ahora elegí la estructura
                                </p>
                            </div>
                        )}

                        {/* Cards de Plantillas */}
                        {loadingDetalles || loadingPlantillas ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    <span className="text-sm text-muted">Cargando estructuras disponibles...</span>
                                </div>
                            </div>
                        ) : plantillaDetalles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {plantillaDetalles.map((detalle) => {
                                    const isSelected = selectedPlantillaId === detalle.id_plantilla;
                                    return (
                                        <button
                                            key={detalle.id_plantilla}
                                            type="button"
                                            onClick={() => setSelectedPlantillaId(detalle.id_plantilla)}
                                            className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                                                ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10 scale-[1.02]'
                                                : 'border-card-border bg-background/50 hover:border-purple-500/30 hover:bg-purple-500/[0.02]'
                                                }`}
                                        >
                                            {/* Selected check */}
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center animate-in zoom-in duration-200">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}

                                            {/* Nombre */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <LayoutGrid className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-muted'} transition-colors`} />
                                                <h3 className={`font-semibold text-sm ${isSelected ? 'text-purple-300' : 'text-foreground'} transition-colors`}>
                                                    {detalle.nombre || detalle.codigo}
                                                </h3>
                                            </div>

                                            {/* Tramos incluidos */}
                                            <div className="mb-4">
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Incluye:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {detalle.tramos.map((tramo, i) => (
                                                        <span
                                                            key={tramo.id_plantilla_tramo}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${isSelected
                                                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                                                                : 'bg-card-bg text-muted border border-card-border'
                                                                } transition-colors`}
                                                        >
                                                            <span className="font-bold opacity-60">{i + 1}.</span>
                                                            {tramo.nombre_default}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer: accesos */}
                                            <div className={`flex items-center gap-2 pt-3 border-t ${isSelected ? 'border-purple-500/20' : 'border-card-border'} transition-colors`}>
                                                <ListChecks className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-muted'}`} />
                                                <span className={`text-xs ${isSelected ? 'text-purple-300' : 'text-muted'}`}>
                                                    {detalle.accesos_count} tipos de invitación
                                                </span>
                                            </div>

                                            {/* Hover "Usar" hint */}
                                            {!isSelected && (
                                                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
                                                        Click para seleccionar
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                                    <Layers className="w-8 h-8 text-amber-400" />
                                </div>
                                <h3 className="text-foreground font-semibold mb-1">No hay estructuras predefinidas</h3>
                                <p className="text-sm text-muted max-w-xs">
                                    No encontramos plantillas para &quot;{getTipoEventoTexto()}&quot;. Podés crear una estructura personalizada.
                                </p>
                            </div>
                        )}

                        {/* Botón secundario: No encontré / Voy a crear */}
                        <div className="mt-6 pt-4 border-t border-card-border">
                            <button
                                type="button"
                                onClick={handleIrAlWizardManual}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-card-border text-muted hover:text-foreground hover:border-muted/60 hover:bg-muted/5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Layers className="w-4 h-4" />
                                {plantillaDetalles.length > 0
                                    ? 'No encontré la estructura que se adapte a mi evento'
                                    : 'Voy a crear la estructura de mi evento'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ STEP 3: Datos Base ═══════════ */}
            {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <MapPin className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Datos base para inicializar el evento</h2>
                                <p className="text-xs text-muted">Usaremos estos datos como base para todos los tramos. Luego vas a poder editarlos tramo por tramo.</p>
                            </div>
                        </div>

                        {/* Plantilla elegida */}
                        {getSelectedPlantilla() && (
                            <div className="mb-6 mt-4 px-4 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <p className="text-xs text-purple-300">
                                    Estructura seleccionada: <span className="font-semibold">{getSelectedPlantilla()?.nombre || getSelectedPlantilla()?.codigo}</span>
                                    {' '}— {getSelectedPlantilla()?.tramos.length} tramos, {getSelectedPlantilla()?.accesos_count} accesos
                                </p>
                            </div>
                        )}

                        <div className="space-y-6 mt-6">
                            {/* Fecha y Hora */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                    <Clock className="w-3 h-3" />
                                    Fecha y Hora de Inicio
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                    <input
                                        type="datetime-local"
                                        name="fechaBase"
                                        value={datosBase.fechaBase}
                                        onChange={handleDatosBaseChange}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-foreground outline-none"
                                    />
                                </div>
                            </div>

                            {/* Lugar y Dirección */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <MapPin className="w-3 h-3" />
                                        Lugar
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <input
                                        name="lugarBase"
                                        placeholder="Nombre del salón, quinta, hotel..."
                                        value={datosBase.lugarBase}
                                        onChange={handleDatosBaseChange}
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <MapPin className="w-3 h-3" />
                                        Dirección
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <input
                                        name="direccionBase"
                                        placeholder="Calle, Número, Ciudad"
                                        value={datosBase.direccionBase}
                                        onChange={handleDatosBaseChange}
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>
                            </div>

                            {/* Latitud / Longitud */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <Globe className="w-3 h-3" />
                                        Latitud
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <input
                                        name="latitudBase"
                                        type="number"
                                        step="any"
                                        placeholder="Ej: -37.9951"
                                        value={datosBase.latitudBase}
                                        onChange={handleDatosBaseChange}
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <Globe className="w-3 h-3" />
                                        Longitud
                                        <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <input
                                        name="longitudBase"
                                        type="number"
                                        step="any"
                                        placeholder="Ej: -57.5734"
                                        value={datosBase.longitudBase}
                                        onChange={handleDatosBaseChange}
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>
                            </div>

                            {/* Info text */}
                            <div className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400/80 flex items-start gap-2">
                                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>
                                    Estos datos se usarán como punto de partida para todos los tramos del evento.
                                    En el siguiente paso podrás personalizar cada tramo individualmente (horarios, lugares diferentes, etc.)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ STEP 4: Acceso y Confirmación ═══════════ */}
            {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                <Lock className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Acceso y Confirmación</h2>
                                <p className="text-xs text-muted">Definí cómo van a acceder y confirmar tus invitados</p>
                            </div>
                        </div>

                        <div className="space-y-7">

                            {/* ─ Tipo de evento ─ */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                                    <Globe className="w-3 h-3" />
                                    Tipo de evento
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {([
                                        { value: false, label: 'Privado', desc: 'Solo tus invitados pueden verlo', icon: Lock },
                                        { value: true, label: 'Público', desc: 'Cualquiera con el link puede verlo', icon: Globe },
                                    ] as const).map(({ value, label, desc, icon: Icon }) => {
                                        const isSelected = acceso.esPublico === value;
                                        return (
                                            <button
                                                key={String(value)}
                                                type="button"
                                                onClick={() => setAcceso(prev => ({ ...prev, esPublico: value }))}
                                                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                    ? 'border-violet-500 bg-violet-500/5 shadow-sm shadow-violet-500/10'
                                                    : 'border-card-border bg-background/50 hover:border-violet-500/30'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-violet-500/20' : 'bg-card-bg'
                                                    }`}>
                                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-muted'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className={`text-sm font-semibold block ${isSelected ? 'text-violet-300' : 'text-foreground'
                                                        }`}>{label}</span>
                                                    <span className="text-xs text-muted">{desc}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─ Cómo ingresan ─ */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                                    <Link className="w-3 h-3" />
                                    Cómo ingresan
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {([
                                        { value: 'I' as const, label: 'Por invitación', desc: 'Se envía invitación nominal a cada uno', icon: Users },
                                        { value: 'L' as const, label: 'Por link público', desc: 'Cualquiera con el link puede ingresar', icon: Link },
                                    ]).map(({ value, label, desc, icon: Icon }) => {
                                        const isSelected = acceso.modoAcceso === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setAcceso(prev => ({ ...prev, modoAcceso: value }))}
                                                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                    ? 'border-violet-500 bg-violet-500/5 shadow-sm shadow-violet-500/10'
                                                    : 'border-card-border bg-background/50 hover:border-violet-500/30'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-violet-500/20' : 'bg-card-bg'
                                                    }`}>
                                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-muted'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className={`text-sm font-semibold block ${isSelected ? 'text-violet-300' : 'text-foreground'
                                                        }`}>{label}</span>
                                                    <span className="text-xs text-muted">{desc}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─ Control de asistencia ─ */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                                    <ClipboardList className="w-3 h-3" />
                                    Control de asistencia
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {([
                                        { value: 'R' as const, label: 'Confirmación previa', desc: 'Los invitados confirman antes del evento', icon: CheckCircle2 },
                                        { value: 'C' as const, label: 'Control al ingresar', desc: 'Se verifica la asistencia en el momento', icon: ClipboardList },
                                    ]).map(({ value, label, desc, icon: Icon }) => {
                                        const isSelected = acceso.modoAsistencia === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setAcceso(prev => ({ ...prev, modoAsistencia: value }))}
                                                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                    ? 'border-violet-500 bg-violet-500/5 shadow-sm shadow-violet-500/10'
                                                    : 'border-card-border bg-background/50 hover:border-violet-500/30'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-violet-500/20' : 'bg-card-bg'
                                                    }`}>
                                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-muted'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className={`text-sm font-semibold block ${isSelected ? 'text-violet-300' : 'text-foreground'
                                                        }`}>{label}</span>
                                                    <span className="text-xs text-muted">{desc}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─ Información Pública (Landing) ─ */}
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                                    <AlignLeft className="w-3 h-3" />
                                    Información Pública para la Landing
                                    <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                </label>
                                <textarea
                                    name="infoPublica"
                                    placeholder="Texto de información que aparecerá en la landing..."
                                    value={acceso.infoPublica}
                                    onChange={(e) => setAcceso(prev => ({ ...prev, infoPublica: e.target.value }))}
                                    rows={3}
                                    className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none"
                                />
                                <p className="text-[11px] text-muted mt-2 ml-1">
                                    Esta información será visible para las personas que accedan a la página pública de tu evento.
                                </p>
                            </div>

                            {/* Hint info */}
                            <div className="px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-400/80 flex items-start gap-2">
                                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>Estas configuraciones se pueden cambiar luego desde el panel del evento.</p>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ STEP 5: ¡Listo! ═══════════ */}
            {currentStep === 5 && plantillaAplicada && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl text-center">
                        {/* Success animation */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30 flex items-center justify-center animate-in zoom-in duration-500">
                                <Rocket className="w-10 h-10 text-emerald-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-2">¡Estructura aplicada con éxito!</h2>
                        <p className="text-muted text-sm max-w-md mx-auto mb-8">
                            Tu evento ha sido creado y la estructura ha sido aplicada correctamente.
                            Ahora podés editar los detalles de cada tramo y tipo de invitación.
                        </p>

                        {/* Resumen */}
                        <div className="max-w-sm mx-auto text-left space-y-3 mb-8">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-card-border">
                                <PartyPopper className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted">Tipo de evento</p>
                                    <p className="text-sm font-medium text-foreground">{getTipoEventoTexto()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-card-border">
                                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted">Anfitriones</p>
                                    <p className="text-sm font-medium text-foreground">{basicInfo.anfitrionesTexto}</p>
                                </div>
                            </div>
                            {getSelectedPlantilla() && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-card-border">
                                    <Layers className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted">Estructura</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {getSelectedPlantilla()?.nombre || getSelectedPlantilla()?.codigo}
                                            {' '}— {getSelectedPlantilla()?.tramos.length} tramos
                                        </p>
                                    </div>
                                </div>
                            )}
                            {datosBase.fechaBase && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-card-border">
                                    <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted">Fecha base</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(datosBase.fechaBase).toLocaleString('es-AR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ═══ Banner Estado Comercial ═══ */}
                        <BannerEstadoComercial idEvento={idEvento} className="mt-6" />

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/events')}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-muted/10 font-medium text-sm transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver a mis eventos
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push(`/dashboard/events/${idEvento}/estructura`)}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Sparkles className="w-4 h-4" />
                                Ir al Editor de Estructura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ Navigation Buttons ═══════════ */}
            {currentStep < 5 && (
                <div className="mt-8">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs mb-4 animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        {/* Botón izquierdo */}
                        <div>
                            {currentStep === 1 ? (
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-muted/10 font-medium text-sm transition-all"
                                >
                                    Cancelar
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={currentStep === 2 && eventCreated}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-muted/10 font-medium text-sm transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Anterior
                                </button>
                            )}
                        </div>

                        {/* Botón derecho */}
                        <div>
                            {currentStep === 1 && (
                                <button
                                    type="button"
                                    onClick={handleCreateEvento}
                                    disabled={!canProceed() || loading}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creando evento...
                                        </>
                                    ) : (
                                        <>
                                            Crear Evento y Continuar
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            )}

                            {currentStep === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    disabled={!canProceed()}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all group"
                                >
                                    Usar esta estructura
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}

                            {currentStep === 3 && (
                                <button
                                    type="button"
                                    onClick={handleAplicarPlantilla}
                                    disabled={!canProceed() || loading}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Aplicando plantilla...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Aplicar Plantilla
                                        </>
                                    )}
                                </button>
                            )}

                            {currentStep === 4 && (
                                <button
                                    type="button"
                                    onClick={handleGuardarAcceso}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-tr from-violet-600 to-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-4 h-4" />
                                            Guardar y Finalizar
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* ═══════════ MODAL: Ver Planes B2C ═══════════ */}
            {showPlanModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={e => { if (e.target === e.currentTarget) setShowPlanModal(false); }}
                >
                    <div className="w-full max-w-4xl bg-card-bg border border-card-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-card-border">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Star className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Elegí tu plan</h3>
                                    <p className="text-xs text-muted">Podés cambiarlo en cualquier momento</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPlanModal(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-card-border transition-colors text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Grid de planes */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                            {loadingPlanes ? (
                                <div className="col-span-3 flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                </div>
                            ) : planes.length === 0 ? (
                                <p className="col-span-3 text-center text-muted py-8">No hay planes disponibles.</p>
                            ) : (
                                planes.map(plan => {
                                    const isSelected = codigoPlan === plan.codigo;
                                    const features = plan.features.slice(0, 4);
                                    return (
                                        <button
                                            key={plan.codigo}
                                            type="button"
                                            onClick={() => { setCodigoPlan(plan.codigo); setShowPlanModal(false); }}
                                            className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                                                : 'border-card-border bg-background/50 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-foreground">{plan.nombre}</h4>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 ml-2">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-2xl font-extrabold text-foreground mb-0.5">
                                                {plan.precio === null
                                                    ? (plan.codigo.includes('FREE') ? '$0' : 'Consultar')
                                                    : `$${typeof plan.precio === 'object' ? (plan.precio as any).importe : plan.precio}`}
                                                <span className="text-sm font-normal text-muted ml-1">
                                                    {plan.periodo && plan.periodo !== 'UNICO' ? `/${plan.periodo}` : ''}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted mb-3">{plan.descripcion}</p>
                                            <ul className="space-y-1.5">
                                                {features.map((f, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-muted">
                                                        <Check className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                                        {typeof f === 'string' ? f : f.nombre}
                                                    </li>
                                                ))}
                                                {plan.features.length > 4 && (
                                                    <li className="text-xs text-indigo-400 font-semibold">
                                                        +{plan.features.length - 4} beneficios más...
                                                    </li>
                                                )}
                                            </ul>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer del modal */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-card-border bg-background/30">
                            <button
                                type="button"
                                onClick={() => setShowPlanModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-card-border text-muted hover:text-foreground hover:border-muted/50 text-sm font-medium transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function NewEventPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        }>
            <NewEventContent />
        </Suspense>
    );
}
