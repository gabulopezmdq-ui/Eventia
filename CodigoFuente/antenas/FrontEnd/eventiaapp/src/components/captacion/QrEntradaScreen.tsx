'use client';

import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Search, AlertTriangle } from 'lucide-react';
import { resolverQrEntrada, resolverEntradaManual, registrarCheckin } from '@/src/features/captacion/captacion.service';
import type { QrEntradaResult } from '@/src/features/captacion/types';

export default function QrEntradaScreen({ idEvento }: { idEvento: number }) {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<QrEntradaResult | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleCheckin = async () => {
        if (!result) return;
        try {
            setLoading(true);
            await registrarCheckin({
                id_evento: idEvento,
                id_invitado: result.id_invitado,
                id_acceso: result.id_acceso,
                id_acceso_link: result.id_acceso_link,
                tipo: result.accion_sugerida
            });
            alert('¡Check-in exitoso!');
            setResult(null);
            setToken('');
        } catch (err) {
            alert('Error al registrar check-in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Escanear Entrada</h3>
                            <p className="text-xs text-muted">Simulador de escaneo para dashboard web</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleScan} className="flex gap-2">
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
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all"
                        >
                            {loading ? '...' : 'Leer'}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-card-border mt-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors uppercase tracking-widest">
                            <Search className="w-4 h-4" /> Búsqueda Manual
                        </button>
                    </div>
                </div>
            </div>

            <div>
                {error && (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-3 animate-in fade-in">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h3 className="text-lg font-bold text-red-500">Error en Lectura</h3>
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="p-6 bg-card-bg border border-card-border rounded-2xl space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{result.nombre} {result.apellido}</h3>
                                <p className="text-muted text-sm mt-1">{result.email || result.celular}</p>
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

                        <div className="space-y-3">
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

                        <button
                            onClick={handleCheckin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
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
