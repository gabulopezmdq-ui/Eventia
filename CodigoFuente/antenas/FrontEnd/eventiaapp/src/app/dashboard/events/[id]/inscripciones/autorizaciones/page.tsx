'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

import { getInscriptosList } from '@/src/features/inscripcion/panel-inscriptos.service';
import type { InscriptoFila } from '@/src/features/inscripcion/types/panel-inscriptos.types';
import { getAutorizacionesInscripcion } from '@/src/features/programas/programas.service';
import type { AutorizacionesInscripcionResponse } from '@/src/features/programas/types';

import InscriptosGrid from './components/InscriptosGrid';
import AutorizacionesDrawer from './components/AutorizacionesDrawer';

export default function AutorizacionesDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);

    // ── State ──
    const [inscriptos, setInscriptos] = useState<InscriptoFila[]>([]);
    const [loadingLista, setLoadingLista] = useState(true);
    const [errorLista, setErrorLista] = useState<string | null>(null);

    // ── Drawer State ──
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [autorizacionesData, setAutorizacionesData] = useState<AutorizacionesInscripcionResponse | null>(null);
    const [loadingAutorizaciones, setLoadingAutorizaciones] = useState(false);
    const [errorAutorizaciones, setErrorAutorizaciones] = useState<string | null>(null);

    // ── Fetch Inscriptos ──
    const fetchInscriptos = useCallback(async () => {
        setLoadingLista(true);
        setErrorLista(null);
        try {
            // Se traen todos los inscriptos sin filtros
            const data = await getInscriptosList(idEvento, {});
            setInscriptos(data);
        } catch (err) {
            setErrorLista('Error al cargar la lista de inscriptos');
        } finally {
            setLoadingLista(false);
        }
    }, [idEvento]);

    useEffect(() => {
        fetchInscriptos();
    }, [fetchInscriptos]);

    // ── Handlers ──
    const handleVerAutorizaciones = async (idInscripcion: number) => {
        setDrawerOpen(true);
        setLoadingAutorizaciones(true);
        setAutorizacionesData(null);
        setErrorAutorizaciones(null);
        
        try {
            const data = await getAutorizacionesInscripcion(idInscripcion, idEvento);
            setAutorizacionesData(data);
        } catch (error) {
            console.error('Error fetching autorizaciones', error);
            setErrorAutorizaciones(error instanceof Error ? error.message : 'Error al cargar las autorizaciones');
        } finally {
            setLoadingAutorizaciones(false);
        }
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        // Small delay to allow animation to finish before clearing data
        setTimeout(() => {
            setAutorizacionesData(null);
            setErrorAutorizaciones(null);
        }, 300);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-violet-500">Autorizaciones</span>
            </nav>

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-violet-500" />
                        Autorizaciones Legales
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Control de firmas y aceptaciones de autorizaciones de todos los participantes.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchInscriptos}
                        disabled={loadingLista}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${loadingLista ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* ── List / Empty State ── */}
            {loadingLista && inscriptos.length === 0 ? (
                <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
                    <p className="text-muted text-sm">Cargando inscriptos...</p>
                </div>
            ) : errorLista ? (
                <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-red-400 text-sm mb-4">{errorLista}</p>
                    <button onClick={fetchInscriptos} className="text-sm text-violet-500 hover:underline">Reintentar</button>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <InscriptosGrid 
                        inscriptos={inscriptos} 
                        onVerAutorizaciones={handleVerAutorizaciones} 
                    />
                </div>
            )}

            {/* ── Drawer de Autorizaciones ── */}
            <AutorizacionesDrawer
                isOpen={drawerOpen}
                onClose={handleCloseDrawer}
                data={autorizacionesData}
                loading={loadingAutorizaciones}
                error={errorAutorizaciones}
            />
        </div>
    );
}
