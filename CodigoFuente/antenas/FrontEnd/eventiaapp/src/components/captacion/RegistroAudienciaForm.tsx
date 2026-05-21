'use client';

import { useState, useEffect } from 'react';
import {
    registrarAudiencia,
    getPerfilesAsistencia,
    getInteresesEvento,
    getPreferenciasMusicales,
} from '@/src/features/captacion/captacion.service';
import type { RegistroAudienciaPayload, RegistroAudienciaResponse, Parametrica } from '@/src/features/captacion/types';
import { Loader2, Music2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    token: string;
    idEvento: number;
    origenDefault?: string | null;
    onSuccess: (data: RegistroAudienciaResponse) => void;
}

/** Extract UTM params + referrer from the current URL */
function extractTrackingData(origenDefault?: string | null) {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
        origen_registro: params.get('origen') || origenDefault || 'LANDING_PUBLICA',
        campania_fuente: params.get('utm_source') || null,
        campania_medio: params.get('utm_medium') || null,
        campania_nombre: params.get('utm_campaign') || null,
        campania_contenido: params.get('utm_content') || null,
        campania_termino: params.get('utm_term') || null,
        pagina_origen: window.location.href,
        referer: document.referrer || null,
    };
}

export default function RegistroAudienciaForm({ token, idEvento, origenDefault, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [perfiles, setPerfiles] = useState<Parametrica[]>([]);
    const [interesesDisponibles, setInteresesDisponibles] = useState<Parametrica[]>([]);
    const [musicalesDisponibles, setMusicalesDisponibles] = useState<Parametrica[]>([]);
    const [showOptionals, setShowOptionals] = useState(false);

    const [formData, setFormData] = useState<RegistroAudienciaPayload>({
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        fecha_nacimiento: null,
        instagram: null,
        zona: null,
        ciudad: null,
        id_perfil_asistencia: null,
        id_intereses_evento: [],
        id_preferencias_musicales: [],
        acepta_terminos: true,
        acepta_comunicaciones: false,
        acepta_promociones: false,
    });

    useEffect(() => {
        Promise.all([
            getPerfilesAsistencia(idEvento).catch(() => []),
            getInteresesEvento(idEvento).catch(() => []),
            getPreferenciasMusicales(idEvento).catch(() => []),
        ]).then(([p, i, m]) => {
            setPerfiles(p);
            setInteresesDisponibles(i);
            setMusicalesDisponibles(m);
        });
    }, [idEvento]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value || null,
        }));
    };

    const toggleArrayItem = (field: 'id_intereses_evento' | 'id_preferencias_musicales', id: number) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const isSelected = current.includes(id);
            return {
                ...prev,
                [field]: isSelected ? current.filter(x => x !== id) : [...current, id],
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Celular obligatorio
        if (!formData.celular) {
            alert('El celular es obligatorio para recibir tu acceso al evento.');
            return;
        }

        try {
            setLoading(true);
            const tracking = extractTrackingData(origenDefault);

            const payload: RegistroAudienciaPayload = {
                ...formData,
                // normalise optional strings to null when empty
                email: formData.email || null,
                fecha_nacimiento: formData.fecha_nacimiento || null,
                instagram: formData.instagram || null,
                zona: formData.zona || null,
                ciudad: formData.ciudad || null,
                id_perfil_asistencia: formData.id_perfil_asistencia ? Number(formData.id_perfil_asistencia) : null,
                // UTM tracking
                ...tracking,
            };

            const res = await registrarAudiencia(token, payload);
            if (res.ok) {
                onSuccess(res);
            } else {
                throw new Error(res.mensaje_post_registro || 'Ocurrió un error al registrar.');
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error de conexión. Intentá nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Datos personales obligatorios ───────────────────────── */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Nombre *</label>
                        <input
                            required
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                            placeholder="Tu nombre"
                            autoComplete="given-name"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Apellido *</label>
                        <input
                            required
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                            placeholder="Tu apellido"
                            autoComplete="family-name"
                        />
                    </div>
                </div>

                {/* Celular — OBLIGATORIO */}
                <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">
                        Celular (WhatsApp) *
                    </label>
                    <input
                        required
                        type="tel"
                        name="celular"
                        value={formData.celular || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                        placeholder="+54 9 11 XXXX XXXX"
                        autoComplete="tel"
                    />
                    <p className="text-[10px] text-white/30 mt-1.5">
                        Tu número de WhatsApp — te enviaremos el acceso por ahí.
                    </p>
                </div>

                {/* Email — opcional */}
                <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Email (opcional)</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                        placeholder="tu@email.com"
                        autoComplete="email"
                    />
                </div>

                {/* Perfil de asistencia */}
                {perfiles.length > 0 && (
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">¿Con quién venís?</label>
                        <select
                            name="id_perfil_asistencia"
                            value={formData.id_perfil_asistencia || ''}
                            onChange={handleChange}
                            className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none transition-all"
                        >
                            <option value="" disabled>Seleccioná una opción...</option>
                            {perfiles.map(p => (
                                <option key={p.id} value={p.id}>{p.texto}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* ── Intereses del evento ──────────────────────────────────── */}
            {interesesDisponibles.length > 0 && (
                <div className="pt-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-3">Intereses en el Evento</label>
                    <div className="flex flex-wrap gap-2">
                        {interesesDisponibles.map(i => {
                            const selected = (formData.id_intereses_evento || []).includes(i.id);
                            return (
                                <button
                                    type="button"
                                    key={i.id}
                                    onClick={() => toggleArrayItem('id_intereses_evento', i.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                        selected
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'
                                    }`}
                                >
                                    {i.texto}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Preferencias musicales ──────────────────────────────── */}
            {musicalesDisponibles.length > 0 && (
                <div className="pt-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                        <Music2 className="w-3 h-3" />
                        Preferencias Musicales
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {musicalesDisponibles.map(m => {
                            const selected = (formData.id_preferencias_musicales || []).includes(m.id);
                            return (
                                <button
                                    type="button"
                                    key={m.id}
                                    onClick={() => toggleArrayItem('id_preferencias_musicales', m.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                        selected
                                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-sm shadow-violet-500/10'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'
                                    }`}
                                >
                                    {m.texto}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Datos opcionales expandibles ─────────────────────────── */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowOptionals(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-white/50 hover:text-white/70 hover:bg-white/5 transition-all uppercase tracking-widest"
                >
                    <span>Datos opcionales (Instagram, Ciudad, Cumpleaños...)</span>
                    {showOptionals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showOptionals && (
                    <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4 animate-in fade-in duration-200">
                        <div>
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Instagram</label>
                            <input
                                type="text"
                                name="instagram"
                                value={formData.instagram || ''}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all"
                                placeholder="@usuario"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento || ''}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Zona / Barrio</label>
                                <input
                                    type="text"
                                    name="zona"
                                    value={formData.zona || ''}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ej: Palermo"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Ciudad</label>
                                <input
                                    type="text"
                                    name="ciudad"
                                    value={formData.ciudad || ''}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ej: Buenos Aires"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Consentimientos de comunicaciones ────────────────────── */}
            <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            name="acepta_comunicaciones"
                            checked={formData.acepta_comunicaciones}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                            {formData.acepta_comunicaciones && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                        Quiero recibir novedades y avisos de próximos eventos.
                    </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            name="acepta_promociones"
                            checked={formData.acepta_promociones}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                            {formData.acepta_promociones && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                        Quiero recibir promociones y beneficios especiales.
                    </span>
                </label>
            </div>

            {/* ── CTA Button ───────────────────────────────────────────── */}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all font-bold text-sm shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-[0.99]"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Asistencia'}
            </button>

            <p className="text-center text-[10px] text-white/25 leading-relaxed">
                Al registrarte aceptás los términos, condiciones y políticas de privacidad del evento.
            </p>
        </form>
    );
}
