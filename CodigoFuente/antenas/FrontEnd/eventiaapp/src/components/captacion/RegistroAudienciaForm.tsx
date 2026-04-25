'use client';

import { useState, useEffect } from 'react';
import { registrarAudiencia, getPerfilesAsistencia, getInteresesEvento, getPreferenciasMusicales } from '@/src/features/captacion/captacion.service';
import type { RegistroAudienciaPayload, RegistroAudienciaResponse, Parametrica } from '@/src/features/captacion/types';
import { Loader2 } from 'lucide-react';

interface Props {
    token: string;
    idEvento: number;
    onSuccess: (data: RegistroAudienciaResponse) => void;
}

export default function RegistroAudienciaForm({ token, idEvento, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [perfiles, setPerfiles] = useState<Parametrica[]>([]);
    const [interesesDisponibles, setInteresesDisponibles] = useState<Parametrica[]>([]);
    const [musicalesDisponibles, setMusicalesDisponibles] = useState<Parametrica[]>([]);

    const [formData, setFormData] = useState<RegistroAudienciaPayload>({
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        id_perfil_asistencia: null,
        id_intereses_evento: [],
        id_preferencias_musicales: [],
        acepta_terminos: true,
        acepta_comunicaciones: true,
        acepta_promociones: true,
    });

    useEffect(() => {
        Promise.all([
            getPerfilesAsistencia(idEvento).catch(() => []),
            getInteresesEvento(idEvento).catch(() => []),
            getPreferenciasMusicales(idEvento).catch(() => [])
        ]).then(([p, i, m]) => {
            setPerfiles(p);
            setInteresesDisponibles(i);
            setMusicalesDisponibles(m);
        });
    }, [idEvento]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleArrayItem = (field: 'id_intereses_evento' | 'id_preferencias_musicales', id: number) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const isSelected = current.includes(id);
            return {
                ...prev,
                [field]: isSelected ? current.filter(x => x !== id) : [...current, id]
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación básica
        if (!formData.email && !formData.celular) {
            alert('Debes ingresar al menos un Email o Celular de contacto.');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                id_perfil_asistencia: formData.id_perfil_asistencia ? Number(formData.id_perfil_asistencia) : null,
                // UTMs y origen si estuvieran disponibles en window.location
                origen_registro: 'LANDING_PUBLICA',
                pagina_origen: window.location.href,
            };

            const res = await registrarAudiencia(token, payload);
            if (res.ok) {
                onSuccess(res);
            } else {
                throw new Error(res.mensaje_post_registro || 'Ocurrió un error al registrar.');
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Nombre *</label>
                        <input
                            required
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Apellido *</label>
                        <input
                            required
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                            placeholder="Tu apellido"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                        placeholder="tu@email.com"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Celular (WhatsApp)</label>
                    <input
                        type="tel"
                        name="celular"
                        value={formData.celular || ''}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                        placeholder="+54 9 11..."
                    />
                    <p className="text-[10px] text-white/30 mt-1">Completa email o celular para recibir el acceso.</p>
                </div>

                {perfiles.length > 0 && (
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">¿Con quién venís?</label>
                        <select
                            name="id_perfil_asistencia"
                            value={formData.id_perfil_asistencia || ''}
                            onChange={handleChange}
                            className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                        >
                            <option value="" disabled>Seleccioná una opción...</option>
                            {perfiles.map(p => (
                                <option key={p.id} value={p.id}>{p.texto}</option>
                            ))}
                        </select>
                    </div>
                )}

                {interesesDisponibles.length > 0 && (
                    <div className="pt-2">
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
                                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' 
                                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {i.texto}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all font-bold text-sm shadow-xl shadow-white/10"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Asistencia'}
            </button>
            
            <p className="text-center text-[10px] text-white/30">
                Al registrarte aceptas los términos, condiciones y políticas de privacidad del evento.
            </p>
        </form>
    );
}
