'use client';

import { useState } from 'react';
import { Calendar, Users, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import type { LandingData, RegistroAudienciaResponse } from '@/src/features/captacion/types';
import RegistroAudienciaForm from './RegistroAudienciaForm';

interface Props {
    data: LandingData;
    token: string;
}

export default function PublicLanding({ data, token }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [registroSuccess, setRegistroSuccess] = useState<RegistroAudienciaResponse | null>(null);

    const bgImageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

    if (registroSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorators */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-background z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] z-0" />

                <div className="relative z-10 w-full max-w-lg bg-card-bg/80 backdrop-blur-xl border border-card-border p-8 md:p-12 rounded-[2rem] text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h2 className="text-3xl font-black text-white">¡Registro Exitoso!</h2>

                    <p className="text-white/70 text-lg">
                        {registroSuccess.mensaje_post_registro || data.mensaje_post_registro || 'Tu lugar en el evento ha sido confirmado.'}
                    </p>

                    {registroSuccess.beneficio_otorgado && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 delay-300">
                            <div className="inline-flex p-3 rounded-full bg-purple-500/20 text-purple-400 mb-4">
                                <Gift className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¡Tenés un beneficio especial!</h3>
                            <p className="text-white/60 text-sm mb-6">
                                Presentá el siguiente QR en puerta o barra para canjearlo.
                            </p>

                            {/* Dummy QR Display */}
                            <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center">
                                {/* Acá iría un componente QRCode real con registroSuccess.qr_token */}
                                <div className="text-black text-center text-xs font-mono">
                                    <span className="block mb-2 font-bold text-lg">QR</span>
                                    {registroSuccess.qr_token?.slice(0, 16)}...
                                </div>
                            </div>
                            {registroSuccess.codigo_canje && (
                                <p className="mt-4 font-mono font-bold text-purple-300 tracking-widest bg-purple-500/10 py-2 rounded-lg">
                                    {registroSuccess.codigo_canje}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* ── Lado Izquierdo: Visual ── */}
            <div className="w-full md:w-1/2 relative min-h-[40vh] md:min-h-screen flex flex-col justify-between p-8 md:p-16">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${bgImageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent z-10" />

                <div className="relative z-20 space-y-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-bold uppercase tracking-widest border border-white/10">
                        <Calendar className="w-3.5 h-3.5" />
                        Acceso Especial
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        {data.anfitriones_texto}
                    </h1>
                </div>

                <div className="relative z-20 pt-10">
                    <div className="flex items-center gap-4 text-white/60 text-sm font-medium">
                        <span>Invitación Oficial</span>
                        <div className="w-12 h-[1px] bg-white/20" />
                        <span>Eventia</span>
                    </div>
                </div>
            </div>

            {/* ── Lado Derecho: Contenido/Formulario ── */}
            <div className="w-full md:w-1/2 bg-[#0A0A0B] p-8 md:p-16 flex items-center justify-center relative">
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
                    {!showForm ? (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white">{data.titulo}</h2>
                                {data.leyenda_publica && (
                                    <p className="text-white/60 leading-relaxed text-lg">
                                        {data.leyenda_publica}
                                    </p>
                                )}
                            </div>

                            {data.mensaje_bienvenida && (
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white/80 italic text-sm">
                                    "{data.mensaje_bienvenida}"
                                </div>
                            )}

                            <div className="space-y-4">
                                {data.beneficio_titulo && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/30">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                                            <Gift className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-purple-100 text-sm">¡Beneficio Incluido!</h4>
                                            <p className="text-purple-300/70 text-xs mt-0.5">{data.beneficio_titulo}</p>
                                        </div>
                                    </div>
                                )}

                                {data.mostrar_disponibles && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center flex-shrink-0">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Cupos Limitados</h4>
                                            <p className="text-white/50 text-xs mt-0.5">Asegurá tu lugar antes de que se agoten.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8">
                                {data.expirado ? (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center font-bold">
                                        Este enlace ha expirado o agotó sus cupos.
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-bold text-lg group"
                                    >
                                        Registrarme Ahora
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-sm font-bold text-white/50 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                            >
                                ← Volver
                            </button>
                            <RegistroAudienciaForm
                                token={token}
                                idEvento={data.id_evento}
                                onSuccess={(res) => setRegistroSuccess(res)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
