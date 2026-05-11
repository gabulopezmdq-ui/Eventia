'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, UserCog, Copy, Check } from 'lucide-react';
import {
    CreateStaffInput,
    UpdateStaffInput,
    Staff,
    StaffRol,
} from '@/src/features/staff/types';
import { createStaff, updateStaff } from '@/src/features/staff/staff.service';
import { StaffUnidadesSelector } from './StaffUnidadesSelector';
import { useAuth } from '@/src/context/AuthContext';

interface StaffModalProps {
    mode: 'create' | 'edit';
    initialData?: Staff;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyForm: CreateStaffInput = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    id_cuenta: 0,
    rol: 'STAFF_MESERO',
    unidades: [],
};

export function StaffModal({ mode, initialData, onClose, onSuccess }: StaffModalProps) {
    const { cuenta } = useAuth();
    const [form, setForm] = useState<CreateStaffInput>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estado para mostrar el código tras creación exitosa
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setForm({
                nombre: initialData.nombre,
                apellido: initialData.apellido,
                email: initialData.email ?? '',
                telefono: initialData.telefono ?? '',
                id_cuenta: initialData.id_cuenta,
                rol: initialData.rol,
                unidades: initialData.unidades.map(u => u.id_unidad),
            });
        } else if (cuenta?.id_cuenta) {
            setForm(prev => ({ ...prev, id_cuenta: cuenta.id_cuenta as number }));
        }
    }, [mode, initialData, cuenta]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.nombre.trim() || !form.apellido.trim()) {
            setError('Nombre y apellido son obligatorios.');
            return;
        }

        if (form.unidades.length === 0) {
            setError('Debe seleccionar al menos una unidad.');
            return;
        }

        setSaving(true);
        try {
            if (mode === 'create') {
                const result = await createStaff(form);
                setCreatedCode(result.codigo); // Muestra la pantalla del código
                onSuccess(); // Refresca la lista de fondo
            } else if (mode === 'edit' && initialData) {
                const payload: UpdateStaffInput = {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    email: form.email,
                    telefono: form.telefono,
                    rol: form.rol,
                    unidades: form.unidades,
                };
                await updateStaff(initialData.id_staff, payload);
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message ?? 'Ocurrió un error inesperado.');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        if (createdCode) {
            navigator.clipboard.writeText(createdCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // ─────────────────────────────────────────────────────────────────
    // VISTA DE ÉXITO (CÓDIGO GENERADO)
    // ─────────────────────────────────────────────────────────────────
    if (createdCode) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 text-center animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        Staff Creado con Éxito
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                        Este es el código de acceso para <strong>{form.nombre} {form.apellido}</strong>. 
                        Copialo y compartilo ahora, no volverá a mostrarse.
                    </p>
                    
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 flex items-center justify-between mb-6 border border-neutral-200 dark:border-neutral-700">
                        <code className="text-xl font-mono font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                            {createdCode}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-neutral-700 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                            title="Copiar código"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                    >
                        Entendido, cerrar
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // VISTA DE FORMULARIO
    // ─────────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                            <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {mode === 'create' ? 'Nuevo Staff' : 'Editar Staff'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form — scrollable */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Juan"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                placeholder="Ej: Pérez"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Email <span className="text-neutral-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="juan@ejemplo.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Teléfono <span className="text-neutral-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                placeholder="+5491100000000"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Rol */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
                        >
                            <option value="STAFF_DJ">DJ</option>
                            <option value="STAFF_MESERO">Mesero</option>
                            <option value="STAFF_COCINA">Cocina</option>
                            <option value="STAFF_SEGURIDAD">Seguridad</option>
                            <option value="STAFF_PROPIETARIO">Propietario / Organizador</option>
                            <option value="ACCOUNT_ADMIN">Administrador de Cuenta</option>
                        </select>
                    </div>

                    {/* Selector de Unidades */}
                    <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Unidades Asignadas <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-neutral-500 mb-2">
                            Seleccioná a qué unidades/locaciones tendrá acceso este staff.
                        </p>
                        <StaffUnidadesSelector
                            value={form.unidades}
                            onChange={(unidades) => setForm(prev => ({ ...prev, unidades }))}
                        />
                    </div>

                    {/* Error */}
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
                            {saving ? 'Guardando...' : mode === 'create' ? 'Crear Staff' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
