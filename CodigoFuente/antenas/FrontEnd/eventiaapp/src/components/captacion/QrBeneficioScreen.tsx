'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket, CheckCircle2, XCircle, AlertTriangle, Users, RefreshCw, Loader2 } from 'lucide-react';
import {
    resolverQrBeneficio,
    canjearBeneficio,
    getPendientesManualBeneficio,
} from '@/src/features/captacion/captacion.service';
import type { QrBeneficioResult, PendienteManualBeneficio } from '@/src/features/captacion/types';

type TabId = 'qr' | 'manual';

export default function QrBeneficioScreen({ idEvento }: { idEvento: number }) {
    const [activeTab, setActiveTab] = useState<TabId>('qr');

    // ── Tab 1: Canjear por QR ──────────────────────────────────────────
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<QrBeneficioResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [observaciones, setObservaciones] = useState('');

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const data = await resolverQrBeneficio(idEvento, token);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'QR de beneficio no válido');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCanje = async () => {
        if (!result || !result.id_beneficio_registro) return;
        try {
            setLoading(true);
            await canjearBeneficio(result.id_beneficio_registro, observaciones || undefined);
            alert('¡Beneficio canjeado exitosamente!');
            setResult(null);
            setToken('');
            setObservaciones('');
        } catch (err) {
            alert('Error al canjear el beneficio');
        } finally {
            setLoading(false);
        }
    };

    // ── Tab 2: Beneficios Pendientes Manual ────────────────────────────
    const [pendientes, setPendientes] = useState<PendienteManualBeneficio[]>([]);
    const [pendientesLoading, setPendientesLoading] = useState(false);
    const [pendientesError, setPendientesError] = useState<string | null>(null);
    const [canjeandoId, setCanjeandoId] = useState<number | null>(null);

    const loadPendientes = useCallback(async () => {
        try {
            setPendientesLoading(true);
            setPendientesError(null);
            const data = await getPendientesManualBeneficio(idEvento);
            setPendientes(data);
        } catch (err: any) {
            setPendientesError(err.message || 'Error al cargar los pendientes');
        } finally {
            setPendientesLoading(false);
        }
    }, [idEvento]);

    useEffect(() => {
        if (activeTab === 'manual') {
            loadPendientes();
        }
    }, [activeTab, loadPendientes]);

    const handleCanjearManual = async (idBeneficioRegistro: number) => {
        try {
            setCanjeandoId(idBeneficioRegistro);
            await canjearBeneficio(idBeneficioRegistro, 'Canje manual sin QR');
            await loadPendientes();
        } catch (err) {
            alert('Error al realizar el canje manual');
        } finally {
            setCanjeandoId(null);
        }
    };

    // ── Tabs config ────────────────────────────────────────────────────
    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'qr', label: 'Canjear por QR', icon: <Ticket className="w-4 h-4" /> },
        { id: 'manual', label: 'Pendientes Manual', icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6">
            {/* Premium Tab Switcher */}
            <div className="flex gap-1 p-1 bg-background border border-card-border rounded-2xl w-fit shadow-inner">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                            setActiveTab(tab.id);
                            setResult(null);
                            setError(null);
                            setToken('');
                            setObservaciones('');
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                : 'text-muted hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.id === 'manual' && pendientes.length > 0 && activeTab !== 'manual' && (
                            <span className="ml-1 w-5 h-5 flex items-center justify-center bg-purple-500 text-white text-[10px] rounded-full font-bold animate-pulse">
                                {pendientes.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: CANJEAR POR QR ─────────────────────────────── */}
            {activeTab === 'qr' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                    {/* Escaner */}
                    <div className="space-y-6">
                        <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 animate-pulse">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Escanear Beneficio</h3>
                                    <p className="text-xs text-muted">Ingrese el token QR del beneficio a canjear</p>
                                </div>
                            </div>

                            <form onSubmit={handleScan} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ingrese Token de Beneficio..."
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    className="flex-1 bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none font-mono transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-600/10"
                                >
                                    {loading ? '...' : 'Leer'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Resultado QR */}
                    <div>
                        {error && (
                            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-3 animate-in fade-in">
                                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                                <h3 className="text-lg font-bold text-red-500">QR Inválido</h3>
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="p-6 bg-card-bg border border-card-border rounded-2xl space-y-6 animate-in fade-in slide-in-from-right-4 shadow-xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">{result.nombre} {result.apellido}</h3>
                                        <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mt-1">
                                            {result.beneficio_titulo || 'Beneficio Especial'}
                                        </p>
                                    </div>
                                </div>

                                {!result.puede_canjear ? (
                                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        <div className="text-sm font-bold">
                                            {result.mensaje || 'Este beneficio no puede ser canjeado (vencido o ya utilizado).'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 border-b border-card-border/50 pb-4">
                                        <div className="flex justify-between text-sm py-2 border-b border-card-border/50">
                                            <span className="text-muted">Estado</span>
                                            <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Disponible para canje</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-card-border/50">
                                            <span className="text-muted">Campaña</span>
                                            <span className="font-bold text-foreground">{result.campania || '—'}</span>
                                        </div>
                                        {result.beneficio_descripcion && (
                                            <div className="pt-2">
                                                <span className="text-muted text-xs uppercase tracking-widest font-bold block mb-1">Descripción</span>
                                                <p className="text-sm text-foreground/90">{result.beneficio_descripcion}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Observaciones */}
                                {result.puede_canjear && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-widest block">Observaciones (opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Entregado en barra norte, 2 copas..."
                                            value={observaciones}
                                            onChange={e => setObservaciones(e.target.value)}
                                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none text-foreground transition-all"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleCanje}
                                    disabled={loading || !result.puede_canjear}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 text-sm tracking-wide"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Entregar Beneficio
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB 2: BENEFICIOS PENDIENTES MANUAL ───────────────── */}
            {activeTab === 'manual' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-foreground">Beneficios Pendientes por Ingreso Manual</h3>
                            <p className="text-xs text-muted mt-0.5">
                                Personas ingresadas manualmente que aún no recibieron su beneficio en barra
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={loadPendientes}
                            disabled={pendientesLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-muted bg-background border border-card-border hover:border-purple-500/50 hover:text-foreground transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${pendientesLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    {/* Error state */}
                    {pendientesError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            {pendientesError}
                        </div>
                    )}

                    {/* Loading state */}
                    {pendientesLoading && !pendientes.length && (
                        <div className="flex items-center justify-center py-16 text-muted">
                            <Loader2 className="w-6 h-6 animate-spin mr-3" />
                            <span className="text-sm">Cargando beneficios pendientes...</span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!pendientesLoading && !pendientesError && pendientes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <p className="font-bold text-foreground">¡Todo al día!</p>
                            <p className="text-sm text-muted max-w-sm">No hay beneficios pendientes de entrega manual en este momento.</p>
                        </div>
                    )}

                    {/* Grid */}
                    {pendientes.length > 0 && (
                        <div className="rounded-2xl border border-card-border overflow-hidden bg-card-bg shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-card-border bg-background/50">
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest">Persona</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest hidden sm:table-cell">Celular</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest hidden md:table-cell">Campaña</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest">Beneficio</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest hidden lg:table-cell">Ingresó</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest hidden lg:table-cell">Observaciones</th>
                                            <th className="text-right px-4 py-3 text-xs font-bold text-muted uppercase tracking-widest">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-card-border/50">
                                        {pendientes.map((p, idx) => (
                                            <tr
                                                key={p.id_beneficio_registro}
                                                className={`transition-colors hover:bg-white/[0.02] ${idx % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-foreground">{p.nombre} {p.apellido}</div>
                                                    <div className="text-xs text-muted mt-0.5 sm:hidden">{p.celular || '—'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-muted hidden sm:table-cell">{p.celular || '—'}</td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wide whitespace-nowrap">
                                                        {p.campania || 'Sin campaña'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-foreground text-xs">{p.beneficio_titulo || 'Beneficio General'}</div>
                                                    <div className="text-[10px] text-muted mt-0.5 font-bold uppercase tracking-widest">{p.estado_beneficio}</div>
                                                </td>
                                                <td className="px-4 py-3 text-muted text-xs hidden lg:table-cell whitespace-nowrap">
                                                    {new Date(p.fecha_hora).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3 text-muted text-xs hidden lg:table-cell max-w-[160px] truncate" title={p.observaciones || ''}>
                                                    {p.observaciones || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCanjearManual(p.id_beneficio_registro)}
                                                        disabled={canjeandoId === p.id_beneficio_registro}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition-all shadow-sm shadow-purple-600/20 whitespace-nowrap"
                                                    >
                                                        {canjeandoId === p.id_beneficio_registro ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        )}
                                                        {canjeandoId === p.id_beneficio_registro ? 'Entregando...' : 'Entregar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-3 border-t border-card-border bg-background/30 flex items-center justify-between">
                                <span className="text-xs text-muted">{pendientes.length} beneficio(s) pendiente(s)</span>
                                <span className="text-[10px] text-muted/60 font-mono">Ordenados por ingreso más reciente</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
