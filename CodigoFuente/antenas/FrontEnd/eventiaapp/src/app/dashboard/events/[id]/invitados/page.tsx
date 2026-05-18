'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Plus, Users, Search, Filter,
    MoreVertical, Mail, Phone, X, Check, Copy, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';
import { crearGrupoManual, cargarInvitacion, listarInvitados, InvitadoListado } from '@/src/features/invitations/invitation.service';
import { getEstructuraEvento, getEventById } from '@/src/features/events/event.service';
import { AccesoEvento, LimitesEvento } from '@/src/features/events/types';
import { usePlanLimit } from '@/src/context/PlanLimitContext';
import { LockIcon } from '@/src/components/ui/LockIcon';

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
    const [invitados, setInvitados] = useState<InvitadoListado[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // ── Plan limits ──
    const { handlePlanLimitError, openUpsell } = usePlanLimit();
    const [limites, setLimites] = useState<LimitesEvento | null>(null);

    // ── Fetch guest list ──
    const fetchInvitados = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        try {
            const data = await listarInvitados(Number(id));
            setInvitados(data);
        } catch (err) {
            setListError(err instanceof Error ? err.message : 'Error al cargar invitados');
        } finally {
            setListLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInvitados();
    }, [fetchInvitados]);

    // ── Fetch event structure (accesos) & limits ──
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [structure, eventoData] = await Promise.all([
                    getEstructuraEvento(Number(id)),
                    getEventById(String(id)).catch(() => null)
                ]);

                if (eventoData?.limites) {
                    setLimites(eventoData.limites);
                }

                setAccesos(structure.accesos || []);
                // Set default access if available
                if (structure.id_acceso_default) {
                    setIdAcceso(structure.id_acceso_default);
                    setDefaultAccesoId(structure.id_acceso_default);
                } else if (structure.accesos && structure.accesos.length > 0) {
                    setIdAcceso(structure.accesos[0].id_acceso);
                    setDefaultAccesoId(structure.accesos[0].id_acceso);
                }
            } catch (err) {
                console.error("Error fetching event data:", err);
            }
        };
        fetchData();
    }, [id]);

    // ── Derived / filtered list ──
    const filteredInvitados = invitados.filter((inv) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            inv.nombre.toLowerCase().includes(q) ||
            inv.apellido.toLowerCase().includes(q) ||
            (inv.email && inv.email.toLowerCase().includes(q)) ||
            (inv.celular && inv.celular.toLowerCase().includes(q))
        );
    });

    // ── Stats ──
    const totalInvitados = invitados.length;
    const confirmados = invitados.filter(i => i.rsvpEstado === 'Y').length;
    const pendientes = invitados.filter(i => i.rsvpEstado === 'P').length;
    const rechazados = invitados.filter(i => i.rsvpEstado === 'R').length;

    const handleCreateInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Build the grupo name automatically if not provided
            const grupoName = nombreGrupo.trim()
                || (cantAdultosExtra + cantMenores > 0
                    ? `${nombre} + ${cantAdultosExtra + cantMenores}`
                    : `${nombre} ${apellido}`);

            // 1 titular (adulto) + extra adults + children
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

            // Refresh guest list to show the new group
            await fetchInvitados();
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

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert("¡Link copiado al portapapeles!");
        }
    };

    const copyInvitadoLink = (inv: InvitadoListado) => {
        let link = `${window.location.origin}/rsvp/${inv.rsvpToken}`;
        if (inv.idAcceso) {
            link += `?idAcceso=${inv.idAcceso}`;
        }
        navigator.clipboard.writeText(link);
        setCopiedId(inv.idInvitado);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const estadoLabel = (estado: string) => {
        switch (estado) {
            case 'Y': return { text: 'Confirmado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
            case 'R': return { text: 'Rechazado', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
            default: return { text: 'Pendiente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        }
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
        // Re-set default access on close if possible or just reset
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
                        {totalInvitados > 0
                            ? `${totalInvitados} invitado${totalInvitados !== 1 ? 's' : ''} · ${confirmados} confirmado${confirmados !== 1 ? 's' : ''} · ${pendientes} pendiente${pendientes !== 1 ? 's' : ''} · ${rechazados} rechazado${rechazados !== 1 ? 's' : ''}`
                            : 'Controlá la lista de asistentes, estados de confirmación y generá nuevas invitaciones.'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchInvitados}
                        disabled={listLoading}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${listLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {limites?.permitirGenerarLinks === false ? (
                        <button
                            onClick={() => openUpsell('Tu plan no permite generar invitaciones personalizadas ni links de registro. Mejorá tu plan para acceder a esta función.')}
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

            {/* ── Filters & Search ── */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, email..."
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
                        Empezá a generar invitaciones personalizadas o utilizá los links masivos para que la gente comience a registrarse.
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
                    <div className="hidden sm:grid sm:grid-cols-[2fr_1.5fr_1fr_auto] gap-4 px-6 py-3 border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest">
                        <span>Invitado</span>
                        <span>Contacto</span>
                        <span>Estado</span>
                        <span className="text-right">Acciones</span>
                    </div>

                    {/* ── Rows ── */}
                    {filteredInvitados.length === 0 ? (
                        <div className="p-8 text-center text-muted text-sm">
                            No se encontraron invitados con "{searchQuery}"
                        </div>
                    ) : (
                        filteredInvitados.map((inv) => {
                            const badge = estadoLabel(inv.rsvpEstado);
                            const isCopied = copiedId === inv.idInvitado;
                            return (
                                <div
                                    key={inv.idInvitado}
                                    className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_auto] gap-2 sm:gap-4 items-center px-6 py-4 border-b border-card-border/30 last:border-b-0 hover:bg-background/50 transition-colors"
                                >
                                    {/* Name */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                                            {inv.nombre.charAt(0)}{inv.apellido.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{inv.nombre} {inv.apellido}</p>
                                            <p className="text-[11px] text-muted sm:hidden mt-0.5">
                                                {inv.email || inv.celular || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact – hidden on mobile (shown inline above) */}
                                    <div className="hidden sm:flex flex-col gap-0.5">
                                        {inv.email && (
                                            <span className="text-xs text-muted flex items-center gap-1.5">
                                                <Mail className="w-3 h-3" /> {inv.email}
                                            </span>
                                        )}
                                        {inv.celular && (
                                            <span className="text-xs text-muted flex items-center gap-1.5">
                                                <Phone className="w-3 h-3" /> {inv.celular}
                                            </span>
                                        )}
                                        {!inv.email && !inv.celular && (
                                            <span className="text-xs text-muted">—</span>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.className}`}>
                                            {inv.rsvpEstado === 'Y' && <Check className="w-3 h-3" />}
                                            {inv.rsvpEstado === 'R' && <X className="w-3 h-3" />}
                                            {badge.text}
                                        </span>
                                    </div>

                                    {/* Actions */}
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
                        })
                    )}
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
        </div>
    );
}
