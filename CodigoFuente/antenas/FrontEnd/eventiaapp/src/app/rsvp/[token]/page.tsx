'use client';

import { useEffect, useState, use } from 'react';
import {
    CheckCircle2, AlertCircle, ChefHat, User, MessageSquare,
    ArrowRight, HeartPulse, Baby, Phone, Mail,
    MapPin, Calendar, Users, PlusCircle, Trash2, Download, QrCode
} from 'lucide-react';
import {
    confirmarRsvp, getInvitacionPersonal,
    getCatalogoRestricciones, getCatalogoParametrico, getDatosInvitacion,
    InvitacionPersonalResponse, PersonaInvitacion, PersonaConfirmarPayload,
    CatalogoRestriccion, getResumenRsvp, ResumenRsvpResponse
} from '@/src/features/rsvp/rsvp.service';

type Step = 'LOADING' | 'VERIFYING' | 'RSVP' | 'SUCCESS' | 'ERROR';

// Restricción seleccionada localmente (por persona)
interface RestriccionLocal {
    idRestriccion: number;
    severidad: 'L' | 'M' | 'G';
    observaciones: string;
}

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
    alimentacionDetalle: string;   // Texto libre: alergias, aclaraciones no categorizadas
    restriccionesSeleccionadas: Record<number, RestriccionLocal>; // key = idRestriccion
}

