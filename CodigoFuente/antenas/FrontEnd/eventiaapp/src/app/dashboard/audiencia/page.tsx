'use client';

import { useEffect, useState } from 'react';
import { getAudienciaCuenta } from '@/src/features/captacion/audiencias.service';
import type { AudienciaPersona } from '@/src/features/captacion/types';
import { Loader2, Users, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AudienciaListPage() {
    const [audiencias, setAudiencias] = useState<AudienciaPersona[]>([]);
    const [filtered, setFiltered] = useState<AudienciaPersona[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getAudienciaCuenta(true)
            .then(data => {
                setAudiencias(data);
                setFiltered(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFiltered(audiencias);
        } else {
            const lower = searchTerm.toLowerCase();
            setFiltered(
                audiencias.filter(a => 
                    a.nombre.toLowerCase().includes(lower) ||
                    a.apellido.toLowerCase().includes(lower) ||
                    a.email?.toLowerCase().includes(lower) ||
                    a.celular?.toLowerCase().includes(lower) ||
                    a.ciudad?.toLowerCase().includes(lower)
                )
            );
        }
    }, [searchTerm, audiencias]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Audiencia (CRM)
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Gestioná el comportamiento global de tu audiencia en todos tus eventos.
                    </p>
                </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-card-border">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, celular..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-xl text-sm focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background/50 border-b border-card-border text-xs uppercase tracking-widest text-muted">
                                <th className="px-6 py-4 font-bold">Asistente</th>
                                <th className="px-6 py-4 font-bold text-center">Eventos Reg.</th>
                                <th className="px-6 py-4 font-bold text-center">Eventos Asist.</th>
                                <th className="px-6 py-4 font-bold">Última Participación</th>
                                <th className="px-6 py-4 font-bold">Tags</th>
                                <th className="px-6 py-4 font-bold text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted text-sm">
                                        No se encontraron personas en tu audiencia.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(persona => (
                                    <tr key={persona.id_audiencia_persona} className="hover:bg-background/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground text-sm">
                                                {persona.nombre} {persona.apellido}
                                            </div>
                                            <div className="text-xs text-muted mt-0.5">
                                                {persona.email || persona.celular || 'Sin contacto'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 font-bold items-center justify-center text-xs">
                                                {persona.eventos_registrados}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 font-bold items-center justify-center text-xs">
                                                {persona.eventos_asistidos}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">
                                            {persona.ultima_participacion 
                                                ? new Date(persona.ultima_participacion).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {persona.tags?.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                                                        {tag.nombre_mostrar}
                                                    </span>
                                                ))}
                                                {persona.tags && persona.tags.length > 2 && (
                                                    <span className="px-2 py-1 rounded-md bg-background border border-card-border text-muted text-[10px] font-bold">
                                                        +{persona.tags.length - 2}
                                                    </span>
                                                )}
                                                {(!persona.tags || persona.tags.length === 0) && (
                                                    <span className="text-xs text-muted">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/dashboard/audiencia/${persona.id_audiencia_persona}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 text-xs font-bold transition-colors"
                                            >
                                                Detalle
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
