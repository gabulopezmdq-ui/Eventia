import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { 
    getComboRolesEquipo, 
    getComboRolesStaff, 
    addMiembroInterno, 
    addStaffDesdeCuenta, 
    addNuevoStaff 
} from '@/src/features/programas/programas.service';
import { getStaffList } from '@/src/features/staff/staff.service';
import { Staff } from '@/src/features/staff/types';
import { Loader2, X, ShieldCheck, Users, PlusCircle, Mail, User, Phone, Calendar } from 'lucide-react';

interface Props {
    idEvento: number;
    idIdioma: number;
    actionType: 'interno' | 'desde-cuenta' | 'nuevo';
    tipoOperacion: 'PROGRAMA' | 'EVENTO';
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpsertStaffDrawer({ 
    idEvento, 
    idIdioma = 1, 
    actionType, 
    tipoOperacion = 'PROGRAMA', 
    onClose, 
    onSuccess 
}: Props) {
    const { cuenta } = useAuth();
    
    // ── States ───────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Combos
    const [roles, setRoles] = useState<any[]>([]);
    const [accountStaff, setAccountStaff] = useState<Staff[]>([]);

    // Form states
    const [email, setEmail] = useState('');
    const [selectedRol, setSelectedRol] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    
    // Nuevo Staff Form
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaExpiracion, setFechaExpiracion] = useState('');

