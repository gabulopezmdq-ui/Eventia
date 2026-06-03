'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    User,
    Mail,
    Phone,
    Calendar,
    ArrowRight,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Sparkles,
    ExternalLink,
    CheckCircle2,
    Clock,
    BookOpen,
} from 'lucide-react';
import {
    getMiEventia,
    obtenerTokenPortal,
    type MiEventiaResponse,
    type PortalAccesoItem,
} from '@/src/features/portal/portal.service';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function getEstadoBadge(estado: string) {
    const normalizado = estado?.toUpperCase();
    switch (normalizado) {
        case 'ACTIVO':
            return {
                label: 'Activo',
                className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                dot: 'bg-emerald-500',
            };
        case 'FINALIZADO':
            return {
                label: 'Finalizado',
                className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                dot: 'bg-gray-400',
            };
        case 'INACTIVO':
            return {
                label: 'Inactivo',
                className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                dot: 'bg-amber-500',
            };
        default:
            return {
                label: estado ?? 'Desconocido',
                className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                dot: 'bg-gray-400',
            };
    }
}

function getTipoIcono(tipo: string) {
    switch (tipo?.toUpperCase()) {
        case 'PROGRAMA':
            return <BookOpen className="w-5 h-5" />;
        case 'EVENTO':
            return <Calendar className="w-5 h-5" />;
        default:
            return <Sparkles className="w-5 h-5" />;
    }
}

// ─────────────────────────────────────────────────────────────────
// Subcomponente: Tarjeta de Acceso
// ─────────────────────────────────────────────────────────────────

