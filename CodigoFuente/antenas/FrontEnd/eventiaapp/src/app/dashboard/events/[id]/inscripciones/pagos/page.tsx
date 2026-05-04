'use client';

import { useState, useEffect, useCallback, use, useMemo } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Search, Filter, AlertCircle, RefreshCw, Loader2,
    DollarSign, Eye, PlusCircle, CheckCircle2, CircleDashed, Clock
} from 'lucide-react';
import { getPagosInscripciones } from '@/src/features/inscripcion/pagos.service';
import type { InscripcionPagoResumen, EstadoPago } from '@/src/features/inscripcion/types/pagos.types';
// We will create these components in the next steps
import ModalDetallePago from './components/ModalDetallePago';
import ModalRegistrarPago from './components/ModalRegistrarPago';

export default function PagosInscripcionesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);

    // ── State ──
    const [inscripciones, setInscripciones] = useState<InscripcionPagoResumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Filters ──
    const [searchQuery, setSearchQuery] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<EstadoPago | 'TODOS'>('TODOS');

    // ── Modals State ──
    const [selectedInscripcionDetalle, setSelectedInscripcionDetalle] = useState<number | null>(null);
    const [selectedInscripcionPago, setSelectedInscripcionPago] = useState<{ id: number, saldo: number } | null>(null);

    // ── Fetch Data ──
    const fetchPagos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPagosInscripciones(idEvento);
            setInscripciones(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los pagos');
        } finally {
            setLoading(false);
        }
    }, [idEvento]);

    useEffect(() => {
        fetchPagos();
    }, [fetchPagos]);

    // ── Derived Data / Filtering ──
    const filteredInscripciones = useMemo(() => {
        return inscripciones.filter((inv) => {
            // Filter by search
            const matchSearch = !searchQuery.trim() || 
                inv.responsable.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.participantes.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
            
            // Filter by estado
            const matchEstado = estadoFilter === 'TODOS' || inv.estadoPago === estadoFilter;

            return matchSearch && matchEstado;
        });
    }, [inscripciones, searchQuery, estadoFilter]);

    // ── Stats ──
    const totalMontoRecaudado = inscripciones.reduce((acc, curr) => acc + curr.totalPagado, 0);
    const totalSaldoPendiente = inscripciones.reduce((acc, curr) => acc + curr.saldo, 0);

    // ── Helpers ──
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency || 'ARS',
        }).format(amount);
    };

    const getEstadoBadge = (estado: EstadoPago) => {
        switch (estado) {
            case 'PAGADO':
                return { text: 'Pagado', icon: <CheckCircle2 className="w-3 h-3" />, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
            case 'PARCIAL':
                return { text: 'Parcial', icon: <CircleDashed className="w-3 h-3" />, className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
            case 'PENDIENTE':
                return { text: 'Pendiente', icon: <Clock className="w-3 h-3" />, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
            case 'SIN_CARGO':
            default:
                return { text: 'Sin Cargo', icon: <CheckCircle2 className="w-3 h-3" />, className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
        }
    };

    const formatAjustes = (descuentos: number, recargos: number, moneda: string) => {
        const neto = recargos - descuentos;
        if (neto === 0) return <span className="text-muted">—</span>;
        
        const isNegative = neto < 0;
        return (
            <span className={`font-semibold ${isNegative ? 'text-red-400' : 'text-amber-400'}`}>
                {isNegative ? '' : '+'}{formatCurrency(neto, moneda)}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Breadcrumbs ── */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-indigo-400">Pagos de Inscripciones</span>
            </nav>

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Estado de Pagos</h1>
                    <p className="text-muted text-sm mt-1">
                        Controlá la deuda, registrá pagos y aplicá ajustes a las inscripciones.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-card-bg border border-card-border flex items-center gap-3">
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Recaudado</p>
                            <p className="text-emerald-400 font-bold text-sm">{formatCurrency(totalMontoRecaudado, 'ARS')}</p>
                        </div>
                        <div className="w-px h-8 bg-card-border"></div>
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">A Cobrar</p>
                            <p className="text-amber-400 font-bold text-sm">{formatCurrency(totalSaldoPendiente, 'ARS')}</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchPagos}
                        disabled={loading}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* ── Filters & Search ── */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por responsable o participante..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                    />
                </div>
                <div className="relative">
                    <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <select
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value as any)}
                        className="pl-11 pr-8 py-3 rounded-xl bg-card-bg border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold outline-none text-foreground appearance-none"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PARCIAL">Parcial</option>
                        <option value="PAGADO">Pagado</option>
                        <option value="SIN_CARGO">Sin Cargo</option>
                    </select>
                </div>
            </div>

            {/* ── List / Empty State ── */}
            {loading && inscripciones.length === 0 ? (
                <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                    <p className="text-muted text-sm">Cargando estado de pagos...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={fetchPagos} className="text-sm text-indigo-400 hover:underline">Reintentar</button>
                </div>
            ) : inscripciones.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-2xl bg-card-bg border border-card-border text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                        <DollarSign className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Aún no hay inscripciones</h3>
                    <p className="text-muted max-w-sm text-sm mb-6">
                        Cuando los usuarios se inscriban, aparecerán aquí para que puedas gestionar sus pagos.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl bg-card-bg border border-card-border overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-card-border/50 text-[10px] font-bold text-muted uppercase tracking-widest bg-background/50">
                                <th className="px-6 py-4 font-bold">Responsable</th>
                                <th className="px-6 py-4 font-bold">Participantes</th>
                                <th className="px-6 py-4 font-bold text-right">Total Orig.</th>
                                <th className="px-6 py-4 font-bold text-right">Ajustes</th>
                                <th className="px-6 py-4 font-bold text-right">A Pagar</th>
                                <th className="px-6 py-4 font-bold text-right">Pagado</th>
                                <th className="px-6 py-4 font-bold text-right">Saldo</th>
                                <th className="px-6 py-4 font-bold text-center">Estado</th>
                                <th className="px-6 py-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInscripciones.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted text-sm">
                                        No se encontraron resultados para los filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                filteredInscripciones.map((inv) => {
                                    const badge = getEstadoBadge(inv.estadoPago);
                                    return (
                                        <tr key={inv.idInscripcion} className="border-b border-card-border/30 last:border-b-0 hover:bg-background/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">{inv.responsable}</span>
                                                    <span className="text-[11px] text-muted">{inv.email || inv.telefono || 'Sin contacto'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    {inv.participantes.map((p, idx) => (
                                                        <span key={idx} className="text-xs text-foreground/80">• {p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-muted">
                                                {formatCurrency(inv.totalOriginal, inv.moneda)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                {formatAjustes(inv.totalDescuentos, inv.totalRecargos, inv.moneda)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                                                {formatCurrency(inv.totalAPagar, inv.moneda)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-emerald-400">
                                                {formatCurrency(inv.totalPagado, inv.moneda)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-amber-400">
                                                {formatCurrency(inv.saldo, inv.moneda)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${badge.className}`}>
                                                    {badge.icon}
                                                    {badge.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedInscripcionDetalle(inv.idInscripcion)}
                                                        className="p-2 rounded-lg bg-card-bg border border-card-border text-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedInscripcionPago({ id: inv.idInscripcion, saldo: inv.saldo })}
                                                        disabled={inv.saldo <= 0}
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-500"
                                                        title={inv.saldo <= 0 ? 'No hay saldo pendiente' : 'Registrar Pago'}
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                        Pago
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modales */}
            {selectedInscripcionDetalle !== null && (
                <ModalDetallePago 
                    idInscripcion={selectedInscripcionDetalle} 
                    onClose={() => setSelectedInscripcionDetalle(null)} 
                    onChanged={fetchPagos} 
                />
            )}

            {selectedInscripcionPago !== null && (
                <ModalRegistrarPago 
                    idInscripcion={selectedInscripcionPago.id} 
                    saldoPendiente={selectedInscripcionPago.saldo}
                    onClose={() => setSelectedInscripcionPago(null)} 
                    onSuccess={fetchPagos}
                />
            )}

        </div>
    );
}
