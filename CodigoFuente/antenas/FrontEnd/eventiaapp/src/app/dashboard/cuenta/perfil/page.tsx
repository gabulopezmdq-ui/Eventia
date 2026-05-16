'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Globe,
    Instagram,
    Phone,
    FileText,
    MapPin,
    Loader2,
    CheckCircle2,
    Save,
    ChevronLeft,
    AlertCircle,
    Lock,
} from 'lucide-react';
import {
    getMiCuentaPerfil,
    updateMiCuentaPerfil,
    type CuentaPerfilInfo,
    type UpdateCuentaPayload,
} from '@/src/features/cuenta/cuenta.service';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos paramétricas
// ─────────────────────────────────────────────────────────────────────────────

interface PaisOption {
    id_pais: string;
    nombre: string;
    codigo: string;
}

interface TipoIdentificacionFiscal {
    id_tipo_identificacion_fiscal: string;
    nombre: string;
    codigo: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS_CUENTA = [
    { value: 'SALON',   label: 'Salón de Fiestas',     desc: 'Espacio propio para eventos y celebraciones' },
    { value: 'PLANNER', label: 'Planner / Organizador', desc: 'Profesional que organiza eventos para terceros' },
    { value: 'EMPRESA', label: 'Empresa / Agencia',     desc: 'Empresa que gestiona múltiples eventos corporativos' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildInitialForm(perfil: CuentaPerfilInfo) {
    return {
        nombre_cuenta:                 perfil.nombre_cuenta                       ?? '',
        tipo:                          perfil.tipo                                 ?? '',
        instagram:                     perfil.instagram                            ?? '',
        web:                           perfil.web                                  ?? '',
        telefono:                      perfil.telefono                             ?? '',
        ciudad:                        perfil.ciudad                               ?? '',
        id_pais:                       perfil.id_pais    != null ? String(perfil.id_pais)    : '',
        id_tipo_identificacion_fiscal: perfil.id_tipo_identificacion_fiscal != null
            ? String(perfil.id_tipo_identificacion_fiscal)
            : '',
        identificacion_fiscal:         perfil.identificacion_fiscal                ?? '',
        descripcion:                   perfil.descripcion                          ?? '',
        // campos extra requeridos por el PUT (no editables)
        estado:                        perfil.estado                               ?? '',
        id_plan:                       perfil.id_plan,
        fecha_alta:                    perfil.fecha_alta,
        fecha_modif:                   perfil.fecha_modif,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PerfilCuentaPage() {
    const router = useRouter();

    // ── Estado de carga y feedback ──────────────────────────────────────────
    const [loadingPerfil,   setLoadingPerfil]   = useState(true);
    const [loadingPaises,   setLoadingPaises]   = useState(true);
    const [loadingTiposId,  setLoadingTiposId]  = useState(false);
    const [saving,          setSaving]          = useState(false);
    const [success,         setSuccess]         = useState(false);
    const [error,           setError]           = useState<string | null>(null);
    const [fetchError,      setFetchError]      = useState<string | null>(null);

    // ── Paramétricas ────────────────────────────────────────────────────────
    const [paises,       setPaises]       = useState<PaisOption[]>([]);
    const [tiposIdFiscal, setTiposIdFiscal] = useState<TipoIdentificacionFiscal[]>([]);

    // ── Formulario ──────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        nombre_cuenta:                 '',
        tipo:                          '',
        instagram:                     '',
        web:                           '',
        telefono:                      '',
        ciudad:                        '',
        id_pais:                       '',
        id_tipo_identificacion_fiscal: '',
        identificacion_fiscal:         '',
        descripcion:                   '',
        estado:                        '',
        id_plan:                       null as number | null,
        fecha_alta:                    null as string | null,
        fecha_modif:                   null as string | null,
    });

    // ── Cargar perfil ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const perfil = await getMiCuentaPerfil();
                setForm(buildInitialForm(perfil));
            } catch (err: any) {
                setFetchError(err.message || 'No se pudo cargar el perfil de cuenta.');
            } finally {
                setLoadingPerfil(false);
            }
        };
        fetchPerfil();
    }, []);

    // ── Cargar países ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const res = await fetch('/api/parametrica/paises');
                if (!res.ok) return;
                const data = await res.json();
                const mapped: PaisOption[] = (data || []).map((p: any) => ({
                    id_pais: String(p.id_pais ?? p.idPais ?? p.id),
                    nombre: p.texto ?? p.nombre ?? p.nombre_pais ?? p.nombrePais ?? 'Sin nombre',
                    codigo: p.codigo ?? '',
                }));
                setPaises(mapped);
            } catch (err) {
                console.error('Error fetchPaises:', err);
            } finally {
                setLoadingPaises(false);
            }
        };
        fetchPaises();
    }, []);

    // ── Cargar tipos ID fiscal cuando cambia el país ──────────────────────
    useEffect(() => {
        if (!form.id_pais) {
            setTiposIdFiscal([]);
            return;
        }
        const fetchTiposId = async () => {
            setLoadingTiposId(true);
            try {
                const res = await fetch(`/api/parametrica/tipos-id-fiscal?idPais=${form.id_pais}`);
                if (!res.ok) return;
                const data = await res.json();
                const mapped: TipoIdentificacionFiscal[] = (data || []).map((t: any) => ({
                    id_tipo_identificacion_fiscal: String(
                        t.id_tipo_identificacion_fiscal ?? t.idTipoIdentificacionFiscal ?? t.id
                    ),
                    nombre: t.nombre ?? '',
                    codigo: t.codigo ?? '',
                }));
                setTiposIdFiscal(mapped);
            } catch (err) {
                console.error('Error fetchTiposId:', err);
            } finally {
                setLoadingTiposId(false);
            }
        };
        fetchTiposId();
    }, [form.id_pais]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (success) setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const payload: UpdateCuentaPayload = {
                nombre_cuenta:                 form.nombre_cuenta,
                tipo:                          form.tipo,
                estado:                        form.estado,
                id_plan:                       form.id_plan,
                instagram:                     form.instagram.trim()              || null,
                web:                           form.web.trim()                    || null,
                telefono:                      form.telefono.trim()               || null,
                ciudad:                        form.ciudad.trim()                 || null,
                id_pais:                       form.id_pais ? Number(form.id_pais) : null,
                id_tipo_identificacion_fiscal: form.id_tipo_identificacion_fiscal
                    ? Number(form.id_tipo_identificacion_fiscal)
                    : null,
                identificacion_fiscal:         form.identificacion_fiscal.trim()  || null,
                descripcion:                   form.descripcion.trim()             || null,
                fecha_alta:                    form.fecha_alta,
                fecha_modif:                   form.fecha_modif,
            };

            await updateMiCuentaPerfil(payload);
            setSuccess(true);

            // Scroll suave al top para que el banner de éxito sea visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al guardar. Intentá nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    // ── Estado: error de carga inicial ───────────────────────────────────────
    if (!loadingPerfil && fetchError) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-500/20 rounded-2xl p-10 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        No se pudo cargar el perfil
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{fetchError}</p>
                    <button
                        onClick={() => router.refresh()}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // ── Nombre del país seleccionado (para mostrarlo en el campo bloqueado) ──
    const paisSeleccionado = paises.find(p => p.id_pais === form.id_pais);

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Header ── */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Datos de la cuenta
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Actualizá la información de tu empresa
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Banner de éxito ── */}
            {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 animate-in fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        ¡Perfil actualizado correctamente!
                    </p>
                </div>
            )}

            {/* ── Formulario ── */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ═══════════════════════════════════════════════════════════
                    CARD: Datos de tu empresa
                ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        Datos de tu empresa
                    </h2>

                    {/* Nombre de cuenta — BLOQUEADO */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                            Nombre de la empresa / salón
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 normal-case tracking-normal">
                                <Lock className="w-3 h-3" /> no editable
                            </span>
                        </label>
                        <input
                            name="nombre_cuenta"
                            value={loadingPerfil ? '' : form.nombre_cuenta}
                            readOnly
                            disabled={loadingPerfil}
                            placeholder={loadingPerfil ? 'Cargando...' : undefined}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Tipo de cuenta */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                            Tipo de cuenta <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {TIPOS_CUENTA.map(({ value, label, desc }) => {
                                const isSelected = form.tipo === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        disabled={loadingPerfil}
                                        onClick={() => setForm(prev => ({ ...prev, tipo: value }))}
                                        className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                                            isSelected
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                                        }`}
                                    >
                                        <p className={`text-sm font-bold mb-0.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-neutral-900 dark:text-white'}`}>
                                            {label}
                                        </p>
                                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Instagram + Web */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                <Instagram className="w-3 h-3 inline mr-1" /> Instagram
                            </label>
                            <input
                                name="instagram"
                                value={form.instagram}
                                onChange={handleChange}
                                disabled={loadingPerfil}
                                placeholder="@mi_empresa"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                <Globe className="w-3 h-3 inline mr-1" /> Web
                            </label>
                            <input
                                name="web"
                                value={form.web}
                                onChange={handleChange}
                                disabled={loadingPerfil}
                                placeholder="https://miempresa.com"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Teléfono + Ciudad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                <Phone className="w-3 h-3 inline mr-1" /> Teléfono
                            </label>
                            <input
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                disabled={loadingPerfil}
                                placeholder="+54 223 555 1234"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                <MapPin className="w-3 h-3 inline mr-1" /> Ciudad
                            </label>
                            <input
                                name="ciudad"
                                value={form.ciudad}
                                onChange={handleChange}
                                disabled={loadingPerfil}
                                placeholder="Mar del Plata, Buenos Aires..."
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* País — BLOQUEADO (obligatorio, bajo Tel y Ciudad) */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                            País <span className="text-red-400">*</span>
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 normal-case tracking-normal">
                                <Lock className="w-3 h-3" /> no editable
                            </span>
                        </label>
                        <input
                            value={
                                loadingPaises || loadingPerfil
                                    ? 'Cargando...'
                                    : paisSeleccionado
                                        ? `${paisSeleccionado.nombre}${paisSeleccionado.codigo ? ` (${paisSeleccionado.codigo})` : ''}`
                                        : 'Sin país asignado'
                            }
                            readOnly
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                        />
                        {/* input oculto para que el id_pais siempre esté accesible en el form state */}
                        <input type="hidden" name="id_pais" value={form.id_pais} />
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    CARD: Datos fiscales
                ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Datos fiscales
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal normal-case tracking-normal text-xs ml-1">(opcional)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tipo ID fiscal */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                Tipo de Identificación Fiscal
                            </label>
                            {loadingTiposId ? (
                                <div className="flex items-center gap-2 py-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                                    <span className="text-xs text-neutral-400">Cargando...</span>
                                </div>
                            ) : (
                                <select
                                    name="id_tipo_identificacion_fiscal"
                                    value={form.id_tipo_identificacion_fiscal}
                                    onChange={handleChange}
                                    disabled={loadingPerfil || tiposIdFiscal.length === 0}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {tiposIdFiscal.length === 0 ? 'Sin opciones disponibles' : 'Seleccioná...'}
                                    </option>
                                    {tiposIdFiscal.map(t => (
                                        <option key={t.id_tipo_identificacion_fiscal} value={t.id_tipo_identificacion_fiscal}>
                                            {t.nombre} ({t.codigo})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Número ID fiscal */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                Número
                            </label>
                            <input
                                name="identificacion_fiscal"
                                value={form.identificacion_fiscal}
                                onChange={handleChange}
                                disabled={loadingPerfil}
                                placeholder="Ej: 30-12345678-9"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    CARD: Descripción
                ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Sobre tu empresa
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal normal-case tracking-normal ml-1">(opcional)</span>
                    </label>
                    <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        disabled={loadingPerfil}
                        rows={3}
                        placeholder="Ej: Somos un salón de eventos con 15 años de experiencia en la ciudad..."
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>

                {/* ── Error de submit ── */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* ── Botón guardar ── */}
                <button
                    type="submit"
                    disabled={loadingPerfil || saving}
                    className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Guardando cambios...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Guardar cambios
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
