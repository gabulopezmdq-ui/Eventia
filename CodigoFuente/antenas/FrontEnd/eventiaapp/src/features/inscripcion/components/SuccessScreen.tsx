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
    Copy,
    Download,
    Share,
    X,
} from 'lucide-react';
import { guardarTokenPortal } from '@/src/features/portal/portal.service';
import { useToast } from '@/src/context/ToastContext';

export function SuccessScreen() {
    const { state, limpiarDraft } = useInscripcion();
    const resultado = state.resultadoConfirmacion;
    const router = useRouter();
    const { addToast } = useToast();
    const [tokenGuardado, setTokenGuardado] = useState(false);
    const [pwaSupported, setPwaSupported] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIosGuide, setShowIosGuide] = useState(false);

    // Al montar: limpiar draft e intentar guardar el token del portal persistente
    useEffect(() => {
        limpiarDraft();

        if (resultado?.token_portal) {
            guardarTokenPortal(resultado.token_portal);
            setTokenGuardado(true);
        }

        if (typeof window !== 'undefined') {
            const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
            setIsStandalone(!!standalone);

            const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as any).standalone;
            setIsIOS(ios);

            const hasPrompt = !!(window as any).deferredPrompt;
            setPwaSupported(hasPrompt || ios);

            const handleInstallAvailable = () => {
                setPwaSupported(true);
            };
            window.addEventListener('pwa-install-available', handleInstallAvailable);
            return () => {
                window.removeEventListener('pwa-install-available', handleInstallAvailable);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleIrAMiEventia = () => {
        if (resultado?.url_mi_eventia) {
            if (resultado.url_mi_eventia.startsWith('http://') || resultado.url_mi_eventia.startsWith('https://') || resultado.url_mi_eventia.startsWith('//')) {
                window.location.href = resultado.url_mi_eventia;
            } else {
                router.push(resultado.url_mi_eventia);
            }
        }
    };

    const handleIrAlPortal = () => {
        if (resultado?.url_portal) {
            if (resultado.url_portal.startsWith('http://') || resultado.url_portal.startsWith('https://') || resultado.url_portal.startsWith('//')) {
                window.location.href = resultado.url_portal;
            } else {
                router.push(resultado.url_portal);
            }
        }
    };

    const handleCopiarEnlace = () => {
        if (resultado?.url_mi_eventia) {
            const urlAbsoluta = `${window.location.origin}${resultado.url_mi_eventia}`;
            navigator.clipboard.writeText(urlAbsoluta)
                .then(() => {
                    addToast('¡Enlace de acceso copiado al portapapeles!', 'success');
                })
                .catch(() => {
                    addToast('No se pudo copiar el enlace. Por favor, cópialo manualmente.', 'error');
                });
        }
    };

    const handleGuardarAcceso = async () => {
        if (isStandalone) {
            addToast('Eventia ya está instalada en tu dispositivo.', 'info');
            return;
        }

        if (isIOS) {
            setShowIosGuide(true);
            return;
        }

        const promptEvent = (window as any).deferredPrompt;
        if (promptEvent) {
            promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === 'accepted') {
                addToast('¡Instalación iniciada con éxito! Disfrutá de Eventia.', 'success');
                (window as any).deferredPrompt = null;
                setPwaSupported(false);
            }
        } else {
            addToast('Para guardar, usa la opción "Agregar a la pantalla de inicio" de tu navegador.', 'info');
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
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* CTA principal */}
                                    <button
                                        id="btn-ir-mi-eventia"
                                        onClick={handleIrAMiEventia}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-purple-700 font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl text-sm"
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
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl backdrop-blur-sm active:scale-[0.98] transition-all border border-white/20 text-sm"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Ver portal del evento
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Copiar enlace */}
                                    <button
                                        id="btn-copiar-enlace"
                                        onClick={handleCopiarEnlace}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl active:scale-[0.98] transition-all border border-white/15 text-sm"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copiar enlace de acceso
                                    </button>

                                    {/* Guardar acceso (PWA) */}
                                    {pwaSupported && !isStandalone && (
                                        <button
                                            id="btn-guardar-celular"
                                            onClick={handleGuardarAcceso}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-md text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Guardar acceso en mi celular
                                        </button>
                                    )}
                                </div>
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

            {/* ── Modal Guía iOS ── */}
            {showIosGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-card-bg rounded-3xl shadow-2xl border border-gray-200 dark:border-card-border p-6 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowIosGuide(false)}
                            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                            <Download className="w-6 h-6" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Guardar Eventia en tu iPhone
                        </h3>
                        <p className="text-sm text-muted mb-4">
                            Agregá la aplicación a tu pantalla de inicio desde Safari para acceder al instante:
                        </p>

                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-card-border">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs shrink-0">
                                    1
                                </span>
                                <span>
                                    Tocá el botón de <strong>Compartir</strong> en la barra de navegación de Safari.
                                </span>
                                <Share className="w-4 h-4 text-blue-500 ml-auto shrink-0" />
                            </div>
                            <div className="flex items-center gap-3 border-t border-gray-200 dark:border-card-border pt-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs shrink-0">
                                    2
                                </span>
                                <span>
                                    Desplazate hacia abajo y seleccioná <strong>"Agregar a inicio"</strong>.
                                </span>
                                <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center font-bold text-[12px] ml-auto shrink-0 text-gray-500">
                                    +
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowIosGuide(false)}
                            className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
