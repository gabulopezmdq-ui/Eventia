'use client';

import { X, ShieldCheck, Users } from 'lucide-react';
import type { AutorizacionesInscripcionResponse } from '@/src/features/programas/types';
import AutorizacionChip from './AutorizacionChip';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: AutorizacionesInscripcionResponse | null;
    loading?: boolean;
    error?: string | null;
}

export default function AutorizacionesDrawer({ isOpen, onClose, data, loading, error }: Props) {
    // Agrupar autorizaciones_participantes por nombre de participante
    const participantesAgrupados = data?.autorizaciones_participantes.reduce((acc, item) => {
        const key = item.participante ?? 'Sin nombre';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, typeof data.autorizaciones_participantes>);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-card-bg border-l border-card-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-card-border">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-violet-400" />
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Autorizaciones Legales</h2>
                            {data && <p className="text-xs text-muted">Inscripción #{data.id_inscripcion}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <X className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-400">Error al cargar</p>
                                <p className="text-xs text-muted mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {data && !loading && (
                        <>
                            {/* Datos del responsable */}
                            <div className="p-4 rounded-xl bg-white/5 border border-card-border space-y-1">
                                <p className="text-sm font-bold text-foreground">{data.responsable}</p>
                                <p className="text-xs text-muted">{data.email}</p>
                                <p className="text-xs text-muted">{data.telefono}</p>
                            </div>

                            {/* Autorizaciones Grupo Familiar */}
                            {data.autorizaciones_grupo.length > 0 && (
                                <section className="space-y-3">
                                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Grupo Familiar
                                    </h3>
                                    {data.autorizaciones_grupo.map((a) => (
                                        <AutorizacionChip
                                            key={a.id_inscripcion_autorizacion}
                                            aceptada={a.aceptada}
                                            titulo={a.titulo}
                                            firmante={a.nombre_firmante}
                                            fecha={a.fecha_aceptacion}
                                        />
                                    ))}
                                </section>
                            )}

                            {/* Autorizaciones por Participante */}
                            {participantesAgrupados && Object.keys(participantesAgrupados).length > 0 && (
                                <section className="space-y-6">
                                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Participantes
                                    </h3>
                                    {Object.entries(participantesAgrupados).map(([nombre, items]) => (
                                        <div key={nombre} className="space-y-2">
                                            <p className="text-sm font-semibold text-foreground/80">{nombre}</p>
                                            {items.map((a) => (
                                                <AutorizacionChip
                                                    key={a.id_inscripcion_autorizacion}
                                                    aceptada={a.aceptada}
                                                    titulo={a.titulo}
                                                    firmante={a.nombre_firmante}
                                                    fecha={a.fecha_aceptacion}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
