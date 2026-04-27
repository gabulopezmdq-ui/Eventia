'use client';

import { use, useEffect, useState } from 'react';
import { getAudienciaDetalle, getTagsSugeridos, agregarTag, setTagActivo } from '@/src/features/captacion/audiencias.service';
import type { AudienciaPersonaDetalle, TagSugerido } from '@/src/features/captacion/types';
import { Loader2, ArrowLeft, Calendar, Tag as TagIcon, X, Check, MapPin, User, Mail, Phone, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function AudienciaDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [persona, setPersona] = useState<AudienciaPersonaDetalle | null>(null);
    const [tagsSugeridos, setTagsSugeridos] = useState<TagSugerido[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTipoTag, setSelectedTipoTag] = useState<string>('');
    const [selectedTagValor, setSelectedTagValor] = useState<string>('');
    const [addingTag, setAddingTag] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getAudienciaDetalle(Number(id));
            setPersona(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        getTagsSugeridos().then(setTagsSugeridos).catch(console.error);
    }, [id]);

    const handleAddTag = async () => {
        if (!selectedTipoTag || !selectedTagValor) return;
        try {
            setAddingTag(true);
            await agregarTag(Number(id), selectedTipoTag, selectedTagValor);
            setSelectedTagValor('');
            await loadData();
        } catch (error) {
            console.error(error);
            alert('Error al agregar tag');
        } finally {
            setAddingTag(false);
        }
    };

    const handleRemoveTag = async (idAudienciaPersonaTag: number) => {
        if (!confirm('¿Quitar este tag?')) return;
        try {
            await setTagActivo(idAudienciaPersonaTag, false);
            await loadData();
        } catch (error) {
            console.error(error);
            alert('Error al quitar tag');
        }
    };

    if (loading || !persona) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    // Filtrar tags sugeridos por tipo para el combo de agregar
    const tiposDisponibles = Array.from(new Set(tagsSugeridos.filter(t => t.permite_asignacion_manual).map(t => t.tag_tipo)));
    const valoresDisponibles = tagsSugeridos.filter(t => t.permite_asignacion_manual && t.tag_tipo === selectedTipoTag);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/audiencia" className="p-2 bg-card-bg hover:bg-background border border-card-border rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted hover:text-foreground" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {persona.nombre} {persona.apellido}
                    </h1>
                    <p className="text-muted text-sm mt-0.5">
                        Perfil del asistente en el CRM
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna Izquierda: Datos y Tags */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Tarjeta de Contacto */}
                    <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted border-b border-card-border pb-2">Información Personal</h3>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-foreground">
                                <Mail className="w-4 h-4 text-muted" />
                                <span>{persona.email || <span className="text-muted italic">Sin email</span>}</span>
                            </div>
                            <div className="flex items-center gap-3 text-foreground">
                                <Phone className="w-4 h-4 text-muted" />
                                <span>{persona.celular || <span className="text-muted italic">Sin celular</span>}</span>
                            </div>
                            <div className="flex items-center gap-3 text-foreground">
                                <Instagram className="w-4 h-4 text-muted" />
                                <span>{persona.instagram || <span className="text-muted italic">No provisto</span>}</span>
                            </div>
                            <div className="flex items-center gap-3 text-foreground">
                                <MapPin className="w-4 h-4 text-muted" />
                                <span>{persona.ciudad ? `${persona.ciudad}${persona.zona ? ` (${persona.zona})` : ''}` : <span className="text-muted italic">Ubicación desconocida</span>}</span>
                            </div>
                            <div className="flex items-center gap-3 text-foreground">
                                <User className="w-4 h-4 text-muted" />
                                <span>Edad: {persona.fecha_nacimiento ? `${new Date().getFullYear() - new Date(persona.fecha_nacimiento).getFullYear()} años` : <span className="text-muted italic">No provista</span>}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-card-border flex gap-2">
                            {persona.acepta_comunicaciones && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-md">Comunicaciones OK</span>}
                            {persona.acepta_promociones && <span className="px-2 py-1 bg-indigo-500/10 text-indigo-600 text-[10px] font-bold rounded-md">Promociones OK</span>}
                        </div>
                    </div>

                    {/* Tarjeta de Tags */}
                    <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted flex items-center gap-2">
                            <TagIcon className="w-4 h-4" /> Etiquetas (Tags)
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {persona.tags.length === 0 ? (
                                <p className="text-sm text-muted">No tiene etiquetas activas.</p>
                            ) : (
                                persona.tags.map(tag => (
                                    <div key={tag.id_audiencia_persona_tag} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${tag.origen === 'AUTO' ? 'bg-background border-card-border text-muted' : 'bg-purple-500/10 border-purple-500/20 text-purple-600'}`}>
                                        {tag.nombre_mostrar}
                                        {tag.origen === 'MANUAL' && (
                                            <button onClick={() => handleRemoveTag(tag.id_audiencia_persona_tag)} className="hover:text-red-500 ml-1">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Agregar Tag */}
                        <div className="pt-4 border-t border-card-border space-y-3">
                            <h4 className="text-xs font-bold text-foreground">Agregar Etiqueta Manual</h4>
                            <select 
                                value={selectedTipoTag} 
                                onChange={(e) => { setSelectedTipoTag(e.target.value); setSelectedTagValor(''); }}
                                className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-sm outline-none"
                            >
                                <option value="">Seleccionar Tipo...</option>
                                {tiposDisponibles.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            
                            {selectedTipoTag && (
                                <select 
                                    value={selectedTagValor} 
                                    onChange={(e) => setSelectedTagValor(e.target.value)}
                                    className="w-full bg-background border border-card-border rounded-xl px-3 py-2 text-sm outline-none"
                                >
                                    <option value="">Seleccionar Etiqueta...</option>
                                    {valoresDisponibles.map(t => (
                                        <option key={t.tag_valor} value={t.tag_valor}>{t.nombre_mostrar}</option>
                                    ))}
                                </select>
                            )}

                            <button 
                                onClick={handleAddTag}
                                disabled={addingTag || !selectedTipoTag || !selectedTagValor}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors"
                            >
                                {addingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Asignar Tag
                            </button>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Historial de Eventos */}
                <div className="lg:col-span-2">
                    <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-card-border flex items-center justify-between">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Historial de Asistencia
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-background/50 border-b border-card-border text-xs uppercase tracking-widest text-muted">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Evento / Campaña</th>
                                        <th className="px-6 py-4 font-bold text-center">Registro</th>
                                        <th className="px-6 py-4 font-bold text-center">Asistencia</th>
                                        <th className="px-6 py-4 font-bold text-center">Beneficio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {persona.historial.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted text-sm">
                                                No hay historial de eventos para esta persona.
                                            </td>
                                        </tr>
                                    ) : (
                                        persona.historial.map(h => (
                                            <tr key={h.id_evento} className="hover:bg-background/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-foreground">{h.evento_nombre}</div>
                                                    <div className="text-xs text-muted mt-0.5">Origen: {h.origen_registro || 'General'}</div>
                                                    <div className="text-[10px] text-muted/70 mt-1 uppercase">Sede: {h.unidad || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-xs font-bold text-muted">
                                                        {new Date(h.fecha_registro).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {h.asistio ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                                                            <Check className="w-3 h-3" /> Asistió
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 text-xs font-bold">
                                                            No show
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {h.beneficio_otorgado ? (
                                                        h.beneficio_canjeado ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 text-xs font-bold">
                                                                <Check className="w-3 h-3" /> Canjeado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-bold">
                                                                Pendiente
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-muted">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
