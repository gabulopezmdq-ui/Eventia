'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
    FileSearch,
    AlertTriangle,
    Search,
    Loader2,
    CheckCircle2,
    X,
    History,
    MessageSquare,
    Edit3
} from 'lucide-react';

interface ProspectoInfo {
    id_prospecto: number;
    fecha_alta: string;
    estado: 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'DESCARTADO' | 'CONVERTIDO';
    empresa_nombre: string;
    nombre_apellido: string;
    ciudad: string;
    pais: string;
    whatsapp: string;
    email: string;
    eventos_por_mes: number;
    proximo_contacto: string;
    id_usuario_asignado: number | null;
    asignado_nombre: string;
    asignado_email: string;
}

interface HistorialItem {
    id_hist: number;
    id_prospecto: number;
    fecha: string;
    id_usuario: number | null;
    tipo: string;
    detalle: string;
    estado_nuevo: string | null;
    proximo_contacto: string | null;
}

export default function ProspectosAdminPage() {
    const { ui, isSuperAdmin } = useAuth();
    const [data, setData] = useState<ProspectoInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

    // Modals
    const [selectedProspecto, setSelectedProspecto] = useState<ProspectoInfo | null>(null);
    const [modalAction, setModalAction] = useState<'Editar' | 'Nota' | 'Historial' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [historial, setHistorial] = useState<HistorialItem[]>([]);
    const [historialLoading, setHistorialLoading] = useState(false);

    // Form states
    const [editEstado, setEditEstado] = useState('NUEVO');
    const [editAsignado, setEditAsignado] = useState('');
    const [editProximoContacto, setEditProximoContacto] = useState('');
    const [nota, setNota] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/prospectos-b2b/pendientes');
            if (!res.ok) throw new Error('Error al cargar prospectos');
            const result = await res.json();
            
            const list = Array.isArray(result) ? result : (result.data || []);
            
            setData(list.map((item: any) => ({
                id_prospecto: item.id_prospecto ?? item.idProspecto,
                fecha_alta: item.fecha_alta ?? item.fechaAlta,
                estado: item.estado || 'NUEVO',
                empresa_nombre: item.empresa_nombre ?? item.empresaNombre ?? 'Sin Empresa',
                nombre_apellido: item.nombre_apellido ?? item.nombreApellido ?? 'Sin Nombre',
                ciudad: item.ciudad ?? '',
                pais: item.pais ?? '',
                whatsapp: item.whatsapp ?? item.telefono ?? '',
                email: item.email ?? '',
                eventos_por_mes: item.eventos_por_mes ?? item.eventosPorMes ?? 0,
                proximo_contacto: item.proximo_contacto ?? item.proximoContacto ?? '',
                id_usuario_asignado: item.id_usuario_asignado ?? item.idUsuarioAsignado ?? null,
                asignado_nombre: item.asignado_nombre ?? item.asignadoNombre ?? '',
                asignado_email: item.asignado_email ?? item.asignadoEmail ?? ''
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

    const fetchHistorial = async (id: number) => {
        setHistorialLoading(true);
        try {
            const res = await fetch(`/api/admin/prospectos-b2b/historial?idProspecto=${id}`);
            if (res.ok) {
                const result = await res.json();
                const list = Array.isArray(result) ? result : (result.historial || result.data || []);
                setHistorial(list);
            }
        } catch (e) {
            console.error("Error al cargar historial", e);
        } finally {
            setHistorialLoading(false);
        }
    };

    const openModal = (prospecto: ProspectoInfo, action: 'Editar' | 'Nota' | 'Historial') => {
        setSelectedProspecto(prospecto);
        setModalAction(action);
        
        if (action === 'Editar') {
            setEditEstado(prospecto.estado);
            setEditAsignado(prospecto.asignado_email || '');
            setEditProximoContacto(prospecto.proximo_contacto ? prospecto.proximo_contacto.split('T')[0] : '');
        } else if (action === 'Nota') {
            setNota('');
        } else if (action === 'Historial') {
            fetchHistorial(prospecto.id_prospecto);
        }
    };

    const closeModal = () => {
        setModalAction(null);
        setSelectedProspecto(null);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProspecto) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/prospectos-b2b/update?idProspecto=${selectedProspecto.id_prospecto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: editEstado,
                    asignado_a: editAsignado,
                    proximo_contacto: editProximoContacto || null
                })
            });
            if (!res.ok) throw new Error('Error al actualizar');
            closeModal();
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddNota = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProspecto || !nota) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/prospectos-b2b/agregar-nota?idProspecto=${selectedProspecto.id_prospecto}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nota })
            });
            if (!res.ok) throw new Error('Error al guardar nota');
            closeModal();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (ui === null) return null;
    if (!ui.mostrar_admin && !isSuperAdmin) {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
    }

    const filteredList = data.filter(p => {
        const matchSearch = p.empresa_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.nombre_apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
        return matchSearch && matchEstado;
    });

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'NUEVO': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">NUEVO</span>;
            case 'CONTACTADO': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">CONTACTADO</span>;
            case 'CALIFICADO': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">CALIFICADO</span>;
            case 'CONVERTIDO': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">CONVERTIDO</span>;
            case 'DESCARTADO': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">DESCARTADO</span>;
            default: return <span>{estado}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <FileSearch className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Prospectos B2B
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Seguimiento de leads y solicitudes de información
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {/* Search & Filters */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
                        {['TODOS', 'NUEVO', 'CONTACTADO', 'CALIFICADO', 'CONVERTIDO', 'DESCARTADO'].map((est) => (
                            <button
                                key={est}
                                onClick={() => setFiltroEstado(est)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    filtroEstado === est
                                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                            >
                                {est}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar prospecto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                            <p>Cargando datos...</p>
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
                                    <th className="px-6 py-4 font-semibold">Empresa / Contacto</th>
                                    <th className="px-6 py-4 font-semibold">Ubicación</th>
                                    <th className="px-6 py-4 font-semibold">Volumen / Tipo</th>
                                    <th className="px-6 py-4 font-semibold">Gestión</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {filteredList.map((p) => (
                                    <tr key={p.id_prospecto} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                                {p.empresa_nombre}
                                                {getEstadoBadge(p.estado)}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{p.nombre_apellido}</p>
                                            <div className="flex gap-2 mt-1">
                                                {p.email && (
                                                    <a href={`mailto:${p.email}`} className="text-[10px] text-blue-500 hover:underline font-medium">{p.email}</a>
                                                )}
                                                {p.email && p.whatsapp && <span className="text-neutral-300">|</span>}
                                                {p.whatsapp && (
                                                    <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1">
                                                        WhatsApp
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                                {p.ciudad || p.pais ? `${p.ciudad}${p.ciudad && p.pais ? ', ' : ''}${p.pais}` : 'No especificado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                {p.eventos_por_mes} {p.eventos_por_mes === 1 ? 'evento' : 'eventos'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Gestión</p>
                                            <div className="mt-1 space-y-1">
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    {p.asignado_nombre || p.asignado_email ? (p.asignado_nombre || p.asignado_email) : <span className="italic text-neutral-400">Sin asignar</span>}
                                                </p>
                                                {p.proximo_contacto && (
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Contactar: {new Date(p.proximo_contacto).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {!p.proximo_contacto && (
                                                    <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                                                        Alta: {new Date(p.fecha_alta).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(p, 'Nota')}
                                                    title="Agregar Nota"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openModal(p, 'Editar')}
                                                    title="Editar Estado"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openModal(p, 'Historial')}
                                                    title="Ver Historial"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Editar */}
            {modalAction === 'Editar' && selectedProspecto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Actualizar Prospecto</h3>
                            <button onClick={closeModal}><X className="w-5 h-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Estado</label>
                                <select value={editEstado} onChange={(e) => setEditEstado(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="NUEVO">NUEVO</option>
                                    <option value="CONTACTADO">CONTACTADO</option>
                                    <option value="CALIFICADO">CALIFICADO</option>
                                    <option value="CONVERTIDO">CONVERTIDO</option>
                                    <option value="DESCARTADO">DESCARTADO</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Asignado a (Email/Nombre)</label>
                                <input type="text" value={editAsignado} onChange={(e) => setEditAsignado(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Próximo Contacto</label>
                                <input type="date" value={editProximoContacto} onChange={(e) => setEditProximoContacto(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex justify-center items-center gap-2 transition-colors">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nota */}
            {modalAction === 'Nota' && selectedProspecto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Agregar Nota Interna</h3>
                            <button onClick={closeModal}><X className="w-5 h-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleAddNota} className="space-y-4">
                            <textarea
                                required
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                placeholder="Escribí una nota sobre el estado de las negociaciones o contacto..."
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                            />
                            <div className="flex gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex justify-center items-center gap-2 transition-colors">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Guardar Nota
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Historial */}
            {modalAction === 'Historial' && selectedProspecto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-lg border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                            <div>
                                <h3 className="font-bold text-lg">Historial</h3>
                                <p className="text-xs text-neutral-500">{selectedProspecto.empresa_nombre}</p>
                            </div>
                            <button onClick={closeModal}><X className="w-5 h-5 text-neutral-500" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {historialLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                            ) : historial.length === 0 ? (
                                <p className="text-center text-neutral-500 py-4">No hay historial registrado.</p>
                            ) : (
                                historial.map((h, i) => (
                                    <div key={h.id_hist || i} className="flex gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">{h.tipo}</p>
                                                {h.estado_nuevo && (
                                                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-500">
                                                        → {h.estado_nuevo}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">{h.detalle}</p>
                                            <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                                                <span>{new Date(h.fecha).toLocaleString()}</span>
                                                {h.id_usuario ? <span>• Usuario ID: {h.id_usuario}</span> : <span>• Sistema</span>}
                                                {h.proximo_contacto && <span className="text-amber-500">• Próximo contacto: {new Date(h.proximo_contacto).toLocaleDateString()}</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