    // ── Load Combos ──────────────────────────────────────
    useEffect(() => {
        const fetchInitialData = async () => {
            setInitialLoading(true);
            setError(null);
            try {
                // 1. Fetch appropriate roles combo
                let rolesCombo: any[] = [];
                if (actionType === 'interno') {
                    rolesCombo = await getComboRolesEquipo(idIdioma, tipoOperacion);
                } else {
                    rolesCombo = await getComboRolesStaff(idIdioma, tipoOperacion);
                }
                setRoles(rolesCombo);
                
                // Pre-select first role if available
                if (rolesCombo.length > 0) {
                    const firstRole = rolesCombo[0].id_rol || rolesCombo[0].idRol || '';
                    setSelectedRol(String(firstRole));
                }

                // 2. Fetch account staff list if needed
                if (actionType === 'desde-cuenta' && cuenta?.id_cuenta) {
                    const staffList = await getStaffList(cuenta.id_cuenta);
                    setAccountStaff(staffList);
                    if (staffList.length > 0) {
                        setSelectedStaffId(String(staffList[0].id_staff));
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error al cargar opciones del formulario');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchInitialData();
    }, [actionType, idEvento, idIdioma, tipoOperacion, cuenta?.id_cuenta]);

    // ── Handle Submit ────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (actionType === 'interno') {
                if (!email) throw new Error('El correo electrónico es requerido');
                if (!selectedRol) throw new Error('El rol es requerido');
                await addMiembroInterno(
                    idEvento, 
                    { email, id_rol: Number(selectedRol) }, 
                    idIdioma
                );
            } else if (actionType === 'desde-cuenta') {
                if (!selectedStaffId) throw new Error('Debes seleccionar un miembro de staff');
                if (!selectedRol) throw new Error('El rol es requerido');
                await addStaffDesdeCuenta(
                    idEvento, 
                    { id_staff: Number(selectedStaffId), id_rol: Number(selectedRol) }, 
                    idIdioma
                );
            } else if (actionType === 'nuevo') {
                if (!nombre || !apellido) throw new Error('El nombre y el apellido son requeridos');
                if (!selectedRol) throw new Error('El rol es requerido');
                
                const payload: any = {
                    nombre,
                    apellido,
                    id_rol: Number(selectedRol),
                };
                if (email) payload.email = email;
                if (telefono) payload.telefono = telefono;
                if (fechaExpiracion) payload.fecha_expiracion = fechaExpiracion;

                await addNuevoStaff(idEvento, payload, idIdioma);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al completar la asignación');
        } finally {
            setLoading(false);
        }
    };

    // UI configurations based on actionType
    const isInterno = actionType === 'interno';
    const isDesdeCuenta = actionType === 'desde-cuenta';
    const isNuevo = actionType === 'nuevo';

    const themeBtnClass = isInterno 
        ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20' 
        : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20';
    const themeFocusClass = isInterno
        ? 'focus:border-indigo-500 focus:ring-indigo-500/20'
        : 'focus:border-emerald-500 focus:ring-emerald-500/20';

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/55 dark:bg-neutral-950/20">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                            isInterno 
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            {isInterno && <ShieldCheck className="w-5 h-5" />}
                            {isDesdeCuenta && <Users className="w-5 h-5" />}
                            {isNuevo && <PlusCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                {isInterno && 'Añadir Miembro Interno'}
                                {isDesdeCuenta && 'Agregar desde Cuenta'}
                                {isNuevo && 'Nuevo Staff Operativo'}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {isInterno && 'Asigna un usuario del sistema mediante email.'}
                                {isDesdeCuenta && 'Asigna personal reusable de tu cuenta.'}
                                {isNuevo && 'Crea y asigna un staff con código único.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {initialLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className={`w-8 h-8 animate-spin ${isInterno ? 'text-indigo-500' : 'text-emerald-500'}`} />
                            <span className="text-xs text-neutral-400">Cargando opciones...</span>
                        </div>
                    ) : (
                        <form id="drawer-staff-form" onSubmit={handleSubmit} className="space-y-5">
                            {/* --- MODO INTERNO --- */}
                            {isInterno && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        Email del Usuario
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="h-4.5 w-4.5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ejemplo@eventia.com"
                                            required
                                            className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all focus:ring-2 ${themeFocusClass}`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                                        💡 El email debe pertenecer a un usuario registrado en Eventia para poder ser asignado.
                                    </p>
                                </div>
                            )}

                            {/* --- MODO DESDE CUENTA --- */}
                            {isDesdeCuenta && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        Seleccionar Staff de Cuenta
                                    </label>
                                    {accountStaff.length === 0 ? (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-xs">
                                            No tienes personal registrado a nivel de cuenta. Puedes crear uno nuevo en la pestaña <strong>Nuevo staff</strong>.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedStaffId}
                                            onChange={(e) => setSelectedStaffId(e.target.value)}
                                            required
                                            className={`w-full p-3 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all font-semibold focus:ring-2 ${themeFocusClass}`}
                                        >
                                            {accountStaff.map((s) => (
                                                <option key={s.id_staff} value={s.id_staff} className="bg-white dark:bg-neutral-900">
                                                    {s.nombre} {s.apellido} ({s.email || 'Sin email'})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* --- MODO NUEVO STAFF --- */}
                            {isNuevo && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Nombre</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-neutral-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    placeholder="Nombre"
                                                    required
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all focus:ring-2 ${themeFocusClass}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Apellido</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-neutral-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={apellido}
                                                    onChange={(e) => setApellido(e.target.value)}
                                                    placeholder="Apellido"
                                                    required
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all focus:ring-2 ${themeFocusClass}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Email (Opcional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-neutral-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="ejemplo@staff.com"
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all focus:ring-2 ${themeFocusClass}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Teléfono (Opcional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Phone className="h-4 w-4 text-neutral-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder="+54 9 11 1234 5678"
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all focus:ring-2 ${themeFocusClass}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Vigencia / Expiración (Opcional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Calendar className="h-4 w-4 text-neutral-400" />
                                            </div>
                                            <input
                                                type="date"
                                                value={fechaExpiracion}
                                                onChange={(e) => setFechaExpiracion(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all focus:ring-2 ${themeFocusClass}`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                                            El código de acceso dejará de ser utilizable después de esta fecha. Dejar vacío para vigencia ilimitada.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* --- CAMPO ROL (COMÚN A TODOS) --- */}
                            {(!isDesdeCuenta || accountStaff.length > 0) && (
                                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        Función / Rol Asignado
                                    </label>
                                    <select
                                        value={selectedRol}
                                        onChange={(e) => setSelectedRol(e.target.value)}
                                        required
                                        className={`w-full p-3 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 outline-none text-sm text-neutral-800 dark:text-neutral-100 transition-all font-semibold focus:ring-2 ${themeFocusClass}`}
                                    >
                                        {roles.map((r) => {
                                            const rId = r.id_rol || r.idRol;
                                            const rText = r.texto || r.rol_texto || r.rolTexto || r.nombre || r.descripcion;
                                            return (
                                                <option key={rId} value={rId} className="bg-white dark:bg-neutral-900 font-semibold">
                                                    {rText}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/55 dark:bg-neutral-950/20 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-2xl transition-all active:scale-98"
                    >
                        Cancelar
                    </button>
                    <button
                        form="drawer-staff-form"
                        type="submit"
                        disabled={loading || initialLoading || (isDesdeCuenta && accountStaff.length === 0)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-2xl shadow-md transition-all active:scale-98 disabled:opacity-50 ${themeBtnClass}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isInterno && 'Añadir Miembro'}
                        {isDesdeCuenta && 'Asignar Personal'}
                        {isNuevo && 'Crear & Asignar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
