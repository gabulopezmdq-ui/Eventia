'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { saveCampana } from '@/src/features/captacion/captacion.service';
import { getEstructuraEvento } from '@/src/features/events/event.service';
import type { CaptacionLink, CaptacionLinkPayload } from '@/src/features/captacion/types';
import type { EstructuraEvento } from '@/src/features/events/types';

interface Props {
    idEvento: number;
    campana: CaptacionLink | null;
    onClose: () => void;
    onSave: () => void;
}

export default function CampanaFormModal({ idEvento, campana, onClose, onSave }: Props) {
    const [loading, setLoading] = useState(false);
    const [estructura, setEstructura] = useState<EstructuraEvento | null>(null);

    const [formData, setFormData] = useState<CaptacionLinkPayload>({
        id_acceso_link: campana?.id_acceso_link || null,
        id_acceso: campana?.id_acceso || 0,
        titulo: campana?.titulo || '',
        leyenda_publica: campana?.leyenda_publica || '',
        max_personas_total: campana?.max_personas_total || 100,
        es_captacion_publica: campana?.es_captacion_publica ?? true,
        requiere_registro: campana?.requiere_registro ?? true,
        requiere_nombres_acompanantes: campana?.requiere_nombres_acompanantes ?? false,
        mostrar_disponibles: campana?.mostrar_disponibles ?? false,
        permite_reutilizar_audiencia: campana?.permite_reutilizar_audiencia ?? true,
        activo: campana?.activo ?? true,
        fecha_expiracion: campana?.fecha_expiracion ? new Date(campana.fecha_expiracion).toISOString().slice(0, 16) : '',
        mensaje_post_registro: campana?.mensaje_post_registro || '',
        cupo_beneficio: campana?.cupo_beneficio || 0,
    });

    useEffect(() => {
        getEstructuraEvento(idEvento).then(setEstructura).catch(console.error);
    }, [idEvento]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...formData,
                fecha_expiracion: formData.fecha_expiracion ? new Date(formData.fecha_expiracion).toISOString() : null,
                cupo_beneficio: formData.cupo_beneficio || null,
            };
            await saveCampana(idEvento, payload);
            onSave();
        } catch (error) {
            console.error(error);
            alert('Error al guardar la campaña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
                <div className="sticky top-0 bg-card-bg/90 backdrop-blur border-b border-card-border p-6 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-foreground">
                        {campana ? 'Editar Campaña' : 'Nueva Campaña'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Título de Campaña</label>
                            <input
                                required
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Ej: Invitación General VIP"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Acceso Destino</label>
                            <select
                                required
                                name="id_acceso"
                                value={formData.id_acceso || ''}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                            >
                                <option value="" disabled>Seleccione un acceso...</option>
                                {estructura?.accesos.map(acc => (
                                    <option key={acc.id_acceso} value={acc.id_acceso}>
                                        {acc.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Cupo Total Personas</label>
                            <input
                                required
                                type="number"
                                name="max_personas_total"
                                value={formData.max_personas_total}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Fecha de Expiración</label>
                            <input
                                type="datetime-local"
                                name="fecha_expiracion"
                                value={formData.fecha_expiracion || ''}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Leyenda Pública (Landing)</label>
                            <textarea
                                name="leyenda_publica"
                                value={formData.leyenda_publica || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none resize-none"
                                placeholder="Mensaje para quienes abren el enlace..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-card-border pt-6">
                        <h3 className="text-sm font-bold text-foreground">Configuraciones Adicionales</h3>
                        
                        <label className="flex items-center gap-3 p-3 bg-background border border-card-border rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                            <input
                                type="checkbox"
                                name="es_captacion_publica"
                                checked={formData.es_captacion_publica}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-card-bg border-card-border"
                            />
                            <div>
                                <div className="text-sm font-bold text-foreground">Campaña Pública</div>
                                <div className="text-xs text-muted">Aparece en reportes de captación general</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-background border border-card-border rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                            <input
                                type="checkbox"
                                name="requiere_nombres_acompanantes"
                                checked={formData.requiere_nombres_acompanantes}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-card-bg border-card-border"
                            />
                            <div>
                                <div className="text-sm font-bold text-foreground">Solicitar Nombres Acompañantes</div>
                                <div className="text-xs text-muted">Si elige venir con amigos, se pedirán sus nombres</div>
                            </div>
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-card-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-foreground transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Campaña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
