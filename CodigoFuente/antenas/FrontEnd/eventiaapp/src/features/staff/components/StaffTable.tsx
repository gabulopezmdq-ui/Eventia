'use client';

import { Trash2, ShieldOff } from 'lucide-react';
import { Staff } from '@/src/features/staff/types';

interface StaffTableProps {
    staffList: Staff[];
    onDelete: (staff: Staff) => void;
    onRefresh: () => void;
}

export function StaffTable({ staffList, onDelete }: StaffTableProps) {
    if (staffList.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 dark:text-neutral-400">
                    No hay integrantes de staff registrados en esta cuenta.
                </p>
            </div>
        );
    }

    const formatFecha = (fecha?: string) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        <th className="px-6 py-4 font-semibold">Nombre</th>
                        <th className="px-6 py-4 font-semibold">Contacto</th>
                        <th className="px-6 py-4 font-semibold">Rol</th>
                        <th className="px-6 py-4 font-semibold">Código</th>
                        <th className="px-6 py-4 font-semibold text-center">Estado</th>
                        <th className="px-6 py-4 font-semibold text-center">Usos</th>
                        <th className="px-6 py-4 font-semibold">Expira</th>
                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {staffList.map(staff => (
                        <tr key={staff.id_staff} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-semibold text-neutral-900 dark:text-white">
                                    {staff.nombre} {staff.apellido}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {staff.email && <div>{staff.email}</div>}
                                {staff.telefono && <div>{staff.telefono}</div>}
                                {!staff.email && !staff.telefono && '-'}
                            </td>
                            <td className="px-6 py-4">
                                <div 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 max-w-[150px]"
                                    title={staff.rol_descripcion}
                                >
                                    <span className="truncate">{staff.rol_descripcion}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {staff.codigo ? (
                                    <code className="text-sm font-mono tracking-widest font-bold text-indigo-600 dark:text-indigo-400">
                                        {staff.codigo}
                                    </code>
                                ) : (
                                    <span className="text-sm text-neutral-400 italic">oculto</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    staff.activo
                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${staff.activo ? 'bg-green-500' : 'bg-neutral-400'}`} />
                                    {staff.activo ? 'Activo' : 'Revocado'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
                                {staff.usos ?? 0}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {formatFecha(staff.fecha_expiracion)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onDelete(staff)}
                                    disabled={!staff.activo}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={staff.activo ? 'Revocar acceso' : 'Ya revocado'}
                                >
                                    <ShieldOff className="w-3.5 h-3.5" />
                                    Revocar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
