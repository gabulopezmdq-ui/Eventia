'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, AlertCircle, ChefHat, User, MessageSquare,
    ArrowRight, HeartPulse, ChevronRight, Apple, Baby, Phone, Mail
} from 'lucide-react';
import {
    confirmarRsvp, getMisRestricciones, getCatalogoRestricciones,
    guardarRestricciones, NinosPayload, GrupoRsvpInfo, CatalogoRestriccion
} from '@/src/features/rsvp/rsvp.service';

type Step = 'LOADING' | 'VERIFYING' | 'RSVP' | 'RESTRICTIONS' | 'SUCCESS' | 'ERROR';

export default function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();

    const [step, setStep] = useState<Step>('VERIFYING');
    const [errorMsg, setErrorMsg] = useState('');

    // --- RSVP Form State ---
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [asiste, setAsiste] = useState<boolean | null>(null);
    const [mensaje, setMensaje] = useState('');
    const [ninos, setNinos] = useState<NinosPayload[]>([]);

    // --- Restrictions State ---
    const [grupoInfo, setGrupoInfo] = useState<GrupoRsvpInfo | null>(null);
    const [catalogo, setCatalogo] = useState<CatalogoRestriccion[]>([]);

    // This will hold the selections: idIntegrante -> { idRestriccion -> { observaciones, severidad } }
    const [restriccionesOpts, setRestriccionesOpts] = useState<Record<number, Record<number, any>>>({});

    useEffect(() => {
        verificarEstado();
    }, [token]);

    const verificarEstado = async () => {
        setStep('VERIFYING');
        try {
            const data = await getMisRestricciones(token);
            // If this succeeds, it means they already RSVP'd and have a group!
            setGrupoInfo(data);
            await cargarCatalogo();
            setStep('RESTRICTIONS');
        } catch (error) {
            // El grupo no existe (404 o string de error), lo cual es normal si no confirmaron.
            // Move to RSVP step.
            setStep('RSVP');
        }
    };

    const cargarCatalogo = async () => {
        try {
            const data = await getCatalogoRestricciones();
            setCatalogo(data.sort((a, b) => a.orden - b.orden));
        } catch (e) {
            console.warn("No se pudo cargar el catálogo de restricciones", e);
        }
    };

    const addNino = () => {
        setNinos([...ninos, { nombre: '', apellido: '' }]);
    };

    const updateNino = (index: number, field: 'nombre' | 'apellido', value: string) => {
        const newNinos = [...ninos];
        newNinos[index][field] = value;
        setNinos(newNinos);
    };

    const removeNino = (index: number) => {
        setNinos(ninos.filter((_, i) => i !== index));
    };

    const handleRsvpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (asiste === null) {
            alert('Por favor, indicanos si vas a asistir.');
            return;
        }

        setStep('LOADING');
        try {
            await confirmarRsvp(token, {
                nombre, apellido, email, celular, asiste, mensaje: mensaje || undefined,
                ninos: ninos.length > 0 ? ninos : undefined
            });

            if (!asiste) {
                // If they are not coming, we don't need their diet restrictions
                setStep('SUCCESS');
                return;
            }

            // If success, get the group and catalog
            const data = await getMisRestricciones(token);
            setGrupoInfo(data);
            await cargarCatalogo();
            setStep('RESTRICTIONS');

        } catch (err: any) {
            setErrorMsg(err.message || 'Error al confirmar asistencia');
            setStep('ERROR');
        }
    };

    const toggleRestriccion = (idIntegrante: number, idRestriccion: number) => {
        setRestriccionesOpts(prev => {
            const userOts = prev[idIntegrante] ? { ...prev[idIntegrante] } : {};
            if (userOts[idRestriccion]) {
                delete userOts[idRestriccion];
            } else {
                userOts[idRestriccion] = { idRestriccion, severidad: 'M', observaciones: '' };
            }
            return { ...prev, [idIntegrante]: userOts };
        });
    };

    const updateRestriccionMeta = (idIntegrante: number, idRestriccion: number, field: string, value: string) => {
        setRestriccionesOpts(prev => {
            const userOts = prev[idIntegrante] ? { ...prev[idIntegrante] } : {};
            if (userOts[idRestriccion]) {
                userOts[idRestriccion] = { ...userOts[idRestriccion], [field]: value };
            }
            return { ...prev, [idIntegrante]: userOts };
        });
    };

    const handleRestriccionesSubmit = async () => {
        if (!grupoInfo) return;
        setStep('LOADING');

        try {
            // Build the payload mapping our frontend state to the expected API state
            const integrantesPayload = grupoInfo.integrantes.map(integ => {
                const userOpts = restriccionesOpts[integ.idRsvpGrupoIntegrante] || {};
                const resArray = Object.values(userOpts).map(opts => ({
                    idRestriccion: opts.idRestriccion,
                    severidad: opts.severidad,
                    observaciones: opts.observaciones || null
                }));

                return {
                    idRsvpGrupoIntegrante: integ.idRsvpGrupoIntegrante,
                    restricciones: resArray
                };
            });

            await guardarRestricciones(token, { integrantes: integrantesPayload });
            setStep('SUCCESS');
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al guardar las restricciones');
            setStep('ERROR');
        }
    };

    // --- Renders ---
    if (step === 'VERIFYING' || step === 'LOADING') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-muted tracking-widest uppercase text-xs font-bold">
                    {step === 'VERIFYING' ? 'Validando tu invitación...' : 'Procesando...'}
                </p>
            </div>
        );
    }

    if (step === 'ERROR') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Algo salió mal</h1>
                <p className="text-muted mb-8 max-w-md">{errorMsg}</p>
                <button onClick={() => setStep('VERIFYING')} className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors">
                    Reintentar
                </button>
            </div>
        );
    }

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mb-8 relative z-10 shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-12 h-12 text-black" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 relative z-10">¡Todo Listo!</h1>
                <p className="text-muted text-lg max-w-lg mx-auto relative z-10">
                    Gracias por tu confirmación. Ya registramos tus respuestas y preferencias correctamente.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 relative">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-500/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 relative z-10">
                {/* Header Context */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-muted/80 bg-white/5 backdrop-blur-md mb-6 inline-block">
                        Confirma tu Asistencia
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        {step === 'RSVP' ? "¡Estás invitado!" : "¡Hola de nuevo!"}
                    </h1>
                </div>

                {/* --- PASO 1: Formulario RSVP --- */}
                {step === 'RSVP' && (
                    <form onSubmit={handleRsvpSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Asistencia Toggle */}
                        <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex">
                            <button type="button" onClick={() => setAsiste(true)}
                                className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all ${asiste === true ? 'bg-white text-black shadow-lg' : 'text-muted hover:text-white'}`}>
                                ¡Sí, voy a ir!
                            </button>
                            <button type="button" onClick={() => setAsiste(false)}
                                className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all ${asiste === false ? 'bg-red-500 text-white shadow-lg' : 'text-muted hover:text-white'}`}>
                                No podré asistir
                            </button>
                        </div>

                        {asiste !== null && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* Datos Principales */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2"><User className="w-3 h-3 inline mr-1" /> Nombre</label>
                                            <input required value={nombre} onChange={e => setNombre(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2"><User className="w-3 h-3 inline mr-1" /> Apellido</label>
                                            <input required value={apellido} onChange={e => setApellido(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2"><Mail className="w-3 h-3 inline mr-1" /> Email</label>
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2"><Phone className="w-3 h-3 inline mr-1" /> Celular</label>
                                        <input type="tel" required value={celular} onChange={e => setCelular(e.target.value)}
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white outline-none" />
                                    </div>
                                </div>

                                {/* Niños / Acompañantes */}
                                {asiste === true && (
                                    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2"><Baby className="w-4 h-4 text-indigo-400" /> Acompañantes Menores</h3>
                                                <p className="text-xs text-muted mt-1">Si venís con niños, agregalos aquí</p>
                                            </div>
                                            <button type="button" onClick={addNino} className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all">
                                                + Agregar Niño
                                            </button>
                                        </div>
                                        {ninos.length > 0 && (
                                            <div className="space-y-3 mt-4">
                                                {ninos.map((nino, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <input placeholder="Nombre" required value={nino.nombre} onChange={e => updateNino(i, 'nombre', e.target.value)}
                                                            className="flex-1 p-3 rounded-xl bg-black/50 border border-white/10 focus:border-indigo-500 text-sm outline-none" />
                                                        <input placeholder="Apellido" required value={nino.apellido} onChange={e => updateNino(i, 'apellido', e.target.value)}
                                                            className="flex-1 p-3 rounded-xl bg-black/50 border border-white/10 focus:border-indigo-500 text-sm outline-none" />
                                                        <button type="button" onClick={() => removeNino(i)} className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mensaje Adicional */}
                                <div>
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2"><MessageSquare className="w-3 h-3 inline mr-1" /> Mensaje al Organizador</label>
                                    <textarea rows={3} value={mensaje} onChange={e => setMensaje(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white outline-none resize-none" />
                                </div>

                                <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                    Confirmar {asiste ? 'Asistencia' : 'Inasistencia'} <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </form>
                )}

                {/* --- PASO 2: Restricciones de Dieta --- */}
                {step === 'RESTRICTIONS' && grupoInfo && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center mb-8">
                            <ChefHat className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Restricciones Alimentarias</h2>
                            <p className="text-muted text-sm">Contanos si alguien de tu grupo necesita un menú especial para organizar el catering.</p>
                        </div>

                        <div className="space-y-6">
                            {grupoInfo.integrantes.map((integrante, idx) => (
                                <div key={integrante.idRsvpGrupoIntegrante} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
                                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <h3 className="font-bold text-lg">
                                            {idx === 0 ? "A tu nombre (Titular)" : `Acompañante ${idx}`}
                                        </h3>
                                        {/* TODO: Idealmente el backend nos devolvería el nombre del integrante acá */}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {catalogo.map(cat => {
                                            const isSelected = !!restriccionesOpts[integrante.idRsvpGrupoIntegrante]?.[cat.idRestriccion];
                                            return (
                                                <button
                                                    key={cat.idRestriccion}
                                                    onClick={() => toggleRestriccion(integrante.idRsvpGrupoIntegrante, cat.idRestriccion)}
                                                    className={`p-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-2 text-center
                                                        ${isSelected
                                                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]'
                                                            : 'bg-black/50 border-white/5 text-muted hover:border-white/20 hover:text-white'}`}
                                                >
                                                    <Apple className={`w-6 h-6 ${isSelected ? 'text-indigo-400' : 'text-muted'}`} />
                                                    {cat.nombre}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Additional info for selected severe restrictions */}
                                    {Object.values(restriccionesOpts[integrante.idRsvpGrupoIntegrante] || {}).map((opt: any) => {
                                        const cat = catalogo.find(c => c.idRestriccion === opt.idRestriccion);
                                        if (cat?.categoria === 'ALERGIA' || cat?.codigo === 'CELIACO') {
                                            return (
                                                <div key={opt.idRestriccion} className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4 animate-in fade-in">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-orange-400">
                                                        <HeartPulse className="w-4 h-4" /> Detalle para: {cat.nombre}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">Severidad</label>
                                                            <select
                                                                value={opt.severidad}
                                                                onChange={(e) => updateRestriccionMeta(integrante.idRsvpGrupoIntegrante, opt.idRestriccion, 'severidad', e.target.value)}
                                                                className="w-full p-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-orange-500 text-sm"
                                                            >
                                                                <option value="L">Leve</option>
                                                                <option value="M">Media</option>
                                                                <option value="G">Grave (Alta contaminación cruzada)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">Observaciones</label>
                                                            <input
                                                                placeholder="Ej. Nada de nueces"
                                                                value={opt.observaciones}
                                                                onChange={(e) => updateRestriccionMeta(integrante.idRsvpGrupoIntegrante, opt.idRestriccion, 'observaciones', e.target.value)}
                                                                className="w-full p-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-orange-500 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ))}
                        </div>

                        <button onClick={handleRestriccionesSubmit} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                            Guardar Preferencias y Terminar <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => setStep('SUCCESS')} className="w-full py-3 text-sm font-bold text-muted hover:text-white transition-colors">
                            Saltar este paso de momento
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
