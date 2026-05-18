'use client';

import { useEffect, useState } from 'react';
import { Plus, Link as LinkIcon, Power, PowerOff, Edit3, Trash2 } from 'lucide-react';
import { getCampanas, toggleCampana } from '@/src/features/captacion/captacion.service';
import type { CaptacionLink } from '@/src/features/captacion/types';
import type { LimitesEvento } from '@/src/features/events/types';
import { usePlanLimit } from '@/src/context/PlanLimitContext';
import { LockIcon } from '@/src/components/ui/LockIcon';
import CampanaFormModal from './CampanaFormModal';

export default function CampanasTab({ idEvento, limites }: { idEvento: number; limites?: LimitesEvento }) {
    const { handlePlanLimitError, openUpsell } = usePlanLimit();
    const [campanas, setCampanas] = useState<CaptacionLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampana, setSelectedCampana] = useState<CaptacionLink | null>(null);
    const [isToggling, setIsToggling] = useState<number | null>(null);

    const loadCampanas = async () => {
        try {
            setLoading(true);
            const data = await getCampanas(idEvento);
            setCampanas(data);
        } catch (error) {
            console.error(error);
            alert('Error al cargar campañas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCampanas();
    }, [idEvento]);

    const handleToggle = async (campana: CaptacionLink) => {
        setIsToggling(campana.id_acceso_link);
        try {
            await toggleCampana(campana.id_acceso_link, !campana.activo);
            await loadCampanas();
        } catch (error) {
            try { handlePlanLimitError(error); }
            catch {
                console.error(error);
                alert('Error al cambiar el estado de la campaña.');
            }
        } finally {
            setIsToggling(null);
        }
    };

    const handleCreate = () => {
        setSelectedCampana(null);
        setIsModalOpen(true);
    };

    const handleEdit = (campana: CaptacionLink) => {
        setSelectedCampana(campana);
        setIsModalOpen(true);
    };

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/registro/${token}`;
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    };

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Campañas Públicas</h2>
                {limites?.permitirGenerarLinks === false ? (
                    <button
                        onClick={() => openUpsell('Tu plan no permite crear nuevas campañas públicas. Mejorá tu plan para acceder a esta función.')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl font-bold text-sm transition-all border border-amber-500/20"
                    >
                        <LockIcon message="" size={16} />
                        Nueva Campaña
                    </button>
                ) : (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Campaña
                    </button>
                )}
            </div>

            {campanas.length === 0 ? (
                <div className="text-center p-12 bg-card-bg/50 border border-card-border rounded-2xl">
                    <LinkIcon className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-foreground">No hay campañas</h3>
                    <p className="text-muted text-sm mt-1">Crea una campaña para empezar a captar audiencia.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campanas.map(c => (
                        <div key={c.id_acceso_link} className="p-5 bg-card-bg border border-card-border rounded-2xl flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">{c.titulo}</h3>
                                    <p className="text-xs text-muted font-mono mt-1">Token: {c.token}</p>
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${c.activo ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                    {c.activo ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-sm py-3 border-y border-card-border/50">
                                <div>
                                    <p className="font-bold text-indigo-400">{c.registrados}</p>
                                    <p className="text-[10px] uppercase text-muted font-bold">Registros</p>
                                </div>
                                <div>
                                    <p className="font-bold text-purple-400">{c.beneficios_otorgados}</p>
                                    <p className="text-[10px] uppercase text-muted font-bold">Beneficios</p>
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-400">{c.max_personas_total}</p>
                                    <p className="text-[10px] uppercase text-muted font-bold">Cupo</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => copyLink(c.token)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-lg text-xs font-bold transition-all"
                                >
                                    <LinkIcon className="w-3.5 h-3.5" /> Copiar Link
                                </button>
                                <button
                                    onClick={() => handleEdit(c)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-foreground rounded-lg transition-all"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleToggle(c)}
                                    disabled={isToggling === c.id_acceso_link}
                                    className={`p-2 rounded-lg transition-all ${c.activo ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                                        }`}
                                >
                                    {c.activo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CampanaFormModal
                    idEvento={idEvento}
                    campana={selectedCampana}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        setIsModalOpen(false);
                        loadCampanas();
                    }}
                />
            )}
        </div>
    );
}
