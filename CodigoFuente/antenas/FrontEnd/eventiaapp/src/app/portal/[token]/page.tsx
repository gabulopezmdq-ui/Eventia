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
} from 'lucide-react';
import {
    getPortalPublico,
    getPortalDashboard,
    verificarEmailPortal,
    guardarJwtPortalPuntual,
    obtenerJwtPortalPuntual,
    type PortalPublicoResponse,
    type PortalDashboardResponse,
    type SeccionHabilitada,
} from '@/src/features/portal/portal.service';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Devuelve el ícono correspondiente al código de sección */
function getSeccionIcono(codigo: string) {
    switch (codigo?.toUpperCase()) {
        case 'INTEGRANTES':
            return <Users className="w-5 h-5" />;
        case 'AUTORIZACIONES':
        case 'FICHAS_MEDICAS':
        case 'SALUD':
            return <HeartPulse className="w-5 h-5" />;
        case 'DOCUMENTOS':
            return <FileText className="w-5 h-5" />;
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
// Subcomponente: Modal de Soft Verification
// ─────────────────────────────────────────────────────────────────

interface ModalVerificacionProps {
    onVerificado: (jwt: string) => void;
    onCerrar: () => void;
    tokenConsulta: string;
    seccionNombre?: string;
}

function ModalVerificacion({ onVerificado, onCerrar, tokenConsulta, seccionNombre }: ModalVerificacionProps) {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [intentos, setIntentos] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailTrimmed = email.trim().toLowerCase();

        if (!emailTrimmed || !emailTrimmed.includes('@')) {
            setError('Por favor ingresá un email válido.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const resultado = await verificarEmailPortal(tokenConsulta, emailTrimmed);
            onVerificado(resultado.token);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Email incorrecto. Intentá nuevamente.';
            setError(msg);
            setIntentos(i => i + 1);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            {/* Panel del modal */}
            <div className="w-full max-w-md bg-white dark:bg-card-bg rounded-3xl shadow-2xl border border-gray-200 dark:border-card-border animate-in zoom-in-95 fade-in duration-200">

                {/* Cabecera */}
                <div className="relative p-6 pb-0">
                    <button
                        id="btn-cerrar-modal-verificacion"
                        onClick={onCerrar}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Ícono */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shadow-lg shadow-accent/30 mb-5">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                        Verificación de identidad
                    </h2>
                    <p className="text-sm text-muted leading-relaxed">
                        Para acceder a{' '}
                        <strong className="text-gray-900 dark:text-white">
                            {seccionNombre ?? 'esta sección'}
                        </strong>
                        , ingresá el email del responsable que se registró en la inscripción.
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="input-email-verificacion"
                            className="text-xs font-semibold text-muted uppercase tracking-wider"
                        >
                            Email del responsable
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            <input
                                id="input-email-verificacion"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                placeholder="responsable@example.com"
                                autoComplete="email"
                                autoFocus
                                className="w-full pl-10 pr-4 py-3.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-card-border rounded-xl text-gray-900 dark:text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">{error}</p>
                                {intentos >= 2 && (
                                    <p className="text-xs mt-1 opacity-75">
                                        Revisá que el email sea el mismo con el que realizaste la inscripción.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botón verificar */}
                    <button
                        id="btn-verificar-email"
                        type="submit"
                        disabled={submitting || !email.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent hover:bg-accent/90 active:scale-[0.98] text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                        ) : (
                            <><ShieldCheck className="w-4 h-4" /> Verificar y acceder</>
                        )}
                    </button>

                    <p className="text-xs text-center text-muted">
                        La sesión se mantiene activa durante 24 horas en este dispositivo.
                    </p>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponente: Panel protegido (secciones)
// ─────────────────────────────────────────────────────────────────

interface PanelProtegidoProps {
    dashboard: PortalDashboardResponse;
    onSeccionBloqueada: (seccion: SeccionHabilitada) => void;
}

function PanelProtegido({ dashboard, onSeccionBloqueada }: PanelProtegidoProps) {
    const [seccionActiva, setSeccionActiva] = useState<SeccionHabilitada | null>(
        dashboard.secciones_habilitadas[0] ?? null
    );

    const seccionesOrdenadas = [...dashboard.secciones_habilitadas].sort((a, b) => a.orden - b.orden);

    return (
        <div className="mt-6 space-y-4">
            {/* Saludo al responsable */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        Identidad verificada
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                        Bienvenido/a,{' '}
                        <strong>
                            {dashboard.participante.nombre_responsable} {dashboard.participante.apellido_responsable}
                        </strong>
                    </p>
                </div>
            </div>

            {/* Tabs de secciones */}
            <div className="bg-white dark:bg-card-bg rounded-2xl border border-gray-200 dark:border-card-border shadow-sm overflow-hidden">
                {/* Navegación de tabs */}
                <div className="flex overflow-x-auto border-b border-gray-200 dark:border-card-border">
                    {seccionesOrdenadas.map(sec => (
                        <button
                            key={sec.codigo}
                            id={`tab-seccion-${sec.codigo.toLowerCase()}`}
                            onClick={() => setSeccionActiva(sec)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                                seccionActiva?.codigo === sec.codigo
                                    ? 'border-accent text-accent'
                                    : 'border-transparent text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black/10'
                            }`}
                        >
                            {getSeccionIcono(sec.codigo)}
                            {sec.titulo}
                        </button>
                    ))}
                </div>

                {/* Contenido de la sección activa */}
                <div className="p-6">
                    {seccionActiva ? (
                        <ContenidoSeccion
                            seccion={seccionActiva}
                            onBloqueado={() => onSeccionBloqueada(seccionActiva)}
                        />
                    ) : (
                        <p className="text-sm text-muted text-center py-8">
                            Seleccioná una sección para ver su contenido.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponente: Contenido por sección (placeholder extensible)
// ─────────────────────────────────────────────────────────────────

function ContenidoSeccion({ seccion, onBloqueado }: { seccion: SeccionHabilitada; onBloqueado: () => void }) {
    // Este componente está preparado para recibir datos reales de cada sección
    // según se expandan los endpoints del backend (ej: GET /api/portal/integrantes, etc.)
    // Por ahora muestra la información de la sección de forma estructurada.

    const iconoSeccion = getSeccionIcono(seccion.codigo);

    return (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                {iconoSeccion}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    {seccion.titulo}
                </h3>
                <p className="text-sm text-muted max-w-xs">
                    El contenido de esta sección estará disponible próximamente. 
                    Podés comunicarte con la organización del evento para más información.
                </p>
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

    // ── Estados ──────────────────────────────────────────────────
    const [infoPublica, setInfoPublica] = useState<PortalPublicoResponse | null>(null);
    const [dashboard, setDashboard] = useState<PortalDashboardResponse | null>(null);

    const [isLoadingPublico, setIsLoadingPublico] = useState(true);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

    const [errorPublico, setErrorPublico] = useState<string | null>(null);
    const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [seccionPendiente, setSeccionPendiente] = useState<SeccionHabilitada | null>(null);
    const [jwtActivo, setJwtActivo] = useState<string | null>(null);

    // ── Carga inicial pública ──────────────────────────────────────
    useEffect(() => {
        async function cargarPublico() {
            setIsLoadingPublico(true);
            setErrorPublico(null);
            try {
                const data = await getPortalPublico(token);
                setInfoPublica(data);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Error al cargar el portal';
                setErrorPublico(msg);
            } finally {
                setIsLoadingPublico(false);
            }
        }
        cargarPublico();
    }, [token]);

    // ── Verificar JWT en sessionStorage al cargar ─────────────────
    useEffect(() => {
        const jwt = obtenerJwtPortalPuntual(token);
        if (jwt) {
            setJwtActivo(jwt);
        }
    }, [token]);

    // ── Cargar dashboard cuando hay JWT activo ─────────────────────
    const cargarDashboard = useCallback(async (jwtParam?: string) => {
        const jwtToUse = jwtParam ?? jwtActivo;
        if (!jwtToUse) return;

        setIsLoadingDashboard(true);
        setErrorDashboard(null);
        try {
            const data = await getPortalDashboard(token);
            setDashboard(data);
        } catch (err: any) {
            if (err?.code === 'SESSION_EXPIRED') {
                // JWT expirado → limpiar y mostrar modal
                setJwtActivo(null);
                setDashboard(null);
                setModalAbierto(true);
            } else {
                const msg = err instanceof Error ? err.message : 'Error al cargar el dashboard';
                setErrorDashboard(msg);
            }
        } finally {
            setIsLoadingDashboard(false);
        }
    }, [token, jwtActivo]);

    useEffect(() => {
        if (jwtActivo) {
            cargarDashboard(jwtActivo);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jwtActivo]);

    // ── Callback: verificación exitosa ────────────────────────────
    const handleVerificado = useCallback((jwt: string) => {
        guardarJwtPortalPuntual(token, jwt);
        setJwtActivo(jwt);
        setModalAbierto(false);
        setSeccionPendiente(null);
        cargarDashboard(jwt);
    }, [token, cargarDashboard]);

    // ── Callback: sección bloqueada (requiere verificación) ───────
    const handleSeccionBloqueada = useCallback((seccion: SeccionHabilitada) => {
        setSeccionPendiente(seccion);
        setModalAbierto(true);
    }, []);

    // ── Estados de carga / error ─────────────────────────────────
    if (isLoadingPublico) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Cargando portal</p>
                    <p className="text-muted text-sm mt-1">Obteniendo información del evento...</p>
                </div>
            </div>
        );
    }

    if (errorPublico || !infoPublica) {
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
                        {errorPublico ?? 'El link de acceso no es válido o expiró. Verificá el email recibido.'}
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

    const { evento } = infoPublica;

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
                            {/* Logo o ícono del evento */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

                    {/* ── Sin JWT: Banner de acceso protegido ──────────── */}
                    {!jwtActivo && !isLoadingDashboard && (
                        <div className="bg-white dark:bg-card-bg rounded-2xl border border-gray-200 dark:border-card-border shadow-sm p-8 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-5">
                                <Lock className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                                Acceder a la información del evento
                            </h2>
                            <p className="text-sm text-muted max-w-sm mx-auto mb-6 leading-relaxed">
                                Para ver los detalles, fichas médicas y autorizaciones de los participantes, 
                                necesitamos verificar tu identidad como responsable de la inscripción.
                            </p>

                            <button
                                id="btn-abrir-verificacion"
                                onClick={() => setModalAbierto(true)}
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent/90 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Verificar identidad
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <p className="text-xs text-muted mt-4">
                                Ingresá el email con el que realizaste la inscripción
                            </p>
                        </div>
                    )}

                    {/* ── Cargando dashboard ────────────────────────────── */}
                    {isLoadingDashboard && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="w-7 h-7 text-accent animate-spin" />
                            <p className="text-sm text-muted">Cargando información del evento...</p>
                        </div>
                    )}

                    {/* ── Error de dashboard ────────────────────────────── */}
                    {errorDashboard && !isLoadingDashboard && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 rounded-2xl p-5 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                    Error al cargar el dashboard
                                </p>
                                <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-0.5">
                                    {errorDashboard}
                                </p>
                            </div>
                            <button
                                onClick={() => cargarDashboard()}
                                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* ── Dashboard protegido (con JWT válido) ─────────── */}
                    {dashboard && !isLoadingDashboard && (
                        <PanelProtegido
                            dashboard={dashboard}
                            onSeccionBloqueada={handleSeccionBloqueada}
                        />
                    )}

                </div>
            </main>

            {/* ── Modal de Soft Verification (fuera del main para z-index) ── */}
            {modalAbierto && (
                <ModalVerificacion
                    tokenConsulta={token}
                    seccionNombre={seccionPendiente?.titulo}
                    onVerificado={handleVerificado}
                    onCerrar={() => { setModalAbierto(false); setSeccionPendiente(null); }}
                />
            )}
        </>
    );
}