export default function RsvpPage({
    params,
    searchParams,
}: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ idAcceso?: string }>;
}) {
    const { token } = use(params);
    const { idAcceso } = use(searchParams);
    const idAccesoNum = idAcceso ? parseInt(idAcceso, 10) : null;

    const [step, setStep] = useState<Step>('VERIFYING');
    const [errorMsg, setErrorMsg] = useState('');

    // --- Invitation data ---
    const [invitacion, setInvitacion] = useState<InvitacionPersonalResponse | null>(null);

    // --- RSVP Form State ---
    const [personas, setPersonas] = useState<PersonaFormState[]>([]);
    const [mensajeGrupo, setMensajeGrupo] = useState('');
    const [globalAsiste, setGlobalAsiste] = useState<boolean | null>(null);

    // --- Restrictions catalogue (loaded at start, keyed by idRestriccion) ---
    const [catalogo, setCatalogo] = useState<CatalogoRestriccion[]>([]);

    // --- Resumen RSVP (QRs y datos post-confirmación) ---
    const [resumenRsvp, setResumenRsvp] = useState<ResumenRsvpResponse | null>(null);

    useEffect(() => {
        verificarEstado();
    }, [token]);

    const verificarEstado = async () => {
        setStep('VERIFYING');
        try {
            // 1. Intentar cargar el resumen primero por si ya está confirmado
            try {
                const resumen = await getResumenRsvp(token);
                if (resumen && resumen.rsvpEstadoGrupo === 'CONFIRMADO') {
                    setResumenRsvp(resumen);
                    setStep('SUCCESS');
                    return;
                }
            } catch (errResumen) {
                console.log('El grupo aún no tiene confirmación registrada o falló la consulta:', errResumen);
            }

            // 2. Si no está confirmado, continuar con el flujo normal de carga
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
                        idEvento: 0,
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
                        alimentacionDetalle: '',
                        restriccionesSeleccionadas: {},
                    };
                }));
            }

            // Load catalogue early so it's ready when user fills the RSVP form
            await cargarCatalogo(inviteData?.idEvento);

            setStep('RSVP');
        } catch {
            setStep('RSVP');
        }
    };

    const cargarCatalogo = async (idEvento?: number) => {
        console.log('=== [CATALOGO] cargarCatalogo() llamado con idEvento:', idEvento);
        try {
            let data: CatalogoRestriccion[];
            if (idEvento && idEvento > 0) {
                // Preferred: event-specific catalogue (respects event language)
                console.log('[CATALOGO] Usando endpoint paramétrico con idEvento:', idEvento);
                data = await getCatalogoParametrico(idEvento);
            } else {
                // Fallback: generic catalogue by locale
                console.log('[CATALOGO] Usando fallback por locale (es-AR)');
                data = await getCatalogoRestricciones();
            }
            console.log('[CATALOGO] Respuesta cruda:', data);
            // Guard: si el backend devuelve { data: [...] } en lugar de [...]
            const lista = Array.isArray(data) ? data : (data as any)?.data ?? [];
            console.log('[CATALOGO] Items parseados:', lista.length, lista);
            setCatalogo(lista.sort((a: CatalogoRestriccion, b: CatalogoRestriccion) => a.orden - b.orden));
        } catch (e) {
            console.error('=== [CATALOGO] ERROR al cargar el catálogo de restricciones:', e);
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
            alimentacionDetalle: '',
            restriccionesSeleccionadas: {},
        }]);
    };

    const addPersonaMenor = () => {
        if (!invitacion || invitacion.cuposMenoresRestantes <= 0) return;
        const currentNewMinors = personas.filter(p => p.isNew && p.rolEvento === 'N').length;
        if (currentNewMinors >= invitacion.cuposMenoresRestantes) return;

        setPersonas(prev => [...prev, {
            nombre: '', apellido: '', email: '', celular: '',
            rolEvento: 'N', asiste: true, mensaje: '', isNew: true,
            alimentacionDetalle: '',
            restriccionesSeleccionadas: {},
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

    // --- Helpers para manejar restricciones por persona (sobre PersonaFormState) ---
    const toggleRestriccionPersona = (personaIdx: number, idRestriccion: number) => {
        setPersonas(prev => {
            const updated = [...prev];
            const persona = { ...updated[personaIdx] };
            const sel = { ...persona.restriccionesSeleccionadas };
            if (sel[idRestriccion]) {
                delete sel[idRestriccion];
            } else {
                sel[idRestriccion] = { idRestriccion, severidad: 'M', observaciones: '' };
            }
            persona.restriccionesSeleccionadas = sel;
            updated[personaIdx] = persona;
            return updated;
        });
    };

    const updateRestriccionPersona = (personaIdx: number, idRestriccion: number, field: 'severidad' | 'observaciones', value: string) => {
        setPersonas(prev => {
            const updated = [...prev];
            const persona = { ...updated[personaIdx] };
            const sel = { ...persona.restriccionesSeleccionadas };
            if (sel[idRestriccion]) {
                sel[idRestriccion] = { ...sel[idRestriccion], [field]: value };
            }
            persona.restriccionesSeleccionadas = sel;
            updated[personaIdx] = persona;
            return updated;
        });
    };

    // --- Submit RSVP unificado (datos + restricciones en una sola llamada) ---
    const handleRsvpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (globalAsiste === null) {
            alert('Por favor, indicanos si vas a asistir.');
            return;
        }

        // Validación dura: email y celular del titular son obligatorios
        if (globalAsiste === true) {
            const titular = personas[0];
            if (!titular?.email?.trim() || !titular?.celular?.trim()) {
                alert('El email y el celular del titular son obligatorios para confirmar la asistencia.');
                return;
            }
        }

        setStep('LOADING');
        try {
            const personasPayload: PersonaConfirmarPayload[] = personas.map(p => {
                const asistel = globalAsiste === false ? false : p.asiste;

                // Construir array de restricciones detalladas
                const restriccionesArr = Object.values(p.restriccionesSeleccionadas).map(r => ({
                    idRestriccion: r.idRestriccion,
                    observaciones: r.observaciones || null,
                }));

                return {
                    idInvitado: p.idInvitado || undefined,
                    nombre: p.nombre,
                    apellido: p.apellido,
                    email: p.email || undefined,
                    celular: p.celular || undefined,
                    rolEvento: p.rolEvento,
                    asiste: asistel,
                    mensaje: p.mensaje || undefined,
                    alimentacionDetalle: p.alimentacionDetalle || undefined,
                    restricciones: restriccionesArr.length > 0 ? restriccionesArr : undefined,
                };
            });

            const payloadAEnviar = {
                mensajeGrupo: mensajeGrupo || undefined,
                personas: personasPayload,
            };

            console.log('=== RSVP PAYLOAD UNIFICADO ===', JSON.stringify(payloadAEnviar, null, 2));

            await confirmarRsvp(token, payloadAEnviar);

            // Intentar obtener el resumen de confirmación tras registrar el RSVP
            try {
                const resumen = await getResumenRsvp(token);
                setResumenRsvp(resumen);
            } catch (errResumen) {
                console.error('Error al obtener el resumen del RSVP tras confirmación:', errResumen);
            }

            setStep('SUCCESS');
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al confirmar asistencia');
            setStep('ERROR');
        }
    };

    // --- Helper para descargar imagen QR como blob ---
    const handleDownloadQr = async (qrToken: string, name: string) => {
        try {
            const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrToken)}&format=png`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr_${name.toLowerCase().replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            // Fallback: abrir en nueva pestaña
            window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrToken)}&format=png`, '_blank');
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
        const integrantesConfirmados = resumenRsvp?.integrantes?.filter(
            i => i.rsvpEstado === 'Y' && i.qrToken
        ) || [];

        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 md:py-20 relative overflow-x-hidden">
                {/* Ambient background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-500/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
                </div>

                <div className="max-w-2xl w-full mx-auto relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-10 h-10 text-black" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
                        Confirmación registrada
                    </h1>

                    <p className="text-muted text-center max-w-md mb-8 text-sm md:text-base">
                        {integrantesConfirmados.length > 0
                            ? 'Guardá tus QR para el ingreso al evento. Estos son tus QR de ingreso:'
                            : 'Gracias por tu respuesta. Ya registramos tus respuestas y preferencias correctamente.'}
                    </p>

                    {integrantesConfirmados.length > 0 && (
                        <div className="w-full space-y-6 animate-in fade-in duration-500">
                            {integrantesConfirmados.map((integrante) => (
                                <div key={integrante.idInvitado} className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-6 transition-all duration-300 hover:border-white/20">
                                    {/* Left section: Text Info */}
                                    <div className="flex flex-col justify-between text-center sm:text-left space-y-4">
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-bold text-white tracking-tight">
                                                {integrante.nombreCompleto}
                                            </h2>
                                            <div>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider ${
                                                    integrante.esTitularGrupo
                                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                        : 'bg-white/5 text-muted border border-white/10'
                                                }`}>
                                                    {integrante.esTitularGrupo ? 'Titular' : 'Acompañante'}
                                                </span>
                                            </div>
                                        </div>

                                        {integrante.mesaNombre && (
                                            <div className="text-xs text-muted/80">
                                                Mesa: <strong className="text-white">{integrante.mesaNombre}</strong>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleDownloadQr(integrante.qrToken!, integrante.nombreCompleto)}
                                            className="hidden sm:flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md mt-auto cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar QR
                                        </button>
                                    </div>

                                    {/* Right section: QR Visual */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center justify-center shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(integrante.qrToken!)}`}
                                                alt={`QR de ingreso para ${integrante.nombreCompleto}`}
                                                width={180}
                                                height={180}
                                                className="rounded-xl border border-white/5"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleDownloadQr(integrante.qrToken!, integrante.nombreCompleto)}
                                            className="flex sm:hidden w-full items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-md cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar QR
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                {step === 'RSVP' && invitacion?.agenda && invitacion.agenda.length > 0 && (() => {
                    // Filtrar por idAcceso de la URL; si no hay match mostramos toda la agenda
                    const agendaFiltrada = idAccesoNum
                        ? invitacion.agenda.filter(a => a.idAcceso === idAccesoNum)
                        : invitacion.agenda;
                    const agendaMostrar = agendaFiltrada.length > 0 ? agendaFiltrada : invitacion.agenda;

                    return (
                        <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <h2 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-400" /> Tu Acceso al Evento
                            </h2>
                            {agendaMostrar.map((acceso, aIdx) => (
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
                    );
                })()}

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

                                            {/* Email & Celular — adultos; required solo para el titular */}
                                            {persona.rolEvento === 'A' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                            <Mail className="w-3 h-3 inline mr-1" />
                                                            Email{idx === 0 && <span className="text-red-400 ml-0.5">*</span>}
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required={idx === 0 && globalAsiste === true}
                                                            value={persona.email}
                                                            onChange={e => updatePersona(idx, 'email', e.target.value)}
                                                            className={`w-full p-3 rounded-xl bg-white/5 border transition-all text-white text-sm outline-none
                                                                focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                                                                ${idx === 0 && globalAsiste === true && !persona.email.trim() ? 'border-red-500/50' : 'border-white/10'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                            <Phone className="w-3 h-3 inline mr-1" />
                                                            Celular{idx === 0 && <span className="text-red-400 ml-0.5">*</span>}
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            required={idx === 0 && globalAsiste === true}
                                                            value={persona.celular}
                                                            onChange={e => updatePersona(idx, 'celular', e.target.value)}
                                                            className={`w-full p-3 rounded-xl bg-white/5 border transition-all text-white text-sm outline-none
                                                                focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                                                                ${idx === 0 && globalAsiste === true && !persona.celular.trim() ? 'border-red-500/50' : 'border-white/10'}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Sección Alimentación (solo si asiste) ── */}
                                            {(globalAsiste === true && (idx === 0 || persona.asiste)) && (
                                                <div className="space-y-3 pt-2 border-t border-white/5">
                                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                        <ChefHat className="w-3.5 h-3.5 text-indigo-400" /> Preferencias alimentarias
                                                    </p>

                                                    {/* Checkboxes del catálogo */}
                                                    {catalogo.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {catalogo.map(cat => {
                                                                const isSelected = !!persona.restriccionesSeleccionadas[cat.idRestriccion];
                                                                return (
                                                                    <button
                                                                        key={cat.idRestriccion}
                                                                        type="button"
                                                                        onClick={() => toggleRestriccionPersona(idx, cat.idRestriccion)}
                                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                                                            ${isSelected
                                                                                ? 'bg-indigo-500/15 border-indigo-500/60 text-indigo-300'
                                                                                : 'bg-white/5 border-white/10 text-muted hover:border-white/30 hover:text-white'}`}
                                                                    >
                                                                        {cat.nombre}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Detalle extra para restricciones de tipo ALERGIA */}
                                                    {Object.values(persona.restriccionesSeleccionadas).map(r => {
                                                        const cat = catalogo.find(c => c.idRestriccion === r.idRestriccion);
                                                        if (cat?.categoria === 'ALERGIA' || cat?.codigo === 'CELIACO') {
                                                            return (
                                                                <div key={r.idRestriccion} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-3 animate-in fade-in">
                                                                    <p className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                                                                        <HeartPulse className="w-3.5 h-3.5" /> {cat.nombre}
                                                                    </p>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Severidad</label>
                                                                            <select
                                                                                value={r.severidad}
                                                                                onChange={e => updateRestriccionPersona(idx, r.idRestriccion, 'severidad', e.target.value as any)}
                                                                                className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                                                                            >
                                                                                <option value="L">Leve</option>
                                                                                <option value="M">Media</option>
                                                                                <option value="G">Grave (contaminación cruzada)</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Aclaración</label>
                                                                            <input
                                                                                placeholder="Ej. Sin nueces"
                                                                                value={r.observaciones}
                                                                                onChange={e => updateRestriccionPersona(idx, r.idRestriccion, 'observaciones', e.target.value)}
                                                                                className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}

                                                    {/* Texto libre adicional */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                            Otras aclaraciones (opcional)
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Ej: No tolero el picante, prefiero vegetariano..."
                                                            value={persona.alimentacionDetalle}
                                                            onChange={e => updatePersona(idx, 'alimentacionDetalle', e.target.value)}
                                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none resize-none"
                                                        />
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
            </div>
        </div>
    );
}
