'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ChefHat, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getCocinaDia } from '@/src/features/inscripcion/cocina.service';
import type { CocinaDiaResponse } from '@/src/features/inscripcion/types/cocina.types';
import CocinaSummaryCards from './components/CocinaSummaryCards';
import CocinaRestrictionChips from './components/CocinaRestrictionChips';
import CocinaGrid from './components/CocinaGrid';
import DetalleCocinaDrawer from './components/DetalleCocinaDrawer';

export default function CocinaDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);

    // ── State ──
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [datosCocina, setDatosCocina] = useState<CocinaDiaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Drawer State ──
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [idInvitadoSeleccionado, setIdInvitadoSeleccionado] = useState<number | null>(null);

    // ── Fetch Data ──
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCocinaDia(idEvento, fechaSeleccionada);
            setDatosCocina(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos de cocina');
        } finally {
            setLoading(false);
        }
    }, [idEvento, fechaSeleccionada]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handlers ──
    const handleVerDetalle = (idInvitado: number) => {
        setIdInvitadoSeleccionado(idInvitado);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        // Limpiamos el id seleccionado con un pequeño delay para
        // no perder la data durante la animación de cierre del drawer
        setTimeout(() => setIdInvitadoSeleccionado(null), 300);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-emerald-500">Organización Comedor</span>
            </nav>

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-emerald-500" />
                        Panel de Organización Comida
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        {datosCocina?.programa
                            ? <>Programa: <span className="font-semibold text-foreground/80">{datosCocina.programa}</span></>
                            : 'Control de asistencia y restricciones alimentarias del día.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <input
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => setFechaSeleccionada(e.target.value)}
                            className="px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-semibold outline-none text-foreground"
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                        onClick={() => alert('Próximamente: Exportación PDF')}
                    >
                        Descargar PDF Cocina
                    </button>
                </div>
            </header>

            {/* ── Resumen Cards ── */}
            {datosCocina && <CocinaSummaryCards resumen={datosCocina.resumen} />}

            {/* ── Chips de Restricciones ── */}
            {datosCocina && datosCocina.totalesPorRestriccion && datosCocina.totalesPorRestriccion.length > 0 && (
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 space-y-3">
                    <h3 className="text-xs font-black text-muted uppercase tracking-widest">Restricciones del día</h3>
                    <CocinaRestrictionChips restricciones={datosCocina.totalesPorRestriccion} />
                </div>
            )}

            {/* ── List / Empty State ── */}
            {loading && !datosCocina ? (
                <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-muted text-sm">Cargando organización de comida...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={fetchData} className="text-sm text-emerald-500 hover:underline">Reintentar</button>
                </div>
            ) : datosCocina && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <CocinaGrid
                        participantes={datosCocina.items || []}
                        onVerDetalle={handleVerDetalle}
                    />
                </div>
            )}

            {/* ── Drawer Detalle Participante ── */}
            <DetalleCocinaDrawer
                isOpen={drawerOpen}
                onClose={handleCloseDrawer}
                idEvento={idEvento}
                idInvitado={idInvitadoSeleccionado}
                fecha={fechaSeleccionada}
            />
        </div>
    );
}
