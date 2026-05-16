'use client';

import { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, Info, Users, Link as LinkIcon, QrCode, Ticket } from 'lucide-react';
import { getEventById, getAdminEventById } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';
import { useSearchParams } from 'next/navigation';

import CampanasTab from '@/src/components/captacion/CampanasTab';
import PersonasRegistradasTab from '@/src/components/captacion/PersonasRegistradasTab';
import QrEntradaScreen from '@/src/components/captacion/QrEntradaScreen';
import QrBeneficioScreen from '@/src/components/captacion/QrBeneficioScreen';

type TabId = 'campanas' | 'registradas' | 'qr_entrada' | 'qr_beneficio';

function AudienciasContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const scope = searchParams.get('scope');
    const isAdmin = scope === 'admin';
    const idEvento = Number(id);

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('campanas');

    useEffect(() => {
        async function loadData() {
            try {
                const request = isAdmin ? getAdminEventById(id) : getEventById(id);
                const eventData = await request;
                setEvent(eventData);
            } catch (err) {
                setError('No se pudo cargar el evento');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, isAdmin]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-muted text-sm font-medium">Cargando módulo de audiencias...</p>
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
                    <p className="text-muted">{error || 'No pudimos encontrar el evento.'}</p>
                </div>
                <Link href="/dashboard/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card-bg border border-card-border hover:text-indigo-400 transition-all font-medium">
                    <ChevronLeft className="w-4 h-4" />
                    Volver a mis eventos
                </Link>
            </div>
        );
    }

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'campanas', label: 'Campañas Públicas', icon: LinkIcon },
        { id: 'registradas', label: 'Personas Registradas', icon: Users },
        { id: 'qr_entrada', label: 'Control de Ingreso', icon: QrCode },
        { id: 'qr_beneficio', label: 'Canje de Beneficios', icon: Ticket },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}${scope ? `?scope=${scope}` : ''}`} className="hover:text-foreground transition-colors">Detalle</Link>
                <span>/</span>
                <span className="text-indigo-400">Audiencias</span>
            </nav>

            {/* ── Header ── */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    Captación y Audiencias
                </h1>
                <p className="text-muted">Gestioná campañas públicas de registro, asistencia y beneficios para {event.anfitriones_texto}.</p>
            </header>

            {/* ── Tabs Navigation ── */}
            <div className="flex space-x-1 p-1 bg-card-bg/50 rounded-2xl border border-card-border overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-muted hover:text-foreground hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            <div className="min-h-[500px]">
                {activeTab === 'campanas' && <CampanasTab idEvento={idEvento} limites={event.limites} />}
                {activeTab === 'registradas' && <PersonasRegistradasTab idEvento={idEvento} />}
                {activeTab === 'qr_entrada' && <QrEntradaScreen idEvento={idEvento} />}
                {activeTab === 'qr_beneficio' && <QrBeneficioScreen idEvento={idEvento} />}
            </div>
        </div>
    );
}

export default function AudienciasPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        }>
            <AudienciasContent params={params} />
        </Suspense>
    );
}
