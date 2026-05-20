'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ChevronLeft, Plus, Loader2, Users, Pencil, Trash2, 
    Mail, ShieldAlert, Key, CheckCircle2, UserPlus, 
    X, Check, AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { 
    getEventStaffList, 
    addEventStaff, 
    createEventStaff, 
    updateEventStaff, 
    deleteEventStaff,
    EventoStaff
} from '@/src/features/events/eventStaff.service';
import { getStaffList } from '@/src/features/staff/staff.service';
import { Staff as AccountStaff } from '@/src/features/staff/types';
import { getEventById } from '@/src/features/events/event.service';
import type { Event } from '@/src/features/events/types';

const ROLES_DISPONIBLES = [
    { id_rol: 1, label: 'Operador General', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id_rol: 2, label: 'DJ', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    { id_rol: 3, label: 'Mesero', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { id_rol: 4, label: 'Cocina', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { id_rol: 5, label: 'Seguridad', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    { id_rol: 6, label: 'Propietario / Organizador', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
];

export default function EventStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);
    const router = useRouter();
    const { cuenta } = useAuth();

    // States
    const [event, setEvent] = useState<Event | null>(null);
    const [staff, setStaff] = useState<EventoStaff[]>([]);
    const [accountStaffPool, setAccountStaffPool] = useState<AccountStaff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal / Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<EventoStaff | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Form inputs
    const [addType, setAddType] = useState<'pool' | 'email'>('pool'); // pool = choose existing, email = invite new
    const [selectedPoolStaffId, setSelectedPoolStaffId] = useState<string>('');
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [idRol, setIdRol] = useState<number>(1);
    const [activo, setActivo] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Load event info
            const eventData = await getEventById(id);
            setEvent(eventData);

            // Load event staff list
            const staffList = await getEventStaffList(idEvento);
            setStaff(staffList);

            // Load account staff pool if B2B (cuenta exists)
            if (cuenta?.id_cuenta) {
                const pool = await getStaffList(cuenta.id_cuenta);
                setAccountStaffPool(pool);
                if (pool.length > 0) {
                    setAddType('pool');
                    setSelectedPoolStaffId(pool[0].id_staff.toString());
                } else {
                    setAddType('email');
                }
            } else {
                setAddType('email');
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, cuenta?.id_cuenta]);

    // Handle open drawer for add or edit
    const openAddDrawer = () => {
        setEditingStaff(null);
        setFormError(null);
        setSuccessMessage(null);
        setEmail('');
        setNombre('');
        setApellido('');
        setIdRol(1);
        setActivo(true);
        if (accountStaffPool.length > 0) {
            setAddType('pool');
            setSelectedPoolStaffId(accountStaffPool[0].id_staff.toString());
        } else {
            setAddType('email');
        }
        setDrawerOpen(true);
    };

    const openEditDrawer = (member: EventoStaff) => {
        setEditingStaff(member);
        setFormError(null);
        setSuccessMessage(null);
        setEmail(member.email || '');
        setNombre(member.nombre || '');
        setApellido(member.apellido || '');
        setIdRol(member.id_rol);
        setActivo(member.activo);
        setAddType('email'); // always email view for editing
        setDrawerOpen(true);
    };

    // Handle submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            if (editingStaff) {
                // Update mode
                await updateEventStaff(idEvento, editingStaff.id_evento_usuario, {
                    id_rol: idRol,
                    activo,
                    nombre: nombre || undefined,
                    apellido: apellido || undefined,
                    email: email || undefined
                });
                setSuccessMessage('Staff actualizado correctamente.');
                setTimeout(() => {
                    setDrawerOpen(false);
                    loadData();
                }, 1500);
            } else {
                // Add mode
                if (addType === 'pool') {
                    const poolStaffId = Number(selectedPoolStaffId);
                    await addEventStaff(idEvento, {
                        id_staff: poolStaffId,
                        id_rol: idRol
                    });
                    setSuccessMessage('Colaborador asignado correctamente.');
                    setTimeout(() => {
                        setDrawerOpen(false);
                        loadData();
                    }, 1500);
                } else {
                    // Invite/Create via email
                    // If B2C (no account context), we can use createEventStaff directly to generate code
                    if (!cuenta) {
                        await createEventStaff(idEvento, {
                            email,
                            nombre,
                            apellido,
                            id_rol: idRol
                        });
                        setSuccessMessage('Staff creado con éxito.');
                    } else {
                        // Standard B2B assign/invite
                        const res = await addEventStaff(idEvento, {
                            email,
                            nombre,
                            apellido,
                            id_rol: idRol
                        });
                        if ('es_invitacion' in res && res.es_invitacion) {
                            setSuccessMessage('Invitación enviada. El usuario recibirá un correo para registrarse.');
                        } else {
                            setSuccessMessage('Staff asignado al evento.');
                        }
                    }
                    setTimeout(() => {
                        setDrawerOpen(false);
                        loadData();
                    }, 2000);
                }
            }
        } catch (err: any) {
            setFormError(err.message || 'Ocurrió un error al procesar la solicitud.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (idEventoUsuario: number, email: string) => {
        if (!confirm(`¿Estás seguro de que deseas quitar a ${email} del staff de este evento?`)) return;

        try {
            await deleteEventStaff(idEvento, idEventoUsuario);
            alert('Staff removido del evento.');
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al remover staff.');
        }
    };

    const getRoleConfig = (roleId: number) => {
        return ROLES_DISPONIBLES.find(r => r.id_rol === roleId) || {
            label: 'Staff',
            color: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
        };
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => router.push(`/dashboard/events/${id}`)}
                    className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group self-start"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-[11px]">Volver al Evento</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                Staff del Evento
                                {event && (
                                    <span className="text-sm font-normal text-neutral-400">
                                        ({event.anfitriones_texto})
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Asigna y administra el equipo técnico, coordinadores, DJs y personal de apoyo.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openAddDrawer}
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-sm font-bold active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Añadir Staff
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-semibold text-sm">{error}</span>
                </div>
            )}

            {/* Content list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">Cargando staff asignado...</p>
                </div>
            ) : staff.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <ShieldAlert className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                    <h4 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">Sin staff asignado aún</h4>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">
                        No hay personal asignado para este evento. Las personas que agregues podrán ver los accesos y coordinar usando sus códigos asignados.
                    </p>
                    <button
                        onClick={openAddDrawer}
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl transition-all"
                    >
                        <UserPlus className="w-4 h-4" /> Asignar mi primer miembro
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((member) => {
                        const role = getRoleConfig(member.id_rol);
                        return (
                            <div 
                                key={member.id_evento_usuario} 
                                className={`bg-white dark:bg-neutral-900 border ${
                                    member.activo 
                                        ? 'border-neutral-200 dark:border-neutral-800' 
                                        : 'border-neutral-200/50 dark:border-neutral-850 opacity-60'
                                } rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold">
                                                {member.nombre ? member.nombre[0].toUpperCase() : 'S'}
                                            </div>
                                            <div className="max-w-[200px]">
                                                <h4 className="font-bold text-neutral-900 dark:text-white truncate">
                                                    {member.nombre || member.apellido 
                                                        ? `${member.nombre ?? ''} ${member.apellido ?? ''}`.trim() 
                                                        : 'Invitado Pendiente'}
                                                </h4>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5 mt-0.5" title={member.email}>
                                                    <Mail className="w-3 h-3 text-neutral-400" />
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${role.color}`}>
                                            {role.label}
                                        </span>
                                        {member.es_invitacion && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                Invitación Pendiente
                                            </span>
                                        )}
                                        {member.activo ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-neutral-500/10 text-neutral-500 border-neutral-500/20">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>

                                    {/* Access Code display */}
                                    {member.codigo_acceso && (
                                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 rounded-xl flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                                <Key className="w-3.5 h-3.5 text-indigo-500" /> Código Acceso
                                            </span>
                                            <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 select-all">
                                                {member.codigo_acceso}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2.5">
                                    <button
                                        onClick={() => openEditDrawer(member)}
                                        className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 dark:text-neutral-300 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id_evento_usuario, member.email)}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Quitar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Slider/Drawer for Upsert */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-350">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    {editingStaff ? 'Editar Staff' : 'Asignar Nuevo Staff'}
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {editingStaff ? 'Actualiza los permisos del colaborador.' : 'Define el rol y método de acceso del staff.'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setDrawerOpen(false)}
                                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form area */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {formError && (
                                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-semibold rounded-2xl flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            <form id="event-staff-form" onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* If ADDING and has Account Staff Pool */}
                                {!editingStaff && accountStaffPool.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                            Origen del Colaborador
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setAddType('pool')}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                                                    addType === 'pool' 
                                                        ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-white shadow-sm' 
                                                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                                }`}
                                            >
                                                Personal de Cuenta
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAddType('email')}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                                                    addType === 'email' 
                                                        ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-white shadow-sm' 
                                                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                                }`}
                                            >
                                                Invitar Nuevo (Email)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Choice A: Select from Account Staff Pool */}
                                {!editingStaff && addType === 'pool' && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                            Seleccionar de la Cuenta
                                        </label>
                                        <select
                                            value={selectedPoolStaffId}
                                            onChange={(e) => setSelectedPoolStaffId(e.target.value)}
                                            required
                                            className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-semibold text-neutral-750 dark:text-neutral-200"
                                        >
                                            {accountStaffPool.map(s => (
                                                <option key={s.id_staff} value={s.id_staff}>
                                                    {s.nombre} {s.apellido} ({s.email})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-neutral-500">Muestra los colaboradores que ya registraste en la configuración general de Staff.</p>
                                    </div>
                                )}

                                {/* Choice B: Invite by email / B2C direct staff */}
                                {(editingStaff || addType === 'email') && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                                Correo Electrónico
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="colaborador@correo.com"
                                                    disabled={!!editingStaff}
                                                    required
                                                    className="w-full pl-10 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm disabled:opacity-50 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                                    Nombre
                                                </label>
                                                <input
                                                    type="text"
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    placeholder="Nombre"
                                                    className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                                    Apellido
                                                </label>
                                                <input
                                                    type="text"
                                                    value={apellido}
                                                    onChange={(e) => setApellido(e.target.value)}
                                                    placeholder="Apellido"
                                                    className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Role selector (common) */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                        Rol del Colaborador
                                    </label>
                                    <select
                                        value={idRol}
                                        onChange={(e) => setIdRol(Number(e.target.value))}
                                        required
                                        className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-neutral-750 dark:text-neutral-200"
                                    >
                                        {ROLES_DISPONIBLES.map(r => (
                                            <option key={r.id_rol} value={r.id_rol}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Active Toggle (Only for edit, or you can have it for new too) */}
                                {editingStaff && (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setActivo(!activo)}
                                            className="w-full flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-neutral-900 dark:text-white">Estado del Acceso</span>
                                                <span className="block text-[11px] text-neutral-500 mt-0.5">Permitir ingresar con su código de acceso.</span>
                                            </div>
                                            <div className="text-indigo-600 dark:text-indigo-400">
                                                {activo ? (
                                                    <ToggleRight className="w-9 h-9" />
                                                ) : (
                                                    <ToggleLeft className="w-9 h-9" />
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-neutral-150 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                form="event-staff-form"
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingStaff ? 'Guardar Cambios' : 'Añadir al Evento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
