'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, CalendarClock, BriefcaseMedical, CheckSquare, Settings, LayoutList, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

// Tab components (se crearán luego)
import PeriodosManager from '@/src/features/programas/components/PeriodosManager';
import ServiciosManager from '@/src/features/programas/components/ServiciosManager';
import AutorizacionesManager from '@/src/features/programas/components/AutorizacionesManager';
import SaludConfigManager from '@/src/features/programas/components/SaludConfigManager';
import StaffManager from '@/src/features/programas/components/StaffManager';

const TABS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'periodos', label: 'Períodos', icon: CalendarClock },
    { id: 'servicios', label: 'Servicios', icon: LayoutList },
    { id: 'autorizaciones', label: 'Autorizaciones', icon: CheckSquare },
    { id: 'salud', label: 'Ficha Médica', icon: BriefcaseMedical },
    { id: 'staff', label: 'Equipo', icon: Users },
];

export default function ProgramaDetallePage() {
    const params = useParams();
    const router = useRouter();
    const idEvento = Number(params.id);

    const [activeTab, setActiveTab] = useState('periodos');
    const [generatingLink, setGeneratingLink] = useState(false);

    if (!idEvento) return null;

    const handleGenerarLink = async () => {
        setGeneratingLink(true);
        try {
            // Asumimos que el front corre en el dominio principal y el flujo b2c está en /p/[codigo]
            // o simplemente copiamos una URL predefinida. Si usamos el servicio:
            const { generarLinkPublico } = await import('@/src/features/programas/programas.service');
            const data = await generarLinkPublico(idEvento);
            
            if (data && data.url) {
                await navigator.clipboard.writeText(data.url);
                alert('¡Enlace de inscripción copiado al portapapeles!');
            } else {
                // Fallback dummy
                const fallbackUrl = `${window.location.origin}/inscripcion/${idEvento}`;
                await navigator.clipboard.writeText(fallbackUrl);
                alert('Link copiado (Modo Pruebas): ' + fallbackUrl);
            }
        } catch (err) {
            console.error(err);
            // Fallback por si la API aún no está 100% lista en el backend
            const fallbackUrl = `${window.location.origin}/inscripcion/${idEvento}`;
            navigator.clipboard.writeText(fallbackUrl);
            alert('Enlace de pruebas copiado al portapapeles (API falló).');
        } finally {
            setGeneratingLink(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/dashboard/cuenta/programas')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Volver a programas</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                            <CalendarDays className="w-8 h-8 text-emerald-600" />
                            Configuración del Programa
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                            Gestiona las semanas, servicios adicionales y autorizaciones de tu colonia o campus.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGenerarLink}
                            disabled={generatingLink}
                            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold rounded-xl transition-all shadow-sm active:scale-95 text-sm disabled:opacity-70"
                        >
                            {generatingLink ? (
                                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            )}
                            Copiar Link del Padre
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 scrollbar-hide">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${isActive
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:hover:text-neutral-300 dark:hover:bg-neutral-800/50'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-neutral-400'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Contenido del Tab */}
            <div className="pt-4">
                {activeTab === 'general' && (
                    <div className="p-12 text-center text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-900/20">
                        Aquí podrías editar los datos generales (nombre, fechas, mensaje de bienvenida) configurados en el alta.
                    </div>
                )}

                {activeTab === 'periodos' && <PeriodosManager idEvento={idEvento} />}

                {activeTab === 'servicios' && <ServiciosManager idEvento={idEvento} />}

                {activeTab === 'autorizaciones' && <AutorizacionesManager idEvento={idEvento} />}

                {activeTab === 'salud' && <SaludConfigManager idEvento={idEvento} />}

                {activeTab === 'staff' && <StaffManager idEvento={idEvento} />}
            </div>
        </div>
    );
}
