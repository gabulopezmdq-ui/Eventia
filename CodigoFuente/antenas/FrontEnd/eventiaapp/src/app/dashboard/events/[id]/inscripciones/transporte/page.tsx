'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Bus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getTransporteDia } from '@/src/features/programas/programas.service';
import type { TransporteDiaResponse, TransporteServicioCodigo } from '@/src/features/programas/types';
import TransporteSummaryCards from './components/TransporteSummaryCards';
import TransporteGrid from './components/TransporteGrid';

const OPCIONES_SERVICIO: { label: string; value: TransporteServicioCodigo }[] = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Acogida', value: 'ACOGIDA' },
    { label: 'Transporte', value: 'TRANSPORTE' },
];

export default function TransporteDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);

    // ── State ──
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
        () => new Date().toISOString().split('T')[0]
    );
    const [servicioCodigo, setServicioCodigo] = useState<TransporteServicioCodigo>('TODOS');
    const [datosTransporte, setDatosTransporte] = useState<TransporteDiaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Fetch ──
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransporteDia(idEvento, fechaSeleccionada, servicioCodigo);
            setDatosTransporte(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos de transporte');
        } finally {
            setLoading(false);
        }
    }, [idEvento, fechaSeleccionada, servicioCodigo]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-blue-500">Transporte</span>
            </nav>

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Bus className="w-8 h-8 text-blue-500" />
                        Logística de Transporte
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        {datosTransporte?.programa
                            ? <>Programa: <span className="font-semibold text-foreground/80">{datosTransporte.programa}</span></>
                            : 'Listado operativo diario de participantes con servicio de transporte.'}
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date picker */}
                    <input
                        type="date"
                        value={fechaSeleccionada}
                        onChange={(e) => setFechaSeleccionada(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold outline-none text-foreground"
                    />

                    {/* Selector de servicio */}
                    <select
                        value={servicioCodigo}
                        onChange={(e) => setServicioCodigo(e.target.value as TransporteServicioCodigo)}
                        className="px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold outline-none text-foreground"
                    >
                        {OPCIONES_SERVICIO.map((op) => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                    </select>

                    {/* Refresh */}
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Export PDF (placeholder) */}
                    <button
                        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                        onClick={() => alert('Próximamente: Exportación PDF Logística')}
                    >
                        Descargar PDF Logística
                    </button>
                </div>
            </header>

            {/* ── Summary Cards ── */}
            {datosTransporte && <TransporteSummaryCards resumen={datosTransporte.resumen} />}

            {/* ── Lista / Empty / Error ── */}
            {loading && !datosTransporte ? (
                <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-muted text-sm">Cargando listado de transporte...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={fetchData} className="text-sm text-blue-500 hover:underline">Reintentar</button>
                </div>
            ) : datosTransporte && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <TransporteGrid participantes={datosTransporte.items || []} />
                </div>
            )}
        </div>
    );
}
