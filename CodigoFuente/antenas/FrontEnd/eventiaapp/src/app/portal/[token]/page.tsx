'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2,
    AlertTriangle,
    RefreshCw,
    Calendar,
    Clock,
    ShieldCheck,
    Lock,
    Mail,
    AlertCircle,
    Users,
    HeartPulse,
    FileText,
    Sparkles,
    X,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Phone,
    QrCode,
    CreditCard,
    Info,
    Megaphone,
    Gift,
    CalendarDays,
    Copy,
    Check,
    MapPin,
    ExternalLink,
    ChefHat,
    Bus,
    Camera,
} from 'lucide-react';
import {
    getPortalPuntual,
    solicitarCodigoOtp,
    validarCodigoOtp,
    type PortalPuntualResponse,
    type SeccionHabilitada,
} from '@/src/features/portal/portal.service';
import { useToast } from '@/src/context/ToastContext';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Devuelve el ícono correspondiente al código de sección */
function getSeccionIcono(codigo: string) {
    switch (codigo?.toUpperCase()) {
        case 'RESUMEN':
            return <FileText className="w-5 h-5" />;
        case 'AGENDA':
            return <CalendarDays className="w-5 h-5" />;
        case 'NOVEDADES':
            return <Megaphone className="w-5 h-5" />;
        case 'REGALOS':
            return <Gift className="w-5 h-5" />;
        case 'PAGOS':
            return <CreditCard className="w-5 h-5" />;
        case 'INTEGRANTES':
            return <Users className="w-5 h-5" />;
        case 'AUTORIZACIONES':
        case 'RETIROS':
        case 'QRSRETIRO':
            return <QrCode className="w-5 h-5" />;
        case 'AUTORIZACIONES_LEGALES':
        case 'FICHAS_MEDICAS':
        case 'SALUD':
            return <HeartPulse className="w-5 h-5" />;
        default:
            return <FileText className="w-5 h-5" />;
    }
}

