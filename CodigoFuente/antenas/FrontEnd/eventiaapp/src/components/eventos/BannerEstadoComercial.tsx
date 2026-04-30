'use client';

import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    CreditCard,
    Loader2,
    Sparkles,
    Timer,
} from 'lucide-react';

interface EstadoComercial {
    id_evento: number;
    estado: string;           // 'P' = Pendiente, 'A' = Activo, 'V' = Vencido
    plan_codigo: string;
    plan_nombre: string;
    pago_pendiente: boolean;
    trial_dias_restantes: number | null;
    trial_vencido: boolean;
    monto_pendiente?: number;
    moneda?: string;
    fecha_vencimiento?: string;
}

interface BannerEstadoComercialProps {
    idEvento: number | string | null;
    className?: string;
}

export default function BannerEstadoComercial({ idEvento, className = '' }: BannerEstadoComercialProps) {
    const [data, setData] = useState<EstadoComercial | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!idEvento) return;

        const fetchEstado = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/eventos-comercial?idEvento=${idEvento}`);
                if (!res.ok) {
                    // Si es 404 o similar, puede ser que el evento no tenga registro comercial aún (trial auto)
                    if (res.status === 404) {
                        setData(null);
                        return;
                    }
                    throw new Error('Error al cargar estado comercial');
                }
                const json = await res.json();
                setData({
                    id_evento: json.id_evento || json.idEvento,
                    estado: json.estado,
                    plan_codigo: json.plan_codigo || json.planCodigo || 'FREE',
                    plan_nombre: json.plan_nombre || json.planNombre || 'Gratuito',
                    pago_pendiente: json.pago_pendiente ?? json.pagoPendiente ?? false,
                    trial_dias_restantes: json.trial_dias_restantes ?? json.trialDiasRestantes ?? null,
                    trial_vencido: json.trial_vencido ?? json.trialVencido ?? false,
                    monto_pendiente: json.monto_pendiente ?? json.montoPendiente,
                    moneda: json.moneda ?? 'ARS',
                    fecha_vencimiento: json.fecha_vencimiento ?? json.fechaVencimiento,
                });
            } catch (err) {
                setError('No se pudo verificar el estado comercial del evento');
            } finally {
                setLoading(false);
            }
        };

        fetchEstado();
    }, [idEvento]);

    if (!idEvento || loading) {
        if (loading) {
            return (
                <div className={`flex items-center gap-2 p-3 rounded-xl bg-card-bg border border-card-border ${className}`}>
                    <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    <span className="text-xs text-muted">Verificando estado comercial...</span>
                </div>
            );
        }
        return null;
    }

    if (error) {
        return (
            <div className={`flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 ${className}`}>
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-300">{error}</span>
            </div>
        );
    }

    if (!data) return null;

    // ─── Trial Vencido → Alerta urgente ───
    if (data.trial_vencido) {
        return (
            <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/30 ${className}`}>
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-300 mb-0.5">
                            Tu período de prueba terminó
                        </p>
                        <p className="text-xs text-red-400/70 leading-relaxed">
                            El evento permanece en modo lectura. Actualizá tu plan para seguir gestionando invitados y accesos.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/dashboard/cuenta/plan'}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-300 hover:bg-red-500/30 transition-colors flex-shrink-0"
                    >
                        Actualizar Plan
                    </button>
                </div>
            </div>
        );
    }

    // ─── Pago Pendiente ───
    if (data.pago_pendiente) {
        return (
            <div className={`p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 ${className}`}>
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-300 mb-0.5">
                            Tu evento está pendiente de pago
                        </p>
                        <p className="text-xs text-amber-400/70 leading-relaxed">
                            Plan: <span className="font-semibold">{data.plan_nombre}</span>
                            {data.monto_pendiente != null && (
                                <> · Monto: <span className="font-semibold">${data.monto_pendiente} {data.moneda}</span></>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/dashboard/cuenta/plan'}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors flex-shrink-0"
                    >
                        Ver Detalle
                    </button>
                </div>
            </div>
        );
    }

    // ─── Trial en curso ───
    if (data.trial_dias_restantes != null && data.trial_dias_restantes > 0) {
        const isUrgent = data.trial_dias_restantes <= 3;
        return (
            <div className={`p-4 rounded-xl ${isUrgent ? 'bg-orange-500/10 border-orange-500/25' : 'bg-sky-500/10 border-sky-500/25'} border ${className}`}>
                <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${isUrgent ? 'bg-orange-500/20' : 'bg-sky-500/20'} flex items-center justify-center flex-shrink-0`}>
                        <Timer className={`w-4.5 h-4.5 ${isUrgent ? 'text-orange-400' : 'text-sky-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isUrgent ? 'text-orange-300' : 'text-sky-300'} mb-0.5`}>
                            {isUrgent
                                ? `¡Quedan solo ${data.trial_dias_restantes} día${data.trial_dias_restantes !== 1 ? 's' : ''} de prueba!`
                                : `Te quedan ${data.trial_dias_restantes} días de prueba`
                            }
                        </p>
                        <p className={`text-xs ${isUrgent ? 'text-orange-400/70' : 'text-sky-400/70'} leading-relaxed`}>
                            Plan: <span className="font-semibold">{data.plan_nombre}</span> · Aprovechá todos los módulos mientras dure la prueba gratuita.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Estado Activo → Badge discreto ───
    if (data.estado === 'A') {
        return (
            <div className={`flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 ${className}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-300">
                    <span className="font-semibold">{data.plan_nombre}</span> · Activo
                </span>
                <Sparkles className="w-3 h-3 text-emerald-500/50 ml-auto" />
            </div>
        );
    }

    // ─── Estado Pendiente ───
    if (data.estado === 'P') {
        return (
            <div className={`flex items-center gap-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 ${className}`}>
                <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-xs text-indigo-300">
                    Plan <span className="font-semibold">{data.plan_nombre}</span> · Pendiente de activación
                </span>
            </div>
        );
    }

    return null;
}
