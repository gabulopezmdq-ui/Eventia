'use client';

import { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Search, 
    Copy, 
    Check, 
    Shield, 
    User, 
    UserCheck, 
    UserX, 
    Calendar, 
    Mail, 
    Sparkles, 
    Loader2, 
    AlertTriangle,
    X,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { 
    getCuentaUsuarios, 
    invitarUsuario, 
    cambiarRolUsuario, 
    setActivoUsuario, 
    CuentaUsuario,
    getCuentaInvitacionesPendientes
} from '@/src/features/cuenta/cuentaUsuarios.service';

export default function CuentaUsuariosPage() {
    const { cuenta, usuario } = useAuth();
    
    // States
    const [usuarios, setUsuarios] = useState<CuentaUsuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
    
    // Modals states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    
    // Form / Action states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRol, setInviteRol] = useState<'ACCOUNT_ADMIN' | 'ACCOUNT_STAFF'>('ACCOUNT_STAFF');
    const [inviting, setInviting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<CuentaUsuario | null>(null);
    const [newRol, setNewRol] = useState<'ACCOUNT_ADMIN' | 'ACCOUNT_STAFF'>('ACCOUNT_STAFF');
    const [updatingRol, setUpdatingRol] = useState(false);
    
    // Notifications / Toasts
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchUsuarios = async () => {
        if (!cuenta?.id_cuenta) return;
        setLoading(true);
        setError(null);
        try {
            const isAdmin = cuenta?.rol_cuenta === 'ACCOUNT_ADMIN';
            const [usersData, invitesData] = await Promise.all([
                getCuentaUsuarios(cuenta.id_cuenta),
                isAdmin
                    ? getCuentaInvitacionesPendientes(cuenta.id_cuenta).catch(err => {
                          console.error('Error fetching pending invitations:', err);
                          return [];
                      })
                    : Promise.resolve([])
            ]);
            setUsuarios([...usersData, ...invitesData]);
        } catch (err: any) {
            console.error('Error fetching usuarios:', err);
            setError(err.message || 'No se pudieron cargar los usuarios de la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cuenta?.id_cuenta) {
            fetchUsuarios();
        }
    }, [cuenta]);

    // Handle invite submit
    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cuenta?.id_cuenta) return;
        if (!inviteEmail.trim()) {
            showToast('Por favor, ingresa un correo electrónico válido', 'warning');
            return;
        }

        setInviting(true);
        try {
            const res = await invitarUsuario(cuenta.id_cuenta, inviteEmail.trim(), inviteRol);
            
            // Generar enlace
            const link = res.url_invitacion || res.link || (res.token ? `${window.location.origin}/register?token=${res.token}` : '');
            setGeneratedLink(link);
            
            // Reset form
            setInviteEmail('');
            setInviteRol('ACCOUNT_STAFF');
            setShowInviteModal(false);
            
            // Show success modal with the generated link
            setShowSuccessModal(true);
            showToast('Invitación generada exitosamente', 'success');
            
            // Refresh list
            fetchUsuarios();
        } catch (err: any) {
            showToast(err.message || 'Error al generar la invitación', 'error');
        } finally {
            setInviting(false);
        }
    };

    // Handle role change submit
    const handleRoleChangeSubmit = async () => {
        if (!cuenta?.id_cuenta || !selectedUser) return;
        
        // Prevent changing self role to be safe
        if (usuario?.id_usuario === selectedUser.id_usuario) {
            showToast('No puedes cambiar tu propio rol en el panel', 'warning');
            setShowRoleModal(false);
            return;
        }

        setUpdatingRol(true);
        try {
            await cambiarRolUsuario(cuenta.id_cuenta, selectedUser.id_cuenta_usuario, newRol);
            showToast(`Rol actualizado a ${newRol === 'ACCOUNT_ADMIN' ? 'Administrador' : 'Colaborador'}`, 'success');
            setShowRoleModal(false);
            setSelectedUser(null);
            fetchUsuarios();
        } catch (err: any) {
            showToast(err.message || 'Error al cambiar el rol', 'error');
        } finally {
            setUpdatingRol(false);
        }
    };

    // Handle toggle active status
    const handleToggleActive = async (user: CuentaUsuario) => {
        if (!cuenta?.id_cuenta) return;

        // Prevent disabling self
        if (usuario?.id_usuario === user.id_usuario) {
            showToast('No puedes desactivar tu propia cuenta activa', 'warning');
            return;
        }

        // Si es el último Administrador activo, prevenir desactivación
        if (user.rol_codigo === 'ACCOUNT_ADMIN' && user.activo) {
            const adminsActivos = usuarios.filter(u => u.rol_codigo === 'ACCOUNT_ADMIN' && u.activo);
            if (adminsActivos.length <= 1) {
                showToast('Debe haber al menos un administrador activo en la cuenta', 'warning');
                return;
            }
        }

        try {
            const nuevoEstado = !user.activo;
            await setActivoUsuario(cuenta.id_cuenta, user.id_cuenta_usuario, nuevoEstado);
            showToast(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
            fetchUsuarios();
        } catch (err: any) {
            showToast(err.message || 'Error al cambiar el estado del usuario', 'error');
        }
    };

    // Copy to clipboard helper
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('Enlace copiado al portapapeles', 'success');
    };

    // Filtered users
    const filteredUsuarios = usuarios.filter(user => {
        // 1. Text search filter
        const fullName = `${user.nombre || ''} ${user.apellido || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = fullName.includes(query) || email.includes(query);
        if (!matchesSearch) return false;

        // 2. Status filter
        const isPending = !user.id_usuario;
        if (statusFilter === 'ACTIVE') {
            return !isPending && user.activo;
        }
        if (statusFilter === 'PENDING') {
            return isPending;
        }
        return true; // 'ALL'
    });

    // Stats calculations
    const totalUsersCount = usuarios.length;
    const activeUsersCount = usuarios.filter(u => u.activo && u.id_usuario).length;
    const pendingInvitesCount = usuarios.filter(u => !u.id_usuario).length;
    const adminsCount = usuarios.filter(u => u.rol_codigo === 'ACCOUNT_ADMIN').length;

    // Helper to get initials
    const getInitials = (user: CuentaUsuario) => {
        if (user.nombre && user.apellido) {
            return `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();
        }
        return 'U';
    };

    // Color mapper for user initials background
    const getInitialsColor = (index: number) => {
        const colors = [
            'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30',
            'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
            'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
            'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30',
            'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-6 relative max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-500" />
                        Usuarios de la Cuenta
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 leading-relaxed">
                        Administrá el personal con acceso a tu cuenta corporativa <strong className="text-indigo-650 dark:text-indigo-400">{cuenta?.nombre_cuenta}</strong>, asigná roles y emití nuevas invitaciones.
                    </p>
                </div>
                
                {cuenta?.rol_cuenta === 'ACCOUNT_ADMIN' && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/10 text-white font-semibold text-sm transition-all shrink-0 active:scale-95 duration-150 cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invitar Usuario
                    </button>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                        : toast.type === 'error'
                        ? 'bg-red-550/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}>
                    {toast.type === 'success' && <UserCheck className="w-5 h-5" />}
                    {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
                    {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Miembros', value: totalUsersCount, icon: Users, iconColor: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20' },
                    { label: 'Usuarios Activos', value: activeUsersCount, icon: UserCheck, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20' },
                    { label: 'Admins de Cuenta', value: adminsCount, icon: Shield, iconColor: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20' },
                    { label: 'Invitaciones Pendientes', value: pendingInvitesCount, icon: Mail, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-350">
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold tracking-wide uppercase">{stat.label}</p>
                                    <h3 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mt-1.5">{loading ? '...' : stat.value}</h3>
                                </div>
                                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-md relative">
                
                {/* Search / Filters Bar */}
                <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        
                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-start">
                            {[
                                { value: 'ALL', label: 'Todos' },
                                { value: 'ACTIVE', label: 'Activos' },
                                { value: 'PENDING', label: 'Pendientes' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.value as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                                        statusFilter === tab.value
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                            : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={fetchUsuarios}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition disabled:opacity-50 shrink-0 self-end md:self-auto bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                </div>

                {/* Table implementation */}
                <div className="overflow-x-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Obteniendo personal de la cuenta...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-12 h-12 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mb-3">
                                <ShieldAlert className="w-6 h-6 text-red-550" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Error de carga</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">{error}</p>
                            <button
                                onClick={fetchUsuarios}
                                className="mt-4 px-4 py-2 bg-neutral-100 hover:bg-neutral-250 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : filteredUsuarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3 text-neutral-400 dark:text-neutral-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Sin usuarios</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                                {searchQuery ? 'Ningún usuario coincide con los criterios de búsqueda.' : 'No tenés miembros ni invitaciones pendientes en esta cuenta.'}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/30 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="py-4 px-6">Miembro</th>
                                    <th className="py-4 px-6">Email</th>
                                    <th className="py-4 px-6">Rol</th>
                                    <th className="py-4 px-6 text-center">Estado</th>
                                    <th className="py-4 px-6">Alta</th>
                                    <th className="py-4 px-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/50">
                                {filteredUsuarios.map((user, index) => {
                                    const isSelf = usuario?.id_usuario === user.id_usuario;
                                    const isPending = !user.id_usuario;
                                    
                                    return (
                                        <tr 
                                            key={user.id_cuenta_usuario} 
                                            className="group hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Miembro Avatar / Nombre */}
                                            <td className="py-4.5 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm ${getInitialsColor(index)} shrink-0`}>
                                                        {isPending ? <Mail className="w-4 h-4 text-amber-500" /> : getInitials(user)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                                            {isPending ? (
                                                                <span className="text-neutral-500 dark:text-neutral-400 font-medium italic">Pendiente de registro</span>
                                                            ) : (
                                                                `${user.nombre || ''} ${user.apellido || ''}`
                                                            )}
                                                            {isSelf && (
                                                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                                                                    Vos
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-neutral-400 dark:text-neutral-500 text-xs mt-0.5">
                                                            {isPending ? 'Enlace emitido' : `ID Usuario: ${user.id_usuario}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="py-4.5 px-6 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                                                {user.email}
                                            </td>

                                            {/* Rol */}
                                            <td className="py-4.5 px-6 whitespace-nowrap">
                                                {user.rol_codigo === 'ACCOUNT_ADMIN' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-650 dark:text-purple-400 text-xs font-semibold">
                                                        <Shield className="w-3.5 h-3.5" />
                                                        {user.rol_codigo.replace('_', ' ')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-xs font-semibold">
                                                        <User className="w-3.5 h-3.5" />
                                                        {user.rol_codigo.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Estado toggle */}
                                            <td className="py-4.5 px-6 whitespace-nowrap text-center">
                                                {isPending ? (
                                                    <span className="inline-flex px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold tracking-wide uppercase">
                                                        Invitado
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleActive(user)}
                                                        disabled={isSelf}
                                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
                                                            user.activo ? 'bg-emerald-600' : 'bg-neutral-200 dark:bg-neutral-800'
                                                        } ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                user.activo ? 'translate-x-5' : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                )}
                                            </td>

                                            {/* Alta */}
                                            <td className="py-4.5 px-6 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                                                    {user.fecha_alta ? new Date(user.fecha_alta).toLocaleDateString('es-AR', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </div>
                                            </td>

                                            {/* Acciones */}
                                            <td className="py-4.5 px-6 whitespace-nowrap text-right text-xs">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    {user.url_invitacion && (
                                                        <button
                                                            onClick={() => {
                                                                setGeneratedLink(user.url_invitacion!);
                                                                setShowSuccessModal(true);
                                                                showToast('Enlace de invitación recuperado', 'success');
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 font-semibold border border-indigo-200/50 dark:border-indigo-500/20 transition cursor-pointer"
                                                        >
                                                            Ver Link
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setNewRol(user.rol_codigo);
                                                            setShowRoleModal(true);
                                                        }}
                                                        disabled={isSelf || isPending}
                                                        className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        Cambiar Rol
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ═══ MODAL: INVITAR USUARIO ═══ */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-150 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Invitar nuevo usuario
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setInviteEmail('');
                                }}
                                className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleInviteSubmit} className="p-6 space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                                    Email del Invitado <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="correo@empresa.com"
                                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-450 leading-relaxed">
                                    Se generará un link especial. El usuario deberá registrarse o iniciar sesión con este correo específico para ingresar.
                                </p>
                            </div>

                            {/* Rol */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                                    Rol asignado <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'ACCOUNT_STAFF', label: 'Colaborador', desc: 'Permisos de operador, lectura y edición' },
                                        { value: 'ACCOUNT_ADMIN', label: 'Administrador', desc: 'Acceso total y gestión de personal' },
                                    ].map(roleItem => {
                                        const active = inviteRol === roleItem.value;
                                        return (
                                            <button
                                                key={roleItem.value}
                                                type="button"
                                                onClick={() => setInviteRol(roleItem.value as any)}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                                                    active 
                                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-650 dark:text-indigo-300' 
                                                        : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                                                }`}
                                            >
                                                <span className={`text-xs font-bold mb-1.5 ${active ? 'text-indigo-600 dark:text-white' : 'text-neutral-800 dark:text-neutral-300'}`}>{roleItem.label}</span>
                                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">{roleItem.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setInviteEmail('');
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition cursor-pointer"
                                >
                                    {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {inviting ? 'Invitando...' : 'Generar Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ MODAL: INVITACIÓN EXITOSA (LINK GENERADO) ═══ */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-150 dark:border-indigo-500/30 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="w-7 h-7 animate-bounce" />
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">¡Invitación Creada Exitosamente!</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                                    Copiá el siguiente enlace de invitación y envíaselo al usuario. Al ingresar, se vinculará a la cuenta de manera automática.
                                </p>
                            </div>

                            {/* Link display and copy */}
                            <div className="space-y-2">
                                <div className="relative flex items-center bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden px-3.5 py-3">
                                    <input
                                        type="text"
                                        readOnly
                                        value={generatedLink}
                                        className="w-full bg-transparent text-xs text-indigo-600 dark:text-indigo-300 font-mono focus:outline-none border-none select-all pr-8"
                                    />
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="absolute right-2 p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition rounded-lg hover:bg-neutral-250 dark:hover:bg-neutral-800 cursor-pointer"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 dark:bg-white hover:bg-indigo-500 dark:hover:bg-neutral-100 text-white dark:text-black font-semibold text-sm transition shadow-md cursor-pointer"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL: CAMBIAR ROL ═══ */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-150 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Cambiar rol de usuario
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setSelectedUser(null);
                                }}
                                className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                <p className="text-xs text-neutral-500">Usuario seleccionado:</p>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">
                                    {selectedUser.nombre && selectedUser.apellido 
                                        ? `${selectedUser.nombre} ${selectedUser.apellido}` 
                                        : 'Invitación Pendiente'}
                                </p>
                                <p className="text-xs text-neutral-455 dark:text-neutral-400 font-mono mt-0.5">{selectedUser.email}</p>
                            </div>

                            {/* Rol Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    Selecciona el nuevo rol:
                                </label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { value: 'ACCOUNT_STAFF', label: 'Colaborador', desc: 'Acceso a operaciones y edición de eventos' },
                                        { value: 'ACCOUNT_ADMIN', label: 'Administrador', desc: 'Permiso total incluyendo gestión de personal' },
                                    ].map(roleItem => {
                                        const isSelected = newRol === roleItem.value;
                                        return (
                                            <button
                                                key={roleItem.value}
                                                type="button"
                                                onClick={() => setNewRol(roleItem.value as any)}
                                                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 text-purple-650 dark:text-purple-300' 
                                                        : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                                                }`}
                                            >
                                                <div className={`font-bold text-xs mb-0.5 ${isSelected ? 'text-purple-600 dark:text-white' : 'text-neutral-800 dark:text-neutral-300'}`}>{roleItem.label}</div>
                                                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal">{roleItem.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRoleModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleRoleChangeSubmit}
                                    disabled={updatingRol}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition cursor-pointer"
                                >
                                    {updatingRol && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {updatingRol ? 'Guardando...' : 'Cambiar Rol'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
