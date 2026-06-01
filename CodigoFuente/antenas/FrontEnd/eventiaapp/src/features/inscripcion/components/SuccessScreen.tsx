'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInscripcion } from '../hooks/useInscripcion';
import {
    CheckCircle,
    Mail,
    QrCode,
    Users,
    Phone,
    LayoutDashboard,
    ArrowRight,
    ExternalLink,
    Sparkles,
} from 'lucide-react';
import { guardarTokenPortal } from '@/src/features/portal/portal.service';

export function SuccessScreen() {
    const { state, limpiarDraft } = useInscripcion();
    const resultado = state.resultadoConfirmacion;
    const router = useRouter();
    const [tokenGuardado, setTokenGuardado] = useState(false);

    // Al montar: limpiar draft e intentar guardar el token del portal persistente
    useEffect(() => {
        limpiarDraft();

        if (resultado?.token_portal) {
            guardarTokenPortal(resultado.token_portal);
            setTokenGuardado(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleIrAMiEventia = () => {
        if (resultado?.url_mi_eventia) {
            router.push(resultado.url_mi_eventia);
        }
    };

    const handleIrAlPortal = () => {
        if (resultado?.url_portal) {
            router.push(resultado.url_portal);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* ── Header de confirmación ──────────────────────────────── */}
                <div className="bg-white dark:bg-card-bg rounded-3xl shadow-xl border border-gray-100 dark:border-card-border p-8 sm:p-12 text-center">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 duration-500">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        ¡Inscripción Confirmada!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {resultado?.mensaje ?? 'Hemos recibido tu inscripción correctamente.'}
                    </p>

                    {/* Importe total */}
                    {resultado?.total_general != null && resultado.total_general > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-accent/10 text-accent font-bold px-5 py-2 rounded-full text-sm">
                            Total: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(resultado.total_general)}
                        </div>
                    )}

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

                {/* ── Banner Mi-Eventia (se muestra cuando hay token_portal) ─── */}
                {resultado?.token_portal && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white">
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                        <div className="relative z-10">
                            {/* Cabecera del banner */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                                        Nuevo
                                    </p>
                                    <h2 className="text-lg font-black leading-tight">
                                        Tu panel Mi-Eventia está listo
                                    </h2>
                                </div>
                            </div>

                            <p className="text-white/80 text-sm leading-relaxed mb-6">
                                Desde <strong className="text-white">Mi-Eventia</strong> podés gestionar todas tus inscripciones, 
                                ver los códigos QR de retiro y acceder a las fichas médicas de los participantes, 
                                todo desde un único lugar, en cualquier momento.
                            </p>

                            {tokenGuardado && (
                                <p className="text-xs text-white/60 flex items-center gap-1.5 mb-5">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-300 shrink-0" />
                                    Acceso guardado en este dispositivo
                                </p>
                            )}

                            {/* Botones de acción */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* CTA principal */}
                                <button
                                    id="btn-ir-mi-eventia"
                                    onClick={handleIrAMiEventia}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-purple-700 font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Ir a Mi-Eventia
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {/* Link secundario al portal puntual del evento */}
                                {resultado?.url_portal && (
                                    <button
                                        id="btn-ver-portal-evento"
                                        onClick={handleIrAlPortal}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl backdrop-blur-sm active:scale-[0.98] transition-all border border-white/20"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Ver portal del evento
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── QRs de retiro ──────────────────────────────────────── */}
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

                                    {/* QR visual */}
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

                {/* ── Acciones secundarias ────────────────────────────────── */}
                <div className="text-center pb-4">
                    <button
                        id="btn-nueva-inscripcion"
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
