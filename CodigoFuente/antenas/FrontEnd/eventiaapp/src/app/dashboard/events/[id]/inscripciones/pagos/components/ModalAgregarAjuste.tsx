'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, Save } from 'lucide-react';
import { getTiposAjuste, agregarAjuste } from '@/src/features/inscripcion/pagos.service';
import type { TipoAjuste, TipoAjusteParam } from '@/src/features/inscripcion/types/pagos.types';

interface ModalAgregarAjusteProps {
    idInscripcion: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalAgregarAjuste({ idInscripcion, onClose, onSuccess }: ModalAgregarAjusteProps) {
    const [loading, setLoading] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data
    const [tiposAjuste, setTiposAjuste] = useState<TipoAjusteParam[]>([]);

    // Form
    const [tipo, setTipo] = useState<TipoAjuste>('DESCUENTO');
    const [idTipoAjuste, setIdTipoAjuste] = useState<number | ''>('');
    const [importe, setImporte] = useState<number | ''>('');
    const [descripcion, setDescripcion] = useState('');

    const fetchTipos = useCallback(async () => {
        setLoadingTipos(true);
        setError(null);
        try {
            const data = await getTiposAjuste();
            setTiposAjuste(data);
            if (data.length > 0) {
                setIdTipoAjuste(data[0].id);
            }
        } catch (err) {
            setError('Error al cargar los motivos de ajuste');
        } finally {
            setLoadingTipos(false);
        }
    }, []);

    useEffect(() => {
        fetchTipos();
    }, [fetchTipos]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (idTipoAjuste === '' || importe === '' || Number(importe) <= 0) {
            setError('Por favor complete todos los campos requeridos con valores válidos.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await agregarAjuste(idInscripcion, {
                tipo,
                idTipoAjuste: Number(idTipoAjuste),
                importe: Number(importe),
                descripcion: descripcion.trim() || undefined
            });
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar el ajuste');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-card-bg border border-card-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-card-border/50">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Agregar Ajuste</h3>
                        <p className="text-xs text-muted mt-0.5">Descuentos, bonificaciones o recargos</p>
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
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Tipo <span className="text-indigo-400">*</span></label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value as TipoAjuste)}
                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground appearance-none"
                            >
                                <option value="DESCUENTO">Descuento</option>
                                <option value="BONIFICACION">Bonificación</option>
                                <option value="RECARGO">Recargo</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Importe <span className="text-indigo-400">*</span></label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={importe}
                                onChange={(e) => setImporte(e.target.value ? Number(e.target.value) : '')}
                                placeholder="0.00"
                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Motivo <span className="text-indigo-400">*</span></label>
                        {loadingTipos ? (
                            <div className="w-full p-3 flex items-center justify-center bg-background border border-card-border rounded-xl">
                                <Loader2 className="w-4 h-4 animate-spin text-muted" />
                            </div>
                        ) : (
                            <select
                                required
                                value={idTipoAjuste === '' ? '' : String(idTipoAjuste)}
                                onChange={(e) => setIdTipoAjuste(e.target.value ? Number(e.target.value) : '')}
                                className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground appearance-none"
                            >
                                <option value="" disabled>Seleccione un motivo...</option>
                                {tiposAjuste.map((t, index) => (
                                    <option key={`${t.id}-${index}`} value={t.id}>{t.texto}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Descripción <span className="text-muted/50">(opcional)</span></label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Aclaración adicional..."
                            rows={3}
                            className="w-full p-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none text-foreground resize-none"
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
                            disabled={loading || loadingTipos}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Guardar Ajuste
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
