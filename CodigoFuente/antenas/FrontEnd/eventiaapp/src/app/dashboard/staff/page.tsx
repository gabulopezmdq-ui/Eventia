'use client';

import { useEffect, useState } from 'react';
import { UserCog, Plus, Loader2, RefreshCw } from 'lucide-react';
import { getStaffUnidades } from '@/src/features/staff/staff.service';
import { Staff } from '@/src/features/staff/types';
import { StaffTable } from '@/src/features/staff/components/StaffTable';
import { StaffModal } from '@/src/features/staff/components/StaffModal';
import { StaffDeleteConfirm } from '@/src/features/staff/components/StaffDeleteConfirm';
import { useAuth } from '@/src/context/AuthContext';

export default function StaffPage() {
    const { cuenta } = useAuth();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>(undefined);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

    const loadStaff = async () => {
        if (!cuenta?.id_cuenta) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getStaffUnidades(cuenta.id_cuenta);
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
                            Gestión de Staff
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Administrá el personal y asigná a qué unidades tienen acceso.
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
                        onClick={() => {
                            setModalMode('create');
                            setSelectedStaff(undefined);
                        }}
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
                    onEdit={(staff) => {
                        setSelectedStaff(staff);
                        setModalMode('edit');
                    }}
                    onDelete={(staff) => setStaffToDelete(staff)}
                    onRefresh={loadStaff}
                />
            )}

            {/* Modals */}
            {modalMode && (
                <StaffModal
                    mode={modalMode}
                    initialData={selectedStaff}
                    onClose={() => setModalMode(null)}
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
