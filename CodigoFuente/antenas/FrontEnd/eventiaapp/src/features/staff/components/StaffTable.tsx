'use client';

import { useState } from 'react';
import { Trash2, ShieldOff, Copy, Check, MoreVertical, Edit3, CalendarClock, Power } from 'lucide-react';
import { Staff } from '@/src/features/staff/types';

interface StaffTableProps {
    staffList: Staff[];
    onEdit: (staff: Staff) => void;
    onRenew: (staff: Staff) => void;
    onToggleActive: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onRefresh: () => void;
}

export function StaffTable({
    staffList,
    onEdit,
    onRenew,
    onToggleActive,
    onDelete,
}: StaffTableProps) {
    const [copiedStaffId, setCopiedStaffId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

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
        try {
            const partes = fecha.split('T')[0].split('-');
            if (partes.length === 3) {
                const [anio, mes, dia] = partes.map(Number);
                return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            }
            return new Date(fecha).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return fecha;
        }
    };

    const handleCopy = (idStaff: number, codigo: string) => {
        navigator.clipboard.writeText(codigo);
        setCopiedStaffId(idStaff);
        setTimeout(() => setCopiedStaffId(null), 2000);
    };

    const toggleDropdown = (idStaff: number) => {
        setOpenDropdownId(openDropdownId === idStaff ? null : idStaff);
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 custom-scrollbar">
            {/* Overlay click to close any active dropdowns */}
            {openDropdownId !== null && (
                <div 
                    className="fixed inset-0 z-10 cursor-default" 
                    onClick={() => setOpenDropdownId(null)}
                />
            )}

            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-neutral-50/80 dark:bg-neutral-950/50 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold">
                        <th className="px-6 py-4 w-[22%] min-w-[180px]">Nombre</th>
                        <th className="px-6 py-4 w-[23%] min-w-[220px]">Contacto</th>
                        <th className="px-6 py-4 w-[18%] min-w-[160px]">Rol</th>
                        <th className="px-6 py-4 w-[14%] min-w-[130px]">Código</th>
                        <th className="px-6 py-4 w-[10%] min-w-[100px] text-center">Estado</th>
                        <th className="px-6 py-4 w-[6%] min-w-[70px] text-center">Usos</th>
                        <th className="px-6 py-4 w-[12%] min-w-[120px]">Expira</th>
                        <th className="px-6 py-4 w-[5%] min-w-[60px] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {staffList.map((staff, index) => {
                        const showUpwards = staffList.length - index <= 2;
                        return (
                            <tr key={staff.id_staff} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20 transition-all duration-200">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                                        {staff.nombre} {staff.apellido}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    {staff.email && <div className="font-medium text-neutral-800 dark:text-neutral-300">{staff.email}</div>}
                                    {staff.telefono && <div className="text-xs text-neutral-400 mt-0.5">{staff.telefono}</div>}
                                    {!staff.email && !staff.telefono && '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-500/20 max-w-[220px] shadow-sm"
                                        title={staff.rol_descripcion}
                                    >
                                        <span className="truncate">{staff.rol_descripcion}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {staff.codigo ? (
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm font-mono tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-100/30 dark:border-indigo-500/10">
                                                {staff.codigo}
                                            </code>
                                            <button
                                                onClick={() => handleCopy(staff.id_staff, staff.codigo!)}
                                                className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-100/50 dark:hover:border-indigo-500/20 transition-all duration-200 active:scale-95"
                                                title="Copiar Código"
                                            >
                                                {copiedStaffId === staff.id_staff ? (
                                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-neutral-400 italic">oculto</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        staff.activo
                                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100/50 dark:border-green-500/20'
                                            : 'bg-neutral-50 dark:bg-neutral-800/40 text-neutral-500 border border-neutral-100/50 dark:border-neutral-800'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${staff.activo ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                                        {staff.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    {staff.usos ?? 0}
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                                    {formatFecha(staff.fecha_expiracion)}
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button
                                        onClick={() => toggleDropdown(staff.id_staff)}
                                        className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* premium dropdown menu (upward/downward dynamic) */}
                                    {openDropdownId === staff.id_staff && (
                                        <div className={`absolute right-6 w-48 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-0.5 z-20 text-left animate-in fade-in duration-150 ${
                                            showUpwards 
                                                ? 'bottom-full mb-1 slide-in-from-bottom-2' 
                                                : 'mt-1 slide-in-from-top-2'
                                        }`}>
                                            <button
                                                onClick={() => {
                                                    onEdit(staff);
                                                    setOpenDropdownId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onRenew(staff);
                                                    setOpenDropdownId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition"
                                            >
                                                <CalendarClock className="w-3.5 h-3.5 text-neutral-400" />
                                                Renovar vigencia
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onToggleActive(staff);
                                                    setOpenDropdownId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition"
                                            >
                                                <Power className={`w-3.5 h-3.5 ${staff.activo ? 'text-amber-500' : 'text-green-500'}`} />
                                                {staff.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />
                                            <button
                                                onClick={() => {
                                                    onDelete(staff);
                                                    setOpenDropdownId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                            >
                                                <ShieldOff className="w-3.5 h-3.5" />
                                                Revocar Acceso
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
