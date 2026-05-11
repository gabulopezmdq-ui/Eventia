'use client';

import { Edit2, Trash2, Power } from 'lucide-react';
import { Staff } from '@/src/features/staff/types';
import { patchStaff } from '@/src/features/staff/staff.service';
import { useState } from 'react';

interface StaffTableProps {
    staffList: Staff[];
    onEdit: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onRefresh: () => void;
}

export function StaffTable({ staffList, onEdit, onDelete, onRefresh }: StaffTableProps) {
    const [toggling, setToggling] = useState<number | null>(null);

    const handleToggleActivo = async (staff: Staff) => {
        setToggling(staff.id_staff);
        try {
            await patchStaff(staff.id_staff, { activo: !staff.activo });
            onRefresh();
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            // Optionally could add a toast here
        } finally {
            setToggling(null);
        }
    };

    if (staffList.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 dark:text-neutral-400">
                    No hay integrantes de staff registrados en esta cuenta.
                </p>
            </div>
        );
    }

    const formatRol = (rol: string) => {
        const parts = rol.split('_');
        if (parts.length > 1) {
            return parts.slice(1).map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
        }
        return rol;
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        <th className="px-6 py-4 font-semibold">Nombre</th>
                        <th className="px-6 py-4 font-semibold">Contacto</th>
                        <th className="px-6 py-4 font-semibold">Rol</th>
                        <th className="px-6 py-4 font-semibold">Unidades</th>
                        <th className="px-6 py-4 font-semibold text-center">Estado</th>
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
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                                    {formatRol(staff.rol)}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {staff.unidades.length > 0 ? (
                                        staff.unidades.map(u => (
                                            <span 
                                                key={u.id_unidad} 
                                                className="inline-flex px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 whitespace-nowrap"
                                                title={u.nombre}
                                            >
                                                {u.nombre.length > 15 ? u.nombre.substring(0, 15) + '...' : u.nombre}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-neutral-400">-</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    onClick={() => handleToggleActivo(staff)}
                                    disabled={toggling === staff.id_staff}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                        staff.activo
                                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                    } ${toggling === staff.id_staff ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <Power className="w-3 h-3" />
                                    {staff.activo ? 'Activo' : 'Inactivo'}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(staff)}
                                        className="p-2 text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(staff)}
                                        className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Desactivar/Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
