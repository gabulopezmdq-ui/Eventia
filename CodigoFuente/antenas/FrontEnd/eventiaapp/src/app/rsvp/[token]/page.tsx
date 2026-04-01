'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, AlertCircle, ChefHat, User, MessageSquare,
    ArrowRight, HeartPulse, ChevronRight, Apple, Baby, Phone, Mail,
    MapPin, Calendar, Users, PlusCircle, Trash2
} from 'lucide-react';
import {
    confirmarRsvp, getInvitacionPersonal, getMisRestricciones,
    getCatalogoRestricciones, getDatosInvitacion, guardarRestricciones,
    InvitacionPersonalResponse, PersonaInvitacion, PersonaConfirmarPayload,
    GrupoRsvpInfo, CatalogoRestriccion
} from '@/src/features/rsvp/rsvp.service';

type Step = 'LOADING' | 'VERIFYING' | 'RSVP' | 'RESTRICTIONS' | 'SUCCESS' | 'ERROR';

// Local state for each person in the confirmation form
interface PersonaFormState {
    idInvitado?: number;
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
    rolEvento: 'A' | 'N';
    asiste: boolean;
    mensaje: string;
    isNew: boolean; // true = persona agregada por el invitado
}

export default function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();

    const [step, setStep] = useState<Step>('VERIFYING');
    const [errorMsg, setErrorMsg] = useState('');

    // --- Invitation data ---
    const [invitacion, setInvitacion] = useState<InvitacionPersonalResponse | null>(null);

    // --- RSVP Form State ---
    const [personas, setPersonas] = useState<PersonaFormState[]>([]);
    const [mensajeGrupo, setMensajeGrupo] = useState('');
    const [globalAsiste, setGlobalAsiste] = useState<boolean | null>(null);

    // --- Restrictions State ---
    const [grupoInfo, setGrupoInfo] = useState<GrupoRsvpInfo | null>(null);
    const [catalogo, setCatalogo] = useState<CatalogoRestriccion[]>([]);
    const [restriccionesOpts, setRestriccionesOpts] = useState<Record<number, Record<number, any>>>({});

    useEffect(() => {
        verificarEstado();
    }, [token]);

    const verificarEstado = async () => {
        setStep('VERIFYING');
        try {
            // Try the unified endpoint first
            let inviteData: InvitacionPersonalResponse | null = null;
            try {
                inviteData = await getInvitacionPersonal(token);
                console.log('=== INFO DEL TOKEN ===', inviteData);
                setInvitacion(inviteData);
            } catch {
                // Fallback: try legacy endpoint for basic data
                try {
                    const legacyData = await getDatosInvitacion(token);
                    // Build a minimal invitacion object from legacy data
                    setInvitacion({
                        idGrupo: 0,
                        nombreGrupo: `${legacyData.nombre || ''} ${legacyData.apellido || ''}`.trim(),
                        saludo: '',
                        anfitriones: legacyData.anfitriones || '',
                        mensajeBienvenida: legacyData.mensajeBienvenida || '',
                        agenda: [],
                        personas: [],
                        cuposAdultosRestantes: 0,
                        cuposMenoresRestantes: 0,
                    });
                    inviteData = null; // mark as no full data
                } catch {
                    // Both failed
                }
            }

            // Pre-fill the personas array from the invitation
            if (inviteData && inviteData.personas && inviteData.personas.length > 0) {
                setPersonas(inviteData.personas.map((p: PersonaInvitacion) => {
                    const [nombre, ...apellidoParts] = p.nombreCompleto.split(' ');
                    return {
                        idInvitado: p.idInvitado,
                        nombre: nombre || '',
                        apellido: apellidoParts.join(' ') || '',
                        email: '',
                        celular: '',
                        rolEvento: p.rolEvento,
                        asiste: true,
                        mensaje: '',
                        isNew: false,
                    };
                }));
            }

            // Then check if they already confirmed (have restrictions group)
            try {
                const data = await getMisRestricciones(token);
                setGrupoInfo(data);
                await cargarCatalogo();
                setStep('RESTRICTIONS');
                return;
            } catch {
                // Normal: they haven't confirmed yet
            }

            setStep('RSVP');
        } catch (error) {
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

    // --- Persona management ---
    const updatePersona = (index: number, field: keyof PersonaFormState, value: any) => {
        setPersonas(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addPersonaAdulto = () => {
        if (!invitacion || invitacion.cuposAdultosRestantes <= 0) return;
        const currentNewAdults = personas.filter(p => p.isNew && p.rolEvento === 'A').length;
        if (currentNewAdults >= invitacion.cuposAdultosRestantes) return;

        setPersonas(prev => [...prev, {
            nombre: '', apellido: '', email: '', celular: '',
            rolEvento: 'A', asiste: true, mensaje: '', isNew: true,
        }]);
    };

    const addPersonaMenor = () => {
        if (!invitacion || invitacion.cuposMenoresRestantes <= 0) return;
        const currentNewMinors = personas.filter(p => p.isNew && p.rolEvento === 'N').length;
        if (currentNewMinors >= invitacion.cuposMenoresRestantes) return;

        setPersonas(prev => [...prev, {
            nombre: '', apellido: '', email: '', celular: '',
            rolEvento: 'N', asiste: true, mensaje: '', isNew: true,
        }]);
    };

    const removePersona = (index: number) => {
        setPersonas(prev => prev.filter((_, i) => i !== index));
    };

    const canAddAdulto = invitacion
        ? personas.filter(p => p.isNew && p.rolEvento === 'A').length < invitacion.cuposAdultosRestantes
        : false;

    const canAddMenor = invitacion
        ? personas.filter(p => p.isNew && p.rolEvento === 'N').length < invitacion.cuposMenoresRestantes
        : false;

    // --- Submit RSVP ---
    const handleRsvpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (globalAsiste === null) {
            alert('Por favor, indicanos si vas a asistir.');
            return;
        }

        setStep('LOADING');
        try {
            // Build the personas payload
            const personasPayload: PersonaConfirmarPayload[] = personas.map(p => ({
                idInvitado: p.idInvitado || 0,
                nombre: p.nombre,
                apellido: p.apellido,
                email: p.email || undefined,
                celular: p.celular || undefined,
                rolEvento: p.rolEvento,
                asiste: globalAsiste === false ? false : p.asiste,
                mensaje: p.mensaje || undefined,
            }));

            const payloadAEnviar = {
                mensajeGrupo: mensajeGrupo || undefined,
                personas: personasPayload,
            };

            console.log('=== INFO DEL RSVP A ENVIAR ===', payloadAEnviar);

            await confirmarRsvp(token, payloadAEnviar);

            if (!globalAsiste) {
                setStep('SUCCESS');
                return;
            }

            // If confirmed, get restrictions
            try {
                const data = await getMisRestricciones(token);
                setGrupoInfo(data);
                await cargarCatalogo();
                setStep('RESTRICTIONS');
            } catch {
                // If restrictions endpoint fails, just go to success
                setStep('SUCCESS');
            }

        } catch (err: any) {
            setErrorMsg(err.message || 'Error al confirmar asistencia');
            setStep('ERROR');
        }
    };

    // --- Restrictions ---
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
                <button onClick={() => verificarEstado()} className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors">
                    Reintentar
                </button>
            </div>
        );
    }

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
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
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-muted/80 bg-white/5 backdrop-blur-md mb-6 inline-block">
                        Confirma tu Asistencia
                    </span>

                    {invitacion?.saludo && (
                        <p className="text-indigo-300 text-sm font-medium mb-3">{invitacion.saludo}</p>
                    )}
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        {step === 'RSVP' ? "¡Estás invitado!" : "¡Hola de nuevo!"}
                    </h1>
                    {invitacion?.anfitriones && (
                        <p className="text-muted mt-3 text-sm">
                            De parte de <span className="text-white font-semibold">{invitacion.anfitriones}</span>
                        </p>
                    )}
                    {invitacion?.mensajeBienvenida && (
                        <p className="text-muted/70 mt-2 text-sm italic">"{invitacion.mensajeBienvenida}"</p>
                    )}
                </div>

                {/* --- Agenda del Evento --- */}
                {step === 'RSVP' && invitacion?.agenda && invitacion.agenda.length > 0 && (
                    <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <h2 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-400" /> Agenda del Evento
                        </h2>
                        {invitacion.agenda.map((acceso, aIdx) => (
                            <div key={aIdx} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                <div className="px-5 py-3 border-b border-white/5 bg-white/[0.03]">
                                    <h3 className="font-bold text-sm text-white">{acceso.nombreAcceso}</h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {acceso.tramos.map((tramo, tIdx) => (
                                        <div key={tIdx} className="px-5 py-4 flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                                                {tramo.orden}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-white">{tramo.nombre}</p>
                                                {tramo.descripcion && (
                                                    <p className="text-xs text-muted mt-0.5">{tramo.descripcion}</p>
                                                )}
                                                {tramo.lugar && (
                                                    <p className="text-xs text-muted/60 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {tramo.lugar}{tramo.direccion ? ` — ${tramo.direccion}` : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- PASO 1: Formulario RSVP --- */}
                {step === 'RSVP' && (
                    <form onSubmit={handleRsvpSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Asistencia Toggle */}
                        <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex">
                            <button type="button" onClick={() => setGlobalAsiste(true)}
                                className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all ${globalAsiste === true ? 'bg-white text-black shadow-lg' : 'text-muted hover:text-white'}`}>
                                ¡Sí, voy a ir!
                            </button>
                            <button type="button" onClick={() => setGlobalAsiste(false)}
                                className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all ${globalAsiste === false ? 'bg-red-500 text-white shadow-lg' : 'text-muted hover:text-white'}`}>
                                No podré asistir
                            </button>
                        </div>

                        {globalAsiste !== null && (
                            <div className="space-y-6 animate-in fade-in duration-500">

                                {/* --- Personas del Grupo --- */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-400" />
                                        {invitacion?.nombreGrupo ? `Grupo: ${invitacion.nombreGrupo}` : 'Datos de los Invitados'}
                                    </h2>

                                    {personas.map((persona, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${persona.rolEvento === 'A'
                                                        ? 'bg-indigo-500/20 text-indigo-400'
                                                        : 'bg-pink-500/20 text-pink-400'
                                                        }`}>
                                                        {persona.rolEvento === 'A' ? <User className="w-3.5 h-3.5" /> : <Baby className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-muted uppercase tracking-widest">
                                                        {idx === 0 ? 'Titular' : persona.rolEvento === 'A' ? 'Adulto' : 'Menor'}
                                                        {persona.isNew && ' (nuevo)'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Individual asiste toggle (only when global is "yes") */}
                                                    {globalAsiste === true && idx > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePersona(idx, 'asiste', !persona.asiste)}
                                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${persona.asiste
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                                }`}
                                                        >
                                                            {persona.asiste ? 'Asiste' : 'No asiste'}
                                                        </button>
                                                    )}
                                                    {persona.isNew && (
                                                        <button type="button" onClick={() => removePersona(idx)}
                                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Nombre</label>
                                                    <input required value={persona.nombre} onChange={e => updatePersona(idx, 'nombre', e.target.value)}
                                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Apellido</label>
                                                    <input required value={persona.apellido} onChange={e => updatePersona(idx, 'apellido', e.target.value)}
                                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none" />
                                                </div>
                                            </div>

                                            {/* Email & Celular only for adults */}
                                            {persona.rolEvento === 'A' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                            <Mail className="w-3 h-3 inline mr-1" /> Email
                                                        </label>
                                                        <input type="email" value={persona.email} onChange={e => updatePersona(idx, 'email', e.target.value)}
                                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                            <Phone className="w-3 h-3 inline mr-1" /> Celular
                                                        </label>
                                                        <input type="tel" value={persona.celular} onChange={e => updatePersona(idx, 'celular', e.target.value)}
                                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Buttons to add people if there are cupos */}
                                    {globalAsiste === true && (canAddAdulto || canAddMenor) && (
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {canAddAdulto && (
                                                <button type="button" onClick={addPersonaAdulto}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                                                    <PlusCircle className="w-4 h-4" /> Agregar Adulto
                                                    <span className="text-muted/50">({invitacion!.cuposAdultosRestantes - personas.filter(p => p.isNew && p.rolEvento === 'A').length} disponible{invitacion!.cuposAdultosRestantes - personas.filter(p => p.isNew && p.rolEvento === 'A').length !== 1 ? 's' : ''})</span>
                                                </button>
                                            )}
                                            {canAddMenor && (
                                                <button type="button" onClick={addPersonaMenor}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 text-pink-400 text-xs font-bold hover:bg-pink-500/20 transition-all border border-pink-500/20">
                                                    <PlusCircle className="w-4 h-4" /> Agregar Menor
                                                    <span className="text-muted/50">({invitacion!.cuposMenoresRestantes - personas.filter(p => p.isNew && p.rolEvento === 'N').length} disponible{invitacion!.cuposMenoresRestantes - personas.filter(p => p.isNew && p.rolEvento === 'N').length !== 1 ? 's' : ''})</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Mensaje al Organizador */}
                                <div>
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">
                                        <MessageSquare className="w-3 h-3 inline mr-1" /> Mensaje al Organizador
                                    </label>
                                    <textarea rows={3} value={mensajeGrupo} onChange={e => setMensajeGrupo(e.target.value)}
                                        placeholder="Un mensaje para los anfitriones..."
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white outline-none resize-none" />
                                </div>

                                <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                    Confirmar {globalAsiste ? 'Asistencia' : 'Inasistencia'} <ArrowRight className="w-5 h-5" />
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

                                    {/* Detail for severe restrictions */}
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
