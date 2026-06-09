'use client';

import { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Calendar, Info, Clock,
    Sparkles, Settings2, Users, LayoutGrid,
    ArrowRight, MessageSquare, Tag, Globe, CheckCircle2,
    Link as LinkIcon, DollarSign, CalendarRange, ChefHat, LogOut, Bus, ShieldCheck, Stethoscope,
    TrendingUp, X, AlertTriangle, Loader2, Lock, Music, Gift, Home
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
}

interface IdiomaItem {
    id_idioma: number;
    nombre_largo: string;
    locale: string;
}

interface DressCodeItem {
    id: number;
    texto: string;
}

import {
    getEventById,
    getAdminEventById,
    getEstructuraEvento,
    getIdiomasActivos,
    getDressCodes,
    updateEventGeneral,
    activateEventManual,
    closeEvent,
    cancelEvent,
    reopenEvent,
    getEventStateHistory
} from '@/src/features/events/event.service';
import type { Event, EstructuraEvento, EstadoHistorial } from '@/src/features/events/types';
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

    // ── Plan Change State ────────────────────────────────
    type SolicitudPendiente = {
        id_evento_plan_cambio: number;
        plan_solicitado_codigo: string;
        plan_solicitado_nombre?: string;
        estado: string;
        fecha_solicitud: string;
    };
    type PlanItem = { codigo: string; nombre: string; precio?: number | null; };

    const [checkingPlan, setCheckingPlan] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [solicitudPendiente, setSolicitudPendiente] = useState<SolicitudPendiente | null>(null);
    const [planesDisponibles, setPlanesDisponibles] = useState<PlanItem[]>([]);
    const [planSeleccionado, setPlanSeleccionado] = useState('');
    const [motivoSolicitud, setMotivoSolicitud] = useState('');
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
    const [solicitudEnviada, setSolicitudEnviada] = useState(false);

    // ── Acciones de Estado & Edición General ───────────────
    const [stateActionLoading, setStateActionLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStateModal, setShowStateModal] = useState(false);
    const [targetState, setTargetState] = useState<'C' | 'X' | 'A' | ''>('');
    const [stateObservaciones, setStateObservaciones] = useState('');
    const [idiomasList, setIdiomasList] = useState<IdiomaItem[]>([]);
    const [dressCodesList, setDressCodesList] = useState<DressCodeItem[]>([]);
    const [loadingLanguages, setLoadingLanguages] = useState(false);
    const [loadingDressCodes, setLoadingDressCodes] = useState(false);
    const [historyList, setHistoryList] = useState<EstadoHistorial[]>([]);
    const [featuresEfectivas, setFeaturesEfectivas] = useState<FeatureEfectiva[]>([]);

    const [editFormData, setEditFormData] = useState({
        idIdioma: 1,
        anfitrionesTexto: '',
        idDressCode: '' as string | number,
        dressCodeDescripcion: '',
        saludo: '',
        mensajeBienvenida: '',
        notas: '',
        infoPublica: '',
    });

    const isAdmin = scope === 'admin';
    const idEventoLong = Number(id);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const request = isAdmin ? getAdminEventById(id) : getEventById(id);
                const eventData = await request;
                setEvent(eventData);
                console.log('EVENT DATA', eventData);

                // Intentar cargar la estructura para mostrar estadísticas
                try {
                    const structData = await getEstructuraEvento(idEventoLong);
                    setEstructura(structData);
                } catch (e) {
                    console.warn('No se pudo cargar la estructura para el resumen', e);
                }

                // Cargar historial de estados
                try {
                    const historyData = await getEventStateHistory(idEventoLong);
                    setHistoryList(historyData);
                } catch (e) {
                    console.warn('No se pudo cargar el historial de estados', e);
                }

                // Cargar features efectivas
                try {
                    const resFeats = await fetch(`/api/features-efectivas?idEvento=${idEventoLong}`);
                    if (resFeats.ok) {
                        const dataFeats = await resFeats.json();
                        setFeaturesEfectivas(dataFeats.features || []);
                    }
                } catch (e) {
                    console.warn('No se pudieron cargar las features efectivas', e);
                }
            } catch {
                setError('No se pudo cargar el detalle del evento');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, scope, isAdmin, idEventoLong]);

    const isFeatureActiva = (codigo: string) => {
        if (loading || featuresEfectivas.length === 0) return true;
        const feat = featuresEfectivas.find(f => f.codigo === codigo);
        return feat ? feat.activo_resuelto : false;
    };

    // Cargar idiomas cuando abre el modal de edición
    useEffect(() => {
        if (showEditModal && event) {
            setEditFormData({
                idIdioma: event.id_idioma,
                anfitrionesTexto: event.anfitriones_texto || '',
                idDressCode: event.id_dress_code ? String(event.id_dress_code) : '',
                dressCodeDescripcion: event.dress_code_descripcion || '',
                saludo: event.saludo || '',
                mensajeBienvenida: event.mensajeBienvenida || '',
                notas: event.notas || '',
                infoPublica: event.infoPublica || '',
            });

            async function fetchIdiomas() {
                setLoadingLanguages(true);
                try {
                    const data = await getIdiomasActivos();
                    setIdiomasList(data);
                } catch (e) {
                    console.error('Error al cargar idiomas', e);
                } finally {
                    setLoadingLanguages(false);
                }
            }
            fetchIdiomas();
        }
    }, [showEditModal, event]);

    // Recargar dress codes cuando cambia el idioma en el formulario
    useEffect(() => {
        if (showEditModal && editFormData.idIdioma) {
            async function fetchDressCodes() {
                setLoadingDressCodes(true);
                try {
                    const data = await getDressCodes(Number(editFormData.idIdioma));
                    setDressCodesList(data);
                } catch (e) {
                    console.error('Error al cargar dress codes', e);
                } finally {
                    setLoadingDressCodes(false);
                }
            }
            fetchDressCodes();
        }
    }, [showEditModal, editFormData.idIdioma]);



    // ── Acciones de Cambio de Estado Manual y Guardado de Datos ──
    const handleManualActivate = async () => {
        const text = isPrograma ? 'programa' : 'evento';
        if (!confirm(`¿Estás seguro de que deseas activar este ${text}?`)) return;

        setStateActionLoading(true);
        try {
            await activateEventManual(idEventoLong);
            alert(`${isPrograma ? 'Programa' : 'Evento'} activado correctamente`);
            window.location.reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : `Error al activar el ${text}`;
            alert(message);
        } finally {
            setStateActionLoading(false);
        }
    };

    const handleOpenStateModal = (state: 'C' | 'X' | 'A') => {
        setTargetState(state);
        setStateObservaciones('');
        setShowStateModal(true);
    };

    const handleStateActionSubmit = async () => {
        const text = isPrograma ? 'programa' : 'evento';
        
        if (targetState === 'X') {
            if (!confirm(`El ${text} quedará anulado. No se eliminarán datos, pero no podrá operarse. ¿Confirmar anulación?`)) {
                return;
            }
        }

        setStateActionLoading(true);
        try {
            if (targetState === 'C') {
                await closeEvent(idEventoLong, stateObservaciones);
                alert(`${isPrograma ? 'Programa' : 'Evento'} cerrado correctamente`);
            } else if (targetState === 'X') {
                await cancelEvent(idEventoLong, stateObservaciones);
                alert(`${isPrograma ? 'Programa' : 'Evento'} anulado correctamente`);
            } else if (targetState === 'A') {
                await reopenEvent(idEventoLong, stateObservaciones);
                alert(`${isPrograma ? 'Programa' : 'Evento'} reabierto correctamente`);
            }
            setShowStateModal(false);
            window.location.reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : `Error al procesar el cambio de estado`;
            alert(message);
        } finally {
            setStateActionLoading(false);
        }
    };

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        setStateActionLoading(true);
        try {
            const payload = {
                idIdioma: Number(editFormData.idIdioma),
                anfitrionesTexto: editFormData.anfitrionesTexto,
                idDressCode: editFormData.idDressCode ? Number(editFormData.idDressCode) : null,
                dressCodeDescripcion: editFormData.dressCodeDescripcion,
                saludo: editFormData.saludo,
                mensajeBienvenida: editFormData.mensajeBienvenida,
                notas: editFormData.notas,
                infoPublica: editFormData.infoPublica,
            };
            await updateEventGeneral(idEventoLong, payload);
            alert('Datos actualizados correctamente');
            setShowEditModal(false);
            window.location.reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar datos generales';
            alert(message);
        } finally {
            setStateActionLoading(false);
        }
    };


    // ── Handler: abrir flujo de cambio de plan ────────────────
    const handleCambiarPlan = async () => {
        if (!event) return;
        setCheckingPlan(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch(`/api/eventos/${event.id_evento}/plan-cambios/pendiente`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (data.tiene_pendiente) {
                setSolicitudPendiente(data.solicitud);
                setShowPendingModal(true);
            } else {
                // Cargar planes disponibles para el mercado del evento
                const mercado = event.codigoMercado || 'AR';
                const moneda = event.codigoMoneda || (mercado === 'AR' ? 'ARS' : (mercado === 'ES' ? 'EUR' : 'USD'));
                const resPlanes = await fetch(`/api/planesPublic/PublicCatalog?tipo=B2C&mercado=${mercado}&moneda=${moneda}`);
                if (resPlanes.ok) {
                    const allPlanes = await resPlanes.json();
                    // Excluir el plan actual
                    const filtered = allPlanes.filter((p: PlanItem) => p.codigo !== event.planCodigo);
                    setPlanesDisponibles(filtered);
                    if (filtered.length > 0) setPlanSeleccionado(filtered[0].codigo);
                }
                setSolicitudEnviada(false);
                setMotivoSolicitud('');
                setShowRequestModal(true);
            }
        } catch {
            alert('No se pudo verificar el estado del plan. Intentá de nuevo.');
        } finally {
            setCheckingPlan(false);
        }
    };

    // ── Handler: enviar solicitud de cambio ─────────────────
    const handleEnviarSolicitud = async () => {
        if (!event || !planSeleccionado) return;
        setEnviandoSolicitud(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch(`/api/eventos/${event.id_evento}/plan-cambios/solicitar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    codigo_plan_solicitado: planSeleccionado,
                    motivo_solicitud: motivoSolicitud || undefined,
                }),
            });
            if (!res.ok) throw new Error();
            setSolicitudEnviada(true);
        } catch {
            alert('No se pudo enviar la solicitud. Intentá de nuevo.');
        } finally {
            setEnviandoSolicitud(false);
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

    const isBorrador = event.estado === 'B';
    const isPendiente = event.estado === 'P';
    const isInactivo = isBorrador || isPendiente;
    const isEvento = event.tipoOperacion === 'EVENTO';
    const isPrograma = event.tipoOperacion === 'PROGRAMA';
    const isPublicEvent = event.esPublico === true || (estructura?.accesos && estructura.accesos.length > 0 && estructura.accesos.some(a => a.es_publico));
    const labelGeneral = isPrograma ? 'programa' : 'evento';
    const labelGeneralCap = isPrograma ? 'Programa' : 'Evento';

    const estadoConfig = {
        'B': {
            label: 'Borrador',
            classes: 'bg-amber-500/10 border-amber-500/20 text-amber-500'
        },
        'P': {
            label: 'Pendiente de Pago',
            classes: 'bg-orange-500/10 border-orange-500/20 text-orange-500'
        },
        'A': {
            label: 'Activo',
            classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        },
        'C': {
            label: 'Cerrado',
            classes: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-500'
        },
        'X': {
            label: 'Anulado',
            classes: 'bg-red-500/10 border-red-500/20 text-red-500'
        },
    } as const;

    const estadoActual = estadoConfig[event.estado as keyof typeof estadoConfig] ?? {
        label: event.estado,
        classes: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-500'
    };

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
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${estadoActual.classes}`}>
                            {estadoActual.label}
                        </span>
                    </div>
                    {(event.estado === 'C' || event.estado === 'X') && event.estadoObservacionActual && (
                        <p className="text-xs text-muted/80 mt-1 bg-card-bg border border-card-border px-3 py-1.5 rounded-xl w-fit">
                            <span className="font-bold text-foreground">Motivo:</span> {event.estadoObservacionActual}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Bloque: Datos Generales */}
                    {(event.estado === 'B' || event.estado === 'P' || event.estado === 'A') && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-card-border/30 hover:text-indigo-400 text-foreground font-bold text-xs transition-all shadow-md"
                        >
                            <Settings2 className="w-4 h-4" />
                            Editar datos generales
                        </button>
                    )}

                    {isEvento && (
                        <button
                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/estructura`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            <Settings2 className="w-4 h-4" />
                            Gestionar Estructura
                        </button>
                    )}
                </div>
            </header>

            {/* ── Avisos del Plan / Estado ── */}
            {(isInactivo || event.limites?.permitirGenerarLinks === false) && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-amber-500">Invitaciones Deshabilitadas</h4>
                        <p className="text-sm text-amber-500/80">
                            {isInactivo
                                ? 'Tu evento se encuentra en estado ' + (isBorrador ? 'Borrador' : 'Pendiente') + '. Debés activarlo para poder generar y enviar invitaciones.'
                                : 'Tu plan actual no permite generar nuevas invitaciones...'}
                        </p>
                    </div>
                    {event.limites?.permitirGenerarLinks === false && !isBorrador && (
                        <button
                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/plan`)}
                            className="ml-auto px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors shrink-0"
                        >
                            Mejorar Plan
                        </button>
                    )}
                </div>
            )}

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
                                {isEvento && (
                                    <button
                                        onClick={() => router.push(`/dashboard/events/${event.id_evento}/estructura`)}
                                        className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group"
                                    >
                                        Ir al Editor de Estructura Completo
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Accesos Rápidos (Módulos de Gestión) ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Quick Link Card - Gestión de Invitados */}
                        {isEvento && (
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
                        )}
                        {/* Quick Link Card - Audiencias */}
                        {isEvento && isPublicEvent && (
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
                        )}
                        {/* Quick Link Card - Equipo y Staff */}
                        {isEvento && (
                            <div className="p-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm mb-1">Equipo y Staff</h4>
                                <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                    Administrá el equipo interno del evento y asigná el staff operativo con códigos de acceso.
                                </p>
                                <button
                                    onClick={() => router.push(`/dashboard/events/${event.id_evento}/staff`)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Ver Equipo y Staff
                                </button>
                            </div>
                        )}
                        {isPrograma && (
                            <>
                                {/* Inscripciones y Pagos */}
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

                                {/* CRM Inscriptos */}
                                <div className="p-5 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4">
                                        <CalendarRange className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm mb-1">Panel de Inscriptos</h4>
                                    <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                        CRM operativo. Control de salud, menú, retiros y detalles por participante.
                                    </p>
                                    <button
                                        onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscriptos`)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
                                    >
                                        <CalendarRange className="w-3.5 h-3.5" />
                                        Ver Panel CRM
                                    </button>
                                </div>

                                 {/* Salud */}
                                {isFeatureActiva('RESTRICCIONES_ALIMENTARIAS') && (
                                    <div className="p-5 rounded-2xl bg-red-600/10 border border-red-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-4">
                                            <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm mb-1">Salud y Medicaciones</h4>
                                        <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                            Fichas médicas, seguimiento de medicaciones y registro de incidentes diarios.
                                        </p>
                                        <button
                                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscripciones/salud`)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 hover:bg-red-400 transition-all"
                                        >
                                            <Stethoscope className="w-3.5 h-3.5" />
                                            Ver Panel de Salud
                                        </button>
                                    </div>
                                )}

                                {/* Cocina */}
                                {isFeatureActiva('RESTRICCIONES_ALIMENTARIAS') && (
                                    <div className="p-5 rounded-2xl bg-teal-600/10 border border-teal-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4">
                                            <ChefHat className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm mb-1">Comedor y Cocina</h4>
                                        <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                            Organización del menú diario, restricciones alimentarias y alertas de salud.
                                        </p>
                                        <button
                                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscripciones/cocina`)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all"
                                        >
                                            <ChefHat className="w-3.5 h-3.5" />
                                            Ver Cocina
                                        </button>
                                    </div>
                                )}

                                {/* Retiros */}
                                {(isFeatureActiva('RETIRO_INFANTIL_AUTORIZACIONES') || isFeatureActiva('RETIRO_INFANTIL_REGISTRO')) && (
                                    <div className="p-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                                            <LogOut className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm mb-1">Retiros QR</h4>
                                        <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                            Control de retiros de participantes autorizados mediante escaneo de código QR.
                                        </p>
                                        <button
                                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscripciones/retiros`)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Ver Retiros
                                        </button>
                                    </div>
                                )}

                                {/* Transporte */}
                                {isFeatureActiva('TRANSPORTE') && (
                                    <div className="p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                                            <Bus className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm mb-1">Transporte</h4>
                                        <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                            Listado operativo diario de participantes con servicio de transporte.
                                        </p>
                                        <button
                                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscripciones/transporte`)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-400 transition-all"
                                        >
                                            <Bus className="w-3.5 h-3.5" />
                                            Ver Transporte
                                        </button>
                                    </div>
                                )}

                                {/* Autorizaciones */}
                                {isFeatureActiva('RETIRO_INFANTIL_AUTORIZACIONES') && (
                                    <div className="p-5 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-4">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm mb-1">Autorizaciones Legales</h4>
                                        <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                            Control de firmas y aceptaciones de autorizaciones de todos los participantes.
                                        </p>
                                        <button
                                            onClick={() => router.push(`/dashboard/events/${event.id_evento}/inscripciones/autorizaciones`)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 hover:bg-violet-400 transition-all"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Ver Autorizaciones
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* B2C Dynamic Feature Cards */}
                        {isEvento && (isFeatureActiva('MUSICA_PLAYLIST_ORGANIZADOR') || isFeatureActiva('MUSICA_SUGERENCIAS') || isFeatureActiva('MUSICA_BLOQUEOS') || isFeatureActiva('MUSICA_VOTACION')) && (
                            <div className="p-5 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-4">
                                    <Music className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm mb-1">Música y Playlist</h4>
                                <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                    Sugerencias de la audiencia, playlist del DJ y control de pistas en vivo.
                                </p>
                                <button
                                    onClick={() => alert('Módulo de Música en construcción. ¡Estará disponible muy pronto!')}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 hover:bg-violet-400 transition-all"
                                >
                                    <Music className="w-3.5 h-3.5" />
                                    Gestionar Música
                                </button>
                            </div>
                        )}

                        {isEvento && isFeatureActiva('HOSPEDAJES') && (
                            <div className="p-5 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4">
                                    <Home className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm mb-1">Hospedajes Sugeridos</h4>
                                <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                    Cargá y administrá las opciones de alojamiento recomendadas para tus invitados.
                                </p>
                                <button
                                    onClick={() => alert('Módulo de Hospedaje en construcción. ¡Estará disponible muy pronto!')}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
                                >
                                    <Home className="w-3.5 h-3.5" />
                                    Ver Hospedajes
                                </button>
                            </div>
                        )}

                        {isEvento && isFeatureActiva('REGALOS') && (
                            <div className="p-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm mb-1">Regalos y Cuentas</h4>
                                <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                    Configurá tu lista de regalos, datos de transferencia y mensajes de agradecimiento.
                                </p>
                                <button
                                    onClick={() => alert('Módulo de Regalos en construcción. ¡Estará disponible muy pronto!')}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                                >
                                    <Gift className="w-3.5 h-3.5" />
                                    Configurar Regalos
                                </button>
                            </div>
                        )}

                        {isEvento && isFeatureActiva('TRANSPORTE') && (
                            <div className="p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                                    <Bus className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm mb-1">Traslados y Transporte</h4>
                                <p className="text-muted text-[11px] leading-relaxed flex-grow">
                                    Definí puntos de encuentro y gestioná las reservas de traslados de tus invitados.
                                </p>
                                <button
                                    onClick={() => alert('Módulo de Transporte en construcción. ¡Estará disponible muy pronto!')}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-400 transition-all"
                                >
                                    <Bus className="w-3.5 h-3.5" />
                                    Gestionar Traslados
                                </button>
                            </div>
                        )}
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
                                    <p className="text-sm text-foreground leading-relaxed">{event.mensajeBienvenida || '—'}</p>
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
                    <FeaturesEventoManager idEvento={idEventoLong} tipoOperacion={event.tipoOperacion as 'EVENTO' | 'PROGRAMA'} />

                    {/* Timeline de Historial de Estados */}
                    <section className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-6">
                        <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Historial de Estados del {labelGeneralCap}
                        </h3>
                        {historyList.length === 0 ? (
                            <p className="text-sm text-muted italic">No hay registros de cambios de estado para este {labelGeneral}.</p>
                        ) : (
                            <div className="relative pl-6 border-l border-indigo-500/20 space-y-6">
                                {historyList.map((hist, index) => {
                                    const histStateConfig = estadoConfig[hist.estado as keyof typeof estadoConfig] ?? {
                                        label: hist.estadoDescripcion || hist.estado,
                                        classes: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-500'
                                    };
                                    return (
                                        <div key={index} className="relative">
                                            {/* Dot centered on border line */}
                                            <div className="absolute -left-[30.5px] top-1.5 w-3 h-3 rounded-full border-2 border-card-bg bg-indigo-500" />
                                            
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${histStateConfig.classes}`}>
                                                        {histStateConfig.label}
                                                    </span>
                                                    <span className="text-xs font-medium text-foreground">{hist.usuario}</span>
                                                    <span className="text-[10px] text-muted ml-auto">
                                                        {new Date(hist.fecha).toLocaleString('es-AR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                {hist.observaciones && (
                                                    <p className="text-sm text-muted leading-relaxed mt-1 italic pl-1">
                                                        &quot;{hist.observaciones}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Sidebar ── */}
                <aside className="space-y-6">
                    {/* Details Panel */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-6">
                        <h3 className="text-sm font-bold text-foreground">Detalles Técnicos</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-card-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Tag className="w-3.5 h-3.5" /> Tipo Evento
                                </div>
                                <span className="text-xs font-bold text-foreground">{event.tipoEventoDescripcion || `ID #${event.id_tipo_evento}`}</span>
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
                    {/* Plan Actual — ampliado con país comercial + botón inteligente */}
                    <div className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-foreground">Plan del Evento</h3>
                                <p className="text-xs text-muted">Plan y mercado asignados al evento</p>
                            </div>
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Card plan */}
                        <div className="p-4 rounded-2xl bg-background border border-card-border space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Plan Actual</p>
                                    <h4 className="text-lg font-bold text-foreground">
                                        {event.planNombre || 'Sin plan asignado'}
                                    </h4>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    Activo
                                </div>
                            </div>

                            {/* País + Mercado/Moneda */}
                            {(event.paisCodigoIso2 || event.codigoMercado) && (
                                <div className="pt-2 border-t border-card-border space-y-2">
                                    {event.paisCodigoIso2 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1.5">
                                                <Globe className="w-3 h-3" />
                                                País Comercial
                                            </span>
                                            <span className="text-xs font-bold text-foreground">{event.paisCodigoIso2}</span>
                                        </div>
                                    )}
                                    {(event.codigoMercado || event.codigoMoneda) && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1.5">
                                                <DollarSign className="w-3 h-3" />
                                                Mercado / Moneda
                                            </span>
                                            <span className="text-xs font-bold text-foreground">
                                                {[event.codigoMercado, event.codigoMoneda].filter(Boolean).join(' / ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Botón Cambiar Plan */}
                        {!isAdmin && (
                            <button
                                onClick={handleCambiarPlan}
                                disabled={checkingPlan}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-70"
                            >
                                {checkingPlan
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...</>
                                    : <><TrendingUp className="w-3.5 h-3.5" /> Cambiar Plan</>
                                }
                            </button>
                        )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="space-y-2">
                        {event.estado === 'B' && (
                            <>
                                <button
                                    onClick={handleManualActivate}
                                    disabled={stateActionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Activar {labelGeneral}
                                </button>
                                <button
                                    onClick={() => handleOpenStateModal('X')}
                                    disabled={stateActionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 font-bold text-xs transition-all disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Anular {labelGeneral}
                                </button>
                            </>
                        )}

                        {event.estado === 'P' && (
                            <button
                                onClick={() => handleOpenStateModal('X')}
                                disabled={stateActionLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 font-bold text-xs transition-all disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Anular {labelGeneral}
                            </button>
                        )}

                        {event.estado === 'A' && (
                            <>
                                <button
                                    onClick={() => handleOpenStateModal('C')}
                                    disabled={stateActionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4 text-white" />
                                    Cerrar {labelGeneral}
                                </button>
                                <button
                                    onClick={() => handleOpenStateModal('X')}
                                    disabled={stateActionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 font-bold text-xs transition-all disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Anular {labelGeneral}
                                </button>
                            </>
                        )}

                        {event.estado === 'C' && (
                            <button
                                onClick={() => handleOpenStateModal('A')}
                                disabled={stateActionLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                            >
                                <Calendar className="w-4 h-4" />
                                Reabrir {labelGeneral}
                            </button>
                        )}

                        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-card-bg transition-all text-xs font-bold uppercase tracking-widest">
                            Duplicar {labelGeneral}
                        </button>
                    </div>
                </aside>
            </div>

            {/* ════ MODAL: Solicitud Pendiente ════ */}
            {showPendingModal && solicitudPendiente && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPendingModal(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-card-bg border border-amber-500/30 shadow-2xl shadow-amber-500/10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Solicitud Pendiente</h3>
                                    <p className="text-xs text-muted">Ya tenés una solicitud en revisión</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPendingModal(false)} className="text-muted hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="p-4 rounded-xl bg-background border border-card-border space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted">Solicitud</span>
                                <span className="text-xs font-bold text-foreground">#{solicitudPendiente.id_evento_plan_cambio}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted">Plan solicitado</span>
                                <span className="text-xs font-bold text-foreground">{solicitudPendiente.plan_solicitado_nombre || solicitudPendiente.plan_solicitado_codigo}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted">Estado</span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">{solicitudPendiente.estado}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted">Fecha</span>
                                <span className="text-xs font-bold text-foreground">{new Date(solicitudPendiente.fecha_solicitud).toLocaleDateString('es-AR')}</span>
                            </div>
                        </div>

                        <p className="text-xs text-muted text-center leading-relaxed">
                            El equipo de Eventia está revisando tu solicitud. Te notificaremos cuando sea procesada.
                        </p>

                        <button
                            onClick={() => setShowPendingModal(false)}
                            className="w-full py-3 rounded-xl bg-card-border text-foreground font-bold text-sm hover:bg-card-border/70 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* ════ MODAL: Solicitar Cambio de Plan ════ */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { if (!enviandoSolicitud) setShowRequestModal(false); }}>
                    <div className="w-full max-w-md rounded-2xl bg-card-bg border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Solicitar Cambio de Plan</h3>
                                    <p className="text-xs text-muted">El equipo de Eventia lo revisará y te confirmará</p>
                                </div>
                            </div>
                            {!enviandoSolicitud && (
                                <button onClick={() => setShowRequestModal(false)} className="text-muted hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {solicitudEnviada ? (
                            /* — Éxito — */
                            <div className="space-y-5">
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                    </div>
                                    <p className="text-center text-sm text-foreground font-semibold">Solicitud enviada</p>
                                    <p className="text-center text-xs text-muted leading-relaxed">
                                        El equipo de Eventia revisará el cambio y confirmará el importe final.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            /* — Formulario — */
                            <div className="space-y-4">
                                {/* Plan actual */}
                                <div className="p-3 rounded-xl bg-background border border-card-border">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Plan Actual</p>
                                    <p className="text-sm font-bold text-foreground">{event?.planNombre || '—'}</p>
                                </div>

                                {/* Nuevo plan */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Nuevo Plan</label>
                                    {planesDisponibles.length === 0 ? (
                                        <p className="text-xs text-muted italic">No hay planes disponibles para cambio.</p>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={planSeleccionado}
                                                onChange={e => setPlanSeleccionado(e.target.value)}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10 text-sm"
                                            >
                                                {planesDisponibles.map(p => (
                                                    <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Motivo */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                                        Motivo <span className="text-muted/50 font-normal lowercase tracking-normal">(opcional)</span>
                                    </label>
                                    <textarea
                                        value={motivoSolicitud}
                                        onChange={e => setMotivoSolicitud(e.target.value)}
                                        placeholder="¿Por qué querés cambiar de plan?"
                                        rows={3}
                                        className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none text-sm"
                                    />
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={() => setShowRequestModal(false)}
                                        disabled={enviandoSolicitud}
                                        className="flex-1 py-3 rounded-xl border border-card-border text-muted hover:text-foreground font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleEnviarSolicitud}
                                        disabled={enviandoSolicitud || !planSeleccionado}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60"
                                    >
                                        {enviandoSolicitud
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                            : 'Solicitar'
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════ MODAL: Editar Datos Generales ════ */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => { if (!stateActionLoading) setShowEditModal(false); }}>
                    <div className="my-8 w-full max-w-lg rounded-2xl bg-card-bg border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <Settings2 className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Editar Datos Generales</h3>
                                    <p className="text-xs text-muted">Modificá los datos generales del {labelGeneral}</p>
                                </div>
                            </div>
                            {!stateActionLoading && (
                                <button onClick={() => setShowEditModal(false)} className="text-muted hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveGeneral} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {/* Idioma */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Idioma</label>
                                {loadingLanguages ? (
                                    <p className="text-xs text-muted italic">Cargando idiomas...</p>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={editFormData.idIdioma}
                                            onChange={e => setEditFormData(prev => ({ ...prev, idIdioma: Number(e.target.value) }))}
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10 text-sm font-medium"
                                        >
                                            {idiomasList.map(idioma => (
                                                <option key={idioma.id_idioma} value={idioma.id_idioma}>
                                                    {idioma.nombre_largo} ({idioma.locale})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Anfitriones / Nombre visible */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Anfitriones / Nombre Visible</label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.anfitrionesTexto}
                                    onChange={e => setEditFormData(prev => ({ ...prev, anfitrionesTexto: e.target.value }))}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm"
                                    placeholder="Ej. Club de mar / Boda de Ana y Juan"
                                />
                            </div>

                            {/* Dress Code */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Dress Code</label>
                                {loadingDressCodes ? (
                                    <p className="text-xs text-muted italic">Cargando códigos de vestimenta...</p>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={editFormData.idDressCode}
                                            onChange={e => setEditFormData(prev => ({ ...prev, idDressCode: e.target.value }))}
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none appearance-none cursor-pointer pr-10 text-sm font-medium"
                                        >
                                            <option value="">Seleccionar Dress Code...</option>
                                            {dressCodesList.map(dc => (
                                                <option key={dc.id} value={dc.id}>{dc.texto}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detalle Dress Code */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Detalle de Dress Code</label>
                                <input
                                    type="text"
                                    value={editFormData.dressCodeDescripcion}
                                    onChange={e => setEditFormData(prev => ({ ...prev, dressCodeDescripcion: e.target.value }))}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm"
                                    placeholder="Ej. Ropa cómoda, tonos pasteles"
                                />
                            </div>

                            {/* Saludo */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Saludo</label>
                                <textarea
                                    value={editFormData.saludo}
                                    onChange={e => setEditFormData(prev => ({ ...prev, saludo: e.target.value }))}
                                    rows={2}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm resize-none"
                                    placeholder="Saludo inicial del evento"
                                />
                            </div>

                            {/* Mensaje Bienvenida */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Mensaje Bienvenida</label>
                                <textarea
                                    value={editFormData.mensajeBienvenida}
                                    onChange={e => setEditFormData(prev => ({ ...prev, mensajeBienvenida: e.target.value }))}
                                    rows={2}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm resize-none"
                                    placeholder="Mensaje de bienvenida"
                                />
                            </div>

                            {/* Notas Internas */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Notas Internas</label>
                                <textarea
                                    value={editFormData.notas}
                                    onChange={e => setEditFormData(prev => ({ ...prev, notas: e.target.value }))}
                                    rows={2}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm resize-none"
                                    placeholder="Notas privadas exclusivas del staff"
                                />
                            </div>

                            {/* Información Pública */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Información Pública</label>
                                <textarea
                                    value={editFormData.infoPublica}
                                    onChange={e => setEditFormData(prev => ({ ...prev, infoPublica: e.target.value }))}
                                    rows={2}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none text-sm resize-none"
                                    placeholder="Detalles públicos del evento"
                                />
                            </div>

                            {/* Acciones del formulario */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={stateActionLoading}
                                    className="flex-1 py-3 rounded-xl border border-card-border text-muted hover:text-foreground font-bold text-sm transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={stateActionLoading}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60"
                                >
                                    {stateActionLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                    ) : (
                                        'Guardar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ MODAL: Cambio de Estado (Cerrar / Anular / Reabrir) ════ */}
            {showStateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { if (!stateActionLoading) setShowStateModal(false); }}>
                    <div className="w-full max-w-md rounded-2xl bg-card-bg border border-card-border shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    targetState === 'C' ? 'bg-neutral-500/10 text-neutral-400' :
                                    targetState === 'X' ? 'bg-red-500/10 text-red-400' :
                                    'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                    {targetState === 'C' && <Lock className="w-5 h-5" />}
                                    {targetState === 'X' && <AlertTriangle className="w-5 h-5" />}
                                    {targetState === 'A' && <Calendar className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {targetState === 'C' && `Cerrar ${labelGeneralCap}`}
                                        {targetState === 'X' && `Anular ${labelGeneralCap}`}
                                        {targetState === 'A' && `Reabrir ${labelGeneralCap}`}
                                    </h3>
                                    <p className="text-xs text-muted">Confirmá la acción para este {labelGeneral}</p>
                                </div>
                            </div>
                            {!stateActionLoading && (
                                <button onClick={() => setShowStateModal(false)} className="text-muted hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Warning if cancellation */}
                        {targetState === 'X' && (
                            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-red-400 font-medium leading-relaxed">
                                    El {labelGeneral} quedará anulado. No se eliminarán datos, pero no podrá operarse.
                                </p>
                            </div>
                        )}

                        {/* Form Body */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                                    Motivo / Observaciones
                                </label>
                                <textarea
                                    value={stateObservaciones}
                                    onChange={e => setStateObservaciones(e.target.value)}
                                    placeholder={`Indica el motivo por el cual deseas ${
                                        targetState === 'C' ? 'cerrar' :
                                        targetState === 'X' ? 'anular' :
                                        'reabrir'
                                    } el ${labelGeneral}...`}
                                    rows={3}
                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-foreground outline-none placeholder:text-muted resize-none text-sm"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => setShowStateModal(false)}
                                    disabled={stateActionLoading}
                                    className="flex-1 py-3 rounded-xl border border-card-border text-muted hover:text-foreground font-bold text-sm transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleStateActionSubmit}
                                    disabled={stateActionLoading}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-60 ${
                                        targetState === 'X' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' :
                                        targetState === 'C' ? 'bg-neutral-600 hover:bg-neutral-500 text-white' :
                                        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                                    }`}
                                >
                                    {stateActionLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                    ) : (
                                        targetState === 'C' ? 'Cerrar' :
                                        targetState === 'X' ? 'Anular' :
                                        'Reabrir'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
