'use client';

import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Search, AlertTriangle } from 'lucide-react';
import { resolverQrEntrada, resolverEntradaManual, registrarCheckin, buscarRegistrado } from '@/src/features/captacion/captacion.service';
import type { QrEntradaResult, BusquedaRegistrado } from '@/src/features/captacion/types';

export default function QrEntradaScreen({ idEvento }: { idEvento: number }) {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<QrEntradaResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Contingency / Manual search state
    const [isManualSearch, setIsManualSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BusquedaRegistrado[]>([]);
    const [manualLoading, setManualLoading] = useState(false);
    const [observaciones, setObservaciones] = useState('');

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        
        try {
            setLoading(true);
            setError(null);
            const data = await resolverQrEntrada(idEvento, token);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'QR no válido o no encontrado');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        try {
            setManualLoading(true);
            setError(null);
            const data = await buscarRegistrado(idEvento, searchQuery);
            setSearchResults(data);
        } catch (err: any) {
            setError(err.message || 'Error al buscar registrado');
            setSearchResults([]);
        } finally {
            setManualLoading(false);
        }
    };

    const handleSelectManualPersona = async (idInvitado: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await resolverEntradaManual(idEvento, idInvitado);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Error al obtener datos de ingreso');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckin = async () => {
        if (!result) return;
        try {
            setLoading(true);
            const obsFinal = isManualSearch
                ? (observaciones ? `Registro manual sin QR - ${observaciones}` : 'Registro manual sin QR')
                : (observaciones || null);

            await registrarCheckin({
                id_evento: idEvento,
                id_invitado: result.id_invitado,
                id_acceso: result.id_acceso,
                id_acceso_link: result.id_acceso_link,
                tipo: result.accion_sugerida,
                observaciones: obsFinal
            });
            alert('¡Check-in exitoso!');
            setResult(null);
            setToken('');
            setObservaciones('');
            if (isManualSearch && searchQuery) {
                const updated = await buscarRegistrado(idEvento, searchQuery);
                setSearchResults(updated);
            }
        } catch (err) {
            alert('Error al registrar check-in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-4 shadow-xl">
                    {!isManualSearch ? (
                        <>
                            <div className="flex items-center gap-3 mb-2 animate-in fade-in">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 animate-pulse">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Escanear Entrada</h3>
                                    <p className="text-xs text-muted">Simulador de escaneo para control de puerta</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleScan} className="flex gap-2 animate-in fade-in">
                                <input
                                    type="text"
                                    placeholder="Ingrese Token QR..."
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    className="flex-1 bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/10"
                                >
                                    {loading ? '...' : 'Leer'}
                                </button>
                            </form>

                            <div className="pt-4 border-t border-card-border mt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsManualSearch(true);
                                        setResult(null);
                                        setError(null);
                                        setToken('');
                                    }}
                                    className="flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors uppercase tracking-widest"
                                >
                                    <Search className="w-4 h-4" /> Búsqueda Manual
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2 animate-in fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Búsqueda Manual</h3>
                                        <p className="text-xs text-muted">Contingencia cuando no se tiene código QR</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManualSearch(false);
                                        setResult(null);
                                        setError(null);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                                >
                                    Ver Lector QR
                                </button>
                            </div>

                            <form onSubmit={handleManualSearch} className="flex gap-2 animate-in fade-in">
                                <input
                                    type="text"
                                    placeholder="Nombre, apellido, email o celular..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={manualLoading || !searchQuery}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all"
                                >
                                    {manualLoading ? '...' : 'Buscar'}
                                </button>
                            </form>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2 border-t border-card-border/50 pt-3 animate-in fade-in duration-300">
                                    {searchResults.map(persona => (
                                        <button
                                            key={persona.id_invitado}
                                            type="button"
                                            onClick={() => handleSelectManualPersona(persona.id_invitado)}
                                            className={`w-full text-left p-3 rounded-xl bg-background border transition-all flex items-center justify-between ${
                                                result?.id_invitado === persona.id_invitado 
                                                    ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500' 
                                                    : 'border-card-border hover:border-indigo-500/50 hover:bg-white/5'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-bold text-sm text-foreground">{persona.nombre} {persona.apellido}</div>
                                                <div className="text-xs text-muted mt-0.5">{persona.celular || persona.email || 'Sin datos de contacto'}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                                    {persona.acceso_nombre}
                                                </span>
                                                {persona.asistio ? (
                                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">INGRESADO</span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-muted bg-white/5 px-2 py-0.5 rounded">PENDIENTE</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchQuery && searchResults.length === 0 && !manualLoading && (
                                <div className="text-center text-xs text-muted py-4 border-t border-card-border/50 mt-4 animate-in fade-in">
                                    No se encontraron resultados para la búsqueda.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div>
                {error && (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-3 animate-in fade-in">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h3 className="text-lg font-bold text-red-500">Error de Validación</h3>
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="p-6 bg-card-bg border border-card-border rounded-2xl space-y-6 animate-in fade-in slide-in-from-right-4 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{result.nombre} {result.apellido}</h3>
                                <p className="text-muted text-sm mt-1">{result.email || result.celular || 'Sin contacto'}</p>
                            </div>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-widest text-[10px] rounded-lg border border-indigo-500/20">
                                {result.acceso_nombre}
                            </span>
                        </div>

                        {result.ya_ingreso && (
                            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <div className="text-sm">
                                    <span className="font-bold block">Esta persona ya ingresó anteriormente.</span>
                                    {result.ultimo_movimiento_fecha && (
                                        <span className="opacity-80">Último movimiento: {new Date(result.ultimo_movimiento_fecha).toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 border-b border-card-border/50 pb-4">
                            <div className="flex justify-between text-sm py-2 border-b border-card-border/50">
                                <span className="text-muted">Campaña Origen</span>
                                <span className="font-bold text-foreground">{result.campania || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-card-border/50">
                                <span className="text-muted">Estado Beneficio</span>
                                <span className="font-bold text-foreground">
                                    {result.beneficio_pendiente ? 'Tiene beneficio sin canjear' : 
                                     result.beneficio_canjeado ? 'Beneficio ya canjeado' : 'No tiene beneficios'}
                                </span>
                            </div>
                        </div>

                        {/* QR de canje para captura de foto */}
                        {result.mostrar_qr_para_canje && result.qr_token && (
                            <div className="flex flex-col items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl animate-in zoom-in duration-300">
                                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider text-center">
                                    Código QR para Canje en Barra
                                </span>
                                <div className="bg-white p-3 rounded-2xl shadow-inner">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(result.qr_token)}`}
                                        alt="QR de Beneficio"
                                        className="w-[180px] h-[180px] object-contain"
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-indigo-300 select-all bg-background px-3 py-1.5 rounded-lg border border-card-border font-bold">
                                    {result.qr_token}
                                </span>
                            </div>
                        )}

                        {/* Input de Observaciones de Ingreso */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block">Observaciones de Ingreso</label>
                            <input
                                type="text"
                                placeholder="Ej: VIP staff, ingresó con acompañantes..."
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none text-foreground transition-all"
                            />
                        </div>

                        <button
                            onClick={handleCheckin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 text-sm tracking-wide"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Confirmar {result.accion_sugerida}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
