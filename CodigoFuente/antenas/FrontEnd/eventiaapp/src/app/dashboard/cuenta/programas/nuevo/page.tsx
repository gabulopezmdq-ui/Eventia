'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { createPrograma } from '@/src/features/programas/programas.service';
import { getTiposEvento, getIdiomasActivos } from '@/src/features/events/event.service';
import {
    CalendarDays, Loader2, Users, MapPin, AlignLeft,
    MessageSquare, ArrowLeft, Building2, PartyPopper, Calendar
} from 'lucide-react';
import type { TipoEvento, Idioma } from '@/src/features/events/types';

// B2B — tipos auxiliares
interface Unidad { id_unidad: number; nombre: string; }
interface Cliente { id_cliente: number; nombre_cliente: string; }

export default function NuevoProgramaPage() {
    const router = useRouter();
    const { cuenta } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Selects
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingSelects, setLoadingSelects] = useState(true);

    // Formulario
    const [formData, setFormData] = useState({
        idTipoEvento: 0,
        idIdioma: 0,
        anfitrionesTexto: '',
        saludo: '',
        mensajeBienvenida: '',
        notas: '',
        fechaInicio: '',
        fechaFin: '',
    });

    const [b2bInfo, setB2bInfo] = useState<{
        idUnidad: number | '';
        destinatario: 'PROPIO' | 'CLIENTE';
        idCliente: number | '';
    }>({
        idUnidad: '',
        destinatario: 'PROPIO',
        idCliente: '',
    });

    useEffect(() => {
        async function loadData() {
            setLoadingSelects(true);
            try {
                // TODO: En un futuro getTiposEvento podría aceptar un filtro tipoOperacion="PROGRAMA"
                // Por ahora usamos el idioma 2 (Español)
                const [tipos, idiomasData, resUnidades, resClientes] = await Promise.all([
                    getTiposEvento(2, 'PROGRAMA'),
                    getIdiomasActivos(),
                    fetch('/api/cuenta-unidades'),
                    fetch('/api/clientes')
                ]);

                // Asumimos que los tipos de evento con "programa", "colonia", "casal" son los que queremos
                // Si el backend aún no los filtra, lo mostraremos todos o el primero
                setTiposEvento(tipos);
                setIdiomas(idiomasData);

                if (tipos.length > 0) setFormData(prev => ({ ...prev, idTipoEvento: tipos[0].id }));
                if (idiomasData.length > 0) setFormData(prev => ({ ...prev, idIdioma: idiomasData[0].id_idioma }));

                if (resUnidades.ok) {
                    const data: Unidad[] = await resUnidades.json();
                    setUnidades(data);
                    if (data.length > 0) setB2bInfo(prev => ({ ...prev, idUnidad: data[0].id_unidad }));
                }
                if (resClientes.ok) {
                    const data: Cliente[] = await resClientes.json();
                    setClientes(data);
                }
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError('No se pudieron cargar los datos necesarios.');
            } finally {
                setLoadingSelects(false);
            }
        }
        loadData();
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'idTipoEvento' || name === 'idIdioma') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                IdTipoEvento: formData.idTipoEvento,
                IdIdioma: formData.idIdioma,
                IdCuenta: cuenta?.id_cuenta || 0, // Se obtiene del contexto del token
                IdUnidad: Number(b2bInfo.idUnidad),
                IdCliente: b2bInfo.destinatario === 'CLIENTE' ? Number(b2bInfo.idCliente) : null,
                Modalidad: b2bInfo.destinatario,
                AnfitrionesTexto: formData.anfitrionesTexto,
                Saludo: formData.saludo,
                MensajeBienvenida: formData.mensajeBienvenida,
                Notas: formData.notas,
                FechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString().split('T')[0] : null,
                FechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString().split('T')[0] : null,
                CodigoPlan: 'B2B_STARTER',
                TipoOperacion: 'PROGRAMA' // Añadido explícitamente por si el backend lo requiere
            };

            const result = await createPrograma(payload as any);
            // Redirigir al detalle de configuración del programa recién creado
            const eventId = result.id_evento || (result as any).idEvento;
            router.push(`/dashboard/cuenta/programas/${eventId}`);
        } catch (err: any) {
            setError(err.message || 'Error al crear el programa.');
            setLoading(false);
        }
    };

    return (
        <section className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Volver a programas</span>
                </button>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-emerald-600" />
                    Nuevo Programa
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                    Configura la información básica para dar de alta una colonia, casal o campus.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30 font-medium text-sm">
                    {error}
                </div>
            )}

            {loadingSelects ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="text-neutral-500 font-medium">Cargando formulario...</p>
                </div>
            ) : (
                <form onSubmit={handleCrear} className="space-y-6">
                    {/* B2B Context */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-6">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                            Contexto Comercial
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Unidad de Negocio</label>
                                <select
                                    value={b2bInfo.idUnidad}
                                    onChange={(e) => setB2bInfo(prev => ({ ...prev, idUnidad: e.target.value ? Number(e.target.value) : '' }))}
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                >
                                    <option value="" disabled>Seleccionar Unidad</option>
                                    {unidades.map(u => (
                                        <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">¿Para quién es el programa?</label>
                                <select
                                    value={b2bInfo.destinatario}
                                    onChange={(e) => {
                                        const dest = e.target.value as 'PROPIO' | 'CLIENTE';
                                        setB2bInfo(prev => ({ ...prev, destinatario: dest, idCliente: dest === 'PROPIO' ? '' : prev.idCliente }));
                                    }}
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                >
                                    <option value="PROPIO">Programa Propio / Corporativo</option>
                                    <option value="CLIENTE">Para un Cliente de Agencia</option>
                                </select>
                            </div>

                            {b2bInfo.destinatario === 'CLIENTE' && (
                                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Seleccionar Cliente</label>
                                    <select
                                        value={b2bInfo.idCliente}
                                        onChange={(e) => setB2bInfo(prev => ({ ...prev, idCliente: e.target.value ? Number(e.target.value) : '' }))}
                                        required
                                        className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                    >
                                        <option value="" disabled>Buscar cliente...</option>
                                        {clientes.map(c => (
                                            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Datos del Programa */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-6">
                            <PartyPopper className="w-5 h-5 text-emerald-500" />
                            Datos del Programa
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Nombre del Programa</label>
                                <input
                                    name="anfitrionesTexto"
                                    placeholder="Ej: Colonia de Verano 2026, Campus de Fútbol..."
                                    value={formData.anfitrionesTexto}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        name="fechaInicio"
                                        value={formData.fechaInicio}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Fecha de Finalización</label>
                                    <input
                                        type="date"
                                        name="fechaFin"
                                        value={formData.fechaFin}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Eslógan o Saludo Opcional</label>
                                <input
                                    name="saludo"
                                    placeholder="Ej: ¡Preparate para la diversión!..."
                                    value={formData.saludo}
                                    onChange={handleFormChange}
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Mensaje de Bienvenida</label>
                                <textarea
                                    name="mensajeBienvenida"
                                    placeholder="Texto descriptivo para la landing de inscripción..."
                                    value={formData.mensajeBienvenida}
                                    onChange={handleFormChange}
                                    rows={3}
                                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading || !formData.anfitrionesTexto || !formData.fechaInicio || !formData.fechaFin}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                            Crear Programa
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}
