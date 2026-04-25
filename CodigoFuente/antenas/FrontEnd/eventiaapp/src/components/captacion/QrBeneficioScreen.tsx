'use client';

import { useState } from 'react';
import { Ticket, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { resolverQrBeneficio, canjearBeneficio } from '@/src/features/captacion/captacion.service';
import type { QrBeneficioResult } from '@/src/features/captacion/types';

export default function QrBeneficioScreen({ idEvento }: { idEvento: number }) {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<QrBeneficioResult | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            await canjearBeneficio(result.id_beneficio_registro);
            alert('¡Beneficio canjeado exitosamente!');
            setResult(null);
            setToken('');
        } catch (err) {
            alert('Error al canjear el beneficio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Escanear Beneficio</h3>
                            <p className="text-xs text-muted">Simulador para control de barra/entregas</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleScan} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ingrese Token de Beneficio..."
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="flex-1 bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none font-mono"
                        />
                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all"
                        >
                            {loading ? '...' : 'Leer'}
                        </button>
                    </form>
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
                                <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mt-1">
                                    {result.beneficio_titulo || 'Beneficio Especial'}
                                </p>
                            </div>
                        </div>

                        {!result.puede_canjear ? (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <div className="text-sm font-bold">
                                    {result.mensaje || 'Este beneficio no puede ser canjeado (Vencido o ya utilizado).'}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm py-2 border-b border-card-border/50">
                                    <span className="text-muted">Estado Actual</span>
                                    <span className="font-bold text-emerald-400 uppercase tracking-widest">Disponible para canje</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-card-border/50">
                                    <span className="text-muted">Campaña</span>
                                    <span className="font-bold text-foreground">{result.campania || '—'}</span>
                                </div>
                                {result.beneficio_descripcion && (
                                    <div className="pt-2">
                                        <span className="text-muted text-xs uppercase tracking-widest font-bold block mb-1">Descripción</span>
                                        <p className="text-sm">{result.beneficio_descripcion}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleCanje}
                            disabled={loading || !result.puede_canjear}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Entregar Beneficio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
