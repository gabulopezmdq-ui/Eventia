'use client';

import { useState } from 'react';
import { X, Loader2, CalendarClock, Check } from 'lucide-react';
import { Staff } from '@/src/features/staff/types';
import { renovarStaff } from '@/src/features/staff/staff.service';
import { useAuth } from '@/src/context/AuthContext';

interface StaffRenewModalProps {
    staff: Staff;
    onClose: () => void;
    onSuccess: () => void;
}

const getDefaultExpiracion = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

export function StaffRenewModal({ staff, onClose, onSuccess }: StaffRenewModalProps) {
    const { cuenta } = useAuth();
    const [fechaExpiracion, setFechaExpiracion] = useState(
        staff.fecha_expiracion ? staff.fecha_expiracion.split('T')[0] : getDefaultExpiracion()
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fechaExpiracion) {
            setError('La fecha de expiración es obligatoria.');
            return;
        }

        if (!cuenta?.id_cuenta) {
            setError('No se encontró el contexto de la cuenta.');
            return;
        }

        setSaving(true);
        try {
            await renovarStaff(cuenta.id_cuenta, staff.id_staff, fechaExpiracion);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message ?? 'Error al renovar la vigencia.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200 p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                            <CalendarClock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                Renovar Vigencia
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {staff.nombre} {staff.apellido}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Nueva Fecha de Expiración <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={fechaExpiracion}
                            onChange={(e) => setFechaExpiracion(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                        <p className="text-xs text-neutral-500">
                            El código de acceso seguirá activo hasta el fin de este día.
                        </p>
                    </div>

                    {error && (
                        <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Guardando...' : 'Confirmar Renovación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
