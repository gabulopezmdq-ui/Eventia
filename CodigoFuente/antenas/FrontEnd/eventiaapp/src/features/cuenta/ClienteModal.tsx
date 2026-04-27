'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Users } from 'lucide-react';
import {
    createCliente,
    updateCliente,
    getMisUnidades,
    CreateClienteInput,
    UpdateClienteInput,
    Cliente,
    Unidad,
} from '@/src/features/cuenta/cuenta.service';

interface ClienteModalProps {
    mode: 'create' | 'edit';
    initialData?: Cliente;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyForm: CreateClienteInput = {
    nombre_cliente: '',
    email: '',
    telefono: '',
    notas: '',
    id_unidad_principal: undefined,
};

export function ClienteModal({ mode, initialData, onClose, onSuccess }: ClienteModalProps) {
    const [form, setForm] = useState<CreateClienteInput>(emptyForm);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [loadingUnidades, setLoadingUnidades] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar unidades para el select
    useEffect(() => {
        getMisUnidades(true)
            .then(setUnidades)
            .catch(() => setUnidades([]))
            .finally(() => setLoadingUnidades(false));
    }, []);

    // Pre-poblar en modo edición
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setForm({
                nombre_cliente: initialData.nombre_cliente,
                email: initialData.email ?? '',
                telefono: initialData.telefono ?? '',
                notas: initialData.notas ?? '',
                id_unidad_principal: initialData.id_unidad_principal,
            });
        }
    }, [mode, initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'id_unidad_principal'
                ? (value === '' ? undefined : Number(value))
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.nombre_cliente.trim()) {
            setError('El nombre del cliente es obligatorio.');
            return;
        }

        setSaving(true);
        try {
            if (mode === 'create') {
                await createCliente(form);
            } else if (mode === 'edit' && initialData) {
                const payload: UpdateClienteInput = {
                    ...form,
                    id_cliente: initialData.id_cliente,
                    activo: initialData.es_activo,
                };
                await updateCliente(payload);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message ?? 'Ocurrió un error inesperado.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10">
                            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
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
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Nombre del cliente <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre_cliente"
                            value={form.nombre_cliente}
                            onChange={handleChange}
                            placeholder="Ej: Familia Sánchez"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Email + Teléfono en fila */}
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
                                placeholder="cliente@ejemplo.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
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
                                placeholder="+5492235550000"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Unidad principal */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Unidad principal <span className="text-neutral-400 font-normal">(opcional)</span>
                        </label>
                        {loadingUnidades ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-400">
                                <Loader2 className="w-4 h-4 animate-spin" /> Cargando unidades...
                            </div>
                        ) : (
                            <select
                                name="id_unidad_principal"
                                value={form.id_unidad_principal ?? ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition appearance-none"
                            >
                                <option value="">— Sin unidad asignada —</option>
                                {unidades.map(u => (
                                    <option key={u.id_unidad} value={u.id_unidad}>
                                        {u.nombre} {u.codigo ? `(${u.codigo})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Notas */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Notas <span className="text-neutral-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            name="notas"
                            value={form.notas}
                            onChange={handleChange}
                            placeholder="Ej: Casamiento hija diciembre, prefiere salón norte"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Guardando...' : mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
