'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Plus, Users, Search, Filter,
    MoreVertical, Mail, MessageCircle, X, Check, Copy, AlertCircle
} from 'lucide-react';
import { cargarInvitacion } from '@/src/features/invitations/invitation.service';

export default function InvitadosPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Form state for new invitation
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');

    // Status state
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await cargarInvitacion({
                idEvento: Number(id),
                invitados: [{
                    nombre,
                    apellido,
                    email: email || undefined,
                    celular: celular || undefined
                }]
            });

            // Assume the response returns an array and we take the first item
            if (response && response.length > 0) {
                const baseUrl = window.location.origin;
                setGeneratedLink(`${baseUrl}/rsvp/${response[0].rsvp_token}`);
            } else {
                throw new Error("El backend no devolvió el token de la invitación");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al generar la invitación');
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

    const closeModal = () => {
        setIsInviteModalOpen(false);
        setGeneratedLink(null);
        setError(null);
        setNombre('');
        setApellido('');
        setEmail('');
        setCelular('');
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
                        Controlá la lista de asistentes, estados de confirmación y generá nuevas invitaciones.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Invitación Personalizada
                    </button>
                </div>
            </header>

            {/* ── Filters & Search ── */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, email..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                    />
                </div>
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card-bg border border-card-border text-foreground hover:bg-background transition-colors text-sm font-semibold whitespace-nowrap">
                    <Filter className="w-4 h-4 text-muted" /> Filtrar
                </button>
            </div>

            {/* ── Invitados List / Empty State ── */}
            <div className="p-8 sm:p-12 rounded-2xl bg-card-bg border border-card-border text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Aún no hay invitados</h3>
                <p className="text-muted max-w-sm text-sm mb-6">
                    Empezá a generar invitaciones personalizadas o utilizá los links masivos para que la gente comience a registrarse.
                </p>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 text-sm font-bold hover:bg-indigo-500/10 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Crear primera invitación
                </button>
            </div>

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
                                </div>

                                <div className="p-4 rounded-xl bg-background border border-card-border relative group">
                                    <p className="text-xs font-mono text-muted break-all pr-10 text-left">
                                        {generatedLink}
                                    </p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-card-bg border border-card-border text-foreground hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all"
                                        title="Copiar link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
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
