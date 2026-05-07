import { useState, useEffect } from 'react';
import { X, User, Phone, CheckSquare, Loader2 } from 'lucide-react';
import { registrarRetiro } from '@/src/features/programas/programas.service';
import { ValidarQRResponse } from '@/src/features/programas/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    idEvento: number;
    qrResult: ValidarQRResponse | null;
    fechaOperativa: string;
    onRetiroRegistrado: () => void;
}

export default function RegistrarRetiroDrawer({ isOpen, onClose, idEvento, qrResult, fechaOperativa, onRetiroRegistrado }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && qrResult) {
            // Seleccionamos por defecto a los que aún no fueron retirados
            const defaultSelected = qrResult.participantesAutorizados
                .filter(p => !p.yaRetiradoHoy)
                .map(p => p.idInvitado);
            setSelectedIds(defaultSelected);
            setObservaciones('');
        } else {
            setSelectedIds([]);
            setObservaciones('');
        }
    }, [isOpen, qrResult]);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleRegistrar = async () => {
        if (!qrResult || selectedIds.length === 0) return;
        setLoading(true);
        try {
            await registrarRetiro(idEvento, {
                qrToken: qrResult.qrToken,
                fechaOperativa,
                idsInvitadosNinos: selectedIds,
                observaciones: observaciones.trim() || undefined
            });
            onRetiroRegistrado();
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Error al registrar retiro');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !qrResult) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-card-bg border-l border-card-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-card-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Registrar Retiro</h2>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mt-1">QR Válido</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-background text-muted hover:text-foreground transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Autorizado Info */}
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Autorizado a retirar</h3>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">{qrResult.nombreAutorizado}</p>
                                <p className="text-xs text-indigo-400 font-medium">{qrResult.relacion || 'Responsable'}</p>
                                {qrResult.telefonoAutorizado && (
                                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                                        <Phone className="w-3 h-3" /> {qrResult.telefonoAutorizado}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Niños */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Puede retirar</h3>
                        <div className="space-y-2">
                            {qrResult.participantesAutorizados.map(p => (
                                <label
                                    key={p.idInvitado}
                                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                                        p.yaRetiradoHoy 
                                            ? 'bg-background/50 border-card-border/50 opacity-60 cursor-not-allowed'
                                            : selectedIds.includes(p.idInvitado)
                                                ? 'bg-emerald-500/10 border-emerald-500/30 cursor-pointer'
                                                : 'bg-card-bg border-card-border hover:border-emerald-500/30 cursor-pointer'
                                    } transition-all`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(p.idInvitado)}
                                        onChange={() => toggleSelection(p.idInvitado)}
                                        disabled={p.yaRetiradoHoy || loading}
                                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-background border-card-border"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-foreground">{p.nombreCompleto}</span>
                                        {p.yaRetiradoHoy && p.fechaRetiro && (
                                            <p className="text-[10px] text-amber-500 font-semibold mt-0.5">
                                                Ya retirado ({new Date(p.fechaRetiro).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-widest">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            disabled={loading}
                            rows={3}
                            placeholder="Ej: Retiro en puerta principal..."
                            className="w-full px-4 py-3 rounded-xl bg-background border border-card-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-card-border bg-card-bg/50 backdrop-blur-xl">
                    <button
                        onClick={handleRegistrar}
                        disabled={loading || selectedIds.length === 0}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-5 h-5" />}
                        Registrar Retiro
                    </button>
                </div>
            </div>
        </div>
    );
}
