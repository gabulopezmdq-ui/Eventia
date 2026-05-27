import { useState, useEffect, useRef } from 'react';
import { QrCode, Loader2, AlertCircle, Search, Camera, X } from 'lucide-react';
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

    // Camera/Modal states
    const [scannerOpen, setScannerOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const scannerRef = useRef<any>(null);

    const handleValidar = async (tokenParaValidar?: string) => {
        const tokenFinal = (tokenParaValidar || token).trim();
        if (!tokenFinal) return;

        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await validarQR(idEvento, {
                qrToken: tokenFinal,
                fechaOperativa
            });
            if (res.valido) {
                onValidado(res);
                setToken(''); // Reset input
                if (scannerOpen) {
                    stopScanner();
                }
            } else {
                setErrorMsg(res.mensaje || 'QR inválido');
                if (scannerOpen) {
                    stopScanner();
                }
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Error al validar QR');
            if (scannerOpen) {
                stopScanner();
            }
        } finally {
            setLoading(false);
        }
    };

    const startScanner = async () => {
        setScannerOpen(true);
        setCameraError(null);
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (err) {
                console.error("Error al detener la cámara:", err);
            }
            scannerRef.current = null;
        }
        setScannerOpen(false);
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && scannerOpen) {
                stopScanner();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scannerOpen]);

    // Control the camera lifecycle using useEffect
    useEffect(() => {
        let activeScanner: any = null;
        let isMounted = true;

        if (scannerOpen) {
            const timer = setTimeout(async () => {
                try {
                    // Import dynamically for SSR safety
                    const { Html5Qrcode } = await import('html5-qrcode');

                    if (!isMounted) return;

                    const scanner = new Html5Qrcode("panel-qr-reader");
                    scannerRef.current = scanner;
                    activeScanner = scanner;

                    const scanConfig = {
                        fps: 12,
                        qrbox: (width: number, height: number) => {
                            const size = Math.min(width, height) * 0.70;
                            return { width: size, height: size };
                        },
                        aspectRatio: 1.0
                    };

                    const onScanSuccess = (decodedText: string) => {
                        if (isMounted) {
                            handleValidar(decodedText);
                        }
                    };

                    const onScanError = () => {
                        // Ignore standard scan noises
                    };

                    try {
                        await scanner.start(
                            { facingMode: "environment" },
                            scanConfig,
                            onScanSuccess,
                            onScanError
                        );
                    } catch (firstErr) {
                        console.warn("Cámara trasera no disponible. Reintentando con frontal/webcam...", firstErr);
                        if (isMounted) {
                            try {
                                await scanner.start(
                                    { facingMode: "user" },
                                    scanConfig,
                                    onScanSuccess,
                                    onScanError
                                );
                            } catch (secondErr) {
                                console.warn("Cámara frontal tampoco disponible. Intentando por defecto...", secondErr);
                                if (isMounted) {
                                    await scanner.start(
                                        {},
                                        scanConfig,
                                        onScanSuccess,
                                        onScanError
                                    );
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("Fallo al iniciar escáner de cámara:", err);
                    if (isMounted) {
                        const errMsg = String(err).toLowerCase();
                        let msg = "No se pudo acceder a la cámara del dispositivo.";
                        if (errMsg.includes("notallowederror") || errMsg.includes("permission denied")) {
                            msg = "Permiso de cámara denegado. Por favor, habilitalo en tu navegador.";
                        } else if (errMsg.includes("notfounderror") || errMsg.includes("no camera found")) {
                            msg = "No se detectaron cámaras en este dispositivo.";
                        }
                        setCameraError(msg);
                    }
                }
            }, 350);

            return () => {
                isMounted = false;
                clearTimeout(timer);
                if (activeScanner && activeScanner.isScanning) {
                    activeScanner.stop().catch((err: any) => console.error("Error al detener cámara en cleanup:", err));
                }
                scannerRef.current = null;
            };
        }

        return () => {
            isMounted = false;
        };
    }, [scannerOpen]);

    return (
        <>
            <div className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-indigo-500" />
                            Validar QR de Retiro
                        </h3>
                        <p className="text-muted text-xs mt-1">Escanear el código QR del portador o tipear manualmente su token.</p>
                    </div>
                    
                    <button
                        onClick={startScanner}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                        <Camera className="w-4 h-4" />
                        Escanear con Cámara
                    </button>
                </div>

                {/* Manual Form */}
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Ingresar token de autorizado..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-background border border-card-border focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold outline-none"
                                disabled={loading}
                            />
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        </div>
                        <button
                            onClick={() => handleValidar()}
                            disabled={loading || !token.trim()}
                            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:opacity-40 text-white font-bold text-sm shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Validar
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-400 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-semibold">{errorMsg}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Camera Scanner Modal */}
            {scannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    {/* Backdrop Click */}
                    <div className="absolute inset-0 cursor-default" onClick={stopScanner} />

                    <div className="relative w-full max-w-md bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-card-border bg-card-bg">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Escáner de Cámara</h4>
                                    <p className="text-muted text-[10px] uppercase font-semibold tracking-wider">Enfoque el código QR</p>
                                </div>
                            </div>
                            <button
                                onClick={stopScanner}
                                className="p-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 text-muted hover:text-foreground transition-all duration-200 border border-card-border cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="relative aspect-square w-full bg-background flex items-center justify-center p-6 border-b border-card-border">
                            <div id="panel-qr-reader" className="w-full h-full [&_video]:object-cover [&_video]:rounded-2xl" />
                            
                            {/* Premium Scan Reticle */}
                            {!cameraError && !loading && (
                                <div className="absolute inset-6 pointer-events-none border-2 border-indigo-500/20 rounded-3xl">
                                    {/* Corners */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    
                                    {/* Laser Line */}
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.9)] animate-bounce" />
                                </div>
                            )}

                            {/* Loading State Overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-200">
                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                                    <p className="text-sm font-bold text-foreground">Validando código...</p>
                                    <p className="text-xs text-muted mt-1">Por favor aguarde un instante</p>
                                </div>
                            )}

                            {/* Camera Error Overlay */}
                            {cameraError && (
                                <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-200">
                                    <div className="p-3.5 rounded-full bg-red-500/10 text-red-400 mb-4 animate-bounce">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-bold text-foreground mb-2">Error de Acceso</p>
                                    <p className="text-xs text-muted max-w-[280px] leading-relaxed">{cameraError}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 bg-card-bg flex items-center justify-center">
                            <span className="text-[11px] font-semibold text-muted text-center max-w-[280px]">
                                Coloque el código QR del tutor frente a la cámara para realizar la validación al instante.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
