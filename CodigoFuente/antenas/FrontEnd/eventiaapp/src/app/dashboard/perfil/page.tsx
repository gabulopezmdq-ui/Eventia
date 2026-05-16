'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { getMiPerfil, updateMiPerfil, PerfilData } from '@/src/features/perfil/perfil.service';
import {
    UserCircle,
    Save,
    Mail,
    Calendar,
    ShieldCheck,
    Loader2,
    Phone,
    Globe,
    Languages,
    Bell,
    BellOff,
    CalendarDays,
    Clock,
    PartyPopper,
    Users,
    LayoutGrid,
    Star,
    ChevronRight,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateString?: string, opts?: Intl.DateTimeFormatOptions) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', opts ?? {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateString;
    }
}

function formatDateTime(dateString?: string) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return dateString;
    }
}

function getInitials(nombre?: string | null, apellido?: string | null) {
    const n = (nombre?.[0] ?? '').toUpperCase();
    const a = (apellido?.[0] ?? '').toUpperCase();
    return n + a || '?';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value?: string | number | null;
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

function StatCard({
    value,
    label,
    colorClass,
}: {
    value: number | undefined;
    label: string;
    colorClass: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/80 dark:border-white/5">
            <span className={`text-3xl font-bold tabular-nums ${colorClass}`}>
                {value ?? 0}
            </span>
            <span className="text-xs text-center text-neutral-500 dark:text-neutral-400 leading-tight">
                {label}
            </span>
        </div>
    );
}

interface ComboOption {
    id: string;
    nombre: string;
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MiPerfilPage() {
    const { authMe, loading: authLoading } = useAuth();
    const [perfil, setPerfil] = useState<PerfilData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form fields
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [recibirNovedades, setRecibirNovedades] = useState(false);
    const [idIdiomaPreferido, setIdIdiomaPreferido] = useState('');
    const [idPais, setIdPais] = useState('');
    const [idIdiomaDefaultEvento, setIdIdiomaDefaultEvento] = useState('');

    // Paramétricas
    const [idiomas, setIdiomas] = useState<ComboOption[]>([]);
    const [paises, setPaises] = useState<ComboOption[]>([]);
    const [loadingPaises, setLoadingPaises] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        getMiPerfil()
            .then(data => {
                setPerfil(data);
                setNombre(data.nombre || '');
                setApellido(data.apellido || '');
                setTelefono(data.telefono || '');
                setRecibirNovedades(data.recibir_novedades ?? false);
                setIdIdiomaPreferido(data.id_idioma_preferido ? String(data.id_idioma_preferido) : '');
                setIdPais(data.id_pais ? String(data.id_pais) : '');
                setIdIdiomaDefaultEvento(data.id_idioma_default_evento ? String(data.id_idioma_default_evento) : '');
            })
            .catch(err => {
                console.error(err);
                if (authMe) {
                    setPerfil({
                        email: authMe.email,
                        nombre: '',
                        apellido: '',
                        telefono: '',
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [authLoading, authMe]);

    useEffect(() => {
        const fetchIdiomas = async () => {
            try {
                // Fetch idiomas (pasando 1 por defecto o el id_idioma_preferido si existe)
                const idiomaQ = idIdiomaPreferido || '1';
                const res = await fetch(`/api/parametrica/idiomas?idIdioma=${idiomaQ}`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped: ComboOption[] = (data || []).map((i: any) => ({
                        id: String(i.id_idioma ?? i.id),
                        nombre: i.nombre_largo ?? 'Sin nombre'
                    }));
                    setIdiomas(mapped);
                }
            } catch (error) {
                console.error('Error fetching idiomas:', error);
            }
        };

        fetchIdiomas();
    }, [idIdiomaPreferido]);

    useEffect(() => {
        const fetchPaises = async () => {
            if (!idIdiomaPreferido) return;
            setLoadingPaises(true);
            try {
                const res = await fetch(`/api/parametrica/paises?idIdioma=${idIdiomaPreferido}`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped: ComboOption[] = (data || []).map((p: any) => ({
                        id: String(p.id),
                        nombre: p.texto ?? 'Sin nombre'
                    }));
                    setPaises(mapped);
                }
            } catch (error) {
                console.error('Error fetching paises:', error);
            } finally {
                setLoadingPaises(false);
            }
        };

        fetchPaises();
    }, [idIdiomaPreferido]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);
        try {
            await updateMiPerfil({
                nombre,
                apellido,
                telefono,
                recibir_novedades: recibirNovedades,
                id_pais: idPais ? Number(idPais) : null,
                id_idioma_preferido: idIdiomaPreferido ? Number(idIdiomaPreferido) : null,
                id_idioma_default_evento: idIdiomaDefaultEvento ? Number(idIdiomaDefaultEvento) : null,
            });
            
            // Update local state to reflect changes without reloading
            setPerfil((prev) => {
                if (!prev) return prev;
                const paisSelected = paises.find(p => p.id === idPais);
                const idiomaPreferidoSelected = idiomas.find(i => i.id === idIdiomaPreferido);
                const idiomaDefaultSelected = idiomas.find(i => i.id === idIdiomaDefaultEvento);

                return {
                    ...prev,
                    nombre,
                    apellido,
                    telefono,
                    recibir_novedades: recibirNovedades,
                    id_pais: idPais ? Number(idPais) : null,
                    pais_nombre: paisSelected ? paisSelected.nombre : prev.pais_nombre,
                    id_idioma_preferido: idIdiomaPreferido ? Number(idIdiomaPreferido) : null,
                    idioma_preferido_nombre: idiomaPreferidoSelected ? idiomaPreferidoSelected.nombre : prev.idioma_preferido_nombre,
                    id_idioma_default_evento: idIdiomaDefaultEvento ? Number(idIdiomaDefaultEvento) : null,
                    idioma_default_evento_nombre: idiomaDefaultSelected ? idiomaDefaultSelected.nombre : prev.idioma_default_evento_nombre,
                };
            });
            setSuccessMsg('Perfil actualizado correctamente.');
            setTimeout(() => setSuccessMsg(null), 3500);
        } catch {
            setError('Error al guardar los cambios. Por favor, intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando tu perfil…</p>
                </div>
            </div>
        );
    }

    const initials = getInitials(perfil?.nombre, perfil?.apellido);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

            {/* ── HERO BANNER ─────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 shadow-xl shadow-indigo-500/20">
                {/* Background decoration */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-purple-400/10 blur-2xl" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white tracking-tight">
                            {initials}
                        </span>
                    </div>

                    {/* Name & meta */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                            {perfil?.nombre || perfil?.apellido
                                ? `${perfil?.nombre ?? ''} ${perfil?.apellido ?? ''}`.trim()
                                : 'Sin nombre'}
                        </h1>
                        <p className="mt-1 text-indigo-200 text-sm flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            {perfil?.email}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {perfil?.pais_nombre && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                                    <Globe className="w-3 h-3" />
                                    {perfil.pais_nombre}
                                </span>
                            )}
                            {perfil?.idioma_preferido_nombre && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                                    <Languages className="w-3 h-3" />
                                    {perfil.idioma_preferido_nombre}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                perfil?.recibir_novedades
                                    ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-100'
                                    : 'bg-white/10 border-white/20 text-white/70'
                            }`}>
                                {perfil?.recibir_novedades
                                    ? <><Bell className="w-3 h-3" /> Novedades activas</>
                                    : <><BellOff className="w-3 h-3" /> Sin novedades</>
                                }
                            </span>
                        </div>
                    </div>

                    {/* Member since */}
                    <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                            Miembro desde
                        </span>
                        <span className="mt-1 text-sm font-medium text-white">
                            {formatDate(perfil?.fecha_alta)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── STATS ROW ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-3xl p-5 border border-indigo-100 dark:border-indigo-500/20">
                <StatCard
                    value={perfil?.cantidad_eventos_propios}
                    label="Eventos propios"
                    colorClass="text-indigo-600 dark:text-indigo-400"
                />
                <StatCard
                    value={perfil?.cantidad_eventos_compartidos}
                    label="Colaboraciones"
                    colorClass="text-purple-600 dark:text-purple-400"
                />
                <StatCard
                    value={perfil?.cantidad_eventos_cuenta}
                    label="Total en cuenta"
                    colorClass="text-cyan-600 dark:text-cyan-400"
                />
            </div>

            {/* ── LAST EVENT BANNER ────────────────────────────────────────── */}
            {perfil?.ultimo_evento_creado && (
                <div className="flex items-center gap-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 px-5 py-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Último evento creado
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {perfil.ultimo_evento_creado}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                </div>
            )}

            {/* ── MAIN GRID ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN: info cards ─────────────────────────────── */}
                <div className="lg:col-span-1 space-y-5">

                    {/* Datos de Acceso */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                            Datos de Acceso
                        </h2>
                        <InfoRow icon={Mail} label="Email" value={perfil?.email} />
                        <InfoRow icon={ShieldCheck} label="Rol" value={authMe?.rol || 'Usuario'} />
                        <InfoRow icon={Phone} label="Teléfono" value={perfil?.telefono} />
                    </div>

                    {/* Ubicación e Idioma (solo lectura eliminado, movido al form) */}
                    
                    {/* Actividad */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                            Actividad
                        </h2>
                        <InfoRow icon={CalendarDays} label="Miembro desde" value={formatDate(perfil?.fecha_alta)} />
                        <InfoRow icon={Clock} label="Último acceso" value={formatDateTime(perfil?.ultimo_acceso)} />
                        <InfoRow
                            icon={perfil?.recibir_novedades ? Bell : BellOff}
                            label="Novedades"
                            value={perfil?.recibir_novedades ? 'Activadas' : 'Desactivadas'}
                        />
                    </div>
                </div>

                {/* ── RIGHT COLUMN: editable form ─────────────────────────── */}
                <div className="lg:col-span-2">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-start"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <UserCircle className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                Información Personal
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                            {/* Nombre */}
                            <div className="space-y-1.5">
                                <label htmlFor="nombre" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Nombre
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej. Juan"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                                />
                            </div>

                            {/* Apellido */}
                            <div className="space-y-1.5">
                                <label htmlFor="apellido" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Apellido
                                </label>
                                <input
                                    id="apellido"
                                    type="text"
                                    value={apellido}
                                    onChange={e => setApellido(e.target.value)}
                                    placeholder="Ej. Pérez"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                                />
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-1.5">
                                <label htmlFor="telefono" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Teléfono Móvil
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                    <input
                                        id="telefono"
                                        type="tel"
                                        value={telefono}
                                        onChange={e => setTelefono(e.target.value)}
                                        placeholder="+54 9 11 1234-5678"
                                        className="w-full pl-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            {/* Idioma Preferido */}
                            <div className="space-y-1.5">
                                <label htmlFor="id_idioma_preferido" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Idioma preferido
                                </label>
                                <div className="relative">
                                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                    <select
                                        id="id_idioma_preferido"
                                        value={idIdiomaPreferido}
                                        onChange={e => setIdIdiomaPreferido(e.target.value)}
                                        className="w-full pl-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Seleccioná tu idioma...</option>
                                        {idiomas.map(i => (
                                            <option key={i.id} value={i.id}>{i.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* País de residencia */}
                            <div className="space-y-1.5">
                                <label htmlFor="id_pais" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    País de residencia
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                    <select
                                        id="id_pais"
                                        value={idPais}
                                        onChange={e => setIdPais(e.target.value)}
                                        disabled={!idIdiomaPreferido || loadingPaises}
                                        className="w-full pl-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {!idIdiomaPreferido 
                                                ? 'Seleccioná un idioma primero' 
                                                : loadingPaises 
                                                    ? 'Cargando países...' 
                                                    : 'Seleccioná tu país...'}
                                        </option>
                                        {paises.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Idioma default para eventos */}
                            <div className="space-y-1.5">
                                <label htmlFor="id_idioma_default_evento" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Idioma default para eventos
                                </label>
                                <div className="relative">
                                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                    <select
                                        id="id_idioma_default_evento"
                                        value={idIdiomaDefaultEvento}
                                        onChange={e => setIdIdiomaDefaultEvento(e.target.value)}
                                        className="w-full pl-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Seleccioná el idioma...</option>
                                        {idiomas.map(i => (
                                            <option key={i.id} value={i.id}>{i.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ── Preferencias ──────────────────────────────────── */}
                        <div className="w-full mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
                                Preferencias de comunicación
                            </h3>

                            <label
                                htmlFor="recibir-novedades"
                                className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                    recibirNovedades
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30'
                                        : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {recibirNovedades
                                        ? <Bell className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                        : <BellOff className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                                    }
                                    <div>
                                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                            Recibir novedades y comunicaciones
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                            Te mantendremos al tanto de novedades de Eventia
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <input
                                        id="recibir-novedades"
                                        type="checkbox"
                                        checked={recibirNovedades}
                                        onChange={e => setRecibirNovedades(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`relative w-11 h-6 rounded-full transition-colors ${
                                            recibirNovedades ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                                recibirNovedades ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* ── Feedback ──────────────────────────────────────── */}
                        {error && (
                            <div className="mt-5 w-full p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mt-5 w-full p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <PartyPopper className="w-4 h-4 flex-shrink-0" />
                                {successMsg}
                            </div>
                        )}

                        {/* ── Actions ───────────────────────────────────────── */}
                        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 w-full flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex flex-shrink-0 items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-md shadow-indigo-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando…
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── ACCOUNT OVERVIEW STRIP ───────────────────────────────────── */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <LayoutGrid className="w-4 h-4 text-neutral-400" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Resumen de la cuenta
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20">
                        <PartyPopper className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">Eventos propios</p>
                            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-200 tabular-nums">
                                {perfil?.cantidad_eventos_propios ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20">
                        <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Compartidos</p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-200 tabular-nums">
                                {perfil?.cantidad_eventos_compartidos ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-500/20">
                        <LayoutGrid className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-cyan-600 dark:text-cyan-300 font-semibold">Total en cuenta</p>
                            <p className="text-lg font-bold text-cyan-700 dark:text-cyan-200 tabular-nums">
                                {perfil?.cantidad_eventos_cuenta ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
