'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { LogOut, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getRetirosDia } from '@/src/features/programas/programas.service';
import type { RetirosDiaResponse, ValidarQRResponse } from '@/src/features/programas/types';
import RetirosSummaryCard from './components/RetirosSummaryCard';
import RetirosGrid from './components/RetirosGrid';
import ValidarQRPanel from './components/ValidarQRPanel';
import RegistrarRetiroDrawer from './components/RegistrarRetiroDrawer';

export default function RetirosDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);

    // ── State ──
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [datosRetiros, setDatosRetiros] = useState<RetirosDiaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Drawer State ──
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [qrResult, setQrResult] = useState<ValidarQRResponse | null>(null);

    // ── Fetch Data ──
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRetirosDia(idEvento, fechaSeleccionada);
            setDatosRetiros(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los retiros del día');
        } finally {
            setLoading(false);
        }
    }, [idEvento, fechaSeleccionada]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handlers ──
    const handleQRValidado = (resultado: ValidarQRResponse) => {
        setQrResult(resultado);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setTimeout(() => setQrResult(null), 300);
    };

    const handleRetiroRegistrado = () => {
        fetchData();
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-emerald-500">Retiros QR</span>
            </nav>

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <LogOut className="w-8 h-8 text-emerald-500" />
                        Panel de Retiros
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Control de retiros de participantes autorizados mediante código QR.
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
                </div>
            </header>

            {/* ── Panel Validar QR ── */}
            <ValidarQRPanel 
                idEvento={idEvento} 
                fechaOperativa={fechaSeleccionada} 
                onValidado={handleQRValidado} 
            />

            {/* ── Resumen Cards ── */}
            {datosRetiros && <RetirosSummaryCard totalRetiros={datosRetiros.totalRetiros} />}

            {/* ── List / Empty State ── */}
            {loading && !datosRetiros ? (
                <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-muted text-sm">Cargando retiros...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={fetchData} className="text-sm text-emerald-500 hover:underline">Reintentar</button>
                </div>
            ) : datosRetiros && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <RetirosGrid items={datosRetiros.items || []} />
                </div>
            )}

            {/* ── Drawer Registrar Retiro ── */}
            <RegistrarRetiroDrawer
                isOpen={drawerOpen}
                onClose={handleCloseDrawer}
                idEvento={idEvento}
                qrResult={qrResult}
                fechaOperativa={fechaSeleccionada}
                onRetiroRegistrado={handleRetiroRegistrado}
            />
        </div>
    );
}
