'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Building2 } from 'lucide-react';
import {
    createUnidad,
    updateUnidad,
    CreateUnidadInput,
    UpdateUnidadInput,
    Unidad,
} from '@/src/features/cuenta/cuenta.service';

interface UnidadModalProps {
    mode: 'create' | 'edit';
    initialData?: Unidad;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyForm: CreateUnidadInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
};

export function UnidadModal({ mode, initialData, onClose, onSuccess }: UnidadModalProps) {
    const [form, setForm] = useState<CreateUnidadInput>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-poblar en modo edición
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setForm({
                codigo: initialData.codigo,
                nombre: initialData.nombre,
                descripcion: initialData.descripcion ?? '',
            });
        }
    }, [mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.codigo.trim() || !form.nombre.trim()) {
            setError('El código y el nombre son obligatorios.');
            return;
        }

        setSaving(true);
        try {
            if (mode === 'create') {
                await createUnidad(form);
            } else if (mode === 'edit' && initialData) {
                const payload: UpdateUnidadInput = {
                    ...form,
                    id_unidad: initialData.id_unidad,
                    activo: initialData.activa,
                };
                await updateUnidad(payload);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message ?? 'Ocurrió un error inesperado.');
        } finally {
            setSaving(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {mode === 'create' ? 'Nueva Unidad' : 'Editar Unidad'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Código */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Código <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="codigo"
                            value={form.codigo}
                            placeholder="Ej: SALON, REST, VIP"
                            maxLength={20}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                handleChange(e);
                            }}
                        />
                        <p className="text-xs text-neutral-400">Identificador corto y único (ej: SALON, REST)</p>
                    </div>

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Salón de Fiestas"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Descripción <span className="text-neutral-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Ej: Sector de fiestas y eventos"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Guardando...' : mode === 'create' ? 'Crear Unidad' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