function TarjetaAcceso({ item, onNavegar }: { item: PortalAccesoItem; onNavegar: () => void }) {
    const badge = getEstadoBadge(item.estado);

    return (
        <div className="group bg-white dark:bg-card-bg rounded-2xl border border-gray-200 dark:border-card-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            {/* Franja superior de color por tipo */}
            <div className="h-1 bg-gradient-to-r from-accent to-violet-500" />

            <div className="p-6">
                {/* Cabecera: tipo + estado */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                        {getTipoIcono(item.tipo)}
                    </div>

                    {/* Badge de estado */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                    </span>
                </div>

                {/* Título del evento */}
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1 line-clamp-2">
                    {item.titulo}
                </h3>

                {/* Tipo de acceso */}
                <p className="text-xs text-muted uppercase tracking-wider font-medium mb-5">
                    {item.tipo === 'PROGRAMA' ? 'Programa / Colonia' : item.tipo}
                </p>

                {/* Token de consulta (referencia) */}
                <div className="bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 mb-5">
                    <p className="text-xs text-muted font-mono truncate" title={item.tokenConsulta}>
                        Ref: {item.tokenConsulta}
                    </p>
                </div>

                {/* CTA */}
                <button
                    id={`btn-portal-${item.tokenConsulta}`}
                    onClick={onNavegar}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 active:scale-[0.98] text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
                >
                    <ExternalLink className="w-4 h-4" />
                    Ingresar al Portal
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Página principal: Mi-Eventia
// ─────────────────────────────────────────────────────────────────

export default function MiEventiaPage({
    params,
}: {
    params: Promise<{ tokenPortal: string }>;
}) {
    const { tokenPortal } = use(params);
    const router = useRouter();

    const [data, setData] = useState<MiEventiaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarDatos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resultado = await getMiEventia(tokenPortal);
            setData(resultado);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al cargar tu panel';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Intentar también obtener el token desde localStorage como validación secundaria
        const tokenLocal = obtenerTokenPortal();
        if (tokenPortal) {
            cargarDatos();
        } else if (tokenLocal) {
            // Si el param no llegó pero hay token en localStorage, redirigir con el token guardado
            router.replace(`/mi-eventia/${tokenLocal}`);
        } else {
            setError('No se encontró tu panel Mi-Eventia. Por favor, completá una inscripción primero.');
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenPortal]);

    const handleNavegar = (urlPortal: string) => {
        if (!urlPortal) return;
        if (urlPortal.startsWith('http://') || urlPortal.startsWith('https://') || urlPortal.startsWith('//')) {
            window.location.href = urlPortal;
        } else {
            router.push(urlPortal);
        }
    };

    // ── Estado: cargando ──────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Cargando tu panel</p>
                    <p className="text-muted text-sm mt-1">Obteniendo tus inscripciones...</p>
                </div>
            </div>
        );
    }

    // ── Estado: error ─────────────────────────────────────────────
    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-6 px-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center max-w-sm">
                    <h2 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
                        No pudimos cargar tu panel
                    </h2>
                    <p className="text-muted text-sm leading-relaxed">
                        {error ?? 'Ocurrió un error inesperado. Por favor, intentá nuevamente.'}
                    </p>
                </div>
                <button
                    onClick={cargarDatos}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-all shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                </button>
            </div>
        );
    }

    const { persona, items } = data;
    const itemsActivos = items.filter(i => i.estado?.toUpperCase() === 'ACTIVO');
    const itemsFinalizados = items.filter(i => i.estado?.toUpperCase() !== 'ACTIVO');

    // ── Renderizado principal ─────────────────────────────────────
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">

            {/* ── Hero Header ──────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
                {/* Decoración */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    {/* Branding Mi-Eventia */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white/80 tracking-wide uppercase">
                            Mi-Eventia
                        </span>
                    </div>

                    {/* Bienvenida */}
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                        Hola, {persona.nombre.split(' ')[0]} 👋
                    </h1>
                    <p className="text-white/75 text-base sm:text-lg max-w-lg">
                        Este es tu panel centralizado. Desde acá podés acceder a todos tus programas e inscripciones.
                    </p>

                    {/* Stats rápidos */}
                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-white/20">
                            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                            <div>
                                <p className="text-2xl font-black leading-none">{itemsActivos.length}</p>
                                <p className="text-xs text-white/70 mt-0.5">
                                    {itemsActivos.length === 1 ? 'Inscripción activa' : 'Inscripciones activas'}
                                </p>
                            </div>
                        </div>

                        {itemsFinalizados.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10">
                                <Clock className="w-5 h-5 text-white/60 shrink-0" />
                                <div>
                                    <p className="text-2xl font-black leading-none">{itemsFinalizados.length}</p>
                                    <p className="text-xs text-white/60 mt-0.5">
                                        {itemsFinalizados.length === 1 ? 'Finalizada' : 'Finalizadas'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Contenido principal ──────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

                {/* ── Tarjeta de perfil ──────────────────────────────────── */}
                <section>
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                        Tu Perfil
                    </h2>
                    <div className="bg-white dark:bg-card-bg rounded-2xl border border-gray-200 dark:border-card-border shadow-sm p-6">
                        <div className="flex items-start gap-4">
                            {/* Avatar inicial */}
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center text-white text-xl font-black shrink-0">
                                {persona.nombre.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 space-y-1.5">
                                <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                    {persona.nombre}
                                </p>

                                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                                    {persona.email && (
                                        <p className="text-sm text-muted flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{persona.email}</span>
                                        </p>
                                    )}
                                    {persona.telefono && (
                                        <p className="text-sm text-muted flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 shrink-0" />
                                            {persona.telefono}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Inscripciones activas ──────────────────────────────── */}
                {itemsActivos.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
                                Inscripciones Activas
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {itemsActivos.map((item) => (
                                <TarjetaAcceso
                                    key={item.tokenConsulta}
                                    item={item}
                                    onNavegar={() => handleNavegar(item.urlPortal)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Sin inscripciones activas ──────────────────────────── */}
                {itemsActivos.length === 0 && (
                    <section>
                        <div className="bg-white dark:bg-card-bg rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-7 h-7 text-muted" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                No tenés inscripciones activas
                            </h3>
                            <p className="text-sm text-muted max-w-xs mx-auto">
                                Cuando te inscribas a un programa o evento, lo verás reflejado acá.
                            </p>
                        </div>
                    </section>
                )}

                {/* ── Historial / Finalizados ────────────────────────────── */}
                {itemsFinalizados.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-muted" />
                            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
                                Historial
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {itemsFinalizados.map((item) => (
                                <TarjetaAcceso
                                    key={item.tokenConsulta}
                                    item={item}
                                    onNavegar={() => handleNavegar(item.urlPortal)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Botón de actualizar ────────────────────────────────── */}
                <div className="flex justify-center pb-4">
                    <button
                        id="btn-actualizar-panel"
                        onClick={cargarDatos}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-muted hover:text-gray-900 dark:hover:text-white bg-white dark:bg-card-bg border border-gray-200 dark:border-card-border rounded-xl hover:shadow-sm transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar panel
                    </button>
                </div>

            </div>
        </main>
    );
}
