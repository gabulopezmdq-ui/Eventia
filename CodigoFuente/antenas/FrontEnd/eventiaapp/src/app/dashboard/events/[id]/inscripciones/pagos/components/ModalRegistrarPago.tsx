'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle, Save, DollarSign } from 'lucide-react';
import { registrarPago } from '@/src/features/inscripcion/pagos.service';
import type { MedioPago } from '@/src/features/inscripcion/types/pagos.types';

interface ModalRegistrarPagoProps {
    idInscripcion: number;
    saldoPendiente: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalRegistrarPago({ idInscripcion, saldoPendiente, onClose, onSuccess }: ModalRegistrarPagoProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form
    const [importe, setImporte] = useState<number | ''>(saldoPendiente > 0 ? saldoPendiente : '');
    const [medioPago, setMedioPago] = useState<MedioPago>('EFECTIVO');
    const [referencia, setReferencia] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (importe === '' || Number(importe) <= 0) {
            setError('Por favor ingrese un importe válido mayor a 0.');
            return;
        }

        if (Number(importe) > saldoPendiente) {
            setError(`El importe no puede ser mayor al saldo pendiente ($${saldoPendiente}).`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await registrarPago(idInscripcion, {
                importe: Number(importe),
                medioPago,
                referencia: referencia.trim() || undefined,
                observaciones: observaciones.trim() || undefined
            });
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar el pago');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-card-bg border border-card-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-card-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Registrar Pago</h3>
                            <p className="text-xs text-muted mt-0.5">Saldo pendiente: <span className="font-bold text-foreground">${saldoPendiente}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 mx-6 mt-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Importe <span className="text-emerald-400">*</span></label>
                            <input
                                type="number"
                                min="0.01"
                                max={saldoPendiente}
                                step="0.01"
                                required
                                value={importe}
                                onChange={(e) => setImporte(e.target.value ? Number(e.target.value) : '')}
                                placeholder="0.00"
                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none text-foreground font-semibold text-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Medio de Pago <span className="text-emerald-400">*</span></label>
                            <select
                                required
                                value={medioPago}
                                onChange={(e) => setMedioPago(e.target.value as MedioPago)}
                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none text-foreground appearance-none"
                            >
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="TRANSFERENCIA">Transferencia</option>
                                <option value="TARJETA">Tarjeta</option>
                                <option value="BIZUM">Bizum</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Referencia de Pago <span className="text-muted/50">(opcional)</span></label>
                        <input
                            type="text"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            placeholder="Nro. comprobante, transacción..."
                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none text-foreground"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Observaciones <span className="text-muted/50">(opcional)</span></label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Aclaración adicional..."
                            rows={2}
                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none text-foreground resize-none"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-card-border/50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-bold text-muted hover:text-foreground transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Guardar Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
