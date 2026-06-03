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
    const d = new Date(iso + 'T00:00:00');
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
                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                                    canal === 'EMAIL'
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
                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                                    canal === 'WHATSAPP'
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
// Subcomponente: Visualizadores de datos por sección
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
        const entries = Object.entries(data || {});
        return (
            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                    Información General
                </h4>
                {entries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {entries.map(([key, val]: [string, any]) => (
                            <div key={key} className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-card-border">
                                <span className="text-xs text-muted uppercase font-semibold">{key.replace(/_/g, ' ')}</span>
                                <p className="font-bold text-gray-900 dark:text-white text-sm mt-1">{String(val)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-card-bg rounded-2xl border border-dashed border-gray-200 dark:border-card-border p-8 text-center">
                        <p className="text-sm text-muted">No hay detalles de información general adicionales cargados para este evento.</p>
                    </div>
                )}
            </div>
        );
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
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                            t.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
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
        if (cod === 'autorizaciones' || cod === 'retiros' || cod === 'qrsretiro') {
            return data.qrsRetiro;
        }
        if (cod === 'fichas_medicas' || cod === 'salud') {
            return data.salud;
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
                                        className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                                            seccionActiva?.codigo === sec.codigo
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
