'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
    HeartHandshake,
    AlertTriangle,
    Search,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

interface OportunidadInfo {
    id_evento: number;
    fecha_alta: string;
    anfitriones_texto: string;
    tipo_evento: string;
    plan_nombre: string;
    owner_email: string;
    trial_fecha_fin: string;
    trial_dias_restantes: number;
    trial_vencido: boolean;
    convertido: boolean;
}

export default function OportunidadesAdminPage() {
    const { ui, isSuperAdmin } = useAuth();
    const [data, setData] = useState<OportunidadInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filtro frontend: activos, por_vencer (<= 2 dias), vencidos
    const [tab, setTab] = useState<'activos' | 'por_vencer' | 'vencidos'>('activos');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/oportunidades');
            if (!res.ok) throw new Error('Error al cargar oportunidades');
            const result = await res.json();
            
            const list = Array.isArray(result) ? result : (result.data || []);
            
            setData(list.map((item: any) => ({
                id_evento: item.id_evento ?? item.idEvento,
                fecha_alta: item.fecha_alta ?? item.fechaAlta,
                anfitriones_texto: item.anfitriones_texto ?? item.anfitrionesTexto,
                tipo_evento: item.tipo_evento ?? item.tipoEvento,
                plan_nombre: item.plan_nombre ?? item.planNombre,
                owner_email: item.owner_email ?? item.ownerEmail,
                trial_fecha_fin: item.trial_fecha_fin ?? item.trialFechaFin,
                trial_dias_restantes: item.trial_dias_restantes ?? item.trialDiasRestantes,
                trial_vencido: item.trial_vencido ?? item.trialVencido,
                convertido: item.convertido
            })));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (ui === null) return null;
    if (!ui.mostrar_admin && !isSuperAdmin) {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
    }

    // Filtrar data por la tab actual
    const getFilteredByTab = () => {
        if (tab === 'vencidos') return data.filter(d => d.trial_vencido);
        if (tab === 'por_vencer') return data.filter(d => !d.trial_vencido && d.trial_dias_restantes <= 2);
        // activos = los que tienen mas de 2 dias y no estan vencidos
        return data.filter(d => !d.trial_vencido && d.trial_dias_restantes > 2);
    };

    const currentList = getFilteredByTab();
    
    // Aplicar buscador texto
    const filteredList = currentList.filter(o =>
        o.anfitriones_texto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Contadores para las tabs
    const counts = {
        activos: data.filter(d => !d.trial_vencido && d.trial_dias_restantes > 2).length,
        por_vencer: data.filter(d => !d.trial_vencido && d.trial_dias_restantes <= 2).length,
        vencidos: data.filter(d => d.trial_vencido).length
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <HeartHandshake className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Oportunidades Free/Trial
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Usuarios con prueba gratuita pendientes de conversión
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {/* Tabs & Search */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
                        <button onClick={() => setTab('activos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'activos' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Activos <span className="font-bold">({counts.activos})</span>
                        </button>
                        <button onClick={() => setTab('por_vencer')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'por_vencer' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Por Vencer <span className="text-amber-500 font-bold">({counts.por_vencer})</span>
                        </button>
                        <button onClick={() => setTab('vencidos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'vencidos' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>
                            Vencidos <span className="text-red-500 font-bold">({counts.vencidos})</span>
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar anfitrión o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
                            <p>Cargando oportunidades...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-red-500">
                            <AlertTriangle className="w-8 h-8 mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <CheckCircle2 className="w-12 h-12 mb-3 text-neutral-300 dark:text-neutral-700" />
                            <p className="text-lg font-medium">No hay registros</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/30">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Evento / Contacto</th>
                                    <th className="px-6 py-4 font-semibold">Alta</th>
                                    <th className="px-6 py-4 font-semibold">Estado Trial</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {filteredList.map((op) => (
                                    <tr key={op.id_evento} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {op.anfitriones_texto} <span className="text-xs font-normal text-neutral-500 ml-1">#{op.id_evento}</span>
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1">{op.owner_email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                                {op.plan_nombre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-neutral-600 dark:text-neutral-300">
                                            {new Date(op.fecha_alta).toLocaleDateString()}
                                            <p className="text-neutral-400 mt-1">{op.tipo_evento}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {op.trial_vencido ? (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Clock className={`w-4 h-4 ${op.trial_dias_restantes <= 2 ? 'text-amber-500' : 'text-blue-500'}`} />
                                                )}
                                                <div>
                                                    <p className={`font-bold ${op.trial_vencido ? 'text-red-500' : (op.trial_dias_restantes <= 2 ? 'text-amber-600' : 'text-blue-600')}`}>
                                                        {op.trial_vencido ? 'VENCIDO' : `${op.trial_dias_restantes} días restantes`}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500">
                                                        Fin: {new Date(op.trial_fecha_fin).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`mailto:${op.owner_email}?subject=Tu prueba en Eventia está terminando`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 hover:bg-teal-200 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Contactar Owner
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
