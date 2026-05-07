import { useState } from 'react';
import { QrCode, Loader2, AlertCircle, Search } from 'lucide-react';
import { validarQR } from '@/src/features/programas/programas.service';
import { ValidarQRResponse } from '@/src/features/programas/types';

interface Props {
    idEvento: number;
    fechaOperativa: string;
    onValidado: (resultado: ValidarQRResponse) => void;
}

export default function ValidarQRPanel({ idEvento, fechaOperativa, onValidado }: Props) {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleValidar = async () => {
        if (!token.trim()) return;
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await validarQR(idEvento, {
                qrToken: token.trim(),
                fechaOperativa
            });
            if (res.valido) {
                onValidado(res);
                setToken(''); // Reset input
            } else {
                setErrorMsg(res.mensaje || 'QR inválido');
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Error al validar QR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-500" />
                Escanear QR / Token manual
            </h3>
            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Ingresar token..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                    className="flex-1 px-4 py-3 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleValidar}
                    disabled={loading || !token.trim()}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Validar
                </button>
            </div>
            
            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            )}
        </div>
    );
}
