import { useState, useEffect } from 'react';
import {
    getEquipoInterno,
    updateMiembroInterno,
    deleteMiembroInterno,
    getStaffOperativo,
    updateStaffOperativo,
    deleteStaffOperativo,
    getProgramaDetalle
} from '@/src/features/programas/programas.service';
import { EquipoMiembro, StaffOperativoMiembro } from '@/src/features/programas/types';
import { 
    Users, Plus, Loader2, Mail, ShieldAlert, Trash2, Key, Calendar, 
    Smartphone, CheckCircle, ShieldCheck, CheckSquare, Sparkles 
} from 'lucide-react';
import UpsertStaffDrawer from './UpsertStaffDrawer';

interface Props {
    idEvento: number;
    tipoOperacion?: 'PROGRAMA' | 'EVENTO';
}

export default function StaffManager({ idEvento, tipoOperacion = 'PROGRAMA' }: Props) {
    // ── States ───────────────────────────────────────────
    const [equipo, setEquipo] = useState<EquipoMiembro[]>([]);
    const [staff, setStaff] = useState<StaffOperativoMiembro[]>([]);
    const [idIdioma, setIdIdioma] = useState<number>(1);
    const [subTab, setSubTab] = useState<'interno' | 'operativo'>('interno');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Actions
    const [drawerState, setDrawerState] = useState<{
        isOpen: boolean;
        actionType: 'interno' | 'desde-cuenta' | 'nuevo';
    }>({
        isOpen: false,
        actionType: 'interno'
    });

    // Toggle loading states
    const [togglingId, setTogglingId] = useState<{ type: 'equipo' | 'staff'; id: number } | null>(null);

    // Deletion Modal
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'equipo' | 'staff';
        id: number;
        name: string;
    }>({
        isOpen: false,
        type: 'equipo',
        id: 0,
        name: ''
    });

    // ── Load Language and Lists ─────────────────────────
    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Obtener idioma del evento
            let langId = 1;
            try {
                const eventDetail = await getProgramaDetalle(idEvento);
                if (eventDetail) {
                    langId = eventDetail.idIdioma || eventDetail.id_idioma || 1;
                    setIdIdioma(langId);
                }
            } catch (err) {
                console.warn('No se pudo obtener el idioma del evento, usando default (1).', err);
            }

            // 2. Cargar grillas en paralelo
            const [equipoData, staffData] = await Promise.all([
                getEquipoInterno(idEvento, langId),
                getStaffOperativo(idEvento, langId)
            ]);

            setEquipo(equipoData);
            setStaff(staffData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error cargando los miembros del equipo y staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idEvento]);

    // ── Toggle Switch Active state ─────────────────────
    const handleToggleActive = async (member: EquipoMiembro | StaffOperativoMiembro, type: 'equipo' | 'staff') => {
        const memberId = type === 'equipo' 
            ? (member as EquipoMiembro).id_evento_usuario 
            : (member as StaffOperativoMiembro).id_evento_staff;

        setTogglingId({ type, id: memberId });
        try {
            const nextActive = !member.activo;
            if (type === 'equipo') {
                await updateMiembroInterno(idEvento, memberId, nextActive);
                setEquipo(prev => prev.map(m => m.id_evento_usuario === memberId ? { ...m, activo: nextActive } : m));
            } else {
                await updateStaffOperativo(idEvento, memberId, nextActive);
                setStaff(prev => prev.map(m => m.id_evento_staff === memberId ? { ...m, activo: nextActive } : m));
            }
        } catch (err: any) {
            alert(err.message || 'Error al cambiar estado.');
        } finally {
            setTogglingId(null);
        }
    };

    // ── Deletion Flow ──────────────────────────────────
    const handleOpenDeleteModal = (member: EquipoMiembro | StaffOperativoMiembro, type: 'equipo' | 'staff') => {
        const id = type === 'equipo' 
            ? (member as EquipoMiembro).id_evento_usuario 
            : (member as StaffOperativoMiembro).id_evento_staff;
        const name = `${member.nombre || ''} ${member.apellido || ''}`.trim() || member.email || 'Miembro';
        
        setDeleteModal({
            isOpen: true,
            type,
            id,
            name
        });
    };

    const handleConfirmDelete = async () => {
        const { type, id } = deleteModal;
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
            if (type === 'equipo') {
                await deleteMiembroInterno(idEvento, id);
                setEquipo(prev => prev.filter(m => m.id_evento_usuario !== id));
            } else {
                await deleteStaffOperativo(idEvento, id);
                setStaff(prev => prev.filter(m => m.id_evento_staff !== id));
            }
        } catch (err: any) {
            alert(err.message || 'Error al eliminar el miembro.');
        } finally {
            setLoading(false);
        }
    };

    // ── Styling Utilities ──────────────────────────────
    const getRoleBadgeClasses = (codigo: string) => {
        const code = (codigo || '').toUpperCase();
        if (code.includes('OWNER') || code.includes('ADMIN')) {
            return 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400';
        }
        if (code.includes('COORDINATOR') || code.includes('COORGANIZER')) {
            return 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400';
        }
        if (code.includes('MONITOR') || code.includes('PROFESSOR') || code.includes('TEACHER')) {
            return 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400';
        }
        if (code.includes('HEALTH') || code.includes('MEDIC') || code.includes('SALUD')) {
            return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
        }
        if (code.includes('COCINA') || code.includes('KITCHEN') || code.includes('CHEF')) {
            return 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400';
        }
        if (code.includes('RECEPTOR') || code.includes('CHECKIN') || code.includes('DOOR') || code.includes('PUERTA')) {
            return 'bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400';
        }
        return 'bg-neutral-500/10 border border-neutral-500/20 text-neutral-600 dark:text-neutral-400';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const handleOpenDrawer = (actionType: 'interno' | 'desde-cuenta' | 'nuevo') => {
        setDrawerState({ isOpen: true, actionType });
    };

    // ── Main Render ─────────────────────────────────────
    return (
        <div className="space-y-10 animate-in fade-in duration-300">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 text-center font-medium">
                    {error}
                </div>
            )}

            {/* Selector de Sub-pestañas Premium */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-2xl w-full max-w-sm sm:max-w-md shadow-inner border border-neutral-200/50 dark:border-neutral-700/50">
                <button
                    onClick={() => setSubTab('interno')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                        subTab === 'interno'
                            ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Equipo Interno
                    {equipo.length > 0 && (
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold ml-1">
                            {equipo.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setSubTab('operativo')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                        subTab === 'operativo'
                            ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                >
                    <Smartphone className="w-4 h-4" />
                    Staff Operativo
                    {staff.length > 0 && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold ml-1">
                            {staff.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ════════════ BLOCK 1: EQUIPO INTERNO ════════════ */}
            {subTab === 'interno' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                Equipo Interno
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Administradores, coorganizadores y coordinadores de Eventia asignados.
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenDrawer('interno')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir miembro interno
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : equipo.length === 0 ? (
                        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 animate-in fade-in">
                            <Users className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">Sin miembros internos</h4>
                            <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">No hay administradores ni coordinadores internos asignados a este evento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {equipo.map((member) => {
                                const isToggling = togglingId?.type === 'equipo' && togglingId?.id === member.id_evento_usuario;
                                return (
                                    <div 
                                        key={member.id_evento_usuario} 
                                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 shrink-0">
                                                        <Users className="w-5.5 h-5.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white truncate" title={`${member.nombre} ${member.apellido}`}>
                                                            {member.nombre || member.apellido 
                                                                ? `${member.nombre || ''} ${member.apellido || ''}`.trim() 
                                                                : 'Sin Nombre'}
                                                        </h4>
                                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5" title={member.email}>
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3.5 flex flex-wrap gap-2">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClasses(member.codigo_rol)}`}>
                                                    {member.rol_texto || member.codigo_rol}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Divider */}
                                        <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleToggleActive(member, 'equipo')}
                                                    disabled={isToggling}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        member.activo 
                                                            ? 'bg-emerald-500 dark:bg-emerald-600' 
                                                            : 'bg-neutral-200 dark:bg-neutral-800'
                                                    } disabled:opacity-50`}
                                                    title={member.activo ? 'Desactivar acceso' : 'Activar acceso'}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            member.activo ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                    {member.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {member.fecha_alta && (
                                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono" title="Fecha de Alta">
                                                        {formatDate(member.fecha_alta)}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleOpenDeleteModal(member, 'equipo')}
                                                    className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                                    title="Eliminar asignación"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════ BLOCK 2: STAFF OPERATIVO ════════════ */}
            {subTab === 'operativo' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-emerald-500" />
                                Staff Operativo
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Personal asignado mediante código al portal de staff sin login de cuenta.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleOpenDrawer('desde-cuenta')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-semibold rounded-2xl shadow-sm transition-all active:scale-95"
                            >
                                Agregar desde staff de cuenta
                            </button>
                            <button
                                onClick={() => handleOpenDrawer('nuevo')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo staff
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 animate-in fade-in">
                            <Smartphone className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">Sin staff operativo</h4>
                            <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">No hay staff operativo asignado mediante código. Crea uno nuevo o agrégalo desde la cuenta.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {staff.map((member) => {
                                const isToggling = togglingId?.type === 'staff' && togglingId?.id === member.id_evento_staff;
                                return (
                                    <div 
                                        key={member.id_evento_staff} 
                                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 shrink-0">
                                                        <Key className="w-5.5 h-5.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white truncate" title={`${member.nombre} ${member.apellido}`}>
                                                            {member.nombre || member.apellido 
                                                                ? `${member.nombre || ''} ${member.apellido || ''}`.trim() 
                                                                : 'Staff Sin Nombre'}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                                                                Cód: <span className="font-bold tracking-wider">{member.codigo_acceso}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3.5 flex flex-wrap gap-2">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClasses(member.codigo_rol)}`}>
                                                    {member.rol_texto || member.codigo_rol}
                                                </span>
                                                {member.fecha_expiracion && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                                                        <Calendar className="w-3 h-3" />
                                                        Expira: {formatDate(member.fecha_expiracion)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3 text-xs text-neutral-400 space-y-1 dark:text-neutral-500">
                                                {member.email && <p className="truncate">Email: {member.email}</p>}
                                                {member.telefono && <p>Tel: {member.telefono}</p>}
                                                <p className="flex items-center gap-1 font-medium mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Usos del Código: <span className="text-neutral-700 dark:text-neutral-300 font-bold ml-0.5">{member.usos || 0}</span>
                                                    {member.fecha_uso && (
                                                        <span className="text-[10px] text-neutral-400 font-normal">
                                                            (Último: {formatDate(member.fecha_uso)})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleToggleActive(member, 'staff')}
                                                    disabled={isToggling}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        member.activo 
                                                            ? 'bg-emerald-500 dark:bg-emerald-600' 
                                                            : 'bg-neutral-200 dark:bg-neutral-800'
                                                    } disabled:opacity-50`}
                                                    title={member.activo ? 'Desactivar asignación' : 'Activar asignación'}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            member.activo ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                    {member.activo ? 'Asignado' : 'Revocado'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {member.fecha_alta && (
                                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono" title="Fecha de Alta">
                                                        {formatDate(member.fecha_alta)}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleOpenDeleteModal(member, 'staff')}
                                                    className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                                    title="Eliminar asignación"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════ DRAWER PANEL ════════════ */}
            {drawerState.isOpen && (
                <UpsertStaffDrawer
                    idEvento={idEvento}
                    idIdioma={idIdioma}
                    actionType={drawerState.actionType}
                    tipoOperacion={tipoOperacion}
                    onClose={() => setDrawerState(prev => ({ ...prev, isOpen: false }))}
                    onSuccess={() => {
                        setDrawerState(prev => ({ ...prev, isOpen: false }));
                        loadData();
                    }}
                />
            )}

            {/* ════════════ SYSTEM DESIGN DELETION CONFIRMATION MODAL ════════════ */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/10 text-red-500 flex items-center justify-center mb-6 shadow-sm shadow-red-500/10">
                            <Trash2 className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">¿Confirmar eliminación?</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
                            ¿Estás completamente seguro de que deseas eliminar a <strong className="text-neutral-800 dark:text-neutral-200">{deleteModal.name}</strong> de este evento/programa? Esta acción removerá sus permisos de forma permanente.
                        </p>
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold rounded-2xl text-sm transition-colors active:scale-98"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-red-600/20 transition-colors"
                            >
                                Eliminar Miembro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
