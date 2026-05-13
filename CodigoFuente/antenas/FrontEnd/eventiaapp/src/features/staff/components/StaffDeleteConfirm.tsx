'use client';

import { useState } from 'react';
import { ShieldOff, Loader2, X } from 'lucide-react';
import { revocarStaff } from '@/src/features/staff/staff.service';
import { Staff } from '@/src/features/staff/types';
import { useAuth } from '@/src/context/AuthContext';

interface StaffDeleteConfirmProps {
    staff: Staff;
    onClose: () => void;
    onSuccess: () => void;
}

export function StaffDeleteConfirm({ staff, onClose, onSuccess }: StaffDeleteConfirmProps) {
    const { cuenta } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!cuenta?.id_cuenta) {
            setError('No se encontró el contexto de la cuenta.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await revocarStaff(cuenta.id_cuenta, staff.id_staff);
            onSuccess();
        } catch (err: any) {
            setError(err.message ?? 'Error al revocar el acceso del staff');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                    <ShieldOff className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    ¿Revocar acceso?
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                    Estás por revocar el acceso de{' '}
                    <strong>{staff.nombre} {staff.apellido}</strong>.
                    Su código quedará inactivo y no podrá ingresar al portal ni ver eventos asignados.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-60"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Revocando...' : 'Sí, revocar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
