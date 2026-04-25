'use client';

import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, Ticket } from 'lucide-react';
import { getPersonasRegistradas } from '@/src/features/captacion/captacion.service';
import type { PersonaRegistrada } from '@/src/features/captacion/types';

export default function PersonasRegistradasTab({ idEvento }: { idEvento: number }) {
    const [personas, setPersonas] = useState<PersonaRegistrada[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getPersonasRegistradas(idEvento);
                setPersonas(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [idEvento]);

    const filtered = personas.filter(p => 
        (p.nombre + ' ' + p.apellido).toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.celular?.includes(search)
    );

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Registrados ({personas.length})
                </h2>
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, celular..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card-bg border border-card-border rounded-xl pl-9 pr-4 py-2 text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-background/50 border-b border-card-border text-xs uppercase font-bold text-muted tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Asistente</th>
                                <th className="px-6 py-4">Acceso / Origen</th>
                                <th className="px-6 py-4 text-center">Asistió</th>
                                <th className="px-6 py-4 text-center">Beneficio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                                        No se encontraron registrados.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(p => (
                                    <tr key={p.id_audiencia_persona} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{p.nombre} {p.apellido}</div>
                                            <div className="text-xs text-muted flex gap-2 mt-1">
                                                {p.email && <span>{p.email}</span>}
                                                {p.celular && <span>{p.celular}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{p.acceso_nombre}</div>
                                            <div className="text-[10px] text-muted uppercase mt-1">{p.origen_registro || 'Registro Directo'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.asistio ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> Sí
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-white/5 text-muted text-[10px] font-bold uppercase tracking-widest">
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.beneficio_otorgado ? (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    p.beneficio_canjeado 
                                                        ? 'bg-purple-500/10 text-purple-500' 
                                                        : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    <Ticket className="w-3 h-3" />
                                                    {p.beneficio_canjeado ? 'Canjeado' : 'Pendiente'}
                                                </span>
                                            ) : (
                                                <span className="text-muted text-xs">—</span>
                                            )}
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
