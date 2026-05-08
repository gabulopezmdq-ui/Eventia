'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPrograma } from '@/src/features/programas/programas.service';
import { getTiposEvento, getIdiomasActivos } from '@/src/features/events/event.service';
import { CalendarDays, Loader2, ArrowLeft, Building2, PartyPopper, Calendar, Save, X, Languages } from 'lucide-react';
import type { TipoEvento, Idioma } from '@/src/features/events/types';

interface Unidad {
    id_unidad: number;
    nombre: string;
}

interface Cliente {
    id_cliente: number;
    nombre_cliente: string;
}


export default function NuevoProgramaPage() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingSelects, setLoadingSelects] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [formData, setFormData] = useState({
        idTipoEvento: 0,
        idIdioma: 0,

        nombrePrograma: '',
        anfitrionesTexto: '',

        saludo: '',
        mensajeBienvenida: '',
        notas: '',
        infoPublica: '',

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

                const [idiomasData,
                    resUnidades,
                    resClientes
                ] = await Promise.all([
                    getIdiomasActivos(),
                    fetch('/api/cuenta-unidades?soloActivas=true'),
                    fetch('/api/clientes')
                ]);

                setIdiomas(idiomasData);

                let initialIdioma = 1;
                if (idiomasData.length > 0) {
                    initialIdioma = idiomasData[0].id_idioma;
                    setFormData(prev => ({
                        ...prev,
                        idIdioma: initialIdioma
                    }));
                }

                const tipos = await getTiposEvento(initialIdioma, 'PROGRAMA');
                setTiposEvento(tipos);

                if (tipos.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        idTipoEvento: tipos[0].id
                    }));
                }

                if (resUnidades.ok) {

                    const data: Unidad[] = await resUnidades.json();

                    setUnidades(data);

                    if (data.length > 0) {

                        setB2bInfo(prev => ({
                            ...prev,
                            idUnidad: data[0].id_unidad
                        }));
                    }
                }


                if (resClientes.ok) {

                    const data: Cliente[] = await resClientes.json();

                    setClientes(data);
                }

                setFormData(prev => ({
                    ...prev,
                    anfitrionesTexto: 'Aquamar'
                }));

            } catch (err) {

                console.error(err);

                setError(
                    'No se pudieron cargar los datos necesarios.'
                );

            } finally {

                setLoadingSelects(false);
            }
        }

        loadData();

    }, []);


    const handleFormChange = async (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {

        const { name, value } = e.target;

        if (name === 'idTipoEvento') {

            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value, 10) || 0
            }));

            return;
        }

        if (name === 'idIdioma') {

            const newIdIdioma = parseInt(value, 10) || 0;

            setFormData(prev => ({
                ...prev,
                idIdioma: newIdIdioma
            }));

            try {
                const tipos = await getTiposEvento(newIdIdioma, 'PROGRAMA');
                setTiposEvento(tipos);

                if (tipos.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        idTipoEvento: tipos[0].id
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        idTipoEvento: 0
                    }));
                }
            } catch (err) {
                console.error('Error al obtener tipos de programa:', err);
            }

            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const validateForm = () => {

        if (!formData.idTipoEvento) {
            return 'Debes seleccionar un tipo de programa.';
        }

        if (!formData.nombrePrograma.trim()) {
            return 'Debes ingresar el nombre del programa.';
        }

        if (!formData.anfitrionesTexto.trim()) {
            return 'Debes ingresar la entidad organizadora.';
        }

        if (!b2bInfo.idUnidad) {
            return 'Debes seleccionar una unidad.';
        }

        if (
            b2bInfo.destinatario === 'CLIENTE'
            && !b2bInfo.idCliente
        ) {
            return 'Debes seleccionar un cliente.';
        }

        if (!formData.fechaInicio) {
            return 'Debes seleccionar la fecha de inicio.';
        }

        if (!formData.fechaFin) {
            return 'Debes seleccionar la fecha de finalización.';
        }

        if (
            new Date(formData.fechaFin)
            < new Date(formData.fechaInicio)
        ) {
            return 'La fecha de finalización no puede ser menor a la fecha de inicio.';
        }

        return null;
    };

    // ===============================
    // SUBMIT
    // ===============================

    const handleCrear = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setLoading(true);
        setError(null);

        try {

            const validationError = validateForm();

            if (validationError) {

                setError(validationError);
                setLoading(false);

                return;
            }

            const payload = {
                id_tipo_evento: formData.idTipoEvento,
                id_idioma: formData.idIdioma,

                id_unidad: Number(b2bInfo.idUnidad),

                id_cliente:
                    b2bInfo.destinatario === 'CLIENTE'
                        ? Number(b2bInfo.idCliente)
                        : null,

                modalidad: b2bInfo.destinatario,

                anfitriones_texto:
                    formData.anfitrionesTexto,

                saludo:
                    formData.nombrePrograma,

                mensaje_bienvenida:
                    formData.mensajeBienvenida || null,

                notas:
                    formData.notas || null,

                info_publica:
                    formData.infoPublica || null,

                fecha_inicio:
                    formData.fechaInicio,

                fecha_fin:
                    formData.fechaFin,

                codigo_plan: 'B2B_STARTER',

                tipo_operacion: 'PROGRAMA'
            };

            const result = await createPrograma(
                payload as any
            );

            alert('Programa creado exitosamente');

            const eventId =
                result.id_evento
                || (result as any).idEvento;
            router.push(
                `/dashboard/cuenta/programas/${eventId}`
            );

        } catch (err: any) {

            console.error(err);

            setError(
                err.message
                || 'Error al crear el programa.'
            );

            setLoading(false);
        }
    };

    // ===============================
    // LOADING
    // ===============================

    if (loadingSelects) {

        return (
            <section className="flex flex-col items-center justify-center py-32">

                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />

                <p className="text-sm text-neutral-500">
                    Cargando formulario...
                </p>

            </section>
        );
    }

    // ===============================
    // RENDER
    // ===============================

    return (

        <section className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">

            {/* =============================== */}
            {/* HEADER */}
            {/* =============================== */}

            <div className="mb-8">

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-5 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />

                    Volver a programas
                </button>

                <h1 className="flex items-center gap-3 text-3xl font-bold text-neutral-900 dark:text-white">

                    <CalendarDays className="w-8 h-8 text-emerald-600" />

                    Nuevo Programa

                </h1>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Configura la información inicial del programa,
                    casal, campus o colonia.
                </p>

            </div>

            {/* =============================== */}
            {/* ERROR */}
            {/* =============================== */}

            {error && (

                <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* =============================== */}
            {/* FORM */}
            {/* =============================== */}

            <form
                onSubmit={handleCrear}
                className="space-y-6"
            >

                {/* =============================== */}
                {/* CONTEXTO COMERCIAL */}
                {/* =============================== */}

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">

                    <h2 className="flex items-center gap-2 text-lg font-bold mb-6 text-neutral-900 dark:text-white">

                        <Building2 className="w-5 h-5 text-emerald-500" />

                        Contexto Comercial

                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* UNIDAD */}

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Unidad / Sede
                            </label>

                            <select
                                value={b2bInfo.idUnidad}
                                onChange={(e) =>
                                    setB2bInfo(prev => ({
                                        ...prev,
                                        idUnidad:
                                            e.target.value
                                                ? Number(e.target.value)
                                                : ''
                                    }))
                                }
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >

                                <option value="">
                                    Seleccionar unidad
                                </option>

                                {unidades.map((u) => (

                                    <option
                                        key={u.id_unidad}
                                        value={u.id_unidad}
                                    >
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DESTINATARIO */}

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Destinatario
                            </label>

                            <select
                                value={b2bInfo.destinatario}
                                onChange={(e) => {

                                    const value =
                                        e.target.value as
                                        'PROPIO'
                                        | 'CLIENTE';

                                    setB2bInfo(prev => ({
                                        ...prev,
                                        destinatario: value,
                                        idCliente:
                                            value === 'PROPIO'
                                                ? ''
                                                : prev.idCliente
                                    }));
                                }}
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >

                                <option value="PROPIO">
                                    Programa Propio
                                </option>

                                <option value="CLIENTE">
                                    Cliente Agencia
                                </option>

                            </select>
                        </div>

                        {/* CLIENTE */}

                        {b2bInfo.destinatario === 'CLIENTE' && (

                            <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">

                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    Cliente
                                </label>

                                <select
                                    value={b2bInfo.idCliente}
                                    onChange={(e) =>
                                        setB2bInfo(prev => ({
                                            ...prev,
                                            idCliente:
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : ''
                                        }))
                                    }
                                    className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >

                                    <option value="">
                                        Seleccionar cliente
                                    </option>

                                    {clientes.map((c) => (

                                        <option
                                            key={c.id_cliente}
                                            value={c.id_cliente}
                                        >
                                            {c.nombre_cliente}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* =============================== */}
                {/* DATOS GENERALES */}
                {/* =============================== */}

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">

                    <h2 className="flex items-center gap-2 text-lg font-bold mb-6 text-neutral-900 dark:text-white">

                        <PartyPopper className="w-5 h-5 text-emerald-500" />

                        Datos Generales

                    </h2>

                    <div className="space-y-6">

                        {/* IDIOMA */}

                        <div>

                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">

                                <Languages className="w-3 h-3" />

                                Idioma
                            </label>

                            <select
                                name="idIdioma"
                                value={formData.idIdioma}
                                onChange={handleFormChange}
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >

                                {idiomas.map((idioma) => (

                                    <option
                                        key={idioma.id_idioma}
                                        value={idioma.id_idioma}
                                    >
                                        {idioma.nombre_largo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TIPO */}

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Tipo de Programa
                            </label>

                            <select
                                name="idTipoEvento"
                                value={formData.idTipoEvento}
                                onChange={handleFormChange}
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >

                                {tiposEvento.map((tipo) => (

                                    <option
                                        key={tipo.id}
                                        value={tipo.id}
                                    >
                                        {tipo.texto}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* NOMBRE */}

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Nombre del Programa
                            </label>

                            <input
                                type="text"
                                name="nombrePrograma"
                                value={formData.nombrePrograma}
                                onChange={handleFormChange}
                                placeholder="Ej: Campus de Fútbol 2026"
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />

                        </div>

                        {/* ORGANIZA */}

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Organiza / Entidad
                            </label>

                            <input
                                type="text"
                                name="anfitrionesTexto"
                                value={formData.anfitrionesTexto}
                                onChange={handleFormChange}
                                placeholder="Ej: Aquamar"
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />

                        </div>
                    </div>
                </div>

                {/* =============================== */}
                {/* FECHAS */}
                {/* =============================== */}

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">

                    <h2 className="flex items-center gap-2 text-lg font-bold mb-6 text-neutral-900 dark:text-white">

                        <Calendar className="w-5 h-5 text-emerald-500" />

                        Fechas

                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Fecha Inicio
                            </label>

                            <input
                                type="date"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleFormChange}
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Fecha Finalización
                            </label>

                            <input
                                type="date"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleFormChange}
                                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* =============================== */}
                {/* TEXTOS */}
                {/* =============================== */}

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">

                    <h2 className="text-lg font-bold mb-6 text-neutral-900 dark:text-white">
                        Textos Públicos
                    </h2>

                    <div className="space-y-6">

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Mensaje Bienvenida
                            </label>

                            <textarea
                                name="mensajeBienvenida"
                                value={formData.mensajeBienvenida}
                                onChange={handleFormChange}
                                rows={4}
                                placeholder="Describe brevemente el programa..."
                                className="w-full resize-none p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Notas Internas
                            </label>

                            <textarea
                                name="notas"
                                value={formData.notas}
                                onChange={handleFormChange}
                                rows={3}
                                placeholder="Notas visibles solo para el staff..."
                                className="w-full resize-none p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <div>

                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Información Pública
                            </label>

                            <textarea
                                name="infoPublica"
                                value={formData.infoPublica}
                                onChange={handleFormChange}
                                rows={3}
                                placeholder="Información pública sobre el programa..."
                                className="w-full resize-none p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* =============================== */}
                {/* ACTIONS */}
                {/* =============================== */}

                <div className="flex items-center justify-end gap-3 pt-2">

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >

                        <X className="w-4 h-4" />

                        Cancelar

                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-md transition-all active:scale-95"
                    >

                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}

                        Guardar Programa

                    </button>

                </div>
            </form>
        </section>
    );
}