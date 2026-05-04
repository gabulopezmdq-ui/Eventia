import { useEffect } from 'react';
import { useInscripcion } from '../hooks/useInscripcion';
import { CheckCircle, Mail, QrCode, Users, Phone } from 'lucide-react';

export function SuccessScreen() {
    const { state, limpiarDraft } = useInscripcion();
    const resultado = state.resultadoConfirmacion;

    useEffect(() => {
        limpiarDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* ── Header de confirmación ─────────────────────── */}
                <div className="bg-white dark:bg-card-bg rounded-3xl shadow-xl border border-gray-100 dark:border-card-border p-8 sm:p-12 text-center">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        ¡Inscripción Confirmada!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {resultado?.mensaje ?? 'Hemos recibido tu inscripción correctamente.'}
                    </p>

                    {/* Email info */}
                    <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 mt-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-left">
                        <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-sm">
                            En breve recibirás un email en{' '}
                            <strong className="text-gray-900 dark:text-white">
                                {state.responsable.email}
                            </strong>{' '}
                            con los detalles e instrucciones de pago.
                        </p>
                    </div>
                </div>

                {/* ── QRs de retiro ──────────────────────────────── */}
                {resultado && resultado.qrs_retiro.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-accent" />
                            Códigos QR de Retiro
                        </h2>
                        <p className="text-sm text-gray-500">
                            Cada persona autorizada recibirá un QR único para retirar a los participantes asignados. Guardá o descargá cada QR.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {resultado.qrs_retiro.map((qr, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-card-bg rounded-2xl border border-gray-200 dark:border-card-border shadow-md p-6 space-y-4"
                                >
                                    {/* Autorizado info */}
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {qr.nombre_autorizado}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" />
                                            {qr.telefono_autorizado}
                                            {qr.relacion && ` · ${qr.relacion}`}
                                        </p>
                                    </div>

                                    {/* Participantes a retirar */}
                                    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <Users className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent" />
                                        <span>
                                            Puede retirar a:{' '}
                                            <strong>
                                                {qr.participantes.map(p => p.nombre_completo).join(', ')}
                                            </strong>
                                        </span>
                                    </div>

                                    {/* QR visual — genera con API de Google Charts */}
                                    <div className="flex flex-col items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qr.qr_token)}`}
                                            alt={`QR de retiro para ${qr.nombre_autorizado}`}
                                            width={180}
                                            height={180}
                                            className="rounded-xl border border-gray-200 dark:border-card-border"
                                        />

                                        <a
                                            href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr.qr_token)}&format=png`}
                                            download={`qr_retiro_${qr.nombre_autorizado.replace(/\s+/g, '_')}.png`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                                        >
                                            <QrCode className="w-3.5 h-3.5" />
                                            Descargar imagen
                                        </a>
                                    </div>

                                    {/* Token en texto para referencia */}
                                    <div className="bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-center">
                                        <p className="text-xs text-gray-400 font-mono truncate" title={qr.qr_token}>
                                            {qr.qr_token}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Volver / Nueva inscripción ─────────────────── */}
                <div className="text-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Hacer otra inscripción
                    </button>
                </div>
            </div>
        </div>
    );
}
