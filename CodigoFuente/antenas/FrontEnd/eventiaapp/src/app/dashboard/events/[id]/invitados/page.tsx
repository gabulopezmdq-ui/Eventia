'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Plus, Users, Search, Filter,
    Mail, Phone, X, Check, Copy, AlertCircle, RefreshCw, Loader2,
    MessageSquare, Clock, CheckCircle2, XCircle, Ticket, ChefHat, AlertTriangle, LogIn, UserPlus, Info
} from 'lucide-react';
import {
    crearGrupoManual,
    listarInvitados,
    listarPersonasEvento,
    listarGruposEvento,
    InvitadoListado
} from '@/src/features/invitations/invitation.service';
import { getEstructuraEvento, getEventById } from '@/src/features/events/event.service';
import { AccesoEvento, LimitesEvento, Event } from '@/src/features/events/types';
import { usePlanLimit } from '@/src/context/PlanLimitContext';
import { LockIcon } from '@/src/components/ui/LockIcon';
import QrEntradaScreen from '@/src/components/captacion/QrEntradaScreen';

type TabId = 'invitados' | 'grupos' | 'ingreso';

export default function InvitadosPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Form state for new invitation
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [idAcceso, setIdAcceso] = useState<number | ''>('');
    const [accesos, setAccesos] = useState<AccesoEvento[]>([]);
    const [defaultAccesoId, setDefaultAccesoId] = useState<number | null>(null);

    // Group fields
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [cantAdultosExtra, setCantAdultosExtra] = useState(0);
    const [cantMenores, setCantMenores] = useState(0);

    // Status state
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Guest list state ──
    const [invitados, setInvitados] = useState<any[]>([]);
    const [resumen, setResumen] = useState<any | null>(null);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // ── Plan limits & Event Info ──
    const { handlePlanLimitError, openUpsell } = usePlanLimit();
    const [limites, setLimites] = useState<LimitesEvento | null>(null);
    const [event, setEvent] = useState<Event | null>(null);

    // ── Tabs Navigation State ──
    const [activeTab, setActiveTab] = useState<TabId>('invitados');

    // ── Groups Tab State ──
    const [grupos, setGrupos] = useState<any[]>([]);
    const [gruposLoading, setGruposLoading] = useState(false);
    const [gruposError, setGruposError] = useState<string | null>(null);

    // ── Group Detail Modal State ──
    const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
    const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);

    const isEvento = event?.tipoOperacion === 'EVENTO';
    const isPublicEvent = event?.esPublico === true || (accesos && accesos.length > 0 && accesos.some(a => a.es_publico));
    const isPrivateEvent = isEvento && !isPublicEvent;

    // ── Fetch guest list & event info ──
    const fetchInvitados = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        try {
            // Cargar info del evento primero si no está cargada
            const eventoData = await getEventById(String(id)).catch(() => null);
            if (eventoData) {
                setEvent(eventoData);
                if (eventoData.limites) {
                    setLimites(eventoData.limites);
                }
            }

            const isEvt = eventoData?.tipoOperacion === 'EVENTO';
            if (isEvt) {
                // Endpoint para Eventos: personas + resumen
                const data = await listarPersonasEvento(Number(id));
                setResumen(data.resumen);
                setInvitados(data.items || []);
            } else {
                // Antigua función para Programas
                const data = await listarInvitados(Number(id));
                setInvitados(data);
            }
        } catch (err) {
            setListError(err instanceof Error ? err.message : 'Error al cargar invitados');
        } finally {
            setListLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInvitados();
    }, [fetchInvitados]);

    // ── Fetch groups ──
    const fetchGrupos = useCallback(async () => {
        setGruposLoading(true);
        setGruposError(null);
        try {
            const data = await listarGruposEvento(Number(id));
            setGrupos(data.items || []);
        } catch (err) {
            setGruposError(err instanceof Error ? err.message : 'Error al cargar grupos');
        } finally {
            setGruposLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (activeTab === 'grupos' && isPrivateEvent) {
            fetchGrupos();
        }
    }, [activeTab, fetchGrupos, isPrivateEvent]);

    // ── Fetch event structure (accesos) ──
    useEffect(() => {
        const fetchData = async () => {
            try {
                const structure = await getEstructuraEvento(Number(id));
                setAccesos(structure.accesos || []);
                if (structure.id_acceso_default) {
                    setIdAcceso(structure.id_acceso_default);
                    setDefaultAccesoId(structure.id_acceso_default);
                } else if (structure.accesos && structure.accesos.length > 0) {
                    setIdAcceso(structure.accesos[0].id_acceso);
                    setDefaultAccesoId(structure.accesos[0].id_acceso);
                }
            } catch (err) {
                console.error("Error fetching event structure:", err);
            }
        };
        fetchData();
    }, [id]);

    // ── Local search filters ──
    const filteredInvitados = invitados.filter((inv) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const full = inv.nombreCompleto ? inv.nombreCompleto.toLowerCase() : `${inv.nombre || ''} ${inv.apellido || ''}`.toLowerCase();
        return (
            full.includes(q) ||
            (inv.email && inv.email.toLowerCase().includes(q)) ||
            (inv.celular && inv.celular.toLowerCase().includes(q))
        );
    });

    const filteredGrupos = grupos.filter((grp) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            grp.grupoResumenTexto.toLowerCase().includes(q) ||
            grp.titular.toLowerCase().includes(q) ||
            (grp.emailTitular && grp.emailTitular.toLowerCase().includes(q)) ||
            (grp.celularTitular && grp.celularTitular.toLowerCase().includes(q))
        );
    });

    // ── Helper: badges styling ──
    const estadoLabel = (estado: string) => {
        switch (estado) {
            case 'Y': return { text: 'Confirmado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
            case 'N': return { text: 'No asiste', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
            case 'R': return { text: 'Rechazado', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
            default: return { text: 'Pendiente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        }
    };

    const handleCreateInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const grupoName = nombreGrupo.trim()
                || (cantAdultosExtra + cantMenores > 0
                    ? `${nombre} + ${cantAdultosExtra + cantMenores}`
                    : `${nombre} ${apellido}`);

            const maxPersonasTotal = 1 + cantAdultosExtra + cantMenores;

            await crearGrupoManual({
                idEvento: Number(id),
                idAcceso: idAcceso !== '' ? Number(idAcceso) : 0,
                nombreGrupo: grupoName,
                maxPersonasTotal,
                cantAdultosSinNombre: cantAdultosExtra,
                cantMenoresSinNombre: cantMenores,
                personas: [{
                    nombre,
                    apellido,
                    email: email || undefined,
                    celular: celular || undefined,
                    titular: true,
                    rolEvento: 'A',
                }],
            });

            await fetchInvitados();
            if (activeTab === 'grupos' && isPrivateEvent) {
                await fetchGrupos();
            }
            setGeneratedLink('__success__');
        } catch (err) {
            try { handlePlanLimitError(err); }
            catch {
                let mensaje = 'Error al generar la invitación';
                if (err instanceof Error) {
                    try {
                        const parsed = JSON.parse(err.message);
                        mensaje = parsed.error || parsed.message || err.message;
                    } catch {
                        mensaje = err.message;
                    }
                } else if (typeof err === 'object' && err !== null) {
                    mensaje = (err as any).error || (err as any).message || mensaje;
                }
                setError(mensaje);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyInvitadoLink = (inv: any) => {
        const tokenVal = inv.rsvpToken || inv.token || inv.qrToken;
        let link = `${window.location.origin}/rsvp/${tokenVal}`;
        if (inv.idAcceso) {
            link += `?idAcceso=${inv.idAcceso}`;
        }
        navigator.clipboard.writeText(link);
        setCopiedId(inv.idInvitado);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const closeModal = () => {
        setIsInviteModalOpen(false);
        setGeneratedLink(null);
        setError(null);
        setNombre('');
        setApellido('');
        setEmail('');
        setCelular('');
        setNombreGrupo('');
        setCantAdultosExtra(0);
        setCantMenores(0);
        if (defaultAccesoId) {
            setIdAcceso(defaultAccesoId);
        } else if (accesos.length > 0) {
            setIdAcceso(accesos[0].id_acceso);
        } else {
            setIdAcceso('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-indigo-400">Invitados</span>
            </nav>

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Invitados</h1>
                    <p className="text-muted text-sm mt-1">
                        {isEvento && resumen ? (
                            `Métricas y listados generales de invitados para tu evento social.`
                        ) : invitados.length > 0 ? (
                            `${invitados.length} asistente${invitados.length !== 1 ? 's' : ''} cargados en tu programa.`
                        ) : (
                            'Controlá la lista de asistentes, estados de confirmación y generá nuevas invitaciones.'
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            await fetchInvitados();
                            if (activeTab === 'grupos' && isPrivateEvent) {
                                await fetchGrupos();
                            }
                        }}
                        disabled={listLoading || gruposLoading}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${listLoading || gruposLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {limites?.permitirGenerarLinks === false ? (
                        <button
                            onClick={() => openUpsell('Tu plan no permite generar invitaciones personalizadas. Mejorá tu plan para acceder a esta función.')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-sm border border-amber-500/20 transition-all"
                        >
                            <LockIcon message="" size={16} />
                            Invitación Personalizada
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Invitación Personalizada
                        </button>
                    )}
                </div>
            </header>

            {/* ── Tabs Navigation (Only visible for PRIVATE events) ── */}
            {isPrivateEvent && (
                <div className="flex space-x-1 p-1 bg-card-bg/50 rounded-2xl border border-card-border overflow-x-auto">
                    <button
                        onClick={() => { setActiveTab('invitados'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'invitados'
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-muted hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Invitados
                    </button>
                    <button
                        onClick={() => { setActiveTab('grupos'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'grupos'
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-muted hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Grupos RSVP
                    </button>
                    <button
                        onClick={() => { setActiveTab('ingreso'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'ingreso'
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-muted hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                        <LogIn className="w-4 h-4" />
                        Control de Ingreso
                    </button>
                </div>
            )}

            {/* ── Content rendering based on active tab & event type ── */}
            {activeTab === 'invitados' && (
                <>
                    {/* ── RESUMEN CARDS (Only for EVENTO type) ── */}
                    {isEvento && resumen && (() => {
                        const pct = resumen.cuposInvitados > 0 ? Math.min(100, Math.round((resumen.personasCargadas / resumen.cuposInvitados) * 100)) : 0;
                        const ingressPct = resumen.confirmados > 0 ? Math.min(100, Math.round((resumen.ingresaron / resumen.confirmados) * 100)) : 0;

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                                {/* Card 1: Capacidad de Invitados */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.04] hover:border-indigo-500/25 transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Capacidad y Cupos</span>
                                            <div className="flex items-baseline gap-1.5 mt-1">
                                                <span className="text-2xl font-black text-foreground">{resumen.personasCargadas ?? 0}</span>
                                                <span className="text-xs text-muted">/ {resumen.cuposInvitados ?? 0} cupos</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                            <Ticket className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-muted/70 flex justify-between">
                                            <span>{pct}% cargado</span>
                                            <span className="font-semibold text-foreground/80">{resumen.cuposNoUsados ?? 0} libres</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Card 2: Grupos RSVP */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.04] hover:border-indigo-500/25 transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Grupos RSVP</span>
                                            <div className="mt-1">
                                                <span className="text-2xl font-black text-foreground">{resumen.totalGrupos ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-white/[0.04]">
                                        <p className="text-[10px] text-muted/70">Familias o acompañantes cargados</p>
                                    </div>
                                </div>

                                {/* Card 3: Respuestas RSVP */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.04] hover:border-indigo-500/25 transition-all duration-300">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-muted block">Respuestas RSVP</span>
                                    </div>
                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted/80 font-bold uppercase tracking-wider text-[9px]">Confirmados</span>
                                            <span className="font-black text-emerald-400 text-sm">{resumen.confirmados ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted/80 font-bold uppercase tracking-wider text-[9px]">Pendientes</span>
                                            <span className="font-black text-amber-400 text-sm">{resumen.pendientes ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted/80 font-bold uppercase tracking-wider text-[9px]">Rechazados</span>
                                            <span className="font-black text-red-400 text-sm">{resumen.noAsisten ?? 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Control de Ingresos */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.04] hover:border-indigo-500/25 transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Asistencia</span>
                                            <div className="flex items-baseline gap-1.5 mt-1">
                                                <span className="text-2xl font-black text-foreground">{resumen.ingresaron ?? 0}</span>
                                                <span className="text-xs text-muted">/ {resumen.confirmados ?? 0} confirmados</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400">
                                            <LogIn className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${ingressPct}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-muted/70 flex justify-between">
                                            <span>{ingressPct}% de asistencia</span>
                                            <span className="font-semibold text-foreground/80">Check-in</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Card 5: Menú Especial */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.04] hover:border-indigo-500/25 transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Menú Especial</span>
                                            <div className="mt-1">
                                                <span className="text-2xl font-black text-foreground">{resumen.conRestricciones ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                                            <ChefHat className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-white/[0.04]">
                                        <p className="text-[10px] text-muted/70">Restricciones alimentarias</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ── Filters & Search ── */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, grupo, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card-bg border border-card-border text-foreground hover:bg-background transition-colors text-sm font-semibold whitespace-nowrap">
                            <Filter className="w-4 h-4 text-muted" /> Filtrar
                        </button>
                    </div>

                    {/* ── Invitados List / Empty State ── */}
                    {listLoading && invitados.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                            <p className="text-muted text-sm">Cargando invitados...</p>
                        </div>
                    ) : listError ? (
                        <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                            <p className="text-red-400 text-sm mb-4">{listError}</p>
                            <button onClick={fetchInvitados} className="text-sm text-indigo-400 hover:underline">Reintentar</button>
                        </div>
                    ) : invitados.length === 0 ? (
                        <div className="p-8 sm:p-12 rounded-2xl bg-card-bg border border-card-border text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                                <Users className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Aún no hay invitados</h3>
                            <p className="text-muted max-w-sm text-sm mb-6">
                                Empezá a generar invitaciones personalizadas para que la gente comience a registrarse.
                            </p>
                            {limites?.permitirGenerarLinks === false ? (
                                <button
                                    onClick={() => openUpsell('Tu plan no permite generar invitaciones personalizadas. Mejorá tu plan para acceder a esta función.')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-500 text-sm font-bold hover:bg-amber-500/10 transition-colors"
                                >
                                    <LockIcon message="" size={16} />
                                    Crear primera invitación
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 text-sm font-bold hover:bg-indigo-500/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Crear primera invitación
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-card-bg border border-card-border overflow-hidden">
                            {/* ── Table Header ── */}
                            {isEvento ? (
                                <div className="hidden sm:grid sm:grid-cols-[1.5fr_0.8fr_1.5fr_1.5fr_1fr_1fr_0.8fr_0.8fr_1fr] gap-4 px-6 py-3 border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest">
                                    <span>Invitado</span>
                                    <span>Rol</span>
                                    <span>Grupo</span>
                                    <span>Contacto</span>
                                    <span>Acceso</span>
                                    <span>Estado RSVP</span>
                                    <span className="text-center">Mensaje</span>
                                    <span>Ingreso</span>
                                    <span className="text-right">Acciones</span>
                                </div>
                            ) : (
                                <div className="hidden sm:grid sm:grid-cols-[2fr_1.5fr_1fr_auto] gap-4 px-6 py-3 border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest">
                                    <span>Invitado</span>
                                    <span>Contacto</span>
                                    <span>Estado</span>
                                    <span className="text-right">Acciones</span>
                                </div>
                            )}

                            {/* ── Rows ── */}
                            {filteredInvitados.length === 0 ? (
                                <div className="p-8 text-center text-muted text-sm">
                                    No se encontraron invitados con "{searchQuery}"
                                </div>
                            ) : (
                                filteredInvitados.map((inv) => {
                                    const badge = estadoLabel(inv.rsvpEstado);
                                    const isCopied = copiedId === inv.idInvitado;

                                    if (isEvento) {
                                        // Rediseño columnas EVENTO
                                        const nameText = inv.nombreCompleto || `${inv.nombre || ''} ${inv.apellido || ''}`;
                                        return (
                                            <div
                                                key={inv.idInvitado}
                                                className="grid grid-cols-1 sm:grid-cols-[1.5fr_0.8fr_1.5fr_1.5fr_1fr_1fr_0.8fr_0.8fr_1fr] gap-2 sm:gap-4 items-center px-6 py-4 border-b border-card-border/30 last:border-b-0 hover:bg-background/50 transition-colors"
                                            >
                                                {/* Invitado */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                                                        {inv.nombre ? inv.nombre.charAt(0) : ''}{inv.apellido ? inv.apellido.charAt(0) : ''}
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground truncate">{nameText}</span>
                                                </div>

                                                {/* Rol */}
                                                <div className="text-xs text-muted">
                                                    {inv.esTitularGrupo ? 'Titular' : 'Acompañante'}
                                                </div>

                                                {/* Grupo */}
                                                <div className="text-xs text-foreground font-medium truncate">
                                                    {inv.grupoResumenTexto || '—'}
                                                </div>

                                                {/* Contacto */}
                                                <div className="flex flex-col gap-0.5 text-xs text-muted truncate">
                                                    {inv.email && <span className="truncate">{inv.email}</span>}
                                                    {inv.celular && <span>{inv.celular}</span>}
                                                    {!inv.email && !inv.celular && <span>—</span>}
                                                </div>

                                                {/* Acceso */}
                                                <div className="text-xs text-muted truncate">
                                                    {inv.accesoNombre || '—'}
                                                </div>

                                                {/* Estado RSVP */}
                                                <div>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.className}`}>
                                                        {badge.text}
                                                    </span>
                                                </div>

                                                {/* Mensaje con tooltip */}
                                                <div className="flex justify-center items-center gap-1">
                                                    {inv.esTitularGrupo && inv.rsvpMensajeGrupo ? (
                                                        <div className="relative group cursor-pointer p-1">
                                                            <Users className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
                                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-950 border border-card-border text-[10px] text-foreground rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 leading-normal">
                                                                Mensaje Grupo: "{inv.rsvpMensajeGrupo}"
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {inv.rsvpMensaje ? (
                                                        <div className="relative group cursor-pointer p-1">
                                                            <MessageSquare className="w-4 h-4 text-emerald-400 hover:text-emerald-300" />
                                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-950 border border-card-border text-[10px] text-foreground rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 leading-normal">
                                                                Mensaje Personal: "{inv.rsvpMensaje}"
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {!inv.rsvpMensaje && !(inv.esTitularGrupo && inv.rsvpMensajeGrupo) && (
                                                        <span className="text-muted text-xs">—</span>
                                                    )}
                                                </div>

                                                {/* Ingreso */}
                                                <div>
                                                    {inv.rsvpEstado === 'N' ? (
                                                        <span className="text-muted text-xs">—</span>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                                            inv.checkinRealizado ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                            {inv.checkinRealizado ? 'Ingresó' : 'Pendiente'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => copyInvitadoLink(inv)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isCopied
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-indigo-500/30'
                                                            }`}
                                                        title="Copiar link de RSVP"
                                                    >
                                                        {isCopied ? (
                                                            <><Check className="w-3 h-3" /> Copiado</>
                                                        ) : (
                                                            <><Copy className="w-3 h-3" /> Link</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Comportamiento original para PROGRAMAS
                                        return (
                                            <div
                                                key={inv.idInvitado}
                                                className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_auto] gap-2 sm:gap-4 items-center px-6 py-4 border-b border-card-border/30 last:border-b-0 hover:bg-background/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                                                        {inv.nombre ? inv.nombre.charAt(0) : ''}{inv.apellido ? inv.apellido.charAt(0) : ''}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{inv.nombre} {inv.apellido}</p>
                                                        <p className="text-[11px] text-muted sm:hidden mt-0.5">
                                                            {inv.email || inv.celular || '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="hidden sm:flex flex-col gap-0.5">
                                                    {inv.email && (
                                                        <span className="text-xs text-muted flex items-center gap-1.5">
                                                            <Mail className="w-3.5 h-3.5" /> {inv.email}
                                                        </span>
                                                    )}
                                                    {inv.celular && (
                                                        <span className="text-xs text-muted flex items-center gap-1.5">
                                                            <Phone className="w-3.5 h-3.5" /> {inv.celular}
                                                        </span>
                                                    )}
                                                    {!inv.email && !inv.celular && (
                                                        <span className="text-xs text-muted">—</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.className}`}>
                                                        {badge.text}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => copyInvitadoLink(inv)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isCopied
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-indigo-500/30'
                                                            }`}
                                                        title="Copiar link de invitación"
                                                    >
                                                        {isCopied ? (
                                                            <><Check className="w-3 h-3" /> Copiado</>
                                                        ) : (
                                                            <><Copy className="w-3 h-3" /> Link</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }
                                })
                            )}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'grupos' && isPrivateEvent && (
                <>
                    {/* ── Filters & Search ── */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                placeholder="Buscar por titular, resumen de grupo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                            />
                        </div>
                    </div>

                    {/* ── Grupos RSVP Table ── */}
                    {gruposLoading && grupos.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                            <p className="text-muted text-sm">Cargando grupos...</p>
                        </div>
                    ) : gruposError ? (
                        <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                            <p className="text-red-400 text-sm mb-4">{gruposError}</p>
                            <button onClick={fetchGrupos} className="text-sm text-indigo-400 hover:underline">Reintentar</button>
                        </div>
                    ) : grupos.length === 0 ? (
                        <div className="p-8 text-center text-muted text-sm bg-card-bg border border-card-border rounded-2xl">
                            No se encontraron grupos cargados.
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-card-bg border border-card-border overflow-hidden">
                            {/* Table Header */}
                            <div className="hidden sm:grid sm:grid-cols-[2fr_1.2fr_1.5fr_1fr_1fr_1fr_0.8fr_1fr] gap-4 px-6 py-3 border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest">
                                <span>Grupo</span>
                                <span>Titular</span>
                                <span>Contacto Titular</span>
                                <span>Invitados</span>
                                <span>Confirmados</span>
                                <span>Estado</span>
                                <span className="text-center">Mensaje</span>
                                <span className="text-right">Acciones</span>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-card-border/30">
                                {filteredGrupos.length === 0 ? (
                                    <div className="p-8 text-center text-muted text-sm">
                                        No se encontraron grupos con "{searchQuery}"
                                    </div>
                                ) : (
                                    filteredGrupos.map((grp) => {
                                        return (
                                            <div
                                                key={grp.idRsvpGrupo}
                                                className="grid grid-cols-1 sm:grid-cols-[2fr_1.2fr_1.5fr_1fr_1fr_1fr_0.8fr_1fr] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-background/50 transition-colors text-sm"
                                            >
                                                {/* Grupo */}
                                                <div className="font-semibold text-foreground truncate" title={grp.grupoResumenTexto}>
                                                    {grp.grupoResumenTexto}
                                                </div>

                                                {/* Titular */}
                                                <div className="text-xs text-muted truncate">
                                                    {grp.titular}
                                                </div>

                                                {/* Contacto Titular */}
                                                <div className="flex flex-col gap-0.5 text-xs text-muted truncate">
                                                    {grp.emailTitular && <span className="truncate">{grp.emailTitular}</span>}
                                                    {grp.celularTitular && <span>{grp.celularTitular}</span>}
                                                    {!grp.emailTitular && !grp.celularTitular && <span>—</span>}
                                                </div>

                                                {/* Invitados */}
                                                <div className="text-xs text-muted">
                                                    {grp.cantidadAdultosInvitadosGrupo} ad. / {grp.cantidadMenoresInvitadosGrupo} men.
                                                </div>

                                                {/* Confirmados */}
                                                <div className="text-xs text-muted">
                                                    {grp.cantidadAdultosConfirmadosGrupo} ad. / {grp.cantidadMenoresConfirmadosGrupo} men.
                                                </div>

                                                {/* Estado */}
                                                <div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                                                        grp.rsvpEstadoGrupo === 'CONFIRMADO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        grp.rsvpEstadoGrupo === 'PARCIAL' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {grp.rsvpEstadoGrupo}
                                                    </span>
                                                </div>

                                                {/* Mensaje con tooltip */}
                                                <div className="flex justify-center items-center">
                                                    {grp.rsvpMensajeGrupo ? (
                                                        <div className="relative group cursor-pointer p-1">
                                                            <MessageSquare className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
                                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-955 border border-card-border text-[10px] text-foreground rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 leading-normal">
                                                                Mensaje Grupo: "{grp.rsvpMensajeGrupo}"
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted text-xs">—</span>
                                                    )}
                                                </div>

                                                {/* Acciones */}
                                                <div className="text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedGroup(grp);
                                                            setIsGroupDetailOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg border border-card-border text-xs font-semibold hover:border-indigo-500/30 hover:text-indigo-400 transition-all bg-card-bg"
                                                    >
                                                        Ver detalle
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'ingreso' && isPrivateEvent && (
                <div className="p-8 rounded-2xl bg-card-bg border border-card-border animate-in fade-in duration-300">
                    <QrEntradaScreen idEvento={Number(id)} />
                </div>
            )}

            {/* ── Modal Invitación Personalizada ── */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-3xl bg-card-bg border border-card-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                        {!generatedLink ? (
                            <>
                                <div className="flex items-center justify-between p-6 border-b border-card-border/50">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Nueva Invitación</h3>
                                        <p className="text-xs text-muted mt-0.5">Generá un link único 1-a-1</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 mx-6 mt-4">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                    </div>
                                )}

                                <form onSubmit={handleCreateInvitation} className="p-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Nombre <span className="text-indigo-400">*</span></label>
                                            <input
                                                required
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Apellido <span className="text-indigo-400">*</span></label>
                                            <input
                                                required
                                                value={apellido}
                                                onChange={(e) => setApellido(e.target.value)}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Celular</label>
                                        <input
                                            type="tel"
                                            value={celular}
                                            onChange={(e) => setCelular(e.target.value)}
                                            placeholder="+54 9 11 1234-5678"
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Acceso <span className="text-indigo-400">*</span></label>
                                        <select
                                            required
                                            value={idAcceso}
                                            onChange={(e) => setIdAcceso(Number(e.target.value))}
                                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground appearance-none shadow-sm"
                                        >
                                            <option value="" disabled>Seleccionar acceso</option>
                                            {accesos.map((acc) => (
                                                <option key={acc.id_acceso} value={acc.id_acceso}>
                                                    {acc.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ── Grupo / Acompañantes ── */}
                                    <div className="pt-4 border-t border-card-border/30">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Grupo / Acompañantes</p>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Nombre del grupo <span className="text-muted/50">(opcional)</span></label>
                                            <input
                                                value={nombreGrupo}
                                                onChange={(e) => setNombreGrupo(e.target.value)}
                                                placeholder={`Ej: ${nombre || 'María'} + familia`}
                                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                            />
                                            <p className="text-[10px] text-muted/60 mt-1">Si lo dejás vacío se genera automáticamente.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Adultos extra</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={cantAdultosExtra}
                                                    onChange={(e) => setCantAdultosExtra(Math.max(0, Number(e.target.value)))}
                                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                                />
                                                <p className="text-[10px] text-muted/60 mt-1">Sin nombre por ahora</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Menores</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={cantMenores}
                                                    onChange={(e) => setCantMenores(Math.max(0, Number(e.target.value)))}
                                                    className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                                                />
                                                <p className="text-[10px] text-muted/60 mt-1">Sin nombre por ahora</p>
                                            </div>
                                        </div>
                                        {(cantAdultosExtra + cantMenores > 0) && (
                                            <div className="mt-3 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300">
                                                Total del grupo: <span className="font-bold">{1 + cantAdultosExtra + cantMenores}</span> persona{1 + cantAdultosExtra + cantMenores !== 1 ? 's' : ''}
                                                {' '}({1 + cantAdultosExtra} adulto{1 + cantAdultosExtra !== 1 ? 's' : ''}, {cantMenores} menor{cantMenores !== 1 ? 'es' : ''})
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-card-border/50">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isLoading}
                                            className="px-5 py-2.5 text-sm font-bold text-muted hover:text-foreground transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generando...</>
                                            ) : 'Generar Invitación'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="p-8 text-center space-y-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                                    <Check className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground">¡Invitación Creada!</h4>
                                    <p className="text-sm text-muted mt-2">
                                        Se generó un link único para <span className="text-foreground font-semibold">{nombre} {apellido}</span>.
                                    </p>
                                    <p className="text-xs text-muted mt-3 px-4">
                                        Podés copiar el link desde el botón <span className="text-indigo-400 font-semibold">Link</span> en la tabla de invitados.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-card-border/50">
                                    <button
                                        onClick={() => setGeneratedLink(null)}
                                        className="px-5 py-3 rounded-xl border border-card-border text-muted hover:text-foreground transition-colors text-sm font-bold"
                                    >
                                        Crear otra
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal de Detalle del Grupo RSVP ── */}
            {isGroupDetailOpen && selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-3xl rounded-3xl bg-card-bg border border-card-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-card-border/50">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{selectedGroup.grupoResumenTexto}</h3>
                                <p className="text-xs text-muted mt-1">
                                    Titular: <span className="text-foreground font-semibold">{selectedGroup.titular}</span> · Contacto: {selectedGroup.emailTitular || '—'} / {selectedGroup.celularTitular || '—'}
                                </p>
                            </div>
                            <button onClick={() => setIsGroupDetailOpen(false)} className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-muted uppercase tracking-widest">Estado RSVP del Grupo:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                                    selectedGroup.rsvpEstadoGrupo === 'CONFIRMADO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    selectedGroup.rsvpEstadoGrupo === 'PARCIAL' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {selectedGroup.rsvpEstadoGrupo}
                                </span>
                            </div>

                            {/* Resumen del Grupo Metrics Grid */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-muted uppercase tracking-widest">Resumen del Grupo</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Adultos Invitados</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.cantidadAdultosInvitadosGrupo}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Menores Invitados</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.cantidadMenoresInvitadosGrupo}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Adultos Confirmados</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.cantidadAdultosConfirmadosGrupo}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Menores Confirmados</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.cantidadMenoresConfirmadosGrupo}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Personas Cargadas</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.cantidadIntegrantes}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Confirmados</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.confirmados}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Pendientes</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.pendientes}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-card-border">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">No Asisten</p>
                                        <p className="text-lg font-bold text-foreground mt-1">{selectedGroup.rechazados}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Group Message Box */}
                            {selectedGroup.rsvpMensajeGrupo && (
                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" /> Mensaje del Grupo
                                    </h4>
                                    <p className="text-sm text-indigo-300/90 leading-relaxed italic">
                                        "{selectedGroup.rsvpMensajeGrupo}"
                                    </p>
                                </div>
                            )}

                            {/* Integrantes Table */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-muted uppercase tracking-widest">Integrantes</h4>
                                <div className="rounded-xl border border-card-border overflow-hidden bg-background">
                                    {/* Table Header */}
                                    <div className="hidden sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_1fr] gap-4 px-4 py-2.5 border-b border-card-border bg-white/5 text-[10px] font-bold text-muted uppercase tracking-widest">
                                        <span>Integrante</span>
                                        <span>Rol Grupo</span>
                                        <span>Tipo</span>
                                        <span>RSVP</span>
                                        <span>Mensaje</span>
                                        <span className="text-right">Ingreso</span>
                                    </div>

                                    {/* Table Rows */}
                                    <div className="divide-y divide-card-border/30">
                                        {selectedGroup.integrantes?.map((member: any) => {
                                            return (
                                                <div key={member.idInvitado} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_1fr] gap-2 sm:gap-4 items-center px-4 py-3 text-sm">
                                                    {/* Name */}
                                                    <div className="font-semibold text-foreground">{member.nombreCompleto}</div>

                                                    {/* Rol Grupo */}
                                                    <div className="text-xs text-muted">
                                                        {member.esTitularGrupo ? 'Titular' : 'Acompañante'}
                                                    </div>

                                                    {/* Tipo */}
                                                    <div className="text-xs text-muted">
                                                        {member.rolEvento === 'A' ? 'Adulto' : 'Menor'}
                                                    </div>

                                                    {/* RSVP Status */}
                                                    <div>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                            member.rsvpEstado === 'Y' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            member.rsvpEstado === 'P' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            {member.rsvpEstado === 'Y' ? 'Confirmado' :
                                                             member.rsvpEstado === 'P' ? 'Pendiente' : 'No asiste'}
                                                        </span>
                                                    </div>

                                                    {/* Message */}
                                                    <div className="text-xs text-muted italic truncate" title={member.rsvpMensaje || ''}>
                                                        {member.rsvpMensaje ? `"${member.rsvpMensaje}"` : '—'}
                                                    </div>

                                                    {/* Check-in */}
                                                    <div className="text-right">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                            member.checkinRealizado ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                            {member.checkinRealizado ? 'Ingresó' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-card-border/50 flex justify-end">
                            <button
                                onClick={() => setIsGroupDetailOpen(false)}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
