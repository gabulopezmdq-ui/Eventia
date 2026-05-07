'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle, Ban } from 'lucide-react';
import { anularPago } from '@/src/features/inscripcion/pagos.service';

interface ModalAnularPagoProps {
    idPago: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalAnularPago({ idPago, onClose, onSuccess }: ModalAnularPagoProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [motivo, setMotivo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!motivo.trim()) {
            setError('Debe especificar un motivo para anular el pago.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await anularPago(idPago, motivo.trim());
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al anular el pago');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-card-bg border border-red-500/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-card-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                            <Ban className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Anular Pago</h3>
                            <p className="text-xs text-muted mt-0.5">Esta acción no se puede deshacer.</p>
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
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-400">
                        ¿Está seguro que desea anular este pago? El saldo pendiente de la inscripción será recalculado automáticamente.
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Motivo de la anulación <span className="text-red-400">*</span></label>
                        <textarea
                            required
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Pago duplicado, error de carga..."
                            rows={3}
                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all text-sm outline-none text-foreground resize-none"
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
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Ban className="w-4 h-4" />
                            )}
                            Confirmar Anulación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
