'use client';

import { useEffect, useState } from 'react';
import { UserCog, Plus, Loader2, RefreshCw } from 'lucide-react';
import {
    getStaffList,
    actualizarStaff,
    getStaffDetail,
    getRolesComboStaff,
} from '@/src/features/staff/staff.service';
import { Staff, StaffRolCombo } from '@/src/features/staff/types';
import { StaffTable } from '@/src/features/staff/components/StaffTable';
import { StaffModal } from '@/src/features/staff/components/StaffModal';
import { StaffRenewModal } from '@/src/features/staff/components/StaffRenewModal';
import { StaffDeleteConfirm } from '@/src/features/staff/components/StaffDeleteConfirm';
import { useAuth } from '@/src/context/AuthContext';

export default function StaffPage() {
    const { cuenta } = useAuth();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [roles, setRoles] = useState<StaffRolCombo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
    const [staffToRenew, setStaffToRenew] = useState<Staff | null>(null);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

    const loadStaff = async () => {
        if (!cuenta?.id_cuenta) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getStaffList(cuenta.id_cuenta);
            setStaffList(data);
        } catch (err: any) {
            setError(err.message ?? 'No se pudo cargar la lista de staff.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, [cuenta?.id_cuenta]);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const dynamicRoles = await getRolesComboStaff();
                setRoles(dynamicRoles);
            } catch (err) {
                console.warn('Error al cargar roles dinámicos en page:', err);
            }
        };
        loadRoles();
    }, []);

    const handleToggleActive = async (staff: Staff) => {
        if (!cuenta?.id_cuenta) return;
        setError(null);
        try {
            // Cargar el detalle completo para asegurar que no perdemos las unidades asignadas
            const detail = await getStaffDetail(cuenta.id_cuenta, staff.id_staff);
            
            // Buscar id_rol correspondiente basándonos en la descripción o código
            const matchingRol = roles.find(
                r => r.codigo === detail.rol_codigo || r.texto === detail.rol_descripcion
            );
            const idRol = matchingRol ? matchingRol.id_rol : 9;

            const updatePayload = {
                nombre: detail.nombre,
                apellido: detail.apellido,
                email: detail.email,
                telefono: detail.telefono ?? '',
                id_rol: idRol,
                fecha_expiracion: detail.fecha_expiracion ? detail.fecha_expiracion.split('T')[0] : '',
                activo: !detail.activo, // Alternar estado activo
                id_unidades: detail.id_unidades ?? [],
            };

            await actualizarStaff(cuenta.id_cuenta, staff.id_staff, updatePayload);
            await loadStaff();
        } catch (err: any) {
            setError(err.message ?? 'No se pudo alternar el estado del integrante de staff.');
        }
    };

    if (!cuenta) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500">Cargando contexto de la cuenta...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl">
                        <UserCog className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Gestión de Staff y Accesos
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Administrá el personal operativo B2B, generá y renová códigos y asigná accesos a unidades.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={loadStaff}
                        disabled={loading}
                        className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold text-sm">Nuevo Staff</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl">
                    {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Cargando staff...</p>
                </div>
            ) : (
                <StaffTable
                    staffList={staffList}
                    onEdit={(staff) => setStaffToEdit(staff)}
                    onRenew={(staff) => setStaffToRenew(staff)}
                    onToggleActive={handleToggleActive}
                    onDelete={(staff) => setStaffToDelete(staff)}
                    onRefresh={loadStaff}
                />
            )}

            {/* Modals */}
            {(modalOpen || staffToEdit) && (
                <StaffModal
                    staff={staffToEdit}
                    onClose={() => {
                        setModalOpen(false);
                        setStaffToEdit(null);
                    }}
                    onSuccess={loadStaff}
                />
            )}

            {staffToRenew && (
                <StaffRenewModal
                    staff={staffToRenew}
                    onClose={() => setStaffToRenew(null)}
                    onSuccess={loadStaff}
                />
            )}

            {staffToDelete && (
                <StaffDeleteConfirm
                    staff={staffToDelete}
                    onClose={() => setStaffToDelete(null)}
                    onSuccess={() => {
                        setStaffToDelete(null);
                        loadStaff();
                    }}
                />
            )}
        </div>
    );
}
