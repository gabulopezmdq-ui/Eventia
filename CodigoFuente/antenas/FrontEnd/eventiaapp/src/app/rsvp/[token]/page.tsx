'use client';

import { useEffect, useState, use, useCallback } from 'react';
import {
    CheckCircle2, AlertCircle, ChefHat, User, MessageSquare,
    ArrowRight, HeartPulse, Baby, Phone, Mail,
    MapPin, Calendar, Users, PlusCircle, Trash2, Download,
    Loader2, X, Music
} from 'lucide-react';
import {
    confirmarRsvp, getInvitacionPersonal,
    getCatalogoRestricciones, getCatalogoParametrico, getDatosInvitacion,
    InvitacionPersonalResponse, PersonaInvitacion, PersonaConfirmarPayload,
    CatalogoRestriccion, getResumenRsvp, ResumenRsvpResponse, cerrarGrupoRsvp
} from '@/src/features/rsvp/rsvp.service';
import {
    getAutorizacionesRsvp,
    createAutorizacionRsvp,
    deleteAutorizacion
} from '@/src/features/programas/autorizaciones-retiro.service';
import { AutorizacionRetiro } from '@/src/features/programas/types';


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
    sugerenciaTema: string;
    sugerenciaArtista: string;
    sugerenciaLink: string;
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

