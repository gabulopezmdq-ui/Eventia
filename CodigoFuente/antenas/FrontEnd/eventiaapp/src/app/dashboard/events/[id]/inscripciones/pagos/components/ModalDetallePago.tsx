'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    X, Loader2, AlertCircle, Calendar, Package, Plus, 
    Tag, CreditCard, Ban, FileText, CheckCircle2, CircleDashed, Clock
} from 'lucide-react';
import { getEstadoPagoInscripcion } from '@/src/features/inscripcion/pagos.service';
import type { 
    EstadoPagoDetalle, 
    DetalleParticipante,
    PeriodoDetalle,
    ServicioDetalle
} from '@/src/features/inscripcion/types/pagos.types';
import ModalAgregarAjuste from './ModalAgregarAjuste';
import ModalRegistrarPago from './ModalRegistrarPago';
import ModalAnularPago from './ModalAnularPago';

interface ModalDetallePagoProps {
    idInscripcion: number;
    onClose: () => void;
    /** Se llama cuando ocurren cambios (ej: se agregó un ajuste) para refetchear la grilla padre */
    onChanged?: () => void;
}

export default function ModalDetallePago({ idInscripcion, onClose, onChanged }: ModalDetallePagoProps) {
    const [detalle, setDetalle] = useState<EstadoPagoDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los modales hijos
    const [showAgregarAjuste, setShowAgregarAjuste] = useState(false);
    const [showRegistrarPago, setShowRegistrarPago] = useState(false);
    const [showAnularPago, setShowAnularPago] = useState<number | null>(null);

    const fetchDetalle = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // El idIdioma por defecto es 3 (Catalán) en el servicio
            const data = await getEstadoPagoInscripcion(idInscripcion);
            setDetalle(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
        } finally {
            setLoading(false);
        }
    }, [idInscripcion]);

    useEffect(() => {
        fetchDetalle();
    }, [fetchDetalle]);

    // ── Agrupamiento por Participante ──
    const participantesAgrupados = useMemo(() => {
        if (!detalle) return [];

        const map = new Map<string, DetalleParticipante>();

        // Inicializar el map con los nombres del resumen
        detalle.participantes.forEach(nombre => {
            map.set(nombre, { nombre, periodos: [], servicios: [] });
        });

        // Agrupar períodos
        detalle.periodos.forEach(p => {
            if (!map.has(p.participante)) {
                map.set(p.participante, { nombre: p.participante, periodos: [], servicios: [] });
            }
            map.get(p.participante)!.periodos.push(p);
        });

        // Agrupar servicios
        detalle.servicios.forEach(s => {
            if (!map.has(s.participante)) {
                map.set(s.participante, { nombre: s.participante, periodos: [], servicios: [] });
            }
            map.get(s.participante)!.servicios.push(s);
        });

        // Filtrar aquellos que realmente tienen algo inscripto
        return Array.from(map.values()).filter(p => p.periodos.length > 0 || p.servicios.length > 0);
    }, [detalle]);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency || 'ARS',
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-AR');
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
    };

    const handleMutacionSuccess = () => {
        // Al terminar una mutación con éxito:
        // 1. Refetch de este detalle para actualizar las grillas y el resumen interno
        fetchDetalle();
        // 2. Avisar al padre para que actualice la grilla general (si hace falta)
        if (onChanged) onChanged();
    };

    if (loading && !detalle) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center bg-card-bg p-8 rounded-3xl border border-card-border shadow-2xl">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-muted">Cargando detalle de pago...</p>
                </div>
            </div>
        );
    }

    if (error && !detalle) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-card-bg p-8 rounded-3xl border border-red-500/20 shadow-2xl max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Error</h3>
                    <p className="text-sm text-muted mb-6">{error}</p>
                    <button onClick={onClose} className="px-6 py-2.5 bg-card-bg border border-card-border rounded-xl text-sm font-bold text-foreground hover:bg-background">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    if (!detalle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl h-full max-h-[90vh] rounded-3xl bg-card-bg border border-card-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* ── Header Fijo ── */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-card-border/50 bg-card-bg z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Detalle de Inscripción #{detalle.idInscripcion}</h2>
                            <p className="text-xs text-muted mt-0.5">
                                Responsable: <span className="font-semibold text-foreground">{detalle.responsable}</span> · {detalle.email || detalle.telefono}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Sección: Participantes (Períodos y Servicios) */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Servicios Contratados
                        </h3>

                        {participantesAgrupados.map((part) => (
                            <div key={part.nombre} className="rounded-2xl border border-card-border/50 overflow-hidden bg-background/30">
                                <div className="px-5 py-3 bg-card-bg/50 border-b border-card-border/50 font-bold text-sm text-foreground">
                                    {part.nombre}
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Períodos */}
                                    {part.periodos.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Semanas / Períodos</p>
                                            <div className="space-y-2">
                                                {part.periodos.map((p, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <span className="text-foreground/80">• {p.nombre}</span>
                                                        <span className="font-medium text-foreground">{formatCurrency(p.precioBase, p.moneda)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Servicios */}
                                    {part.servicios.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 mt-4">Servicios Adicionales</p>
                                            <div className="space-y-2">
                                                {part.servicios.map((s, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-foreground/80">• {s.nombre}</span>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-card-border/50 text-muted">
                                                                {s.tipoCalculo === 'POR_DIA' ? `${s.cantidadCalculada} días` : '1'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium text-foreground">{formatCurrency(s.subtotal, s.moneda)}</span>
                                                            {s.tipoCalculo === 'POR_DIA' && (
                                                                <span className="text-[10px] text-muted">{formatCurrency(s.precio, s.moneda)} x día</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Sección: Ajustes */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Ajustes Manuales
                            </h3>
                            <button
                                onClick={() => setShowAgregarAjuste(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 text-xs font-bold hover:bg-indigo-500/10 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Agregar Ajuste
                            </button>
                        </div>

                        {detalle.ajustes.length === 0 ? (
                            <div className="px-5 py-4 rounded-2xl border border-dashed border-card-border/50 text-center text-sm text-muted">
                                No se aplicaron descuentos ni recargos adicionales.
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-card-border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-card-bg/50 border-b border-card-border/50 text-[10px] uppercase tracking-widest text-muted">
                                        <tr>
                                            <th className="px-5 py-3 font-bold">Fecha</th>
                                            <th className="px-5 py-3 font-bold">Tipo</th>
                                            <th className="px-5 py-3 font-bold">Motivo</th>
                                            <th className="px-5 py-3 font-bold">Detalle</th>
                                            <th className="px-5 py-3 font-bold text-right">Importe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-card-border/50">
                                        {detalle.ajustes.map((aj) => (
                                            <tr key={aj.idInscripcionAjuste} className={!aj.activo ? 'opacity-50 line-through' : ''}>
                                                <td className="px-5 py-3">{formatDateTime(aj.fechaAlta)}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        aj.tipo === 'RECARGO' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                        {aj.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">{aj.tipoAjusteTexto}</td>
                                                <td className="px-5 py-3 text-muted">{aj.descripcion || '—'}</td>
                                                <td className="px-5 py-3 text-right font-medium">
                                                    {aj.tipo === 'RECARGO' ? '+' : '-'}{formatCurrency(aj.importe, aj.moneda)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Sección: Pagos */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Historial de Pagos
                            </h3>
                            <button
                                onClick={() => setShowRegistrarPago(true)}
                                disabled={detalle.saldo <= 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-500 text-xs font-bold hover:bg-emerald-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Registrar Pago
                            </button>
                        </div>

                        {detalle.pagos.length === 0 ? (
                            <div className="px-5 py-4 rounded-2xl border border-dashed border-card-border/50 text-center text-sm text-muted">
                                Aún no se han registrado pagos para esta inscripción.
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-card-border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-card-bg/50 border-b border-card-border/50 text-[10px] uppercase tracking-widest text-muted">
                                        <tr>
                                            <th className="px-5 py-3 font-bold">Fecha</th>
                                            <th className="px-5 py-3 font-bold">Medio</th>
                                            <th className="px-5 py-3 font-bold">Referencia</th>
                                            <th className="px-5 py-3 font-bold text-right">Importe</th>
                                            <th className="px-5 py-3 font-bold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-card-border/50">
                                        {detalle.pagos.map((pago) => (
                                            <tr key={pago.idInscripcionPago} className={pago.anulado ? 'opacity-50 bg-card-bg/50' : ''}>
                                                <td className={`px-5 py-3 ${pago.anulado ? 'line-through' : ''}`}>
                                                    {formatDateTime(pago.fechaPago)}
                                                </td>
                                                <td className={`px-5 py-3 ${pago.anulado ? 'line-through' : ''}`}>
                                                    {pago.medioPago}
                                                </td>
                                                <td className={`px-5 py-3 text-muted ${pago.anulado ? 'line-through' : ''}`}>
                                                    {pago.referencia || pago.observaciones || '—'}
                                                </td>
                                                <td className={`px-5 py-3 text-right font-medium text-emerald-400 ${pago.anulado ? 'line-through opacity-70' : ''}`}>
                                                    {formatCurrency(pago.importe, pago.moneda)}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {!pago.anulado ? (
                                                        <button
                                                            onClick={() => setShowAnularPago(pago.idInscripcionPago)}
                                                            className="p-1.5 rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                            title="Anular Pago"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Anulado</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Footer / Resumen Final Fijo ── */}
                <div className="flex-shrink-0 bg-background/50 border-t border-card-border p-6 mt-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Original</p>
                            <p className="text-lg font-bold text-foreground/80">{formatCurrency(detalle.totalOriginal, detalle.moneda)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Ajustes</p>
                            {detalle.totalRecargos - detalle.totalDescuentos === 0 ? (
                                <p className="text-lg font-bold text-foreground/80">—</p>
                            ) : (
                                <p className={`text-lg font-bold ${detalle.totalRecargos - detalle.totalDescuentos < 0 ? 'text-red-400' : 'text-amber-400'}`}>
                                    {detalle.totalRecargos - detalle.totalDescuentos < 0 ? '' : '+'}
                                    {formatCurrency(detalle.totalRecargos - detalle.totalDescuentos, detalle.moneda)}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">A Pagar</p>
                            <p className="text-lg font-bold text-foreground">{formatCurrency(detalle.totalAPagar, detalle.moneda)}</p>
                        </div>
                        <div className="space-y-1 p-3 -mt-3 -mb-3 rounded-xl bg-card-bg border border-card-border shadow-sm relative">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Saldo Pendiente</p>
                            <p className={`text-2xl font-black ${detalle.saldo > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {formatCurrency(detalle.saldo, detalle.moneda)}
                            </p>
                            {detalle.saldo <= 0 && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Modales Secundarios */}
                {showAgregarAjuste && (
                    <ModalAgregarAjuste
                        idInscripcion={detalle.idInscripcion}
                        onClose={() => setShowAgregarAjuste(false)}
                        onSuccess={() => {
                            setShowAgregarAjuste(false);
                            handleMutacionSuccess();
                        }}
                    />
                )}

                {showRegistrarPago && (
                    <ModalRegistrarPago
                        idInscripcion={detalle.idInscripcion}
                        saldoPendiente={detalle.saldo}
                        onClose={() => setShowRegistrarPago(false)}
                        onSuccess={() => {
                            setShowRegistrarPago(false);
                            handleMutacionSuccess();
                        }}
                    />
                )}

                {showAnularPago !== null && (
                    <ModalAnularPago
                        idPago={showAnularPago}
                        onClose={() => setShowAnularPago(null)}
                        onSuccess={() => {
                            setShowAnularPago(null);
                            handleMutacionSuccess();
                        }}
                    />
                )}

            </div>
        </div>
    );
}
