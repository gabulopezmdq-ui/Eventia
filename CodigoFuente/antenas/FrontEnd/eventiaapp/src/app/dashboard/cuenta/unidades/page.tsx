'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getMisUnidades,
    setActivoUnidad,
    Unidad,
} from '@/src/features/cuenta/cuenta.service';
import { UnidadModal } from '@/src/features/cuenta/UnidadModal';
import {
    Building2,
    Plus,
    Loader2,
    CheckCircle2,
    XCircle,
    Pencil,
    PowerOff,
    Power,
    Tag,
    AlignLeft,
} from 'lucide-react';

export default function UnidadesPage() {
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUnidad, setSelectedUnidad] = useState<Unidad | undefined>(undefined);

    // Toggle activo loading por unidad
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const cargarUnidades = useCallback(() => {
        setLoading(true);
        setError(null);
        getMisUnidades(false) // false = traer todas, activas e inactivas
            .then(setUnidades)
            .catch(() => setError('No se pudieron cargar las unidades de negocio'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        cargarUnidades();
    }, [cargarUnidades]);

    const handleNueva = () => {
        setSelectedUnidad(undefined);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleEditar = (unidad: Unidad) => {
        setSelectedUnidad(unidad);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleToggleActivo = async (unidad: Unidad) => {
        setTogglingId(unidad.id_unidad);
        try {
            await setActivoUnidad(unidad.id_unidad, !unidad.activa);
            cargarUnidades();
        } catch {
            alert('No se pudo cambiar el estado de la unidad.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleModalSuccess = () => {
        setModalOpen(false);
        cargarUnidades();
    };

    const activas = unidades.filter(u => u.activa);
    const inactivas = unidades.filter(u => !u.activa);

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                            Unidades de Negocio
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Gestioná las sedes, sectores o marcas bajo tu cuenta organizadora.
                        </p>
                    </div>
                    <button
                        onClick={handleNueva}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Unidad
                    </button>
                </div>

                {/* ── States ── */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
                        {error}
                    </div>
                ) : unidades.length === 0 ? (
                    <div className="p-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center">
                        <Building2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aún no hay unidades registradas.</p>
                        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 mb-5">
                            Las unidades permiten organizar eventos por sector, sede o marca.
                        </p>
                        <button
                            onClick={handleNueva}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Crear primera unidad
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* ── Activas ── */}
                        {activas.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                                        Activas ({activas.length})
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {activas.map(unidad => (
                                        <UnidadCard
                                            key={unidad.id_unidad}
                                            unidad={unidad}
                                            toggling={togglingId === unidad.id_unidad}
                                            onEditar={handleEditar}
                                            onToggleActivo={handleToggleActivo}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Inactivas ── */}
                        {inactivas.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <XCircle className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                                        Inactivas ({inactivas.length})
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
                                    {inactivas.map(unidad => (
                                        <UnidadCard
                                            key={unidad.id_unidad}
                                            unidad={unidad}
                                            toggling={togglingId === unidad.id_unidad}
                                            onEditar={handleEditar}
                                            onToggleActivo={handleToggleActivo}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <UnidadModal
                    mode={modalMode}
                    initialData={selectedUnidad}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleModalSuccess}
                />
            )}
        </>
    );
}

// ─── Card de Unidad ───────────────────────────────────────────────────────────
interface UnidadCardProps {
    unidad: Unidad;
    toggling: boolean;
    onEditar: (u: Unidad) => void;
    onToggleActivo: (u: Unidad) => void;
}

function UnidadCard({ unidad, toggling, onEditar, onToggleActivo }: UnidadCardProps) {
    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors relative overflow-hidden group">

            {/* Badge principal */}
            {unidad.es_principal && (
                <div className="absolute top-0 right-0 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wide">
                    PRINCIPAL
                </div>
            )}

            {/* Icono + Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                    <Building2 className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-neutral-900 dark:text-white leading-tight truncate pr-10">
                        {unidad.nombre}
                    </h3>

                    {/* Código */}
                    {unidad.codigo && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Tag className="w-3 h-3 text-neutral-400" />
                            <span className="text-[11px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                                {unidad.codigo}
                            </span>
                        </div>
                    )}

                    {/* Descripción */}
                    {unidad.descripcion && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                            <AlignLeft className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                {unidad.descripcion}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: estado + acciones */}
            <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                {/* Estado */}
                <div className="flex items-center gap-1.5">
                    {unidad.activa ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Activa</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-xs font-medium text-neutral-500">Inactiva</span>
                        </>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEditar(unidad)}
                        title="Editar unidad"
                        className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onToggleActivo(unidad)}
                        disabled={toggling}
                        title={unidad.activa ? 'Desactivar unidad' : 'Activar unidad'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            unidad.activa
                                ? 'text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                : 'text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        }`}
                    >
                        {toggling
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : unidad.activa
                                ? <PowerOff className="w-3.5 h-3.5" />
                                : <Power className="w-3.5 h-3.5" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
