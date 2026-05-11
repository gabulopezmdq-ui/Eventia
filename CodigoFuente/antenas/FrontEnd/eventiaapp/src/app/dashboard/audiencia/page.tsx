'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAudienciaCRM } from '@/src/features/captacion/audiencias.service';
import type { AudienciaCRMPersona, TipoPersonaCRM } from '@/src/features/captacion/types';
import { useAuth } from '@/src/context/AuthContext';
import {
    Loader2, Users, Search, ChevronRight,
    AlertTriangle, Heart, Utensils, UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';

// ─── Configuración de tabs ───────────────────────────────────────────────────

const TABS: { codigo: TipoPersonaCRM; label: string }[] = [
    { codigo: 'TODOS',               label: 'Todos' },
    { codigo: 'RESPONSABLE_PROGRAMA',  label: 'Responsables' },
    { codigo: 'PARTICIPANTE_PROGRAMA', label: 'Participantes' },
    { codigo: 'EVENTO_PUBLICO',        label: 'Eventos Públicos' },
    { codigo: 'EVENTO_PRIVADO',        label: 'Eventos Privados' },
    { codigo: 'STAFF',                 label: 'Staff' },
    { codigo: 'SIN_CLASIFICAR',        label: 'Sin clasificar' },
];

// ─── Helpers de presentación ─────────────────────────────────────────────────

const TIPO_BADGE: Record<TipoPersonaCRM, string> = {
    TODOS:                '',
    RESPONSABLE_PROGRAMA:  'bg-indigo-500/10 text-indigo-600',
    PARTICIPANTE_PROGRAMA: 'bg-emerald-500/10 text-emerald-600',
    EVENTO_PUBLICO:        'bg-amber-500/10  text-amber-600',
    EVENTO_PRIVADO:        'bg-purple-500/10 text-purple-600',
    STAFF:                 'bg-cyan-500/10   text-cyan-600',
    SIN_CLASIFICAR:        'bg-neutral-500/10 text-neutral-500',
};

function AlertaBadge({ alerta }: { alerta: string }) {
    if (alerta === 'SALUD') {
        return (
            <span title="Salud" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[10px] font-bold">
                <Heart className="w-3 h-3" /> Salud
            </span>
        );
    }
    if (alerta === 'RESTRICCION_ALIMENTARIA') {
        return (
            <span title="Restricción alimentaria" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 text-[10px] font-bold">
                <UtensilsCrossed className="w-3 h-3" /> Rest. Alim.
            </span>
        );
    }
    if (alerta === 'COMEDOR') {
        return (
            <span title="Comedor" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 text-[10px] font-bold">
                <Utensils className="w-3 h-3" /> Comedor
            </span>
        );
    }
    return null;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AudienciaCRMPage() {
    const { cuenta, loading: authLoading } = useAuth();

    const [tipoActivo, setTipoActivo]   = useState<TipoPersonaCRM>('TODOS');
    const [searchTerm, setSearchTerm]   = useState('');
    const [audiencia, setAudiencia]     = useState<AudienciaCRMPersona[]>([]);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState<string | null>(null);

    // Debounce ref para el campo de búsqueda
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchAudiencia = useCallback(async (tipo: TipoPersonaCRM, q: string) => {
        const idCuenta = cuenta?.id_cuenta;
        if (!idCuenta) return;

        setLoading(true);
        setError(null);
        try {
            const data = await getAudienciaCRM({ idCuenta, tipo, q });
            setAudiencia(data);
        } catch {
            setError('No se pudo cargar la audiencia. Verificá tu conexión e intentá de nuevo.');
            setAudiencia([]);
        } finally {
            setLoading(false);
        }
    }, [cuenta?.id_cuenta]);

    // Carga inicial y cuando cambia el tab
    useEffect(() => {
        if (!authLoading) fetchAudiencia(tipoActivo, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoActivo, authLoading]);

    // Búsqueda con debounce de 400ms
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchAudiencia(tipoActivo, value);
        }, 400);
    };

    const handleTabChange = (tipo: TipoPersonaCRM) => {
        setTipoActivo(tipo);
        // La carga se dispara por el useEffect de tipoActivo
    };

    return (
        <div className="space-y-6">

            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Audiencia (CRM)
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Explorá y segmentá toda tu audiencia por tipo de participación.
                    </p>
                </div>

                {/* Contador */}
                {!loading && !error && (
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 text-sm font-bold">
                        {audiencia.length} {audiencia.length === 1 ? 'persona' : 'personas'}
                    </span>
                )}
            </div>

            {/* ── Tabs de filtrado rápido ────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {TABS.map(tab => (
                    <button
                        key={tab.codigo}
                        onClick={() => handleTabChange(tab.codigo)}
                        className={`
                            px-4 py-1.5 rounded-xl text-sm font-bold border transition-all
                            ${tipoActivo === tab.codigo
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                                : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-indigo-400'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tabla principal ────────────────────────────────────── */}
            <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden">

                {/* Search bar */}
                <div className="p-4 border-b border-card-border">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, celular..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-xl text-sm focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background/50 border-b border-card-border text-xs uppercase tracking-widest text-muted">
                                <th className="px-6 py-4 font-bold">Persona</th>
                                <th className="px-6 py-4 font-bold">Tipo</th>
                                <th className="px-6 py-4 font-bold">Contexto</th>
                                <th className="px-6 py-4 font-bold">Contacto</th>
                                <th className="px-6 py-4 font-bold text-center">Eventos</th>
                                <th className="px-6 py-4 font-bold">Alertas</th>
                                <th className="px-6 py-4 font-bold">Tags</th>
                                <th className="px-6 py-4 font-bold text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">

                            {/* Estado: cargando */}
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                                        <p className="text-muted text-sm mt-3">Cargando audiencia…</p>
                                    </td>
                                </tr>
                            )}

                            {/* Estado: error */}
                            {!loading && error && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <p className="text-muted text-sm">{error}</p>
                                    </td>
                                </tr>
                            )}

                            {/* Estado: vacío */}
                            {!loading && !error && audiencia.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted text-sm">
                                        No se encontraron personas en esta categoría.
                                    </td>
                                </tr>
                            )}

                            {/* Filas de datos */}
                            {!loading && !error && audiencia.map(persona => (
                                <tr
                                    key={persona.id_audiencia_persona}
                                    className="hover:bg-background/50 transition-colors group"
                                >
                                    {/* Persona */}
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-foreground text-sm">
                                            {persona.nombre} {persona.apellido}
                                        </div>
                                        <div className="text-xs text-muted mt-0.5">
                                            Últ. participación:{' '}
                                            {persona.ultima_participacion
                                                ? new Date(persona.ultima_participacion).toLocaleDateString('es-AR')
                                                : '—'}
                                        </div>
                                    </td>

                                    {/* Tipo */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${TIPO_BADGE[persona.tipo_persona]}`}>
                                            {persona.tipo_label}
                                        </span>
                                    </td>

                                    {/* Contexto */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-foreground">
                                            {persona.contexto ?? <span className="text-muted italic">—</span>}
                                        </span>
                                    </td>

                                    {/* Contacto */}
                                    <td className="px-6 py-4">
                                        {persona.email || persona.celular ? (
                                            <div className="text-sm text-foreground">
                                                {persona.email && <div>{persona.email}</div>}
                                                {persona.celular && <div className="text-xs text-muted">{persona.celular}</div>}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted italic">Sin contacto</span>
                                        )}
                                    </td>

                                    {/* Eventos registrados / asistidos */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span title="Registrados" className="inline-flex w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 font-bold items-center justify-center text-xs">
                                                {persona.eventos_registrados}
                                            </span>
                                            <span className="text-muted text-xs">/</span>
                                            <span title="Asistidos" className="inline-flex w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 font-bold items-center justify-center text-xs">
                                                {persona.eventos_asistidos}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Alertas */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {persona.alertas.length === 0 ? (
                                                <span className="text-xs text-muted">—</span>
                                            ) : (
                                                persona.alertas.map(a => (
                                                    <AlertaBadge key={a} alerta={a} />
                                                ))
                                            )}
                                        </div>
                                    </td>

                                    {/* Tags */}
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {persona.tags.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                                                    {tag}
                                                </span>
                                            ))}
                                            {persona.tags.length > 2 && (
                                                <span className="px-2 py-1 rounded-md bg-background border border-card-border text-muted text-[10px] font-bold">
                                                    +{persona.tags.length - 2}
                                                </span>
                                            )}
                                            {persona.tags.length === 0 && (
                                                <span className="text-xs text-muted">—</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Acción */}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
