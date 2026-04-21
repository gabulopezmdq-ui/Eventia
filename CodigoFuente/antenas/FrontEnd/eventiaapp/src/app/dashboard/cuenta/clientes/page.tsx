'use client';

import { useEffect, useState } from 'react';
import { getMisClientes, Cliente } from '@/src/features/cuenta/cuenta.service';
import { Users, Plus, Loader2, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMisClientes()
            .then(setClientes)
            .catch(() => setError('No se pudieron cargar los clientes'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
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
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {error}
                </div>
            ) : clientes.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center">
                    <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aún no tenés clientes en tu directorio.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Clasificación / Nombre</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contacto</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Unidad Principal</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {clientes.map((cliente) => (
                                    <tr key={cliente.id_cliente} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                            {cliente.nombre_cliente}
                                            {cliente.fecha_alta && (
                                                <div className="text-xs text-neutral-400 font-normal mt-0.5">
                                                    Desde {new Date(cliente.fecha_alta).toLocaleDateString('es-AR')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {cliente.email && (
                                                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs">
                                                        <Mail className="w-3.5 h-3.5" /> {cliente.email}
                                                    </div>
                                                )}
                                                {cliente.telefono && (
                                                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-xs">
                                                        <Phone className="w-3.5 h-3.5" /> {cliente.telefono}
                                                    </div>
                                                )}
                                                {!cliente.email && !cliente.telefono && <span className="text-neutral-400 text-xs italic">Sin contacto</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                            {cliente.unidad_principal || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {cliente.es_activo ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold dark:bg-neutral-800 dark:text-neutral-400">
                                                        <XCircle className="w-3.5 h-3.5" /> Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sky-600 dark:text-sky-400 font-semibold text-xs hover:underline">
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
