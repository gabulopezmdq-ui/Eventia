'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import {
    Building2,
    Globe,
    Instagram,
    Phone,
    FileText,
    MapPin,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Briefcase,
    ChevronLeft,
    Sparkles,
} from 'lucide-react';

interface PaisOption {
    id_pais: number;
    nombre: string;
}

interface TipoIdentificacionFiscal {
    id_tipo_identificacion_fiscal: number;
    nombre: string;
    codigo: string;
}

const TIPOS_CUENTA = [
    { value: 'SALON', label: 'Salón de Fiestas', desc: 'Espacio propio para eventos y celebraciones' },
    { value: 'PLANNER', label: 'Planner / Organizador', desc: 'Profesional que organiza eventos para terceros' },
    { value: 'EMPRESA', label: 'Empresa / Agencia', desc: 'Empresa que gestiona múltiples eventos corporativos' },
] as const;

export default function SolicitarCuentaPage() {
    const router = useRouter();
    const { refresh } = useAuth();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Paramétricas ──
    const [paises, setPaises] = useState<PaisOption[]>([]);
    const [tiposIdFiscal, setTiposIdFiscal] = useState<TipoIdentificacionFiscal[]>([]);
    const [loadingPaises, setLoadingPaises] = useState(true);
    const [loadingTiposId, setLoadingTiposId] = useState(false);

    // ── Form ──
    const [form, setForm] = useState({
        nombre_cuenta: '',
        tipo: '' as string,
        instagram: '',
        web: '',
        telefono: '',
        ciudad: '',
        id_pais: '' as string | number,
        id_tipo_identificacion_fiscal: '' as string | number,
        identificacion_fiscal: '',
        descripcion: '',
    });

    // ── Cargar países ──
    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const res = await fetch('/api/parametrica/paises');
                if (res.ok) {
                    const data = await res.json();
                    const mapped = (data || []).map((p: any) => ({
                        id_pais: p.id_pais || p.idPais,
                        nombre: p.texto || p.nombre || p.nombre_pais || p.nombrePais,
                    }));
                    setPaises(mapped);
                    // Pre-seleccionar Argentina
                    const ar = mapped.find((p: PaisOption) => p.nombre?.toLowerCase().includes('argentin'));
                    if (ar) {
                        setForm(prev => ({ ...prev, id_pais: ar.id_pais }));
                    }
                }
            } catch {
                // No bloqueante
            } finally {
                setLoadingPaises(false);
            }
        };
        fetchPaises();
    }, []);

    // ── Cargar tipos de identificación fiscal cuando cambia el país ──
    useEffect(() => {
        if (!form.id_pais) {
            setTiposIdFiscal([]);
            return;
        }

        const fetchTiposId = async () => {
            setLoadingTiposId(true);
            try {
                const res = await fetch(`/api/parametrica/tipos-id-fiscal?idPais=${form.id_pais}`);
                if (res.ok) {
                    const data = await res.json();
                    setTiposIdFiscal(
                        (data || []).map((t: any) => ({
                            id_tipo_identificacion_fiscal: t.id_tipo_identificacion_fiscal || t.idTipoIdentificacionFiscal,
                            nombre: t.nombre,
                            codigo: t.codigo,
                        }))
                    );
                }
            } catch {
                // No bloqueante
            } finally {
                setLoadingTiposId(false);
            }
        };
        fetchTiposId();
    }, [form.id_pais]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const canSubmit = form.nombre_cuenta.trim() && form.tipo;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError(null);

        try {
            const payload = {
                nombre_cuenta: form.nombre_cuenta.trim(),
                tipo: form.tipo,
                instagram: form.instagram.trim() || null,
                web: form.web.trim() || null,
                telefono: form.telefono.trim() || null,
                ciudad: form.ciudad.trim() || null,
                id_pais: form.id_pais ? Number(form.id_pais) : null,
                id_tipo_identificacion_fiscal: form.id_tipo_identificacion_fiscal ? Number(form.id_tipo_identificacion_fiscal) : null,
                identificacion_fiscal: form.identificacion_fiscal.trim() || null,
                descripcion: form.descripcion.trim() || null,
            };

            const res = await fetch('/api/cuentas/solicitar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Error al enviar la solicitud');
            }

            setSuccess(true);
            // Refrescar el AuthContext para que la sidebar se actualice
            await refresh();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Pantalla de éxito ───
    if (success) {
        return (
            <div className="max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 text-center shadow-xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                        ¡Solicitud enviada!
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                        Recibimos tu solicitud de cuenta B2B. Nuestro equipo la va a revisar y te notificaremos
                        cuando esté activa. Esto puede demorar hasta 24 horas hábiles.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                    >
                        Volver al Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
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
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Solicitar Cuenta B2B
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Completá los datos para habilitar tu perfil profesional
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card: Datos principales */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        Datos de tu empresa
                    </h2>

                    {/* Nombre de cuenta */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                            Nombre de la empresa / salón <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="nombre_cuenta"
                            value={form.nombre_cuenta}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Salón Las Rosas, Eventoz Corp..."
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                        onClick={() => setForm(prev => ({ ...prev, tipo: value }))}
                                        className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
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
                                placeholder="@mi_empresa"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                placeholder="https://miempresa.com"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                placeholder="+54 223 555 1234"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                placeholder="Mar del Plata, Buenos Aires..."
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Card: Datos fiscales */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Datos fiscales
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal normal-case tracking-normal text-xs ml-1">(opcional)</span>
                    </h2>

                    {/* País */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                            País
                        </label>
                        {loadingPaises ? (
                            <div className="flex items-center gap-2 py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                                <span className="text-xs text-neutral-400">Cargando países...</span>
                            </div>
                        ) : (
                            <select
                                name="id_pais"
                                value={form.id_pais}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Seleccioná un país...</option>
                                {paises.map(p => (
                                    <option key={p.id_pais} value={p.id_pais}>{p.nombre}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Tipo ID fiscal + Nro */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    disabled={tiposIdFiscal.length === 0}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {tiposIdFiscal.length === 0 ? 'Seleccioná un país primero' : 'Seleccioná...'}
                                    </option>
                                    {tiposIdFiscal.map(t => (
                                        <option key={t.id_tipo_identificacion_fiscal} value={t.id_tipo_identificacion_fiscal}>
                                            {t.nombre} ({t.codigo})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                Número
                            </label>
                            <input
                                name="identificacion_fiscal"
                                value={form.identificacion_fiscal}
                                onChange={handleChange}
                                placeholder="Ej: 30-12345678-9"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Card: Descripción */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        Contanos sobre tu empresa
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal normal-case tracking-normal ml-1">(opcional)</span>
                    </label>
                    <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ej: Somos un salón de eventos con 15 años de experiencia en la ciudad. Organizamos fiestas, bodas, corporativos..."
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando solicitud...
                        </>
                    ) : (
                        <>
                            Enviar Solicitud
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
                    Una vez aprobada, vas a poder gestionar unidades, clientes y eventos desde el panel B2B.
                </p>
            </form>
        </div>
    );
}