function formatFecha(iso: string): string {
    if (!iso) return '';
    const d = iso.includes('T') ? new Date(iso) : new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────
// Subcomponente: Badge de estado del evento
// ─────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
    const normalizado = estado?.toUpperCase();
    if (normalizado === 'ACTIVO') {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Activo
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {estado}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponente: Modal de Desbloqueo OTP
// ─────────────────────────────────────────────────────────────────

interface ModalOtpProps {
    onVerificado: () => void;
    onCerrar: () => void;
    tokenConsulta: string;
    emailUsuario: string;
    seccionNombre?: string;
}

type OtpStep = 'SELECT_CHANNEL' | 'ENTER_CODE';

function ModalOtp({ onVerificado, onCerrar, tokenConsulta, emailUsuario, seccionNombre }: ModalOtpProps) {
    const { addToast } = useToast();
    const [step, setStep] = useState<OtpStep>('SELECT_CHANNEL');
    const [canal, setCanal] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
    const [codigo, setCodigo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codigoDev, setCodigoDev] = useState<string | null>(null);

    const handleSolicitarCodigo = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await solicitarCodigoOtp(tokenConsulta, canal);
            if (res.ok) {
                addToast(res.mensaje || 'Te enviamos un código de validación.', 'success');
                if (res.codigo_dev) {
                    setCodigoDev(res.codigo_dev);
                }
                setStep('ENTER_CODE');
            }
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : 'Error al enviar código.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleValidarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeTrimmed = codigo.trim();

        if (codeTrimmed.length !== 6) {
            setError('El código debe tener 6 dígitos.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await validarCodigoOtp(tokenConsulta, codeTrimmed);
            if (res.ok) {
                addToast(res.mensaje || 'Portal desbloqueado correctamente.', 'success');
                onVerificado();
            }
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Código incorrecto. Intentá nuevamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAutoFill = () => {
        if (codigoDev) {
            setCodigo(codigoDev);
            setError(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            <div className="w-full max-w-md bg-white dark:bg-card-bg rounded-3xl shadow-2xl border border-gray-200 dark:border-card-border animate-in zoom-in-95 fade-in duration-200">

                {/* Cabecera */}
                <div className="relative p-6 pb-0">
                    <button
                        onClick={onCerrar}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                        Verificación de seguridad
                    </h2>
                    <p className="text-sm text-muted leading-relaxed">
                        Para ver {seccionNombre ? `la sección ${seccionNombre}` : 'esta información sensible'}, valida tu identidad como responsable.
                    </p>
                </div>

                {/* Formulario Dinámico */}
                {step === 'SELECT_CHANNEL' ? (
                    <div className="p-6 space-y-5">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Seleccioná el canal de envío
                        </p>

                        <div className="space-y-3">
                            {/* Opción Email */}
                            <button
                                onClick={() => setCanal('EMAIL')}
                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${canal === 'EMAIL'
                                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/10'
                                    : 'border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-black/10'
                                    }`}
                            >
                                <Mail className={`w-5 h-5 mt-0.5 ${canal === 'EMAIL' ? 'text-indigo-600' : 'text-muted'}`} />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                                        Enviar por Correo Electrónico
                                    </p>
                                    <p className="text-xs text-muted truncate mt-0.5">
                                        Código OTP al email {emailUsuario}
                                    </p>
                                </div>
                            </button>

                            {/* Opción WhatsApp */}
                            <button
                                onClick={() => setCanal('WHATSAPP')}
                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${canal === 'WHATSAPP'
                                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/10'
                                    : 'border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-black/10'
                                    }`}
                            >
                                <Phone className={`w-5 h-5 mt-0.5 ${canal === 'WHATSAPP' ? 'text-indigo-600' : 'text-muted'}`} />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                                        Enviar por WhatsApp
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">
                                        Mensaje con código al número registrado
                                    </p>
                                </div>
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="font-medium text-xs leading-snug">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSolicitarCodigo}
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Solicitando...</>
                            ) : (
                                'Solicitar código'
                            )}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleValidarCodigo} className="p-6 space-y-4">
                        <p className="text-xs text-muted leading-relaxed">
                            Ingresá el código de 6 dígitos enviado a tu <strong>{canal === 'EMAIL' ? 'Correo' : 'WhatsApp'}</strong>.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                                Código de 6 dígitos
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={codigo}
                                onChange={(e) => {
                                    setCodigo(e.target.value.replace(/\D/g, ''));
                                    setError(null);
                                }}
                                placeholder="000000"
                                autoFocus
                                className="w-full text-center tracking-[1em] text-lg font-bold py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-card-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Banner QA para facilitar pruebas */}
                        {codigoDev && (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                                    <Info className="w-4 h-4 shrink-0" />
                                    <span>Código de prueba: <strong>{codigoDev}</strong></span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAutoFill}
                                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
                                >
                                    Autocompletar
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="font-medium text-xs leading-snug">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('SELECT_CHANNEL');
                                    setCodigo('');
                                    setError(null);
                                }}
                                className="flex-1 py-3 border border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-black/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition text-sm text-center"
                            >
                                Cambiar canal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || codigo.length !== 6}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Validando...</>
                                ) : (
                                    'Validar y Acceder'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponentes Especializados por Sección
// ─────────────────────────────────────────────────────────────────

function CountdownTimer({ fechaEvento }: { fechaEvento: string }) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isFinished: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

    useEffect(() => {
        const target = new Date(fechaEvento).getTime();
        if (isNaN(target)) return;

        const calculateTime = () => {
            const now = new Date().getTime();
            const diff = target - now;
            if (diff <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
            }
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60),
                isFinished: false,
            };
        };

        setTimeLeft(calculateTime());
        const timer = setInterval(() => {
            setTimeLeft(calculateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [fechaEvento]);

    if (timeLeft.isFinished) {
        return (
            <div className="flex justify-center items-center py-3 px-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl animate-fade-in shadow-sm">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                    ¡El evento ha comenzado!
                </p>
            </div>
        );
    }

    const units = [
        { label: 'Días', value: timeLeft.days },
        { label: 'Horas', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Seg', value: timeLeft.seconds },
    ];

    return (
        <div className="flex flex-col items-center gap-3 bg-white dark:bg-card-bg/30 p-5 rounded-2xl border border-gray-150 dark:border-card-border/60 shadow-sm max-w-sm mx-auto">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                Faltan para el gran día:
            </p>
            <div className="flex gap-2.5 sm:gap-3.5">
                {units.map((u, i) => (
                    <div
                        key={i}
                        className="bg-indigo-50/50 dark:bg-indigo-950/20 backdrop-blur-sm p-3 w-16 sm:w-20 text-center border border-indigo-100/50 dark:border-indigo-950/30 rounded-2xl shadow-inner animate-in zoom-in-95 duration-200"
                    >
                        <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                            {String(u.value).padStart(2, '0')}
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider mt-0.5">
                            {u.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResumenSeccion({ data }: { data: any }) {
    if (!data) return null;

    const {
        titulo,
        saludo,
        mensaje_bienvenida,
        fecha_evento,
        dress_code_codigo,
        usuario,
    } = data;

    const getDressCodeDesc = (code: string) => {
        const normalized = code?.toUpperCase();
        switch (normalized) {
            case 'GALA':
                return 'Gala / Formal: Vestido largo de gala y smoking o traje oscuro formal.';
            case 'ELEGANTE':
                return 'Elegante: Traje y corbata para ellos, vestido de cóctel o largo para ellas.';
            case 'SPORT_ELEGANTE':
                return 'Sport Elegante: Saco y camisa sin corbata para ellos, vestido corto o de día para ellas.';
            case 'CASUAL':
                return 'Casual: Ropa informal y cómoda para disfrutar relajados.';
            default:
                return 'Vestimenta formal sugerida.';
        }
    };

    const formattedDate = fecha_evento ? new Date(fecha_evento).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) : '';

    return (
        <div className="space-y-6">
            {/* Banner de Bienvenida */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 sm:p-10 text-center shadow-lg shadow-indigo-500/20">
                {/* Círculos decorativos flotantes de fondo */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-12 -translate-y-12" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-400/10 rounded-full blur-3xl translate-x-12 translate-y-12" />

                <div className="relative space-y-4">
                    {saludo && (
                        <div className="inline-flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-bold tracking-widest uppercase text-pink-200">
                                <Sparkles className="w-3.5 h-3.5" />
                                {saludo}
                            </span>
                        </div>
                    )}
                    {titulo && (
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            {titulo}
                        </h2>
                    )}
                    {mensaje_bienvenida && (
                        <p className="text-sm sm:text-base text-indigo-100 max-w-md mx-auto leading-relaxed font-medium">
                            {mensaje_bienvenida}
                        </p>
                    )}
                </div>
            </div>

            {/* Cuenta Regresiva */}
            {fecha_evento && (
                <div className="py-2">
                    <CountdownTimer fechaEvento={fecha_evento} />
                </div>
            )}

            {/* Detalles en Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fecha y Hora */}
                {fecha_evento && (
                    <div className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border flex gap-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <span className="text-xs text-muted uppercase font-semibold tracking-wider">Fecha y Hora</span>
                            <p className="font-extrabold text-gray-950 dark:text-white text-sm sm:text-base capitalize leading-snug">
                                {formattedDate}
                            </p>
                        </div>
                    </div>
                )}

                {/* Dress Code */}
                {dress_code_codigo && (
                    <div className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border flex gap-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <span className="text-xs text-muted uppercase font-semibold tracking-wider">Código de Vestimenta</span>
                            <p className="font-extrabold text-gray-950 dark:text-white text-sm sm:text-base leading-none mb-1">
                                {dress_code_codigo}
                            </p>
                            <p className="text-xs text-muted leading-relaxed font-medium">
                                {getDressCodeDesc(dress_code_codigo)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Organizador */}
                {usuario && (
                    <div className="sm:col-span-2 bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border flex gap-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <span className="text-xs text-muted uppercase font-semibold tracking-wider">Contacto Organizador</span>
                            <p className="font-extrabold text-gray-950 dark:text-white text-sm sm:text-base">
                                {usuario.nombre}
                            </p>
                            {usuario.email && (
                                <a
                                    href={`mailto:${usuario.email}`}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    {usuario.email}
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AgendaSeccion({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                No hay actividades cargadas en la agenda del evento.
            </div>
        );
    }

    const itemsOrdenados = [...data].sort((a, b) => a.orden - b.orden);

    const formatTime = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' hs';
    };

    return (
        <div className="space-y-6">
            <h4 className="font-bold text-gray-950 dark:text-white text-sm uppercase tracking-wider mb-2">
                Cronograma del Evento
            </h4>

            <div className="relative border-l-2 border-indigo-150 dark:border-indigo-950/50 ml-4 sm:ml-6 space-y-6 py-2">
                {itemsOrdenados.map((item, idx) => {
                    const timeStart = formatTime(item.fecha_hora_inicio);
                    const timeEnd = item.fecha_hora_fin ? formatTime(item.fecha_hora_fin) : null;
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        item.lugar + (item.direccion ? ', ' + item.direccion : '')
                    )}`;

                    return (
                        <div key={idx} className="relative pl-7 sm:pl-10 group">
                            {/* Dot */}
                            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-4 border-white dark:border-gray-950 bg-indigo-600 group-hover:scale-125 group-hover:bg-pink-500 transition-all duration-300 shadow-md shadow-indigo-600/20" />

                            <div className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border shadow-sm space-y-2 transition-all duration-300 group-hover:shadow-md group-hover:border-indigo-200 dark:group-hover:border-indigo-950/50 group-hover:scale-[1.01]">
                                {/* Hora */}
                                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                                    <span>
                                        {timeStart} {timeEnd ? ` - ${timeEnd}` : ''}
                                    </span>
                                </div>

                                {/* Nombre */}
                                <h5 className="text-base sm:text-lg font-black text-gray-950 dark:text-white leading-tight">
                                    {item.nombre}
                                </h5>

                                {/* Leyenda / Descripción */}
                                {item.leyenda_visible && (
                                    <p className="text-sm text-muted leading-relaxed font-medium">
                                        {item.leyenda_visible}
                                    </p>
                                )}

                                {/* Lugar */}
                                {item.lugar && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-gray-50 dark:border-card-border/30">
                                        <span className="flex items-center gap-1.5 text-xs text-muted font-bold min-w-0">
                                            <MapPin className="w-3.5 h-3.5 text-muted/80 shrink-0" />
                                            <span className="truncate">{item.lugar}</span>
                                        </span>
                                        <a
                                            href={mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            Ver ubicación
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function NovedadesSeccion({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                No hay comunicados o novedades para mostrar.
            </div>
        );
    }

    const novedadesOrdenadas = [...data].sort((a, b) => a.orden - b.orden);

    const getTipoBadge = (codigo: string) => {
        const cod = codigo?.toUpperCase();
        switch (cod) {
            case 'RECORDATORIO':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        Recordatorio
                    </span>
                );
            case 'UBICACION':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                        Ubicación
                    </span>
                );
            case 'GENERAL':
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Comunicado
                    </span>
                );
        }
    };

    const formatDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-950 dark:text-white text-sm uppercase tracking-wider mb-2">
                Novedades y Comunicados
            </h4>

            <div className="space-y-4">
                {novedadesOrdenadas.map((novedad, idx) => {
                    const isDestacada = novedad.destacada || novedad.importante;
                    return (
                        <div
                            key={idx}
                            className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${isDestacada
                                ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-2 border-amber-200 dark:border-amber-900/40 shadow-sm shadow-amber-500/5'
                                : 'bg-white dark:bg-card-bg border-gray-200 dark:border-card-border'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                                <div className="flex items-center gap-2">
                                    {getTipoBadge(novedad.tipo_codigo)}
                                    {isDestacada && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 uppercase tracking-wide">
                                            Importante
                                        </span>
                                    )}
                                </div>
                                {novedad.fecha_alta && (
                                    <span className="text-[10px] font-semibold text-muted">
                                        {formatDate(novedad.fecha_alta)}
                                    </span>
                                )}
                            </div>

                            {/* Titulo */}
                            <h5 className="text-base font-extrabold text-gray-950 dark:text-white mb-1.5 flex items-center gap-2">
                                {isDestacada && <Megaphone className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />}
                                {novedad.titulo}
                            </h5>

                            {/* Descripcion */}
                            <p className="text-sm text-muted leading-relaxed font-medium">
                                {novedad.descripcion}
                            </p>

                            {/* Adjunto */}
                            {novedad.url_adjunto && (
                                <div className="pt-2">
                                    <a
                                        href={novedad.url_adjunto}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Ver archivo adjunto
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RegalosSeccion({ data }: { data: any }) {
    const { addToast } = useToast();

    if (!data) return null;

    const {
        transferencias_habilitado,
        lista_habilitado,
        fondo_metas_habilitado,
        transferencias = [],
        lista = [],
        fondo = {},
        metas = [],
    } = data;

    // Determinar la sub-tab inicial basada en habilitadas
    const tabsHabilitadas: ('transferencias' | 'lista' | 'fondo')[] = [];
    if (transferencias_habilitado) tabsHabilitadas.push('transferencias');
    if (lista_habilitado) tabsHabilitadas.push('lista');
    if (fondo_metas_habilitado) tabsHabilitadas.push('fondo');

    const [subTab, setSubTab] = useState<'transferencias' | 'lista' | 'fondo'>(
        tabsHabilitadas[0] || 'transferencias'
    );

    useEffect(() => {
        const enabled: ('transferencias' | 'lista' | 'fondo')[] = [];
        if (transferencias_habilitado) enabled.push('transferencias');
        if (lista_habilitado) enabled.push('lista');
        if (fondo_metas_habilitado) enabled.push('fondo');
        
        if (enabled.length > 0 && !enabled.includes(subTab)) {
            setSubTab(enabled[0]);
        }
    }, [transferencias_habilitado, lista_habilitado, fondo_metas_habilitado, subTab]);

    const [copiedIndex, setCopiedIndex] = useState<{ [key: string]: boolean }>({});

    if (tabsHabilitadas.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                No hay opciones de regalos habilitadas para este evento.
            </div>
        );
    }

    const handleCopy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex((prev) => ({ ...prev, [key]: true }));
            addToast('Copiado al portapapeles', 'success');
            setTimeout(() => {
                setCopiedIndex((prev) => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (err) {
            addToast('Error al copiar', 'error');
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency || 'ARS',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Helper para parsear datos de transferencia
    const parseTransferText = (text: string) => {
        if (!text) return [];
        return text.split('\n').map((line) => {
            const parts = line.split(':');
            const label = parts[0]?.trim() || '';
            const value = parts.slice(1).join(':')?.trim() || '';
            return { label, value };
        }).filter(item => item.label && item.value);
    };

    return (
        <div className="space-y-6">
            {/* Tabs de Regalos */}
            <div className="flex p-1 bg-gray-100 dark:bg-black/35 rounded-2xl">
                {transferencias_habilitado && (
                    <button
                        type="button"
                        onClick={() => setSubTab('transferencias')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${subTab === 'transferencias'
                            ? 'bg-white dark:bg-card-bg text-indigo-600 dark:text-white shadow-sm'
                            : 'text-muted hover:text-gray-950 dark:hover:text-white'
                            }`}
                    >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        Transferencias
                    </button>
                )}
                {lista_habilitado && (
                    <button
                        type="button"
                        onClick={() => setSubTab('lista')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${subTab === 'lista'
                            ? 'bg-white dark:bg-card-bg text-indigo-600 dark:text-white shadow-sm'
                            : 'text-muted hover:text-gray-950 dark:hover:text-white'
                            }`}
                    >
                        <Gift className="w-4 h-4 shrink-0" />
                        Lista de Regalos
                    </button>
                )}
                {fondo_metas_habilitado && (
                    <button
                        type="button"
                        onClick={() => setSubTab('fondo')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${subTab === 'fondo'
                            ? 'bg-white dark:bg-card-bg text-indigo-600 dark:text-white shadow-sm'
                            : 'text-muted hover:text-gray-950 dark:hover:text-white'
                            }`}
                    >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        Luna de Miel
                    </button>
                )}
            </div>

            {/* Contenido de la Tab Activa */}
            <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. Transferencias */}
                {subTab === 'transferencias' && (
                    <div className="space-y-4">
                        {transferencias.map((tf: any, idx: number) => {
                            const parsedRows = parseTransferText(tf.datos_transferencia_texto);
                            return (
                                <div key={idx} className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border space-y-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-card-border pb-2.5">
                                        <h5 className="font-extrabold text-gray-955 dark:text-white text-base flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            {tf.titulo}
                                        </h5>
                                        <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg">
                                            {tf.codigo_moneda}
                                        </span>
                                    </div>

                                    {/* Campos copiables */}
                                    <div className="space-y-3">
                                        {parsedRows.length > 0 ? (
                                            parsedRows.map((row, rowIdx) => {
                                                const uniqueKey = `${idx}-${rowIdx}`;
                                                const isCopied = copiedIndex[uniqueKey];
                                                return (
                                                    <div key={rowIdx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-black/20 px-4 py-2.5 rounded-xl border border-gray-100/50 dark:border-card-border/40 gap-2">
                                                        <div className="min-w-0">
                                                            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">{row.label}</span>
                                                            <p className="font-bold text-gray-950 dark:text-white text-sm break-all font-mono">
                                                                {row.value}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(row.value, uniqueKey)}
                                                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shrink-0 border ${isCopied
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-950/50'
                                                                : 'bg-white dark:bg-card-bg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-black/10'
                                                                }`}
                                                        >
                                                            {isCopied ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    Copiado
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    Copiar
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-muted whitespace-pre-wrap">{tf.datos_transferencia_texto}</p>
                                        )}
                                    </div>

                                    {/* Instrucciones */}
                                    {tf.instrucciones && (
                                        <div className="flex gap-2 p-3 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/30 dark:border-indigo-950/20">
                                            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-muted leading-relaxed font-semibold">
                                                {tf.instrucciones}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 2. Lista de Regalos */}
                {subTab === 'lista' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {lista.map((item: any, idx: number) => {
                            const isDisponible = item.cantidad_disponible > 0;
                            return (
                                <div key={idx} className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h5 className="font-extrabold text-gray-955 dark:text-white text-base leading-tight">
                                                {item.titulo}
                                            </h5>
                                            {isDisponible ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 shrink-0">
                                                    Disponible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-950/30 dark:text-gray-400 shrink-0">
                                                    Reservado
                                                </span>
                                            )}
                                        </div>

                                        {item.descripcion && (
                                            <p className="text-xs text-muted leading-relaxed font-medium">
                                                {item.descripcion}
                                            </p>
                                        )}
                                    </div>

                                    {item.url_referencia && (
                                        <a
                                            href={item.url_referencia}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                                        >
                                            Ver referencia / link
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 3. Luna de Miel (Fondo) */}
                {subTab === 'fondo' && (
                    <div className="space-y-6">
                        {/* Intro Fondo */}
                        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 dark:border-indigo-950/50 p-6 rounded-2xl space-y-2">
                            <h5 className="font-black text-gray-950 dark:text-white text-lg flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                                {fondo.titulo || 'Fondo para el evento'}
                            </h5>
                            {fondo.descripcion_publica && (
                                <p className="text-sm text-muted leading-relaxed font-medium">
                                    {fondo.descripcion_publica}
                                </p>
                            )}
                        </div>

                        {/* Metas */}
                        <div className="space-y-4">
                            <h6 className="text-xs font-semibold text-muted uppercase tracking-wider">Nuestras metas:</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {metas.map((meta: any, idx: number) => {
                                    const progress = Math.min(meta.porcentaje || 0, 100);
                                    return (
                                        <div key={idx} className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border space-y-3 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                                            <div className="space-y-1">
                                                <h6 className="font-extrabold text-gray-955 dark:text-white text-base leading-tight">
                                                    {meta.titulo}
                                                </h6>
                                                {meta.descripcion && (
                                                    <p className="text-xs text-muted leading-relaxed font-medium">
                                                        {meta.descripcion}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Progreso */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="w-full h-2.5 bg-gray-100 dark:bg-black/35 rounded-full overflow-hidden">
                                                    <div
                                                        style={{ width: `${progress}%` }}
                                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                        {progress.toFixed(1)}% completado
                                                    </span>
                                                    <span className="font-bold text-gray-950 dark:text-white">
                                                        {formatCurrency(meta.total_confirmado, fondo.moneda_base)} / {formatCurrency(meta.objetivo_monto, fondo.moneda_base)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Nuevos Subcomponentes Especializados por Sección (Programas y Eventos)
// ─────────────────────────────────────────────────────────────────

function ServiciosSeccion({ data }: { data: any }) {
    if (!data) return null;

    const { inscripcion = {}, participantes = [] } = data;

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat(currency === 'EUR' ? 'es-ES' : 'es-AR', {
            style: 'currency',
            currency: currency || 'EUR',
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Resumen General de Inscripción */}
            {inscripcion.id_inscripcion && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            Resumen de Contratación
                        </span>
                        <h5 className="font-extrabold text-gray-900 dark:text-white text-base">
                            Responsable: {inscripcion.responsable}
                        </h5>
                        <p className="text-xs text-muted">
                            {inscripcion.responsable_email} {inscripcion.responsable_telefono ? `· ${inscripcion.responsable_telefono}` : ''}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-card-bg/60 border border-emerald-500/25 px-5 py-3 rounded-2xl text-center shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted block">Total General</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {formatPrice(inscripcion.total_general, inscripcion.moneda)}
                        </span>
                    </div>
                </div>
            )}

            {/* Listado de Participantes */}
            <div className="space-y-6">
                {participantes.map((part: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-card-bg p-6 rounded-3xl border border-gray-200 dark:border-card-border space-y-5 shadow-sm transition-all duration-300 hover:shadow-md">
                        {/* Nombre Participante */}
                        <div className="border-b border-gray-150 dark:border-card-border/50 pb-3 flex items-center justify-between gap-3">
                            <h5 className="font-black text-gray-900 dark:text-white text-lg">
                                {part.participante}
                            </h5>
                            <span className="px-2.5 py-0.5 text-[9px] font-black bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 rounded-full uppercase tracking-wider">
                                Participante #{part.id_invitado}
                            </span>
                        </div>

                        {/* Períodos / Semanas */}
                        {part.periodos && part.periodos.length > 0 && (
                            <div className="space-y-2">
                                <h6 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                    Períodos / Semanas
                                </h6>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {part.periodos.map((per: any, perIdx: number) => (
                                        <div key={perIdx} className="bg-neutral-50 dark:bg-black/15 p-3 rounded-xl border border-gray-100 dark:border-card-border/40 flex justify-between items-center gap-3 text-xs">
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-955 dark:text-white truncate">{per.nombre}</p>
                                                <p className="text-[10px] text-muted mt-0.5">
                                                    {formatFecha(per.fecha_desde)} al {formatFecha(per.fecha_hasta)}
                                                </p>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white shrink-0">
                                                {formatPrice(per.precio_base, per.moneda)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Servicios Adicionales */}
                        {part.servicios && part.servicios.length > 0 && (
                            <div className="space-y-2.5">
                                <h6 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                                    <Gift className="w-3.5 h-3.5 text-indigo-500" />
                                    Servicios Adicionales
                                </h6>
                                <div className="divide-y divide-gray-100 dark:divide-card-border/40 bg-neutral-50 dark:bg-black/15 rounded-2xl border border-gray-100 dark:border-card-border/40 overflow-hidden">
                                    {part.servicios.map((srv: any, srvIdx: number) => (
                                        <div key={srvIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-neutral-100/40 dark:hover:bg-black/5 transition-colors">
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-955 dark:text-white">
                                                    {srv.nombre}
                                                    {srv.tipo_calculo === 'POR_DIA' && (
                                                        <span className="ml-2 px-1.5 py-0.5 text-[8px] font-bold rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                                                            Por Día ({srv.cantidad_calculada})
                                                        </span>
                                                    )}
                                                </p>
                                                {srv.fechas && srv.fechas.length > 0 && (
                                                    <p className="text-[10px] text-muted flex flex-wrap gap-1">
                                                        Fechas: {srv.fechas.map((f: string) => formatFecha(f)).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-extrabold text-gray-955 dark:text-white">
                                                    {formatPrice(srv.subtotal, srv.moneda)}
                                                </p>
                                                <p className="text-[10px] text-muted">
                                                    {formatPrice(srv.precio, srv.moneda)} c/u
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Restricciones Alimentarias */}
                        {part.restricciones_alimentarias && part.restricciones_alimentarias.length > 0 && (
                            <div className="space-y-2">
                                <h6 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                                    <ChefHat className="w-3.5 h-3.5 text-rose-500" />
                                    Restricciones Alimentarias / Alergias
                                </h6>
                                <div className="space-y-2">
                                    {part.restricciones_alimentarias.map((rest: any, restIdx: number) => (
                                        <div key={restIdx} className={`p-3.5 rounded-xl border flex gap-3 text-xs ${
                                            rest.requiere_alerta_visual
                                                ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                                : 'bg-neutral-50 dark:bg-black/15 border-gray-150 dark:border-card-border/40 text-muted'
                                        }`}>
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-extrabold text-gray-900 dark:text-white">
                                                    {rest.texto}
                                                    <span className="ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-background border">
                                                        {rest.categoria}
                                                    </span>
                                                </p>
                                                {rest.observaciones && (
                                                    <p className="text-[10px] mt-1 leading-relaxed italic opacity-90">
                                                        Observaciones: {rest.observaciones}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {participantes.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                        No hay participantes inscritos asociados a esta cuenta.
                    </div>
                )}
            </div>
        </div>
    );
}

function ParticipantesSeccion({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                No hay integrantes o participantes para mostrar.
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-955 dark:text-white text-sm uppercase tracking-wider">
                Integrantes del Grupo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.map((part, idx) => (
                    <div key={idx} className="bg-white dark:bg-card-bg p-5 rounded-2xl border border-gray-200 dark:border-card-border flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-extrabold text-sm">
                            {part.nombre ? part.nombre[0].toUpperCase() : 'P'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-950 dark:text-white truncate">{part.nombre} {part.apellido || ''}</p>
                            <p className="text-xs text-muted truncate">{part.tipo_acceso || 'Participante'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TransporteSeccion({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="bg-white dark:bg-card-bg p-6 rounded-3xl border border-gray-200 dark:border-card-border space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Bus className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-extrabold text-gray-950 dark:text-white text-base">Traslados y Transporte</h4>
                    <p className="text-xs text-muted">Información sobre coordinaciones y rutas de traslado.</p>
                </div>
            </div>
            <div className="bg-neutral-50 dark:bg-black/15 p-4 rounded-2xl text-xs space-y-3 leading-relaxed text-muted">
                {data.colectivo_ruta && <p><strong>Ruta / Colectivo:</strong> {data.colectivo_ruta}</p>}
                {data.horario_salida && <p><strong>Horario Salida:</strong> {data.horario_salida} hs</p>}
                {data.punto_encuentro && <p><strong>Punto de Encuentro:</strong> {data.punto_encuentro}</p>}
                {data.observaciones && <p className="italic">Nota: {data.observaciones}</p>}
                {!data.colectivo_ruta && <p className="italic text-center py-4">No se ha asignado una ruta de transporte para tu grupo.</p>}
            </div>
        </div>
    );
}

function FotosSeccion({ data }: { data: any }) {
    return (
        <div className="bg-white dark:bg-card-bg p-6 rounded-3xl border border-gray-200 dark:border-card-border space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-extrabold text-gray-955 dark:text-white text-base">Álbum de Fotos</h4>
                    <p className="text-xs text-muted">Reviví los mejores momentos y compartí tus capturas.</p>
                </div>
            </div>
            <div className="p-8 text-center text-sm text-muted bg-neutral-50 dark:bg-black/15 rounded-2xl border border-gray-100 dark:border-card-border/40">
                <p>Las fotos del evento estarán disponibles una vez finalizado o durante la jornada.</p>
            </div>
        </div>
    );
}

function SaludAccionesSeccion({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                No hay novedades o registros de enfermería para el día de hoy.
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-955 dark:text-white text-sm uppercase tracking-wider">
                Bitácora de Enfermería y Alertas
            </h4>
            <div className="space-y-3">
                {data.map((log, idx) => (
                    <div key={idx} className="bg-white dark:bg-card-bg p-4 rounded-xl border border-rose-500/10 flex gap-3 text-xs">
                        <HeartPulse className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{log.tipo_registro || 'Control Médico'}</p>
                            <p className="text-muted mt-0.5 leading-relaxed">{log.descripcion || log.observacion}</p>
                            <span className="text-[10px] text-muted block mt-1">Registrado el {new Date(log.fecha).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponente Principal: Visualizadores de datos por sección
// ─────────────────────────────────────────────────────────────────

interface ContenidoSeccionProps {
    seccion: SeccionHabilitada;
    desbloqueado: boolean;
    data: any;
    onDesbloquear: () => void;
}

function ContenidoSeccion({ seccion, desbloqueado, data, onDesbloquear }: ContenidoSeccionProps) {
    const isSensible = seccion.requiere_desbloqueo;
    const isBloqueada = isSensible && !desbloqueado;

    if (isBloqueada) {
        return (
            <div className="bg-white dark:bg-card-bg rounded-2xl border border-gray-200 dark:border-card-border p-8 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/10 text-amber-500 flex items-center justify-center">
                    <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Contenido Protegido
                </h3>
                <p className="text-sm text-muted max-w-sm">
                    Para visualizar la información confidencial de esta pestaña ({seccion.titulo}), valida tu identidad como responsable del grupo familiar.
                </p>
                <button
                    onClick={onDesbloquear}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm shadow-sm"
                >
                    <ShieldCheck className="w-4 h-4" />
                    Validar identidad
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-muted flex items-center justify-center">
                    {getSeccionIcono(seccion.codigo)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        Sin datos disponibles
                    </h3>
                    <p className="text-xs text-muted max-w-xs mt-1">
                        El contenido de esta sección no se encuentra cargado todavía.
                    </p>
                </div>
            </div>
        );
    }

    // Renderizar según sección
    const codigoUpper = seccion.codigo.toUpperCase();

    if (codigoUpper === 'RESUMEN') {
        return <ResumenSeccion data={data} />;
    }

    if (codigoUpper === 'AGENDA') {
        return <AgendaSeccion data={data} />;
    }

    if (codigoUpper === 'NOVEDADES') {
        return <NovedadesSeccion data={data} />;
    }

    if (codigoUpper === 'REGALOS') {
        return <RegalosSeccion data={data} />;
    }

    if (codigoUpper === 'SERVICIOS') {
        return <ServiciosSeccion data={data} />;
    }

    if (codigoUpper === 'PARTICIPANTES' || codigoUpper === 'INTEGRANTES') {
        return <ParticipantesSeccion data={data} />;
    }

    if (codigoUpper === 'TRANSPORTE') {
        return <TransporteSeccion data={data} />;
    }

    if (codigoUpper === 'FOTOS') {
        return <FotosSeccion data={data} />;
    }

    if (codigoUpper === 'SALUD_ACCIONES') {
        return <SaludAccionesSeccion data={data} />;
    }

    if (codigoUpper === 'PAGOS') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                        Estado de Pagos
                    </h4>
                    {data.saldo_pendiente != null && (
                        <div className="text-sm">
                            Saldo pendiente:{' '}
                            <span className={`font-bold ${data.saldo_pendiente > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(data.saldo_pendiente)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border overflow-hidden">
                    {data.transacciones && data.transacciones.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-card-border">
                            {data.transacciones.map((t: any, index: number) => (
                                <div key={index} className="p-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{t.concepto || 'Pago recibido'}</p>
                                        <p className="text-xs text-muted mt-0.5">{t.fecha ? formatFecha(t.fecha) : ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(t.monto)}
                                        </p>
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${t.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
                                            }`}>
                                            {t.estado}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted">
                            No se registran transacciones de pago.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (codigoUpper === 'SALUD' || codigoUpper === 'FICHAS_MEDICAS') {
        return (
            <div className="space-y-6">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                    Ficha Médica de Participantes
                </h4>

                {Array.isArray(data) ? (
                    <div className="space-y-4">
                        {data.map((ficha: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-card-border space-y-4">
                                <div className="border-b border-gray-200 dark:border-card-border pb-2">
                                    <p className="font-black text-base text-indigo-600 dark:text-indigo-400">{ficha.nombre_completo}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted font-semibold uppercase">Grupo Sanguíneo</span>
                                        <p className="font-bold text-gray-900 dark:text-white mt-0.5">{ficha.grupo_sanguineo || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted font-semibold uppercase">Obra Social / Prepaga</span>
                                        <p className="font-bold text-gray-900 dark:text-white mt-0.5">{ficha.obra_social || 'No especificada'}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="text-xs text-muted font-semibold uppercase">Alergias o Restricciones</span>
                                        <p className="font-bold text-gray-900 dark:text-white mt-0.5">{ficha.alergias || 'Ninguna declarada'}</p>
                                    </div>
                                    {ficha.contacto_emergencia && (
                                        <div className="sm:col-span-2 bg-indigo-50/30 dark:bg-indigo-950/5 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-950/20">
                                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Contacto de Emergencia</span>
                                            <p className="font-bold text-gray-900 dark:text-white mt-1">
                                                {ficha.contacto_emergencia.nombre} ({ficha.contacto_emergencia.relacion}) · {ficha.contacto_emergencia.telefono}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-card-border text-sm space-y-2">
                        <p><strong>Grupo Sanguíneo:</strong> {data.grupo_sanguineo || 'No especificado'}</p>
                        <p><strong>Alergias/Medicamentos:</strong> {data.alergias || 'Ninguno'}</p>
                        <p><strong>Obra Social:</strong> {data.obra_social || 'No especificada'}</p>
                        {data.contacto_nombre && (
                            <p><strong>Contacto de Emergencia:</strong> {data.contacto_nombre} ({data.contacto_telefono})</p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (codigoUpper === 'AUTORIZACIONES' || codigoUpper === 'RETIROS' || codigoUpper === 'QRSRETIRO') {
        const qrs = Array.isArray(data) ? data : (data.qrs || []);
        return (
            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                    Personas Autorizadas para Retiro
                </h4>

                {qrs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {qrs.map((qr: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-card-border flex flex-col justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-white">{qr.nombre_autorizado}</p>
                                    <p className="text-xs text-muted flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {qr.telefono_autorizado} {qr.relacion && `· ${qr.relacion}`}
                                    </p>
                                </div>

                                {qr.qr_token && (
                                    <div className="flex flex-col items-center gap-3 bg-white dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-card-border/60">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qr.qr_token)}`}
                                            alt={`QR para ${qr.nombre_autorizado}`}
                                            className="w-32 h-32 object-contain"
                                        />
                                        <a
                                            href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr.qr_token)}&format=png`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                                        >
                                            <QrCode className="w-3.5 h-3.5" />
                                            Ver Pantalla Completa
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-card-border">
                        No hay personas adicionales autorizadas registradas.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                Detalle de {seccion.titulo}
            </h4>
            <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-card-border text-sm">
                <pre className="font-mono text-xs whitespace-pre-wrap overflow-x-auto text-muted">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Página principal: Portal Puntual
// ─────────────────────────────────────────────────────────────────

export default function PortalPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = use(params);
    const router = useRouter();

    const [portalData, setPortalData] = useState<PortalPuntualResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seccionPendiente, setSeccionPendiente] = useState<SeccionHabilitada | null>(null);
    const [seccionActiva, setSeccionActiva] = useState<SeccionHabilitada | null>(null);

    const cargarPortal = useCallback(async (silent: boolean = false) => {
        if (!silent) setIsLoading(true);
        setError(null);
        try {
            const data = await getPortalPuntual(token);
            setPortalData(data);

            // Elegir tab por defecto al cargar si no hay una seleccionada
            if (data.secciones && data.secciones.length > 0) {
                const ordenadas = [...data.secciones].sort((a, b) => a.orden - b.orden);
                setSeccionActiva(prev => {
                    if (prev) {
                        // Intentar mantener la misma si sigue disponible
                        const coincidencia = ordenadas.find(x => x.codigo === prev.codigo);
                        return coincidencia || ordenadas[0];
                    }
                    return ordenadas[0];
                });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al cargar el portal';
            setError(msg);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        cargarPortal();
    }, [cargarPortal]);

    const handleDesbloqueoExitoso = () => {
        setModalAbierto(false);
        setSeccionPendiente(null);
        // Refrescar el portal automáticamente tras desbloquear
        cargarPortal(true);
    };

    const triggerDesbloqueo = (seccion?: SeccionHabilitada) => {
        if (seccion) setSeccionPendiente(seccion);
        setModalAbierto(true);
    };

    // ── Carga inicial pública ──────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Cargando portal</p>
                    <p className="text-muted text-sm mt-1">Obteniendo información del evento...</p>
                </div>
            </div>
        );
    }

    if (error || !portalData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-6 px-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center max-w-sm">
                    <h2 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
                        Portal no encontrado
                    </h2>
                    <p className="text-muted text-sm leading-relaxed">
                        {error ?? 'El link de acceso no es válido o expiró. Verificá el email recibido.'}
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-muted hover:text-gray-900 dark:hover:text-white bg-white dark:bg-card-bg border border-gray-200 dark:border-card-border rounded-xl transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </button>
            </div>
        );
    }

    const { evento, usuario, requiere_desbloqueo_sensible, desbloqueado_sensible, secciones, data } = portalData;
    const seccionesOrdenadas = [...secciones].sort((a, b) => a.orden - b.orden);

    // Obtener los datos mapeados para la sección activa
    const getActiveData = () => {
        if (!seccionActiva) return null;
        const cod = seccionActiva.codigo.toLowerCase();
        if (cod === 'autorizaciones' || cod === 'retiros' || cod === 'qrsretiro' || cod === 'qrs_retiro') {
            return data.qrsRetiro;
        }
        if (cod === 'fichas_medicas' || cod === 'salud') {
            return data.salud;
        }
        if (cod === 'salud_acciones' || cod === 'saludacciones') {
            return data.saludAcciones ?? data.salud_acciones;
        }
        return data[cod as keyof typeof data];
    };

    return (
        <>
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">

                {/* ── Header del evento (público) ────────────────────── */}
                <div className="bg-white dark:bg-card-bg border-b border-gray-200 dark:border-card-border">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

                        {/* Navegación */}
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                            {/* Logo del evento */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                {evento.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={evento.logo_url}
                                        alt={evento.nombre}
                                        className="w-14 h-14 object-contain rounded-xl"
                                    />
                                ) : (
                                    <Sparkles className="w-8 h-8 text-white" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                        {evento.nombre}
                                    </h1>
                                    <EstadoBadge estado={evento.estado} />
                                </div>

                                {/* Fechas */}
                                {(evento.fecha_inicio || evento.fecha_fin) && (
                                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                                        {evento.fecha_inicio && evento.fecha_fin && formatFecha(evento.fecha_inicio) === formatFecha(evento.fecha_fin) ? (
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 shrink-0 text-indigo-500" />
                                                {formatFecha(evento.fecha_inicio)}
                                            </span>
                                        ) : (
                                            <>
                                                {evento.fecha_inicio && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 shrink-0" />
                                                        Inicio: {formatFecha(evento.fecha_inicio)}
                                                    </span>
                                                )}
                                                {evento.fecha_fin && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 shrink-0" />
                                                        Fin: {formatFecha(evento.fecha_fin)}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Cuerpo principal ─────────────────────────────────── */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* Banner Global si requiere desbloqueo sensible */}
                    {requiere_desbloqueo_sensible && !desbloqueado_sensible && (
                        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                                        Datos Sensibles Ocultos
                                    </p>
                                    <p className="text-xs text-muted max-w-md leading-relaxed">
                                        Para visualizar la información de Salud, Autorizaciones y códigos QR de retiro, valida tu identidad mediante el código OTP.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => triggerDesbloqueo()}
                                className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Validar ahora
                            </button>
                        </div>
                    )}

                    {/* Tabs y Secciones */}
                    <div className="bg-white dark:bg-card-bg rounded-3xl border border-gray-200 dark:border-card-border shadow-sm overflow-hidden">
                        {/* Pestañas */}
                        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-card-border">
                            {seccionesOrdenadas.map(sec => {
                                const locked = sec.requiere_desbloqueo && !desbloqueado_sensible;
                                return (
                                    <button
                                        key={sec.codigo}
                                        onClick={() => setSeccionActiva(sec)}
                                        className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 shrink-0 ${seccionActiva?.codigo === sec.codigo
                                            ? 'border-indigo-600 text-indigo-600 dark:text-white'
                                            : 'border-transparent text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-black/10'
                                            }`}
                                    >
                                        {getSeccionIcono(sec.codigo)}
                                        <span>{sec.titulo}</span>
                                        {locked && (
                                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Contenedor del contenido */}
                        <div className="p-6">
                            {seccionActiva ? (
                                <ContenidoSeccion
                                    seccion={seccionActiva}
                                    desbloqueado={desbloqueado_sensible}
                                    data={getActiveData()}
                                    onDesbloquear={() => triggerDesbloqueo(seccionActiva)}
                                />
                            ) : (
                                <p className="text-sm text-muted text-center py-12">
                                    Selecciona una pestaña del menú para visualizar los detalles.
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* ── Modal OTP ── */}
            {modalAbierto && (
                <ModalOtp
                    tokenConsulta={token}
                    emailUsuario={usuario.email}
                    seccionNombre={seccionPendiente?.titulo}
                    onVerificado={handleDesbloqueoExitoso}
                    onCerrar={() => { setModalAbierto(false); setSeccionPendiente(null); }}
                />
            )}
        </>
    );
}
