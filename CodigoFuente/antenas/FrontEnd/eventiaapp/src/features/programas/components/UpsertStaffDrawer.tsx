import { useState } from 'react';
import { StaffPrograma } from '@/src/features/programas/types';
import { upsertStaffPrograma } from '@/src/features/programas/programas.service';
import { Loader2, X, Users, Mail } from 'lucide-react';

interface Props {
    idEvento: number;
    staffToEdit: StaffPrograma | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpsertStaffDrawer({ idEvento, staffToEdit, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<StaffPrograma>({
        id_evento: idEvento,
        email: staffToEdit?.email || '',
        id_rol: staffToEdit?.id_rol || 'PROGRAM_MONITOR',
        activo: staffToEdit?.activo ?? true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await upsertStaffPrograma(idEvento, formData);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al asignar staff. Asegúrate de que el email esté registrado.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" />
                            {staffToEdit ? 'Editar Rol' : 'Añadir Miembro del Equipo'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Email del Usuario</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ejemplo@correo.com"
                                    disabled={!!staffToEdit}
                                    required
                                    className="w-full pl-10 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm disabled:opacity-50"
                                />
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1.5">El usuario debe estar registrado en el sistema previamente.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Rol en el Programa</label>
                            <select
                                name="id_rol"
                                value={formData.id_rol}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-semibold text-neutral-700 dark:text-neutral-200"
                            >
                                <option value="PROGRAM_ADMIN">Administrador (Acceso total)</option>
                                <option value="PROGRAM_COORDINATOR">Coordinador (Gestión de inscriptos)</option>
                                <option value="PROGRAM_MONITOR">Monitor / Profesor (Asistencia)</option>
                                <option value="PROGRAM_HEALTH">Médico / Salud (Fichas médicas)</option>
                                <option value="PROGRAM_KITCHEN">Comedor (Restricciones alimentarias)</option>
                                <option value="PROGRAM_CHECKIN">Recepción (Check-in / Retiros)</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-emerald-600 rounded"
                                />
                                <div>
                                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">Acceso Activo</span>
                                    <span className="block text-xs text-neutral-500">El usuario puede acceder al programa.</span>
                                </div>
                            </label>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="staff-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {staffToEdit ? 'Guardar Cambios' : 'Añadir Miembro'}
                    </button>
                </div>
            </div>
        </div>
    );
}