interface FeatureEfectiva {
    id_feature: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    incluida_en_plan: boolean;
    incluida_por_addon: boolean;
    activo_evento: boolean | null;
    activo_resuelto: boolean;
}

    // --- Resumen RSVP (QRs y datos post-confirmación) ---
    const [resumenRsvp, setResumenRsvp] = useState<ResumenRsvpResponse | null>(null);
    const [featuresEfectivas, setFeaturesEfectivas] = useState<FeatureEfectiva[]>([]);

    // --- Nuevos Acompañantes en SUCCESS (Grupo Incompleto) ---
    const [nuevosAcompanantes, setNuevosAcompanantes] = useState<PersonaFormState[]>([]);
    const [submittingNuevos, setSubmittingNuevos] = useState(false);
    const [errorNuevosMsg, setErrorNuevosMsg] = useState<string | null>(null);
    const [submittingCerrarGrupo, setSubmittingCerrarGrupo] = useState(false);

    const isFeatureActiva = (codigo: string) => {
        if (featuresEfectivas.length === 0) return true;
        const feat = featuresEfectivas.find(f => f.codigo === codigo);
        return feat ? feat.activo_resuelto : false;
    };

    const buildSugerenciaMusica = (p: PersonaFormState) => {
        if (!p.sugerenciaTema?.trim() && !p.sugerenciaArtista?.trim()) return undefined;
        const parts = [];
        if (p.sugerenciaTema?.trim()) parts.push(p.sugerenciaTema.trim());
        if (p.sugerenciaArtista?.trim()) parts.push(p.sugerenciaArtista.trim());
        let str = parts.join(' - ');
        if (p.sugerenciaLink?.trim()) {
            str += ` (${p.sugerenciaLink.trim()})`;
        }
        return str;
    };

    const addNuevoAcompananteAdulto = () => {
        if (!resumenRsvp) return;
        const limit = resumenRsvp.adultosDisponibles ?? 0;
        const current = nuevosAcompanantes.filter(p => p.rolEvento === 'A').length;
        if (current >= limit) return;

        setNuevosAcompanantes(prev => [...prev, {
            nombre: '', apellido: '', email: '', celular: '',
            rolEvento: 'A', asiste: true, mensaje: '', isNew: true,
            alimentacionDetalle: '',
            restriccionesSeleccionadas: {},
            sugerenciaTema: '',
            sugerenciaArtista: '',
            sugerenciaLink: '',
        }]);
    };

    const addNuevoAcompananteMenor = () => {
        if (!resumenRsvp) return;
        const limit = resumenRsvp.menoresDisponibles ?? 0;
        const current = nuevosAcompanantes.filter(p => p.rolEvento === 'N').length;
        if (current >= limit) return;

        setNuevosAcompanantes(prev => [...prev, {
            nombre: '', apellido: '', email: '', celular: '',
            rolEvento: 'N', asiste: true, mensaje: '', isNew: true,
            alimentacionDetalle: '',
            restriccionesSeleccionadas: {},
            sugerenciaTema: '',
            sugerenciaArtista: '',
            sugerenciaLink: '',
        }]);
    };

    const removeNuevoAcompanante = (index: number) => {
        setNuevosAcompanantes(prev => prev.filter((_, i) => i !== index));
    };

    const updateNuevoAcompanante = <K extends keyof PersonaFormState>(index: number, field: K, value: PersonaFormState[K]) => {
        setNuevosAcompanantes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const toggleRestriccionNuevoAcompanante = (personaIdx: number, idRestriccion: number) => {
        setNuevosAcompanantes(prev => {
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

    const updateRestriccionNuevoAcompanante = (personaIdx: number, idRestriccion: number, field: 'severidad' | 'observaciones', value: string) => {
        setNuevosAcompanantes(prev => {
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

    const handleConfirmarNuevosAcompanantes = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nuevosAcompanantes.length === 0) return;

        // Validaciones: Nombre y Apellido para todos; Email y Celular para Adultos
        for (const p of nuevosAcompanantes) {
            if (!p.nombre.trim() || !p.apellido.trim()) {
                alert('El nombre y apellido son obligatorios para todos los acompañantes.');
                return;
            }
            if (p.rolEvento === 'A') {
                if (!p.email.trim() || !p.celular.trim()) {
                    alert(`El email y celular son obligatorios para el adulto ${p.nombre} ${p.apellido}.`);
                    return;
                }
            }
        }

        setSubmittingNuevos(true);
        setErrorNuevosMsg(null);
        try {
            const personasPayload: PersonaConfirmarPayload[] = nuevosAcompanantes.map(p => {
                const restriccionesArr = Object.values(p.restriccionesSeleccionadas).map(r => ({
                    idRestriccion: r.idRestriccion,
                    observaciones: r.observaciones || null,
                }));

                return {
                    nombre: p.nombre.trim(),
                    apellido: p.apellido.trim(),
                    email: p.email.trim() || undefined,
                    celular: p.celular.trim() || undefined,
                    rolEvento: p.rolEvento,
                    asiste: true,
                    alimentacionDetalle: p.alimentacionDetalle.trim() || undefined,
                    restricciones: restriccionesArr.length > 0 ? restriccionesArr : undefined,
                    sugerenciaMusica: buildSugerenciaMusica(p),
                };
            });

            await confirmarRsvp(token, { personas: personasPayload });

            // Refrescar resumen para mostrar nuevos QR y actualizar cupos
            const resumen = await getResumenRsvp(token);
            setResumenRsvp(resumen);
            setNuevosAcompanantes([]);
            await cargarAutorizados();
        } catch (err) {
            setErrorNuevosMsg(err instanceof Error ? err.message : 'Error al guardar acompañantes.');
        } finally {
            setSubmittingNuevos(false);
        }
    };

    const handleCerrarGrupo = async () => {
        if (!confirm('¿Estás seguro de que no deseas agregar más acompañantes? Esta acción cerrará tu grupo de forma definitiva.')) {
            return;
        }

        setSubmittingCerrarGrupo(true);
        try {
            const response = await cerrarGrupoRsvp(token);
            setResumenRsvp(response);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al cerrar el grupo.');
        } finally {
            setSubmittingCerrarGrupo(false);
        }
    };

    // --- Autorizados de Retiro state ---
    const [autorizados, setAutorizados] = useState<AutorizacionRetiro[]>([]);
    const [loadingAutorizados, setLoadingAutorizados] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authNombre, setAuthNombre] = useState('');
    const [authCelular, setAuthCelular] = useState('');
    const [authRelacion, setAuthRelacion] = useState('Madre');
    const [submittingAuth, setSubmittingAuth] = useState(false);
    const [errorAuthMsg, setErrorAuthMsg] = useState<string | null>(null);

    const cargarAutorizados = useCallback(async () => {
        setLoadingAutorizados(true);
        try {
            const data = await getAutorizacionesRsvp(token);
            setAutorizados(data || []);
        } catch (err) {
            console.error('Error al cargar autorizados de retiro:', err);
        } finally {
            setLoadingAutorizados(false);
        }
    }, [token]);

    const handleAgregarAutorizado = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authNombre.trim() || !authCelular.trim() || !authRelacion.trim()) {
            setErrorAuthMsg('Todos los campos son obligatorios');
            return;
        }
        setSubmittingAuth(true);
        setErrorAuthMsg(null);
        try {
            await createAutorizacionRsvp(token, {
                nombreAutorizado: authNombre.trim(),
                telefonoAutorizado: authCelular.trim(),
                relacion: authRelacion.trim()
            });
            setIsAuthModalOpen(false);
            setAuthNombre('');
            setAuthCelular('');
            setAuthRelacion('Madre');
            await cargarAutorizados();
        } catch (err) {
            setErrorAuthMsg(err instanceof Error ? err.message : 'Error al guardar la autorización');
        } finally {
            setSubmittingAuth(false);
        }
    };

    const handleEliminarAutorizado = async (id: number, nombre: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la autorización de retiro para ${nombre}? Su código QR quedará invalidado inmediatamente.`)) {
            return;
        }
        try {
            await deleteAutorizacion(id);
            await cargarAutorizados();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al eliminar la autorización');
        }
    };

    const cargarCatalogo = useCallback(async (idEvento?: number) => {
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
            const lista = Array.isArray(data) ? data : (data as unknown as { data?: CatalogoRestriccion[] })?.data ?? [];
            console.log('[CATALOGO] Items parseados:', lista.length, lista);
            setCatalogo(lista.sort((a: CatalogoRestriccion, b: CatalogoRestriccion) => a.orden - b.orden));
        } catch (e) {
            console.error('=== [CATALOGO] ERROR al cargar el catálogo de restricciones:', e);
        }
    }, []);

    const verificarEstado = useCallback(async () => {
        setStep('VERIFYING');
        try {
            // 0. Intentar cargar la invitación primero para tener los datos de la familia/evento
            let inviteData: InvitacionPersonalResponse | null = null;
            try {
                inviteData = await getInvitacionPersonal(token);
                console.log('=== INFO DEL TOKEN ===', inviteData);
                setInvitacion(inviteData);
            } catch (errInvite) {
                console.log('Error al precargar invitación:', errInvite);
                try {
                    const legacyData = await getDatosInvitacion(token);
                    inviteData = {
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
                    };
                    setInvitacion(inviteData);
                } catch {}
            }

            // 1. Cargar el resumen de RSVP
            let resumen: ResumenRsvpResponse | null = null;
            try {
                resumen = await getResumenRsvp(token);
                setResumenRsvp(resumen);
            } catch (errResumen) {
                console.log('Error al obtener el resumen del RSVP:', errResumen);
            }

            // Cargar features efectivas del evento (versión pública para el RSVP)
            const idEventoResolved = inviteData?.idEvento ?? resumen?.idEvento;
            if (idEventoResolved) {
                try {
                    const resFeats = await fetch(`/api/features-efectivas/public?idEvento=${idEventoResolved}`);
                    if (resFeats.ok) {
                        const dataFeats = await resFeats.json();
                        setFeaturesEfectivas(dataFeats.features || []);
                    }
                } catch (e) {
                    console.warn('No se pudieron cargar las features efectivas en el RSVP', e);
                }
            }

            if (resumen && (resumen.rsvpEstadoGrupo === 'CONFIRMADO' || resumen.rsvpEstadoGrupo === 'INCOMPLETO')) {
                await cargarAutorizados();
                // Precargar el catálogo para cuando decidan agregar acompañantes
                await cargarCatalogo(inviteData?.idEvento);
                setStep('SUCCESS');
                return;
            }


            // 2. Si no está confirmado, continuar con el flujo normal de carga
            // Try the unified endpoint first (if not already loaded in step 0)
            if (!inviteData) {
                try {
                    inviteData = await getInvitacionPersonal(token);
                    console.log('=== INFO DEL TOKEN ===', inviteData);
                    setInvitacion(inviteData);
                } catch {
                    // Fallback: try legacy endpoint for basic data
                    try {
                        const legacyData = await getDatosInvitacion(token);
                        // Build a minimal invitacion object from legacy data
                        inviteData = {
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
                        };
                        setInvitacion(inviteData);
                    } catch {
                        // Both failed
                    }
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
                        sugerenciaTema: '',
                        sugerenciaArtista: '',
                        sugerenciaLink: '',
                    };
                }));
            }

            // Load catalogue early so it's ready when user fills the RSVP form
            await cargarCatalogo(inviteData?.idEvento);

            setStep('RSVP');
        } catch {
            setStep('RSVP');
        }
    }, [token, cargarAutorizados, cargarCatalogo]);

    useEffect(() => {
        verificarEstado();
    }, [verificarEstado]);

    // --- Persona management ---
    const updatePersona = <K extends keyof PersonaFormState>(index: number, field: K, value: PersonaFormState[K]) => {
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
            sugerenciaTema: '',
            sugerenciaArtista: '',
            sugerenciaLink: '',
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
            sugerenciaTema: '',
            sugerenciaArtista: '',
            sugerenciaLink: '',
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
                    sugerenciaMusica: buildSugerenciaMusica(p),
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
                await cargarAutorizados();
            } catch (errResumen) {
                console.error('Error al obtener el resumen del RSVP tras confirmación:', errResumen);
            }

            setStep('SUCCESS');
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Error al confirmar asistencia');
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

                    {/* ── Sección Acompañantes Pendientes (Grupo Incompleto) ── */}
                    {resumenRsvp?.rsvpEstadoGrupo === 'INCOMPLETO' && resumenRsvp?.puedeEditarGrupo === true && isFeatureActiva('RSVP_ACOMPANIANTES') && (() => {
                        const adultosRestantes = (resumenRsvp.adultosDisponibles ?? 0) - nuevosAcompanantes.filter(p => p.rolEvento === 'A').length;
                        const menoresRestantes = (resumenRsvp.menoresDisponibles ?? 0) - nuevosAcompanantes.filter(p => p.rolEvento === 'N').length;

                        return (
                            <div className="w-full mt-12 pt-10 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                                        <Users className="w-6 h-6 text-indigo-400" />
                                        Compañeros de Grupo Pendientes
                                    </h2>
                                    <p className="text-muted text-xs sm:text-sm mt-1.5 max-w-lg">
                                        Tu grupo cuenta con cupos pendientes por definir. Podés agregarlos ahora o cerrar el grupo si no van a asistir más personas.
                                    </p>
                                </div>

                                {/* Resumen de Cupos */}
                                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted uppercase tracking-widest">Te quedan por definir:</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {resumenRsvp.adultosDisponibles !== undefined && resumenRsvp.adultosDisponibles > 0 && (
                                                <span className="text-sm font-semibold text-white">
                                                    +{adultosRestantes} Adulto{adultosRestantes !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {resumenRsvp.menoresDisponibles !== undefined && resumenRsvp.menoresDisponibles > 0 && (
                                                <span className="text-sm font-semibold text-pink-400">
                                                    +{menoresRestantes} Menor{menoresRestantes !== 1 ? 'es' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                                        {adultosRestantes > 0 && isFeatureActiva('RSVP_ACOMPANIANTES') && (
                                            <button
                                                type="button"
                                                onClick={addNuevoAcompananteAdulto}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold border border-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Agregar Adulto
                                            </button>
                                        )}
                                        {menoresRestantes > 0 && isFeatureActiva('RSVP_ACOMPANIANTES') && (
                                            <button
                                                type="button"
                                                onClick={addNuevoAcompananteMenor}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-xs font-bold border border-pink-500/20 active:scale-95 transition-all cursor-pointer"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Agregar Menor
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleCerrarGrupo}
                                            disabled={submittingCerrarGrupo}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 text-muted hover:text-white border border-white/10 text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingCerrarGrupo ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'No agregar más'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Formulario para los Nuevos Acompañantes */}
                                {nuevosAcompanantes.length > 0 && (
                                    <form onSubmit={handleConfirmarNuevosAcompanantes} className="space-y-6 animate-in fade-in duration-500">
                                        {nuevosAcompanantes.map((persona, idx) => (
                                            <div key={idx} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4 relative">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${persona.rolEvento === 'A'
                                                            ? 'bg-indigo-500/20 text-indigo-400'
                                                            : 'bg-pink-500/20 text-pink-400'
                                                            }`}>
                                                            {persona.rolEvento === 'A' ? <User className="w-3.5 h-3.5" /> : <Baby className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className="text-xs font-bold text-muted uppercase tracking-widest">
                                                            {persona.rolEvento === 'A' ? 'Nuevo Adulto' : 'Nuevo Menor'}
                                                        </span>
                                                    </div>

                                                    <button type="button" onClick={() => removeNuevoAcompanante(idx)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Nombre</label>
                                                        <input required value={persona.nombre} onChange={e => updateNuevoAcompanante(idx, 'nombre', e.target.value)}
                                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Apellido</label>
                                                        <input required value={persona.apellido} onChange={e => updateNuevoAcompanante(idx, 'apellido', e.target.value)}
                                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none" />
                                                    </div>
                                                </div>

                                                {persona.rolEvento === 'A' && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                                <Mail className="w-3 h-3 inline mr-1" />
                                                                Email<span className="text-red-400 ml-0.5">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                required
                                                                value={persona.email}
                                                                onChange={e => updateNuevoAcompanante(idx, 'email', e.target.value)}
                                                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                                <Phone className="w-3 h-3 inline mr-1" />
                                                                Celular<span className="text-red-400 ml-0.5">*</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                required
                                                                value={persona.celular}
                                                                onChange={e => updateNuevoAcompanante(idx, 'celular', e.target.value)}
                                                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Alimentación / Restricciones */}
                                                {isFeatureActiva('RESTRICCIONES_ALIMENTARIAS') && (
                                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                            <ChefHat className="w-3.5 h-3.5 text-indigo-400" /> Preferencias alimentarias
                                                        </p>

                                                        {catalogo.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {catalogo.map(cat => {
                                                                const isSelected = !!persona.restriccionesSeleccionadas[cat.idRestriccion];
                                                                return (
                                                                    <button
                                                                        key={cat.idRestriccion}
                                                                        type="button"
                                                                        onClick={() => toggleRestriccionNuevoAcompanante(idx, cat.idRestriccion)}
                                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
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
                                                                                onChange={e => updateRestriccionNuevoAcompanante(idx, r.idRestriccion, 'severidad', e.target.value as 'L' | 'M' | 'G')}
                                                                                className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white text-xs outline-none focus:border-orange-500 cursor-pointer"
                                                                            >
                                                                                <option value="L">Leve</option>
                                                                                <option value="M">Media</option>
                                                                                <option value="G">Grave (contaminación cruzada)</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Aclaración</label>
                                                                            <input
                                                                                placeholder="Ej: Sin nueces"
                                                                                value={r.observaciones}
                                                                                onChange={e => updateRestriccionNuevoAcompanante(idx, r.idRestriccion, 'observaciones', e.target.value)}
                                                                                className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}

                                                    <div>
                                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">
                                                            Otras aclaraciones (opcional)
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Ej: No tolero el picante, prefiero vegetariano..."
                                                            value={persona.alimentacionDetalle}
                                                            onChange={e => updateNuevoAcompanante(idx, 'alimentacionDetalle', e.target.value)}
                                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                                )}

                                                {/* ── Sección Música / Sugerencias (solo si feature activa) ── */}
                                                {isFeatureActiva('MUSICA_SUGERENCIAS') && (
                                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                            <Music className="w-3.5 h-3.5 text-violet-400" /> ¿Qué tema no debería faltar en la fiesta?
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-muted/80 uppercase block mb-1">Título de la Canción</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: Billie Jean"
                                                                    value={persona.sugerenciaTema || ''}
                                                                    onChange={e => updateNuevoAcompanante(idx, 'sugerenciaTema', e.target.value)}
                                                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-muted/80 uppercase block mb-1">Artista / Banda</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: Michael Jackson"
                                                                    value={persona.sugerenciaArtista || ''}
                                                                    onChange={e => updateNuevoAcompanante(idx, 'sugerenciaArtista', e.target.value)}
                                                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-muted/80 uppercase block mb-1">Link de Spotify / YouTube (opcional)</label>
                                                            <input
                                                                type="url"
                                                                placeholder="Ej: https://open.spotify.com/..."
                                                                value={persona.sugerenciaLink || ''}
                                                                onChange={e => updateNuevoAcompanante(idx, 'sugerenciaLink', e.target.value)}
                                                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-sm outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {errorNuevosMsg && (
                                            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                                                {errorNuevosMsg}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submittingNuevos}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingNuevos ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    Confirmar y Registrar Acompañante{nuevosAcompanantes.length !== 1 ? 's' : ''}
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        );
                    })()}

                    {/* ── Sección de Autorizaciones de Retiro ── */}
                    {(() => {
                        const tieneMenores = invitacion?.personas?.some(p => p.rolEvento === 'N') || personas?.some(p => p.rolEvento === 'N');
                        if (!tieneMenores) return null;

                        return (
                            <div className="w-full mt-12 pt-10 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                                            <Users className="w-6 h-6 text-emerald-400" />
                                            Autorizados para Retiro
                                        </h2>
                                        <p className="text-muted text-xs sm:text-sm mt-1.5 max-w-lg">
                                            Registrá a los adultos autorizados para retirar a los menores del predio. Cada uno contará con un código QR inmutable para validar su identidad en portería.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="flex items-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Autorizar Adulto
                                    </button>
                                </div>

                                {loadingAutorizados ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-emerald-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                        <p className="text-xs text-muted font-bold tracking-widest uppercase">Cargando autorizados...</p>
                                    </div>
                                ) : autorizados.length === 0 ? (
                                    <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center flex flex-col items-center justify-center">
                                        <p className="text-sm font-semibold text-muted">Sin autorizados registrados aún</p>
                                        <p className="text-xs text-muted/60 mt-1 max-w-xs">Solo los responsables familiares principales (padres/tutores) podrán realizar los retiros por defecto.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {autorizados.map((auth) => {
                                            const idAutorizacion = auth.idAutorizacion ?? auth.id_autorizacion;
                                            const nombreAutorizado = auth.nombreAutorizado ?? auth.nombre_autorizado;
                                            const telefonoAutorizado = auth.telefonoAutorizado ?? auth.telefono_autorizado;
                                            const relacion = auth.relacion;
                                            const qrToken = auth.qrToken ?? auth.qr_token;

                                            return (
                                                <div
                                                    key={idAutorizacion}
                                                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col justify-between gap-5 transition-all duration-300 hover:border-white/15"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-base leading-tight">{nombreAutorizado}</h4>
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 mt-1 border border-emerald-500/20">
                                                                    {relacion}
                                                                </span>
                                                                <p className="text-xs text-muted flex items-center gap-1 mt-2 font-mono">
                                                                    <Phone className="w-3.5 h-3.5 text-muted/70" /> {telefonoAutorizado}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEliminarAutorizado(idAutorizacion, nombreAutorizado)}
                                                            className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors border border-red-500/10 cursor-pointer"
                                                            title="Revocar autorización"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 rounded-xl p-3 gap-3">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrToken || '')}`}
                                                            alt={`QR para ${nombreAutorizado}`}
                                                            width={140}
                                                            height={140}
                                                            className="rounded-lg border border-white/5 bg-white p-1"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadQr(qrToken || '', nombreAutorizado)}
                                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 font-bold text-xs shadow-md transition-all cursor-pointer"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            Descargar QR Autorizado
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* ── Modal de Agregar Autorizado ── */}
                    {isAuthModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                                {/* Ambient glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
                                        <PlusCircle className="w-5 h-5 text-emerald-400" />
                                        Autorizar Adulto
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAuthModalOpen(false);
                                            setErrorAuthMsg(null);
                                        }}
                                        className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleAgregarAutorizado} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej: Juan Pérez"
                                            value={authNombre}
                                            onChange={(e) => setAuthNombre(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white text-sm outline-none"
                                            disabled={submittingAuth}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Relación / Parentesco</label>
                                        <select
                                            value={authRelacion}
                                            onChange={(e) => setAuthRelacion(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white text-sm outline-none cursor-pointer"
                                            disabled={submittingAuth}
                                        >
                                            <option value="Madre" className="bg-[#0d0d0d] text-white">Madre</option>
                                            <option value="Padre" className="bg-[#0d0d0d] text-white">Padre</option>
                                            <option value="Tío/a" className="bg-[#0d0d0d] text-white">Tío/a</option>
                                            <option value="Abuelo/a" className="bg-[#0d0d0d] text-white">Abuelo/a</option>
                                            <option value="Tutor Legal" className="bg-[#0d0d0d] text-white">Tutor Legal</option>
                                            <option value="Niñero/a" className="bg-[#0d0d0d] text-white">Niñero/a</option>
                                            <option value="Chofer" className="bg-[#0d0d0d] text-white">Chofer</option>
                                            <option value="Otro" className="bg-[#0d0d0d] text-white">Otro</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Teléfono Celular</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Ej: +54 9 11 2345 6789"
                                            value={authCelular}
                                            onChange={(e) => setAuthCelular(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white text-sm outline-none font-mono"
                                            disabled={submittingAuth}
                                        />
                                        <span className="text-[10px] text-muted/60 mt-1 block">Preferentemente en formato internacional con código de país.</span>
                                    </div>

                                    {errorAuthMsg && (
                                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                                            {errorAuthMsg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 py-3 px-5 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={submittingAuth}
                                    >
                                        {submittingAuth ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <PlusCircle className="w-4 h-4" />
                                                Autorizar Adulto
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
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
                        <p className="text-muted/70 mt-2 text-sm italic">&quot;{invitacion.mensajeBienvenida}&quot;</p>
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
                                                                                onChange={e => updateRestriccionPersona(idx, r.idRestriccion, 'severidad', e.target.value as 'L' | 'M' | 'G')}
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
                                    {globalAsiste === true && (canAddAdulto || canAddMenor) && isFeatureActiva('RSVP_ACOMPANIANTES') && (
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
