'use client';

import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Loader2, Save, Info, Crown } from 'lucide-react';

interface FeatureEfectiva {
    codigo_feature: string;
    nombre_feature: string;
    descripcion: string;
    incluida_en_plan: boolean; // Si la puede usar o necesita upgrade
}

interface FeaturesEventoProps {
    idEvento: number;
}

export default function FeaturesEventoManager({ idEvento }: FeaturesEventoProps) {
    const [efectivas, setEfectivas] = useState<FeatureEfectiva[]>([]);
    const [activas, setActivas] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Obtener el catalogo disponible
            const resEfectivas = await fetch(`/api/features-efectivas?idEvento=${idEvento}`);
            if (!resEfectivas.ok) throw new Error('Error al cargar catálogo de módulos');
            const dataEfectivas = await resEfectivas.json();
            
            // 2. Obtener los switches que tiene prendidos
            const resActivas = await fetch(`/api/evento-features?idEvento=${idEvento}`);
            if (!resActivas.ok) throw new Error('Error al cargar módulos encendidos');
            const dataActivas = await resActivas.json();

            setEfectivas(dataEfectivas.data || dataEfectivas);
            
            // Mapeamos para obtener solo un array de strings (codigos de feature activas)
            const activasArray = (dataActivas.data || dataActivas).map((a: any) => a.codigo_feature ?? a.codigoFeature);
            setActivas(activasArray);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idEvento) fetchData();
    }, [idEvento]);

    const handleToggle = (codigo: string, incluida: boolean) => {
        if (!incluida) {
            alert('Esta funcionalidad requiere hacer un upgrade de plan para este evento.');
            return;
        }

        if (activas.includes(codigo)) {
            setActivas(activas.filter(a => a !== codigo));
        } else {
            setActivas([...activas, codigo]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/evento-features?idEvento=${idEvento}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activas) // Enviamos el array modificado
            });
            if (!res.ok) throw new Error('Error al guardar configuraciones');
            alert('Módulos actualizados con éxito.');
        } catch (err) {
            alert('Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Módulos del Evento</h3>
                    <p className="text-sm text-neutral-500 mt-1">Activa o desactiva las funcionalidades que verán tus invitados.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {efectivas.map((feat) => {
                    const isActiva = activas.includes(feat.codigo_feature);
                    const isPremium = !feat.incluida_en_plan;

                    return (
                        <div 
                            key={feat.codigo_feature}
                            className={`p-4 rounded-2xl border transition-all ${
                                isActiva 
                                    ? 'border-purple-200 bg-purple-50/50 dark:border-purple-500/30 dark:bg-purple-500/5' 
                                    : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                            } ${isPremium ? 'opacity-70 grayscale-[0.5]' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {isPremium ? (
                                            <Crown className="w-5 h-5 text-amber-500" />
                                        ) : (
                                            <Info className="w-5 h-5 text-purple-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                            {feat.nombre_feature}
                                            {isPremium && (
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
                                                    Upgrade Requerido
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 pr-4">
                                            {feat.descripcion}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle(feat.codigo_feature, feat.incluida_en_plan)}
                                    className={`focus:outline-none transition-transform ${isActiva ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-300 dark:text-neutral-600'}`}
                                >
                                    {isActiva ? (
                                        <ToggleRight className="w-8 h-8" />
                                    ) : (
                                        <ToggleLeft className="w-8 h-8" />
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
