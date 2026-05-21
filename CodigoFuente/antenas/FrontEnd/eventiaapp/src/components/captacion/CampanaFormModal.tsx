'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { saveCampana, getTiposBeneficio } from '@/src/features/captacion/captacion.service';
import { getEstructuraEvento } from '@/src/features/events/event.service';
import type { CaptacionLink, CaptacionLinkPayload, TipoBeneficio } from '@/src/features/captacion/types';
import type { EstructuraEvento } from '@/src/features/events/types';
import { usePlanLimit } from '@/src/context/PlanLimitContext';

interface Props {
    idEvento: number;
    campana: CaptacionLink | null;
    onClose: () => void;
    onSave: () => void;
}

export default function CampanaFormModal({ idEvento, campana, onClose, onSave }: Props) {
    const { handlePlanLimitError } = usePlanLimit();
    const [loading, setLoading] = useState(false);
    const [estructura, setEstructura] = useState<EstructuraEvento | null>(null);
    const [tiposBeneficio, setTiposBeneficio] = useState<TipoBeneficio[]>([]);

    const [formData, setFormData] = useState<CaptacionLinkPayload>({
        id_acceso_link: campana?.id_acceso_link || null,
        id_acceso: campana?.id_acceso || 0,
        titulo: campana?.titulo || '',
        leyenda_publica: campana?.leyenda_publica || '',
        max_personas_total: campana?.max_personas_total || 100,
        max_adultos: campana?.max_adultos ?? 1,
        origen_default: campana?.origen_default || '',
        es_captacion_publica: campana?.es_captacion_publica ?? true,
        requiere_registro: campana?.requiere_registro ?? true,
        requiere_nombres_acompanantes: campana?.requiere_nombres_acompanantes ?? false,
        mostrar_disponibles: campana?.mostrar_disponibles ?? false,
        permite_reutilizar_audiencia: campana?.permite_reutilizar_audiencia ?? true,
        activo: campana?.activo ?? true,
        fecha_expiracion: campana?.fecha_expiracion ? new Date(campana.fecha_expiracion).toISOString().slice(0, 16) : '',
        mensaje_post_registro: campana?.mensaje_post_registro || '',
        cupo_beneficio: campana?.cupo_beneficio || 0,
        id_tipo_beneficio_registro: campana?.id_tipo_beneficio_registro || null,
        beneficio_titulo: campana?.beneficio_titulo || '',
        beneficio_descripcion: campana?.beneficio_descripcion || '',
        beneficio_hasta: campana?.beneficio_hasta ? new Date(campana.beneficio_hasta).toISOString().slice(0, 16) : '',
    });

    useEffect(() => {
        getEstructuraEvento(idEvento).then(setEstructura).catch(console.error);
        getTiposBeneficio(idEvento).then(setTiposBeneficio).catch(console.error);
    }, [idEvento]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));
    };

    const selectedAcceso = estructura?.accesos.find(a => a.id_acceso === Number(formData.id_acceso));
    const isConBeneficio = selectedAcceso?.nombre.toLowerCase().includes('beneficio');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...formData,
                fecha_expiracion: formData.fecha_expiracion ? new Date(formData.fecha_expiracion).toISOString() : null,
                beneficio_hasta: isConBeneficio && formData.beneficio_hasta ? new Date(formData.beneficio_hasta).toISOString() : null,
                cupo_beneficio: isConBeneficio ? formData.cupo_beneficio || null : null,
                id_tipo_beneficio_registro: isConBeneficio && formData.id_tipo_beneficio_registro ? Number(formData.id_tipo_beneficio_registro) : null,
                max_adultos: formData.max_adultos ? Number(formData.max_adultos) : 1,
                origen_default: formData.origen_default || null,
            };
            await saveCampana(idEvento, payload);
            onSave();
        } catch (error) {
            try { handlePlanLimitError(error); }
            catch {
                console.error(error);
                alert('Error al guardar la campaña');
            }
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

                        <div>
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Cupo Total de Registros</label>
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
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Cierre de Registro</label>
                            <input
                                type="datetime-local"
                                name="fecha_expiracion"
                                value={formData.fecha_expiracion || ''}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Acompañantes Máximos / Adultos</label>
                            <input
                                required
                                type="number"
                                name="max_adultos"
                                value={formData.max_adultos ?? 1}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Origen por Defecto</label>
                            <select
                                name="origen_default"
                                value={formData.origen_default || ''}
                                onChange={handleChange}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none animate-in fade-in"
                            >
                                <option value="">Sin origen específico (Default)</option>
                                <option value="INSTAGRAM">INSTAGRAM</option>
                                <option value="QR_BARRA">QR_BARRA</option>
                                <option value="WHATSAPP">WHATSAPP</option>
                                <option value="VIP">VIP</option>
                                <option value="INFLUENCERS">INFLUENCERS</option>
                                <option value="STAFF">STAFF</option>
                            </select>
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

                        <div className="col-span-2 pt-4 border-t border-card-border mt-2">
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

                        {isConBeneficio && (
                            <div className="col-span-2 space-y-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                                <h3 className="text-sm font-bold text-indigo-400">Configuración de Beneficio</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Tipo de Beneficio</label>
                                        <select
                                            name="id_tipo_beneficio_registro"
                                            value={formData.id_tipo_beneficio_registro || ''}
                                            onChange={handleChange}
                                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                        >
                                            <option value="">Sin beneficio</option>
                                            {tiposBeneficio.map(tipo => (
                                                <option key={tipo.id} value={tipo.id}>
                                                    {tipo.texto}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.id_tipo_beneficio_registro ? (
                                        <>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Título del Beneficio</label>
                                                <input
                                                    name="beneficio_titulo"
                                                    value={formData.beneficio_titulo || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                                    placeholder="Ej: 2x1 en Tragos"
                                                />
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Cupo del Beneficio</label>
                                                <input
                                                    type="number"
                                                    name="cupo_beneficio"
                                                    value={formData.cupo_beneficio || 0}
                                                    onChange={handleChange}
                                                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                                    min={0}
                                                    placeholder="0 = Sin límite"
                                                />
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Vencimiento del Beneficio</label>
                                                <input
                                                    type="datetime-local"
                                                    name="beneficio_hasta"
                                                    value={formData.beneficio_hasta || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Descripción del Beneficio</label>
                                                <textarea
                                                    name="beneficio_descripcion"
                                                    value={formData.beneficio_descripcion || ''}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none resize-none"
                                                    placeholder="Detalles del beneficio..."
                                                />
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        )}
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

                        <label className="flex items-center gap-3 p-3 bg-background border border-card-border rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                            <input
                                type="checkbox"
                                name="mostrar_disponibles"
                                checked={formData.mostrar_disponibles}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-card-bg border-card-border"
                            />
                            <div>
                                <div className="text-sm font-bold text-foreground">Mostrar Disponibles</div>
                                <div className="text-xs text-muted">Muestra la disponibilidad de cupos públicamente</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-background border border-card-border rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                            <input
                                type="checkbox"
                                name="permite_reutilizar_audiencia"
                                checked={formData.permite_reutilizar_audiencia}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-card-bg border-card-border"
                            />
                            <div>
                                <div className="text-sm font-bold text-foreground">Permite Reutilizar Audiencia</div>
                                <div className="text-xs text-muted">Evita duplicar personas en la base de datos general si ya se registraron antes</div>
                            </div>
                        </label>

                        <div className="col-span-2 pt-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Mensaje Post Registro</label>
                            <textarea
                                name="mensaje_post_registro"
                                value={formData.mensaje_post_registro || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none resize-none"
                                placeholder="Ej: ¡Registro exitoso! Muestra este QR en el ingreso..."
                            />
                        </div>
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
