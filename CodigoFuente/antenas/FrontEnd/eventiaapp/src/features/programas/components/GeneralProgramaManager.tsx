'use client';

import { useEffect, useState } from 'react';
import {
    CalendarDays,
    Building2,
    Globe,
    User2,
    FileText,
    Loader2,
    Calendar
} from 'lucide-react';
import { getProgramaDetalle } from '@/src/features/programas/programas.service';

interface Props {
    idEvento: number;
}

interface EventoDetalle {
    idEvento: number;
    tipoEventoDescripcion: string;
    modalidad: string;

    anfitrionesTexto: string;

    saludo: string | null;
    mensajeBienvenida: string | null;
    notas: string | null;

    unidadNombre: string | null;
    clienteNombre: string | null;

    planNombre: string | null;

    fechaInicio: string | null;
    fechaFin: string | null;

    estado: string;
}

export default function GeneralProgramaManager({
    idEvento
}: Props) {

    const [evento, setEvento] =
        useState<EventoDetalle | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {

        async function loadEvento() {

            try {

                setLoading(true);

                const data =
                    await getProgramaDetalle(idEvento);

                setEvento(data);

            } catch (err: any) {

                console.error(err);

                setError(
                    err.message
                    || 'Error cargando el evento'
                );

            } finally {

                setLoading(false);
            }
        }

        loadEvento();

    }, [idEvento]);

    const formatDate = (
        fecha?: string | null
    ) => {

        if (!fecha) return '-';

        return new Intl.DateTimeFormat(
            'es-AR',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        ).format(new Date(fecha));
    };

    // ===============================
    // LOADING
    // ===============================

    if (loading) {

        return (
            <div className="flex justify-center py-16">

                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />

            </div>
        );
    }

    // ===============================
    // ERROR
    // ===============================

    if (error) {

        return (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium">
                {error}
            </div>
        );
    }

    // ===============================
    // EMPTY
    // ===============================

    if (!evento) {

        return (
            <div className="p-6 text-sm text-neutral-500">
                No se encontró información del programa.
            </div>
        );
    }

    // ===============================
    // RENDER
    // ===============================

    return (

        <div className="space-y-6 animate-in fade-in duration-300">

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm p-6">

                <div className="flex items-center gap-3 mb-8">

                    <CalendarDays className="w-6 h-6 text-emerald-500" />

                    <div>

                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Información General
                        </h2>

                        <p className="text-sm text-neutral-500 mt-1">
                            Datos principales del programa.
                        </p>

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* TIPO */}

                    <InfoCard
                        icon={<Globe className="w-4 h-4" />}
                        label="Tipo de Programa"
                        value={evento.tipoEventoDescripcion}
                    />

                    {/* MODALIDAD */}

                    <InfoCard
                        icon={<User2 className="w-4 h-4" />}
                        label="Modalidad"
                        value={evento.modalidad}
                    />

                    {/* ORGANIZA */}

                    <InfoCard
                        icon={<Building2 className="w-4 h-4" />}
                        label="Organiza"
                        value={evento.anfitrionesTexto}
                    />

                    {/* UNIDAD */}

                    <InfoCard
                        icon={<Building2 className="w-4 h-4" />}
                        label="Unidad"
                        value={evento.unidadNombre || '-'}
                    />

                    {/* FECHA INICIO */}

                    <InfoCard
                        icon={<Calendar className="w-4 h-4" />}
                        label="Fecha Inicio"
                        value={formatDate(evento.fechaInicio)}
                    />

                    {/* FECHA FIN */}

                    <InfoCard
                        icon={<Calendar className="w-4 h-4" />}
                        label="Fecha Fin"
                        value={formatDate(evento.fechaFin)}
                    />

                </div>

                {/* MENSAJE */}

                <div className="mt-8 space-y-5">

                    <TextBlock
                        title="Nombre / Saludo"
                        text={evento.saludo}
                    />

                    <TextBlock
                        title="Mensaje de Bienvenida"
                        text={evento.mensajeBienvenida}
                    />

                    <TextBlock
                        title="Notas Internas"
                        text={evento.notas}
                    />

                </div>
            </div>
        </div>
    );
}

// ===============================
// COMPONENTES AUX
// ===============================

function InfoCard({
    icon,
    label,
    value
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {

    return (

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-800/40">

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">

                {icon}

                {label}

            </div>

            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                {value || '-'}
            </div>
        </div>
    );
}

function TextBlock({
    title,
    text
}: {
    title: string;
    text?: string | null;
}) {

    return (

        <div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">

                <FileText className="w-4 h-4" />

                {title}

            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap min-h-[80px]">
                {text || 'Sin información'}
            </div>
        </div>
    );
}