"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Database,
    Plus,
    Pencil,
    Trash2,
    ShieldAlert,
} from "lucide-react";

import { getCurrentUser } from "@/src/features/events/event.service";

/* =======================
   Tipos
======================= */

interface TipoEvento {
    id: number;
    nombre: string;
    descripcion: string;
    estado: boolean;
}

interface DressCode {
    id: number;
    nombre: string;
    descripcion: string;
    estado: boolean;
}

/* =======================
   Page
======================= */

export default function ParametricasPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    /* =======================
       Data mock
    ======================= */

    const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([
        {
            id: 1,
            nombre: "Conferencia",
            descripcion: "Eventos académicos o profesionales",
            estado: true,
        },
        {
            id: 2,
            nombre: "Workshop",
            descripcion: "Talleres prácticos",
            estado: true,
        },
        {
            id: 3,
            nombre: "Social",
            descripcion: "Reuniones sociales y networking",
            estado: false,
        },
    ]);

    const [dressCodes, setDressCodes] = useState<DressCode[]>([
        {
            id: 1,
            nombre: "Formal",
            descripcion: "Traje, vestido elegante",
            estado: true,
        },
        {
            id: 2,
            nombre: "Casual",
            descripcion: "Ropa informal",
            estado: true,
        },
        {
            id: 3,
            nombre: "Gala",
            descripcion: "Etiqueta y vestimenta de lujo",
            estado: false,
        },
    ]);

    /* =======================
       Auth
    ======================= */

    useEffect(() => {
        getCurrentUser()
            .then((user) => {
                if (user.rol === "superadmin") {
                    setIsAuthorized(true);
                } else {
                    router.push("/dashboard");
                }
            })
            .catch(() => {
                router.push("/login");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [router]);

    /* =======================
       States
    ======================= */

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    /* =======================
       Render
    ======================= */

    return (
        <section className="space-y-10">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Database className="w-6 h-6 text-indigo-600" />
                    Altas Paramétricas
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Gestión de catálogos y tablas maestras del sistema
                </p>
            </header>

            {/* =======================
               Tipos de Eventos
            ======================= */}

            <ParametricaTable
                title="Tipos de Eventos"
                data={tiposEventos}
                onNew={() => console.log("Nuevo Tipo Evento")}
            />

            {/* =======================
               Dress Code
            ======================= */}

            <ParametricaTable
                title="Dress Code"
                data={dressCodes}
                onNew={() => console.log("Nuevo Dress Code")}
            />

            {/* =======================
               Placeholders futuros
            ======================= */}

            <div className="grid md:grid-cols-2 gap-4">
                <Placeholder
                    title="Idiomas"
                    description="Gestión de idiomas disponibles"
                />
                <Placeholder
                    title="Roles y Permisos"
                    description="Configuración de niveles de acceso"
                    icon={<ShieldAlert className="w-6 h-6 text-neutral-400" />}
                />
            </div>
        </section>
    );
}

/* =======================
   Components
======================= */

function ParametricaTable({
    title,
    data,
    onNew,
}: {
    title: string;
    data: any[];
    onNew: () => void;
}) {
    return (
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                    onClick={onNew}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <tr>
                            <th className="px-6 py-3 font-medium text-neutral-500">
                                ID
                            </th>
                            <th className="px-6 py-3 font-medium text-neutral-500">
                                Nombre
                            </th>
                            <th className="px-6 py-3 font-medium text-neutral-500">
                                Descripción
                            </th>
                            <th className="px-6 py-3 font-medium text-neutral-500">
                                Estado
                            </th>
                            <th className="px-6 py-3 font-medium text-neutral-500 text-right">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            >
                                <td className="px-6 py-4 font-mono text-neutral-400">
                                    #{item.id}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {item.nombre}
                                </td>
                                <td className="px-6 py-4 text-neutral-500">
                                    {item.descripcion}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.estado
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                            }`}
                                    >
                                        {item.estado
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1.5 hover:text-indigo-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Placeholder({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="p-6 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-center py-12 bg-neutral-50 dark:bg-neutral-900/20">
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3">
                {icon ?? <Database className="w-6 h-6 text-neutral-400" />}
            </div>
            <h3 className="font-medium text-neutral-900 dark:text-white">
                {title}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 mb-4">
                {description}
            </p>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Gestionar →
            </button>
        </div>
    );
}
