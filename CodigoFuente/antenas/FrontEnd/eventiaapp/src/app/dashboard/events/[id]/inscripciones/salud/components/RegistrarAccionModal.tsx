'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { TipoAccionSalud, RegistrarAccionPayload } from '@/src/features/inscripcion/types/salud.types';
import { getTiposAccionSalud, registrarAccionSalud } from '@/src/features/inscripcion/salud.service';

interface ParticipanteTarget {
    id: number;
    nombre: string;
    id_inscripcion: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    idEvento: number;
    participante: ParticipanteTarget | null;
    participantesDisponibles?: { id_invitado: number; participante: string; id_inscripcion: number; alerta_visual?: boolean }[];
    onSuccess: () => void;
}

export default function RegistrarAccionModal({ isOpen, onClose, idEvento, participante, participantesDisponibles, onSuccess }: Props) {
    const [tiposAccion, setTiposAccion] = useState<TipoAccionSalud[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedParticipante, setSelectedParticipante] = useState<ParticipanteTarget | null>(null);

    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const [form, setForm] = useState({
        fecha_hora: localISO,
        tipo_accion: '',
        descripcion: '',
        requirio_contacto_familia: false,
        contacto_realizado: false,
        requiere_seguimiento: false,
    });

    // Cargar tipos de acción al abrir
    useEffect(() => {
        if (!isOpen) return;
        setLoadingTipos(true);
        getTiposAccionSalud()
            .then(setTiposAccion)
            .catch(() => setTiposAccion([]))
            .finally(() => setLoadingTipos(false));
    }, [isOpen]);

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setSelectedParticipante(participante);
            const n = new Date();
            const iso = new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setForm({ fecha_hora: iso, tipo_accion: '', descripcion: '', requirio_contacto_familia: false, contacto_realizado: false, requiere_seguimiento: false });
        }
    }, [isOpen, participante]);

    const handleChange = (field: string, value: string | boolean) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            // Regla del spec: si requirio_contacto_familia=false, forzar contacto_realizado=false
            if (field === 'requirio_contacto_familia' && !value) {
                next.contacto_realizado = false;
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParticipante) { setError('Seleccioná a un participante.'); return; }
        if (!form.tipo_accion) { setError('Seleccioná un tipo de acción.'); return; }
        if (!form.descripcion.trim()) { setError('La descripción es obligatoria.'); return; }

        setSaving(true);
        setError(null);

        const payload: RegistrarAccionPayload = {
            id_inscripcion: selectedParticipante.id_inscripcion,
            id_participante: selectedParticipante.id,
            fecha_hora: new Date(form.fecha_hora).toISOString(),
            tipo_accion: form.tipo_accion,
            descripcion: form.descripcion.trim(),
            requirio_contacto_familia: form.requirio_contacto_familia,
            contacto_realizado: form.requirio_contacto_familia ? form.contacto_realizado : false,
            requiere_seguimiento: form.requiere_seguimiento,
        };

        try {
            await registrarAccionSalud(idEvento, payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar la acción.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-background border border-card-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-card-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Registrar Acción</h2>
                        {participante ? (
                            <p className="text-sm text-muted mt-0.5">{participante.nombre}</p>
                        ) : (
                            <p className="text-sm text-muted mt-0.5">Seleccionar participante</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-muted hover:bg-muted/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Selector de Participante (sólo si no viene pre-seleccionado) */}
                    {!participante && participantesDisponibles && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest">Participante</label>
                            <select
                                value={selectedParticipante?.id || ''}
                                onChange={(e) => {
                                    const p = participantesDisponibles.find(x => x.id_invitado === Number(e.target.value));
                                    if (p) {
                                        setSelectedParticipante({
                                            id: p.id_invitado,
                                            nombre: p.participante,
                                            id_inscripcion: p.id_inscripcion
                                        });
                                    } else {
                                        setSelectedParticipante(null);
                                    }
                                }}
                                className="w-full px-4 py-2.5 rounded-xl bg-card-bg border border-card-border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none text-foreground"
                                required
                            >
                                <option value="">Seleccioná un participante...</option>
                                {participantesDisponibles.map((p) => (
                                    <option key={p.id_invitado} value={p.id_invitado}>
                                        {p.participante} {p.alerta_visual ? '⚠️ (Alerta)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Fecha y Hora */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            value={form.fecha_hora}
                            onChange={(e) => handleChange('fecha_hora', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-card-bg border border-card-border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none text-foreground"
                            required
                        />
                    </div>

                    {/* Tipo de Acción */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest">Tipo de Acción</label>
                        {loadingTipos ? (
                            <div className="flex items-center gap-2 text-muted text-sm py-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Cargando tipos...
                            </div>
                        ) : (
                            <select
                                value={form.tipo_accion}
                                onChange={(e) => handleChange('tipo_accion', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-card-bg border border-card-border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none text-foreground"
                                required
                            >
                                <option value="">Seleccioná un tipo...</option>
                                {tiposAccion.map((t) => (
                                    <option key={t.codigo} value={t.codigo}>{t.texto}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest">Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            rows={3}
                            placeholder="Describí la acción realizada..."
                            className="w-full px-4 py-2.5 rounded-xl bg-card-bg border border-card-border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none text-foreground resize-none"
                            required
                        />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        {/* Requirió contacto familia */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/50">
                            <label className="text-sm text-foreground font-medium cursor-pointer" htmlFor="requirio_contacto">
                                ¿Requirió contactar a la familia?
                            </label>
                            <button
                                id="requirio_contacto"
                                type="button"
                                onClick={() => handleChange('requirio_contacto_familia', !form.requirio_contacto_familia)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.requirio_contacto_familia ? 'bg-blue-600' : 'bg-card-border'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.requirio_contacto_familia ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Contacto realizado (condicional) */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${form.requirio_contacto_familia ? 'border-card-border bg-card-bg/50' : 'border-card-border/40 bg-card-bg/20 opacity-50 pointer-events-none'}`}>
                            <label className="text-sm text-foreground font-medium">
                                ¿El contacto fue realizado?
                            </label>
                            <button
                                type="button"
                                disabled={!form.requirio_contacto_familia}
                                onClick={() => handleChange('contacto_realizado', !form.contacto_realizado)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.contacto_realizado ? 'bg-emerald-600' : 'bg-card-border'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.contacto_realizado ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Requiere seguimiento */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card-bg/50">
                            <label className="text-sm text-foreground font-medium">
                                ¿Requiere seguimiento?
                            </label>
                            <button
                                type="button"
                                onClick={() => handleChange('requiere_seguimiento', !form.requiere_seguimiento)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.requiere_seguimiento ? 'bg-amber-500' : 'bg-card-border'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.requiere_seguimiento ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-card-border text-muted hover:text-foreground text-sm font-semibold transition-colors">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-60"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Guardar Acción
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
