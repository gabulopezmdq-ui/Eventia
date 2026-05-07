import { useState, useEffect } from 'react';
import { getStaffPrograma } from '@/src/features/programas/programas.service';
import { StaffPrograma } from '@/src/features/programas/types';
import { Plus, Loader2, Users, Pencil, Mail, ShieldAlert } from 'lucide-react';
import UpsertStaffDrawer from './UpsertStaffDrawer';

interface Props {
    idEvento: number;
}

export default function StaffManager({ idEvento }: Props) {
    const [staff, setStaff] = useState<StaffPrograma[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffPrograma | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getStaffPrograma(idEvento);
            setStaff(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error cargando el equipo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idEvento]);

    const handleOpenDrawer = (staffMember?: StaffPrograma) => {
        setSelectedStaff(staffMember || null);
        setIsDrawerOpen(true);
    };

    const getRoleName = (idRol: string) => {
        const roles: Record<string, string> = {
            'PROGRAM_ADMIN': 'Administrador',
            'PROGRAM_COORDINATOR': 'Coordinador',
            'PROGRAM_MONITOR': 'Profesor / Monitor',
            'PROGRAM_HEALTH': 'Médico',
            'PROGRAM_KITCHEN': 'Comedor',
            'PROGRAM_CHECKIN': 'Recepción',
        };
        return roles[idRol] || idRol;
    };

    const getRoleColor = (idRol: string) => {
        const colors: Record<string, string> = {
            'PROGRAM_ADMIN': 'bg-red-100 text-red-700',
            'PROGRAM_COORDINATOR': 'bg-purple-100 text-purple-700',
            'PROGRAM_MONITOR': 'bg-blue-100 text-blue-700',
            'PROGRAM_HEALTH': 'bg-emerald-100 text-emerald-700',
        };
        return colors[idRol] || 'bg-neutral-100 text-neutral-700';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        Equipo y Staff
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Añade profesores, médicos y coordinadores que operarán el programa.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenDrawer()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Añadir Miembro
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">{error}</div>
            ) : staff.length === 0 ? (
                <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <ShieldAlert className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">Sin miembros asignados</h4>
                    <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">No hay nadie asignado al equipo. Solamente los administradores de la cuenta podrán acceder.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((member, index) => (
                        <div key={member.id_usuario || index} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[150px]" title={member.email}>
                                            {member.email || 'Usuario ' + member.id_usuario}
                                        </h4>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getRoleColor(member.id_rol)}`}>
                                            {getRoleName(member.id_rol)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${member.activo ? 'bg-emerald-500' : 'bg-neutral-400'}`}></div>
                                    <span className="text-xs text-neutral-500 font-medium">{member.activo ? 'Activo' : 'Acceso Revocado'}</span>
                                </div>
                                <button
                                    onClick={() => handleOpenDrawer(member)}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isDrawerOpen && (
                <UpsertStaffDrawer
                    idEvento={idEvento}
                    staffToEdit={selectedStaff}
                    onClose={() => setIsDrawerOpen(false)}
                    onSuccess={() => {
                        setIsDrawerOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
