'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, getTiposEvento, getIdiomasActivos, getPlantillasByTipo, getTramosByPlantilla } from '@/src/features/events/event.service';
import type { CreateEventPayload, TipoEvento, Idioma, PlantillaEvento, PlantillaTramo } from '@/src/features/events/types';
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
    Palette,
    Layers,
    ListOrdered
} from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Información Básica', icon: PartyPopper, color: 'indigo' },
    { id: 2, title: 'Ubicación', icon: MapPin, color: 'purple' },
    { id: 3, title: 'Mensajes', icon: MessageSquare, color: 'emerald' },
    { id: 4, title: 'Revisión', icon: CheckCircle2, color: 'amber' },
];

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Datos de selects
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [plantillas, setPlantillas] = useState<PlantillaEvento[]>([]);
    const [tramos, setTramos] = useState<PlantillaTramo[]>([]);
    const [loadingSelects, setLoadingSelects] = useState(true);
    const [loadingPlantillas, setLoadingPlantillas] = useState(false);
    const [loadingTramos, setLoadingTramos] = useState(false);

    const [form, setForm] = useState<CreateEventPayload>({
        idTipoEvento: 0,
        idIdioma: 0,
        fechaHora: '',
        anfitrionesTexto: '',
        lugar: '',
        direccion: '',
        latitud: 0,
        longitud: 0,
        saludo: '',
        mensajeBienvenida: '',
        notas: '',
    });

    // Cargar tipos de evento e idiomas al montar
    useEffect(() => {
        async function loadSelects() {
            setLoadingSelects(true);
            try {
                const [tipos, idiomasData] = await Promise.all([
                    getTiposEvento(2),
                    getIdiomasActivos(),
                ]);
                setTiposEvento(tipos);
                setIdiomas(idiomasData);

                // Preseleccionar primer valor si existen
                if (tipos.length > 0 && form.idTipoEvento === 0) {
                    setForm(prev => ({ ...prev, idTipoEvento: tipos[0].id }));
                }
                if (idiomasData.length > 0 && form.idIdioma === 0) {
                    setForm(prev => ({ ...prev, idIdioma: idiomasData[0].id_idioma }));
                }
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError('No se pudieron cargar los datos necesarios.');
            } finally {
                setLoadingSelects(false);
            }
        }
        loadSelects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Recargar tipos de evento cuando cambia el idioma seleccionado
    useEffect(() => {
        if (form.idIdioma === 0) return;
        async function reloadTipos() {
            try {
                const tipos = await getTiposEvento(form.idIdioma);
                setTiposEvento(tipos);
                // Si el tipo actual no existe en los nuevos datos, seleccionar primero
                if (tipos.length > 0 && !tipos.find(t => t.id === form.idTipoEvento)) {
                    setForm(prev => ({ ...prev, idTipoEvento: tipos[0].id }));
                }
            } catch (err) {
                console.error('Error recargando tipos de evento:', err);
            }
        }
        reloadTipos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.idIdioma]);

    // Cargar plantillas cuando cambia el tipo de evento
    useEffect(() => {
        if (form.idTipoEvento === 0) return;
        async function loadPlantillas() {
            setLoadingPlantillas(true);
            try {
                const data = await getPlantillasByTipo(form.idTipoEvento);
                setPlantillas(data);
                // Preseleccionar la primera plantilla si hay
                if (data.length > 0) {
                    setForm(prev => ({ ...prev, idPlantilla: data[0].id_plantilla }));
                } else {
                    setForm(prev => ({ ...prev, idPlantilla: undefined }));
                }
            } catch (err) {
                console.error('Error cargando plantillas:', err);
                setPlantillas([]);
                setForm(prev => ({ ...prev, idPlantilla: undefined }));
            } finally {
                setLoadingPlantillas(false);
            }
        }
        loadPlantillas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.idTipoEvento]);

    // Cargar tramos cuando cambia la plantilla seleccionada
    useEffect(() => {
        if (!form.idPlantilla) {
            setTramos([]);
            return;
        }
        async function loadTramos() {
            setLoadingTramos(true);
            try {
                const data = await getTramosByPlantilla(form.idPlantilla!);
                setTramos(data);
            } catch (err) {
                console.error('Error cargando tramos:', err);
                setTramos([]);
            } finally {
                setLoadingTramos(false);
            }
        }
        loadTramos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.idPlantilla]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'idTipoEvento' || name === 'idIdioma' || name === 'idPlantilla') {
            setForm({
                ...form,
                [name]: parseInt(value, 10),
            });
            return;
        }

        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createEvent(form);
            router.push('/dashboard/events');
        } catch {
            setError('No se pudo crear el evento. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Validaciones por step
    const isStep1Valid = () => {
        return (
            form.idTipoEvento > 0 &&
            form.idIdioma > 0 &&
            form.anfitrionesTexto.trim() !== '' &&
            form.saludo.trim() !== '' &&
            form.mensajeBienvenida.trim() !== ''
        );
    };

    const isStep2Valid = () => {
        return (
            form.fechaHora !== '' &&
            form.lugar.trim() !== '' &&
            form.direccion.trim() !== ''
        );
    };

    const isStep3Valid = () => {
        return true; // Notas es opcional, mensajes ya se completaron en step 1
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return isStep1Valid();
            case 2: return isStep2Valid();
            case 3: return isStep3Valid();
            default: return true;
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length && canProceed()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const goToStep = (step: number) => {
        // Solo permitir ir a steps anteriores o al siguiente si el actual es válido
        if (step < currentStep || (step === currentStep + 1 && canProceed())) {
            setCurrentStep(step);
        }
    };

    // Helper: obtener texto del tipo evento seleccionado
    const getTipoEventoTexto = () => {
        return tiposEvento.find(t => t.id === form.idTipoEvento)?.texto || '—';
    };

    // Helper: obtener nombre del idioma seleccionado
    const getIdiomaTexto = () => {
        const idioma = idiomas.find(i => i.id_idioma === form.idIdioma);
        return idioma ? idioma.nombre_largo : '—';
    };

    // Helper: obtener nombre de la plantilla seleccionada
    const getPlantillaTexto = () => {
        const plantilla = plantillas.find(p => p.id_plantilla === form.idPlantilla);
        return plantilla ? plantilla.codigo : 'Sin plantilla';
    };

    return (
        <section className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Back Button */}
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
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Paso {currentStep} de {STEPS.length}</span>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    {/* Progress bar background */}
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
                                        <StepIcon className={`w-4 h-4 transition-colors ${isCurrent ? 'text-indigo-400' : 'text-muted'
                                            }`} />
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

            <form onSubmit={handleSubmit}>
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
                                                    value={form.idIdioma}
                                                    onChange={handleChange}
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
                                                    value={form.idTipoEvento}
                                                    onChange={handleChange}
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

                                    {/* Plantilla del Evento */}
                                    {form.idTipoEvento > 0 && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-400">
                                            <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                                <Palette className="w-3 h-3" />
                                                Plantilla del Evento
                                            </label>
                                            {loadingPlantillas ? (
                                                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-card-border">
                                                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                                    <span className="text-sm text-muted">Cargando plantillas...</span>
                                                </div>
                                            ) : plantillas.length > 0 ? (
                                                <div className="relative">
                                                    <select
                                                        name="idPlantilla"
                                                        value={form.idPlantilla || ''}
                                                        onChange={handleChange}
                                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10"
                                                    >
                                                        {plantillas.map((plantilla) => (
                                                            <option key={plantilla.id_plantilla} value={plantilla.id_plantilla}>
                                                                {plantilla.codigo}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-400/80 flex items-center gap-2">
                                                    <Palette className="w-4 h-4" />
                                                    No hay plantillas disponibles para este tipo de evento
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tramos de la Plantilla */}
                                    {form.idPlantilla && form.idPlantilla > 0 && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                            <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                                                <ListOrdered className="w-3 h-3" />
                                                Tramos de la Plantilla
                                            </label>
                                            {loadingTramos ? (
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-card-border">
                                                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                                    <span className="text-sm text-muted">Cargando tramos...</span>
                                                </div>
                                            ) : tramos.length > 0 ? (
                                                <div className="space-y-2">
                                                    {tramos.map((tramo, index) => (
                                                        <div
                                                            key={tramo.id_plantilla_tramo}
                                                            className="flex items-start gap-3 p-3.5 rounded-xl bg-background/60 border border-card-border hover:border-indigo-500/20 transition-all group"
                                                        >
                                                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-indigo-400">{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-foreground group-hover:text-indigo-300 transition-colors">
                                                                    {tramo.nombre_default}
                                                                </p>
                                                                {tramo.leyenda_default && (
                                                                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                                                                        {tramo.leyenda_default}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tramo.activo
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                                }`}>
                                                                {tramo.activo ? 'Activo' : 'Inactivo'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-400/80 flex items-center gap-2">
                                                    <Layers className="w-4 h-4" />
                                                    Esta plantilla no tiene tramos configurados
                                                </div>
                                            )}
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
                                            value={form.anfitrionesTexto}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                        />
                                    </div>

                                    {/* Saludo */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                            <Sparkles className="w-3 h-3" />
                                            Saludo / Dedicatoria
                                        </label>
                                        <input
                                            name="saludo"
                                            placeholder="Ej: ¡Mis 15!, ¡Nos casamos!, Feliz Cumpleaños..."
                                            value={form.saludo}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                        />
                                    </div>

                                    {/* Mensaje de Bienvenida */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                            <MessageSquare className="w-3 h-3" />
                                            Mensaje de Bienvenida
                                        </label>
                                        <textarea
                                            name="mensajeBienvenida"
                                            placeholder="Un mensaje cálido para tus invitados al abrir la invitación..."
                                            value={form.mensajeBienvenida}
                                            onChange={handleChange}
                                            rows={3}
                                            required
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
                                            value={form.notas}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full p-4 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 2: Ubicación y Fecha ═══════════ */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <MapPin className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Ubicación y Fecha</h2>
                                    <p className="text-xs text-muted">¿Dónde y cuándo será el evento?</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Fecha y Hora */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <Clock className="w-3 h-3" />
                                        Fecha y Hora
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            name="fechaHora"
                                            value={form.fechaHora}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background border border-card-border focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-foreground outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Lugar */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">
                                        <MapPin className="w-3 h-3" />
                                        Lugar
                                    </label>
                                    <input
                                        name="lugar"
                                        placeholder="Nombre del salón, quinta, hotel..."
                                        value={form.lugar}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>

                                {/* Dirección */}
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">Dirección Exacta</label>
                                    <input
                                        name="direccion"
                                        placeholder="Calle, Número, Ciudad"
                                        value={form.direccion}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3.5 rounded-xl bg-background border border-card-border focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-foreground outline-none placeholder:text-muted"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 3: Mensajes adicionales (vista previa tipo tarjeta) ═══════════ */}
                {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Vista Previa del Mensaje</h2>
                                    <p className="text-xs text-muted">Así verán tus invitados la invitación</p>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="max-w-md mx-auto">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-emerald-600/10 border border-indigo-500/20 p-8 text-center">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]" />
                                    <div className="relative z-10">
                                        <p className="text-muted text-xs uppercase tracking-widest mb-4">{getTipoEventoTexto()}</p>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">{form.saludo || 'Tu saludo aquí'}</h3>
                                        <p className="text-sm text-muted mb-6">{form.anfitrionesTexto || 'Los anfitriones'}</p>
                                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-6" />
                                        <p className="text-sm text-foreground/80 italic leading-relaxed">
                                            {form.mensajeBienvenida || 'Tu mensaje de bienvenida aparecerá aquí...'}
                                        </p>
                                        {form.fechaHora && (
                                            <div className="mt-6 pt-4 border-t border-white/10">
                                                <p className="text-xs text-muted flex items-center justify-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(form.fechaHora).toLocaleString('es-AR', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                {form.lugar && (
                                                    <p className="text-xs text-muted flex items-center justify-center gap-2 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {form.lugar}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-xs text-muted mt-6">
                                Si deseas modificar algo, puedes volver a los pasos anteriores.
                            </p>
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 4: Revisión Final ═══════════ */}
                {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border backdrop-blur-xl transition-all hover:border-muted/50">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Revisión Final</h2>
                                    <p className="text-xs text-muted">Verifica que todo esté correcto antes de crear el evento</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Resumen Info Básica */}
                                <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <PartyPopper className="w-4 h-4 text-indigo-400" />
                                            Información Básica
                                        </h3>
                                        <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Editar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-muted text-xs">Tipo de Evento</span>
                                            <p className="text-foreground font-medium">{getTipoEventoTexto()}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted text-xs">Idioma</span>
                                            <p className="text-foreground font-medium">{getIdiomaTexto()}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted text-xs">Plantilla</span>
                                            <p className="text-foreground font-medium">{getPlantillaTexto()}</p>
                                        </div>
                                        {tramos.length > 0 && (
                                            <div className="col-span-2">
                                                <span className="text-muted text-xs">Tramos ({tramos.length})</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {tramos.map((tramo, i) => (
                                                        <span key={tramo.id_plantilla_tramo} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                                                            <span className="font-bold text-indigo-400">{i + 1}</span> {tramo.nombre_default}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-span-2">
                                            <span className="text-muted text-xs">Anfitriones</span>
                                            <p className="text-foreground font-medium">{form.anfitrionesTexto}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted text-xs">Saludo</span>
                                            <p className="text-foreground font-medium">{form.saludo}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted text-xs">Mensaje de Bienvenida</span>
                                            <p className="text-foreground font-medium">{form.mensajeBienvenida}</p>
                                        </div>
                                        {form.notas && (
                                            <div className="col-span-2">
                                                <span className="text-muted text-xs">Notas Internas</span>
                                                <p className="text-foreground/70 text-sm italic">{form.notas}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resumen Ubicación */}
                                <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-purple-400" />
                                            Ubicación y Fecha
                                        </h3>
                                        <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Editar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-muted text-xs">Fecha y Hora</span>
                                            <p className="text-foreground font-medium">
                                                {form.fechaHora
                                                    ? new Date(form.fechaHora).toLocaleString('es-AR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted text-xs">Lugar</span>
                                            <p className="text-foreground font-medium">{form.lugar || '—'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted text-xs">Dirección</span>
                                            <p className="text-foreground font-medium">{form.direccion || '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Features incluidas */}
                                <div className="p-4 rounded-xl bg-indigo-600/5 border border-indigo-500/20">
                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        Incluido con tu evento
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="flex items-center gap-2 text-sm text-muted p-2 rounded-lg bg-muted/10 border border-muted/10">
                                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                            <span>Invitación Digital</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted p-2 rounded-lg bg-muted/10 border border-muted/10">
                                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                            <span>Gestión de Invitados</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted p-2 rounded-lg bg-muted/10 border border-muted/10">
                                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                            <span>QR de Acceso</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ Navigation Buttons ═══════════ */}
                <div className="mt-8">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs mb-4 animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        {/* Botón izquierdo */}
                        <div>
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-muted/10 font-medium text-sm transition-all group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Anterior
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-muted/10 font-medium text-sm transition-all"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>

                        {/* Botón derecho */}
                        <div>
                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all group"
                                >
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Crear Evento
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}
