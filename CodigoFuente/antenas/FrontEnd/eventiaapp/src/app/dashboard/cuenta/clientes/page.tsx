'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getMisClientes,
    getMisUnidades,
    setActivoCliente,
    Cliente,
    Unidad,
} from '@/src/features/cuenta/cuenta.service';
import { ClienteModal } from '@/src/features/cuenta/ClienteModal';
import {
    Users,
    Plus,
    Loader2,
    Mail,
    Phone,
    CheckCircle2,
    XCircle,
    Pencil,
    Power,
    PowerOff,
    FileText,
    Building2,
    Search,
    SlidersHorizontal,
} from 'lucide-react';

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroUnidad, setFiltroUnidad] = useState<string>('');
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('activos');

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);

    // Toggle loading por cliente
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const cargarDatos = useCallback(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            getMisClientes(false),   // false = traer todos (activos + inactivos)
            getMisUnidades(true),
        ])
            .then(([c, u]) => {
                setClientes(c);
                setUnidades(u);
            })
            .catch(() => setError('No se pudieron cargar los datos'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // ── Filtrado ──────────────────────────────────────────────
    const clientesFiltrados = clientes.filter(c => {
        const matchEstado =
            filtroEstado === 'todos' ? true :
            filtroEstado === 'activos' ? c.es_activo :
            !c.es_activo;

        const matchUnidad =
            filtroUnidad === '' ? true :
            String(c.id_unidad_principal) === filtroUnidad;

        const q = busqueda.toLowerCase();
        const matchBusqueda =
            busqueda === '' ? true :
            c.nombre_cliente.toLowerCase().includes(q) ||
            (c.email ?? '').toLowerCase().includes(q) ||
            (c.telefono ?? '').includes(q);

        return matchEstado && matchUnidad && matchBusqueda;
    });

    // ── Acciones ──────────────────────────────────────────────
    const handleNuevo = () => {
        setSelectedCliente(undefined);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleEditar = (cliente: Cliente) => {
        setSelectedCliente(cliente);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleToggleActivo = async (cliente: Cliente) => {
        setTogglingId(cliente.id_cliente);
        try {
            await setActivoCliente(cliente.id_cliente, !cliente.es_activo);
            cargarDatos();
        } catch {
            alert('No se pudo cambiar el estado del cliente.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleModalSuccess = () => {
        setModalOpen(false);
        cargarDatos();
    };

    const totalActivos = clientes.filter(c => c.es_activo).length;

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Users className="w-6 h-6 text-sky-600" />
                            Directorio de Clientes
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Administrá tu cartera de clientes y asociá eventos a ellos.
                        </p>
                    </div>
                    <button
                        onClick={handleNuevo}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-sky-600/20 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Cliente
                    </button>
                </div>

                {/* ── Stats rápidas ── */}
                {!loading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4">
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total</p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{clientes.length}</p>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4">
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Activos</p>
                            <p className="text-2xl font-bold text-emerald-600">{totalActivos}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4">
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Inactivos</p>
                            <p className="text-2xl font-bold text-neutral-400">{clientes.length - totalActivos}</p>
                        </div>
                    </div>
                )}

                {/* ── Filtros ── */}
                {!loading && !error && clientes.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Búsqueda */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre, email o teléfono…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Filtro unidad */}
                        <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                            <select
                                value={filtroUnidad}
                                onChange={e => setFiltroUnidad(e.target.value)}
                                className="pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition appearance-none"
                            >
                                <option value="">Todas las unidades</option>
                                {unidades.map(u => (
                                    <option key={u.id_unidad} value={u.id_unidad}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro estado */}
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                            <select
                                value={filtroEstado}
                                onChange={e => setFiltroEstado(e.target.value as any)}
                                className="pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition appearance-none"
                            >
                                <option value="activos">Solo activos</option>
                                <option value="inactivos">Solo inactivos</option>
                                <option value="todos">Todos</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* ── Contenido ── */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
                        {error}
                    </div>
                ) : clientes.length === 0 ? (
                    <EmptyState onNuevo={handleNuevo} />
                ) : clientesFiltrados.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 dark:text-neutral-500">
                        <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Sin resultados para los filtros aplicados.</p>
                        <button
                            onClick={() => { setBusqueda(''); setFiltroUnidad(''); setFiltroEstado('activos'); }}
                            className="mt-3 text-sm text-sky-600 dark:text-sky-400 hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contacto</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Unidad</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Notas</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {clientesFiltrados.map(cliente => (
                                        <ClienteRow
                                            key={cliente.id_cliente}
                                            cliente={cliente}
                                            toggling={togglingId === cliente.id_cliente}
                                            onEditar={handleEditar}
                                            onToggleActivo={handleToggleActivo}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400">
                            {clientesFiltrados.length} de {clientes.length} clientes
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <ClienteModal
                    mode={modalMode}
                    initialData={selectedCliente}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleModalSuccess}
                />
            )}
        </>
    );
}

// ─── Fila de cliente ──────────────────────────────────────────────────────────
interface ClienteRowProps {
    cliente: Cliente;
    toggling: boolean;
    onEditar: (c: Cliente) => void;
    onToggleActivo: (c: Cliente) => void;
}

function ClienteRow({ cliente, toggling, onEditar, onToggleActivo }: ClienteRowProps) {
    return (
        <tr className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors ${!cliente.es_activo ? 'opacity-50' : ''}`}>
            {/* Nombre */}
            <td className="px-6 py-4">
                <p className="font-semibold text-neutral-900 dark:text-white">{cliente.nombre_cliente}</p>
                {cliente.fecha_alta && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                        Desde {new Date(cliente.fecha_alta).toLocaleDateString('es-AR')}
                    </p>
                )}
            </td>

            {/* Contacto */}
            <td className="px-6 py-4">
                <div className="space-y-1">
                    {cliente.email && (
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[160px]">{cliente.email}</span>
                        </div>
                    )}
                    {cliente.telefono && (
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {cliente.telefono}
                        </div>
                    )}
                    {!cliente.email && !cliente.telefono && (
                        <span className="text-neutral-400 text-xs italic">Sin contacto</span>
                    )}
                </div>
            </td>

            {/* Unidad */}
            <td className="px-6 py-4">
                {cliente.unidad_principal ? (
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 text-xs">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        {cliente.unidad_principal}
                    </div>
                ) : (
                    <span className="text-neutral-400 text-xs">—</span>
                )}
            </td>

            {/* Notas */}
            <td className="px-6 py-4 max-w-[180px]">
                {cliente.notas ? (
                    <div className="flex items-start gap-1.5 text-neutral-500 dark:text-neutral-400 text-xs">
                        <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cliente.notas}</span>
                    </div>
                ) : (
                    <span className="text-neutral-400 text-xs">—</span>
                )}
            </td>

            {/* Estado */}
            <td className="px-6 py-4">
                {cliente.es_activo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold dark:bg-neutral-800 dark:text-neutral-400">
                        <XCircle className="w-3.5 h-3.5" /> Inactivo
                    </span>
                )}
            </td>

            {/* Acciones */}
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => onEditar(cliente)}
                        title="Editar cliente"
                        className="p-1.5 text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onToggleActivo(cliente)}
                        disabled={toggling}
                        title={cliente.es_activo ? 'Desactivar' : 'Activar'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            cliente.es_activo
                                ? 'text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                : 'text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        }`}
                    >
                        {toggling
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : cliente.es_activo
                                ? <PowerOff className="w-3.5 h-3.5" />
                                : <Power className="w-3.5 h-3.5" />
                        }
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────
function EmptyState({ onNuevo }: { onNuevo: () => void }) {
    return (
        <div className="p-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center">
            <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aún no tenés clientes en tu directorio.</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 mb-5">
                Agregá tus primeros clientes para asociarlos a eventos.
            </p>
            <button
                onClick={onNuevo}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
                <Plus className="w-4 h-4" /> Agregar primer cliente
            </button>
        </div>
    );
}
