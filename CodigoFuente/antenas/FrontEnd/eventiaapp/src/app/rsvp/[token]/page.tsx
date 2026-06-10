'use client';

import { useEffect, useState, use, useCallback } from 'react';
import {
    CheckCircle2, AlertCircle, ChefHat, User, MessageSquare,
    ArrowRight, HeartPulse, Baby, Phone, Mail,
    MapPin, Calendar, Users, PlusCircle, Trash2, Download,
    Loader2, X, Music, Clock, Heart, Sparkles, MailOpen, Ticket, ShieldCheck, Landmark
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
    searchParams: Promise<{ idAcceso?: string; previewStep?: string }>;
}) {
    const { token } = use(params);
    const { idAcceso, previewStep } = use(searchParams);
    const idAccesoNum = idAcceso ? parseInt(idAcceso, 10) : null;

    const [step, setStep] = useState<Step>('VERIFYING');
    const [errorMsg, setErrorMsg] = useState('');
    const [hasInitialized, setHasInitialized] = useState(false);
    const [overrideRestricciones, setOverrideRestricciones] = useState<Record<string, boolean>>({});

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

    const renderPreviewBar = () => {
        if (token !== 'preview') return null;
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-neutral-200/80 px-4 py-2.5 rounded-full z-50 flex items-center gap-3 shadow-xl">
                <span className="text-xs font-bold text-neutral-500 mr-1">Preview Step:</span>
                <button 
                    type="button"
                    onClick={() => setStep('VERIFYING')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${(step as string) === 'VERIFYING' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                    Loading
                </button>
                <button 
                    type="button"
                    onClick={() => {
                        setErrorMsg("No pudimos verificar tu invitación en este momento.");
                        setStep('ERROR');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${(step as string) === 'ERROR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                    Error
                </button>
                <button 
                    type="button"
                    onClick={() => setStep('RSVP')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${(step as string) === 'RSVP' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                    RSVP Form
                </button>
                <button 
                    type="button"
                    onClick={() => setStep('SUCCESS')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${(step as string) === 'SUCCESS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                    Success Ticket
                </button>
            </div>
        );
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
        if (token === 'preview') {
            setStep((previewStep as Step) || 'RSVP');
            
            const mockInvitacion: InvitacionPersonalResponse = {
                idEvento: 1,
                idGrupo: 100,
                nombreGrupo: "Familia González",
                saludo: "Querida Familia González,",
                anfitriones: "Juan & María",
                mensajeBienvenida: "Nos complace invitarlos a celebrar nuestra unión matrimonial. Esperamos contar con su hermosa presencia en este día tan especial.",
                agenda: [
                    {
                        nombreAcceso: "Invitación General",
                        tramos: [
                            {
                                nombre: "Ceremonia Religiosa",
                                lugar: "Catedral Primada",
                                descripcion: "Intercambio de votos, alianzas y bendición de anillos.",
                                direccion: "Av. de Mayo 500, CABA",
                                orden: 1
                            },
                            {
                                nombre: "Banquete & Cena",
                                lugar: "Salón del Bosque",
                                descripcion: "Una deliciosa cena de tres pasos especialmente curada.",
                                direccion: "Ruta 8, Km 45, Pilar",
                                orden: 2
                            },
                            {
                                nombre: "Gran Fiesta & Baile",
                                lugar: "Salón Principal (DJ Set)",
                                descripcion: "Música, barra de tragos y baile hasta el amanecer.",
                                direccion: "Ruta 8, Km 45, Pilar",
                                orden: 3
                            }
                        ]
                    }
                ],
                personas: [
                    {
                        idInvitado: 101,
                        nombreCompleto: "Carlos González",
                        rolEvento: "A"
                    },
                    {
                        idInvitado: 102,
                        nombreCompleto: "Ana María Rodríguez",
                        rolEvento: "A"
                    },
                    {
                        idInvitado: 103,
                        nombreCompleto: "Mateo González",
                        rolEvento: "N"
                    }
                ],
                cuposAdultosRestantes: 2,
                cuposMenoresRestantes: 1
            };
            setInvitacion(mockInvitacion);
            
            setPersonas([
                {
                    idInvitado: 101,
                    nombre: "Carlos",
                    apellido: "González",
                    email: "carlos.gonzalez@example.com",
                    celular: "1122334455",
                    rolEvento: "A",
                    asiste: true,
                    isNew: false,
                    alimentacionDetalle: "",
                    restriccionesSeleccionadas: {},
                    sugerenciaTema: "Danza Kuduro",
                    sugerenciaArtista: "Don Omar",
                    sugerenciaLink: "",
                    mensaje: ""
                },
                {
                    idInvitado: 102,
                    nombre: "Ana María",
                    apellido: "Rodríguez",
                    email: "ana.rodriguez@example.com",
                    celular: "1166778899",
                    rolEvento: "A",
                    asiste: true,
                    isNew: false,
                    alimentacionDetalle: "Alergia severa al maní.",
                    restriccionesSeleccionadas: {
                        1: { idRestriccion: 1, severidad: "G", observaciones: "Contaminación cruzada" }
                    },
                    sugerenciaTema: "As It Was",
                    sugerenciaArtista: "Harry Styles",
                    sugerenciaLink: "",
                    mensaje: ""
                },
                {
                    idInvitado: 103,
                    nombre: "Mateo",
                    apellido: "González",
                    email: "",
                    celular: "",
                    rolEvento: "N",
                    asiste: true,
                    isNew: false,
                    alimentacionDetalle: "",
                    restriccionesSeleccionadas: {},
                    sugerenciaTema: "",
                    sugerenciaArtista: "",
                    sugerenciaLink: "",
                    mensaje: ""
                }
            ]);

            const mockResumen: ResumenRsvpResponse = {
                idEvento: 1,
                evento: "Boda de Juan & María",
                idRsvpGrupo: 100,
                titular: "Carlos González",
                rsvpEstadoGrupo: "CONFIRMADO",
                rsvpMensaje: "¡Allí estaremos para celebrar con ustedes!",
                personasCargadas: 3,
                cuposSinDefinir: 0,
                adultosDisponibles: 2,
                menoresDisponibles: 1,
                puedeEditarGrupo: true,
                grupoCerrado: false,
                integrantes: [
                    {
                        idInvitado: 101,
                        nombreCompleto: "Carlos González",
                        esTitularGrupo: true,
                        rsvpEstado: "Y",
                        qrToken: "mock-qr-carlos",
                        rsvpMensaje: "¡Allí estaremos!",
                        fechaRsvp: "2026-06-10",
                        idMesa: 5,
                        mesaNombre: "Mesa VIP 5",
                        tieneRestricciones: false,
                        restricciones: [],
                        cantidadSugerenciasMusica: 1,
                        sugerenciasMusica: ["Danza Kuduro - Don Omar"]
                    },
                    {
                        idInvitado: 102,
                        nombreCompleto: "Ana María Rodríguez",
                        esTitularGrupo: false,
                        rsvpEstado: "Y",
                        qrToken: "mock-qr-ana",
                        rsvpMensaje: "¡Con muchas ganas!",
                        fechaRsvp: "2026-06-10",
                        idMesa: 5,
                        mesaNombre: "Mesa VIP 5",
                        tieneRestricciones: true,
                        restricciones: ["Celíaco"],
                        cantidadSugerenciasMusica: 1,
                        sugerenciasMusica: ["As It Was - Harry Styles"]
                    },
                    {
                        idInvitado: 103,
                        nombreCompleto: "Mateo González",
                        esTitularGrupo: false,
                        rsvpEstado: "Y",
                        qrToken: "mock-qr-mateo",
                        rsvpMensaje: null,
                        fechaRsvp: "2026-06-10",
                        idMesa: 5,
                        mesaNombre: "Mesa VIP 5",
                        tieneRestricciones: false,
                        restricciones: [],
                        cantidadSugerenciasMusica: 0,
                        sugerenciasMusica: []
                    }
                ]
            };
            setResumenRsvp(mockResumen);

            setCatalogo([
                { idRestriccion: 1, codigo: "CELIACO", nombre: "Celíaco / TACC", orden: 1, categoria: "ALIMENTACION", descripcion: "" },
                { idRestriccion: 2, codigo: "VEGETARIANO", nombre: "Vegetariano", orden: 2, categoria: "ALIMENTACION", descripcion: "" },
                { idRestriccion: 3, codigo: "VEGANO", nombre: "Vegano", orden: 3, categoria: "ALIMENTACION", descripcion: "" },
                { idRestriccion: 4, codigo: "LACTOSA", nombre: "Intolerante a la Lactosa", orden: 4, categoria: "ALIMENTACION", descripcion: "" },
                { idRestriccion: 5, codigo: "DIABETICO", nombre: "Diabético", orden: 5, categoria: "ALIMENTACION", descripcion: "" }
            ]);

            setFeaturesEfectivas([
                {
                    id_feature: 1,
                    codigo: "MUSICA_SUGERENCIAS",
                    nombre: "Sugerencias de Música",
                    descripcion: "",
                    categoria: "",
                    incluida_en_plan: true,
                    incluida_por_addon: false,
                    activo_evento: true,
                    activo_resuelto: true
                }
            ]);

            return;
        }

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
        if (!hasInitialized) {
            verificarEstado();
            setHasInitialized(true);
        }
    }, [verificarEstado, hasInitialized]);

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

    const renderSeccionAlimentacion = (persona: PersonaFormState, idx: number, type: 'main' | 'nuevo') => {
        const key = `${type}-${idx}`;
        const tieneRestriccionesSeleccionadas = Object.keys(persona.restriccionesSeleccionadas || {}).length > 0;
        const tieneDetalleLibre = !!persona.alimentacionDetalle?.trim();
        const tieneRestricciones = tieneRestriccionesSeleccionadas || tieneDetalleLibre;
        const estaExpandido = overrideRestricciones[key] !== undefined 
            ? overrideRestricciones[key] 
            : tieneRestricciones;

        const isAlergia = (cat: CatalogoRestriccion) => {
            return cat.categoria === 'ALERGIA' || 
                   cat.nombre.toLowerCase().includes('alergia') || 
                   cat.nombre.toLowerCase().includes('intol') || 
                   cat.codigo.toLowerCase().includes('celiaco') ||
                   cat.codigo.toLowerCase().includes('tacc');
        };

        const dietas = catalogo.filter(cat => !isAlergia(cat));
        const alergias = catalogo.filter(cat => isAlergia(cat));

        const handleToggleSelect = (option: boolean) => {
            setOverrideRestricciones(prev => ({ ...prev, [key]: option }));
            if (!option) {
                if (type === 'main') {
                    updatePersona(idx, 'restriccionesSeleccionadas', {});
                    updatePersona(idx, 'alimentacionDetalle', '');
                } else {
                    updateNuevoAcompanante(idx, 'restriccionesSeleccionadas', {});
                    updateNuevoAcompanante(idx, 'alimentacionDetalle', '');
                }
            }
        };

        const onToggleRestriccion = (idRestriccion: number) => {
            if (type === 'main') {
                toggleRestriccionPersona(idx, idRestriccion);
            } else {
                toggleRestriccionNuevoAcompanante(idx, idRestriccion);
            }
        };

        const onUpdateRestriccion = (idRestriccion: number, field: 'severidad' | 'observaciones', val: string) => {
            if (type === 'main') {
                updateRestriccionPersona(idx, idRestriccion, field, val);
            } else {
                updateRestriccionNuevoAcompanante(idx, idRestriccion, field, val);
            }
        };

        const onUpdateAlimentacionDetalle = (val: string) => {
            if (type === 'main') {
                updatePersona(idx, 'alimentacionDetalle', val);
            } else {
                updateNuevoAcompanante(idx, 'alimentacionDetalle', val);
            }
        };

        return (
            <div className="space-y-6 pt-4 border-t border-neutral-100">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
                        <ChefHat className="w-4 h-4 text-indigo-550 text-indigo-500" /> Preferencias Alimentarias & Restricciones
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleToggleSelect(false)}
                            className={`flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                                !estaExpandido
                                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-md'
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-350 hover:bg-neutral-100/50'
                            }`}
                        >
                            <CheckCircle2 className={`w-4 h-4 ${!estaExpandido ? 'text-white' : 'text-neutral-400'}`} />
                            No presento restricciones alimentarias
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggleSelect(true)}
                            className={`flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                                estaExpandido
                                    ? 'bg-indigo-50 border-indigo-250 text-indigo-850 shadow-sm shadow-indigo-100/50'
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-350 hover:bg-neutral-100/50'
                            }`}
                        >
                            <ChefHat className={`w-4 h-4 ${estaExpandido ? 'text-indigo-600' : 'text-neutral-400'}`} />
                            Sí, poseo requerimientos especiales
                        </button>
                    </div>
                </div>

                {estaExpandido && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
                        {catalogo.length > 0 ? (
                            <div className="space-y-5">
                                {dietas.length > 0 && (
                                    <div className="space-y-2.5">
                                        <h4 className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block ml-1">
                                            Dietas y Preferencias Generales
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {dietas.map(cat => {
                                                const isSelected = !!persona.restriccionesSeleccionadas[cat.idRestriccion];
                                                return (
                                                    <button
                                                        key={cat.idRestriccion}
                                                        type="button"
                                                        onClick={() => onToggleRestriccion(cat.idRestriccion)}
                                                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none
                                                            ${isSelected
                                                                ? 'bg-indigo-50 border-indigo-250 text-indigo-700 shadow-sm shadow-indigo-100'
                                                                : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-750'}`}
                                                    >
                                                        {cat.nombre}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {alergias.length > 0 && (
                                    <div className="space-y-2.5 pt-1">
                                        <h4 className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block ml-1">
                                            Alergias e Intolerancias Médicas
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {alergias.map(cat => {
                                                const isSelected = !!persona.restriccionesSeleccionadas[cat.idRestriccion];
                                                return (
                                                    <button
                                                        key={cat.idRestriccion}
                                                        type="button"
                                                        onClick={() => onToggleRestriccion(cat.idRestriccion)}
                                                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none
                                                            ${isSelected
                                                                ? 'bg-indigo-50 border-indigo-250 text-indigo-700 shadow-sm shadow-indigo-100'
                                                                : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-750'}`}
                                                    >
                                                        {cat.nombre}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 italic">No se pudo cargar el catálogo de restricciones.</p>
                        )}

                        {Object.values(persona.restriccionesSeleccionadas).map(r => {
                            const cat = catalogo.find(c => c.idRestriccion === r.idRestriccion);
                            if (cat?.categoria === 'ALERGIA' || cat?.codigo === 'CELIACO') {
                                return (
                                    <div 
                                        key={r.idRestriccion} 
                                        className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4 animate-in slide-in-from-top-2 duration-300"
                                    >
                                        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                                            <HeartPulse className="w-4 h-4" /> Detalle de Gravedad: {cat.nombre}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Nivel de Severidad</label>
                                                <select
                                                    value={r.severidad}
                                                    onChange={e => onUpdateRestriccion(r.idRestriccion, 'severidad', e.target.value)}
                                                    className="w-full p-3 rounded-xl bg-white border border-amber-200 text-amber-800 text-xs outline-none focus:border-amber-500 cursor-pointer"
                                                >
                                                    <option value="L">Leve (Tolerancia a trazas / Preferencia)</option>
                                                    <option value="M">Media (No debe contener el ingrediente)</option>
                                                    <option value="G">Grave (Peligro de shock / Contaminación cruzada)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Detalle o Ingrediente</label>
                                                <input
                                                    placeholder="Ej. Nueces, maní, mariscos..."
                                                    value={r.observaciones}
                                                    onChange={e => onUpdateRestriccion(r.idRestriccion, 'observaciones', e.target.value)}
                                                    className="w-full p-3 rounded-xl bg-white border border-amber-200 text-amber-800 text-xs outline-none focus:border-amber-500 placeholder:text-amber-350"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">
                                Otras aclaraciones alimentarias (opcional)
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Ej: No consumo picante, prefiero menú sin lactosa, etc."
                                value={persona.alimentacionDetalle}
                                onChange={e => onUpdateAlimentacionDetalle(e.target.value)}
                                className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-neutral-800 text-sm outline-none resize-none placeholder:text-neutral-400"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Renders ---
    if (step === 'VERIFYING' || step === 'LOADING') {
        return (
            <div className="min-h-screen bg-[#faf9f5] text-neutral-850 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                {/* Ambient lights */}
                <div className="absolute w-72 h-72 rounded-full bg-indigo-100/40 blur-3xl animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center">
                    {/* Animated loading circle */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-400 border-r-indigo-400/40 animate-spin" />
                        <div className="w-12 h-12 rounded-full bg-indigo-50/70 flex items-center justify-center border border-indigo-100 backdrop-blur-md">
                            <Calendar className="w-6 h-6 text-indigo-500 animate-pulse" />
                        </div>
                    </div>
                    
                    <h2 className="mt-8 text-xl font-bold tracking-tight text-neutral-800">Eventia</h2>
                    <p className="mt-2 text-sm text-neutral-500 font-medium tracking-wide animate-pulse">
                        {step === 'VERIFYING' ? 'Validando tu invitación exclusiva...' : 'Procesando tus respuestas...'}
                    </p>
                </div>
                {renderPreviewBar()}
            </div>
        );
    }

    if (step === 'ERROR') {
        return (
            <div className="min-h-screen bg-[#faf9f5] text-neutral-850 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute w-72 h-72 rounded-full bg-red-100/30 blur-3xl" />
                
                <div className="relative z-10 max-w-md w-full p-8 rounded-3xl border border-neutral-200/60 bg-white shadow-sm backdrop-blur-xl flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 border border-red-100">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-neutral-850 mb-2 tracking-tight">Ocurrió un inconveniente</h1>
                    <p className="text-neutral-500 text-sm mb-8 leading-relaxed">{errorMsg || 'No pudimos verificar tu invitación en este momento.'}</p>
                    <button 
                        onClick={() => verificarEstado()} 
                        className="w-full py-4 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 active:scale-[0.98] transition-all cursor-pointer shadow-md"
                    >
                        Reintentar verificación
                    </button>
                </div>
                {renderPreviewBar()}
            </div>
        );
    }

    if (step === 'SUCCESS') {
        const integrantesConfirmados = resumenRsvp?.integrantes?.filter(
            i => i.rsvpEstado === 'Y' && i.qrToken
        ) || [];

        return (
            <div className="min-h-screen bg-[#faf9f5] text-neutral-800 flex flex-col items-center p-6 md:py-20 relative overflow-x-hidden font-sans">
                {/* Ambient background */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-indigo-100/30 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-100/30 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
                </div>

                <div className="max-w-2xl w-full mx-auto relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-md shadow-emerald-100 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-center mb-3 text-neutral-800">
                        Confirmación Registrada
                    </h1>

                    <p className="text-neutral-500 text-center max-w-md mb-10 text-sm md:text-base leading-relaxed">
                        {integrantesConfirmados.length > 0
                            ? '¡Ya tienes tus accesos listos! Guarda o descarga tus pases QR para el ingreso al evento:'
                            : 'Gracias por tu respuesta. Ya registramos tus preferencias y respuestas correctamente.'}
                    </p>

                    {integrantesConfirmados.length > 0 && (
                        <div className="w-full space-y-6 animate-in fade-in duration-500">
                            {integrantesConfirmados.map((integrante) => (
                                <div 
                                    key={integrante.idInvitado} 
                                    className="w-full relative rounded-3xl border border-neutral-200/60 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-stretch justify-between overflow-hidden shadow-sm transition-all duration-300 hover:border-neutral-300"
                                >
                                    {/* Ticket left/main info section */}
                                    <div className="p-6 flex-1 flex flex-col justify-between text-center sm:text-left space-y-6 relative">
                                        <div className="space-y-3">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                integrante.esTitularGrupo
                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                    : 'bg-neutral-50 text-neutral-500 border border-neutral-200/60'
                                            }`}>
                                                {integrante.esTitularGrupo ? 'Invitado Principal' : 'Acompañante'}
                                            </span>
                                            
                                            <h2 className="text-2xl font-bold text-neutral-800 tracking-tight leading-tight">
                                                {integrante.nombreCompleto}
                                            </h2>
                                            
                                            {integrante.mesaNombre && (
                                                <div className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200/60 px-3 py-1 rounded-xl">
                                                    <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                                                    Mesa Asignada: <strong className="text-neutral-850">{integrante.mesaNombre}</strong>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDownloadQr(integrante.qrToken!, integrante.nombreCompleto)}
                                            className="hidden sm:flex w-fit items-center gap-2 py-3 px-5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold text-xs active:scale-[0.98] transition-all shadow-sm mt-auto cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar Pase QR
                                        </button>
                                    </div>

                                    {/* Ticket divider dashed line (VIP Ticket stub effect) */}
                                    <div className="relative flex sm:flex-col items-center justify-center py-2 sm:py-0 shrink-0">
                                        {/* Left/Top cut circle */}
                                        <div className="absolute top-0 sm:top-[-10px] left-1/2 sm:left-auto sm:right-[-10px] w-5 h-5 bg-[#faf9f5] rounded-full border border-neutral-200/60 z-20 translate-x-[-50%] sm:translate-x-0" />
                                        
                                        {/* Dash line */}
                                        <div className="w-full sm:w-[1px] h-[1px] sm:h-full border-t sm:border-l border-dashed border-neutral-200" />
                                        
                                        {/* Right/Bottom cut circle */}
                                        <div className="absolute bottom-0 sm:bottom-[-10px] left-1/2 sm:left-auto sm:left-[-10px] w-5 h-5 bg-[#faf9f5] rounded-full border border-neutral-200/60 z-20 translate-x-[-50%] sm:translate-x-0" />
                                    </div>

                                    {/* Ticket right QR stub section */}
                                    <div className="p-6 bg-neutral-50/50 flex flex-col items-center justify-center gap-4 shrink-0 sm:w-[220px]">
                                        <div className="bg-white rounded-2xl p-2.5 shadow-sm flex items-center justify-center shrink-0 border border-neutral-200/50">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(integrante.qrToken!)}`}
                                                alt={`QR de ingreso para ${integrante.nombreCompleto}`}
                                                width={140}
                                                height={140}
                                                className="rounded-xl"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleDownloadQr(integrante.qrToken!, integrante.nombreCompleto)}
                                            className="flex sm:hidden w-full items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold text-sm active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar Pase QR
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
                            <div className="w-full mt-16 pt-12 border-t border-neutral-200/60 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-black text-neutral-800 flex items-center justify-center sm:justify-start gap-2 tracking-tight">
                                        <Users className="w-6 h-6 text-indigo-500" />
                                        Compañeros de Grupo Pendientes
                                    </h2>
                                    <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto sm:mx-0">
                                        Tu grupo cuenta con cupos pendientes por definir. Podés agregarlos ahora o cerrar el grupo si no van a asistir más personas.
                                    </p>
                                </div>

                                {/* Resumen de Cupos */}
                                <div className="p-5 rounded-3xl border border-neutral-200/60 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Te quedan por definir:</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {resumenRsvp.adultosDisponibles !== undefined && resumenRsvp.adultosDisponibles > 0 && (
                                                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-400" /> +{adultosRestantes} Adulto{adultosRestantes !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {resumenRsvp.menoresDisponibles !== undefined && resumenRsvp.menoresDisponibles > 0 && (
                                                <span className="text-sm font-bold text-pink-600 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-pink-400" /> +{menoresRestantes} Menor{menoresRestantes !== 1 ? 'es' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex items-center gap-2.5 flex-wrap sm:shrink-0">
                                        {adultosRestantes > 0 && isFeatureActiva('RSVP_ACOMPANIANTES') && (
                                            <button
                                                type="button"
                                                onClick={addNuevoAcompananteAdulto}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100/50 text-xs font-bold active:scale-[0.98] transition-all cursor-pointer"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Agregar Adulto
                                            </button>
                                        )}
                                        {menoresRestantes > 0 && isFeatureActiva('RSVP_ACOMPANIANTES') && (
                                            <button
                                                type="button"
                                                onClick={addNuevoAcompananteMenor}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-100/50 text-xs font-bold active:scale-[0.98] transition-all cursor-pointer"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Agregar Menor
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleCerrarGrupo}
                                            disabled={submittingCerrarGrupo}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200/50 text-xs font-bold active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            <div key={idx} className="relative rounded-3xl border border-neutral-200/60 bg-white p-6 space-y-6 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                                                            persona.rolEvento === 'A'
                                                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                                : 'bg-pink-50 text-pink-600 border border-pink-100'
                                                        }`}>
                                                            {persona.rolEvento === 'A' ? <User className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-xs font-bold text-neutral-800 tracking-wide block">
                                                            {persona.rolEvento === 'A' ? 'Nuevo Adulto' : 'Nuevo Menor'}
                                                        </span>
                                                    </div>

                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeNuevoAcompanante(idx)}
                                                        className="p-2 rounded-xl text-neutral-450 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Nombre</label>
                                                        <input 
                                                            required 
                                                            value={persona.nombre} 
                                                            onChange={e => updateNuevoAcompanante(idx, 'nombre', e.target.value)}
                                                            className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400" 
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Apellido</label>
                                                        <input 
                                                            required 
                                                            value={persona.apellido} 
                                                            onChange={e => updateNuevoAcompanante(idx, 'apellido', e.target.value)}
                                                            className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400" 
                                                        />
                                                    </div>
                                                </div>

                                                {persona.rolEvento === 'A' && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">
                                                                <Mail className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                                                                Email<span className="text-red-400 ml-0.5">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                required
                                                                value={persona.email}
                                                                onChange={e => updateNuevoAcompanante(idx, 'email', e.target.value)}
                                                                className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">
                                                                <Phone className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                                                                Celular<span className="text-red-400 ml-0.5">*</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                required
                                                                value={persona.celular}
                                                                onChange={e => updateNuevoAcompanante(idx, 'celular', e.target.value)}
                                                                className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Alimentación / Restricciones */}
                                                {isFeatureActiva('RESTRICCIONES_ALIMENTARIAS') && (
                                                    renderSeccionAlimentacion(persona, idx, 'nuevo')
                                                )}

                                                {/* Sugerencias de música para acompañantes adicionales */}
                                                {isFeatureActiva('MUSICA_SUGERENCIAS') && (
                                                    <div className="space-y-4 pt-4 border-t border-neutral-100">
                                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Music className="w-4 h-4 text-violet-500" /> ¿Qué tema no debería faltar en la fiesta?
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1.5 ml-1">Título de la Canción</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: Billie Jean"
                                                                    value={persona.sugerenciaTema || ''}
                                                                    onChange={e => updateNuevoAcompanante(idx, 'sugerenciaTema', e.target.value)}
                                                                    className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1.5 ml-1">Artista / Banda</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: Michael Jackson"
                                                                    value={persona.sugerenciaArtista || ''}
                                                                    onChange={e => updateNuevoAcompanante(idx, 'sugerenciaArtista', e.target.value)}
                                                                    className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1.5 ml-1">Link de Spotify / YouTube (opcional)</label>
                                                            <input
                                                                type="url"
                                                                placeholder="Ej: https://open.spotify.com/..."
                                                                value={persona.sugerenciaLink || ''}
                                                                onChange={e => updateNuevoAcompanante(idx, 'sugerenciaLink', e.target.value)}
                                                                className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {errorNuevosMsg && (
                                            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-500 text-xs font-semibold animate-in fade-in">
                                                {errorNuevosMsg}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submittingNuevos}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 text-white font-black text-lg hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingNuevos ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    Confirmar Acompañante{nuevosAcompanantes.length !== 1 ? 's' : ''}
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
                            <div className="w-full mt-16 pt-12 border-t border-neutral-200/60 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-neutral-800 flex items-center justify-center sm:justify-start gap-2 tracking-tight">
                                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                            Autorizados para Retiro de Menores
                                        </h2>
                                        <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto sm:mx-0">
                                            Registra a los adultos autorizados para retirar a los menores del predio. Cada uno contará con un código QR inmutable para validar su identidad en portería.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-bold text-xs shadow-sm active:scale-[0.98] transition-all cursor-pointer shrink-0"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Autorizar Adulto
                                    </button>
                                </div>

                                {loadingAutorizados ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-emerald-600">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                        <p className="text-xs text-neutral-500 font-bold tracking-widest uppercase">Cargando autorizaciones...</p>
                                    </div>
                                ) : autorizados.length === 0 ? (
                                    <div className="p-8 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/30 text-center flex flex-col items-center justify-center">
                                        <p className="text-sm font-semibold text-neutral-600">Sin autorizados registrados aún</p>
                                        <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">Solo los responsables familiares principales (padres/tutores) podrán realizar los retiros por defecto.</p>
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
                                                    className="rounded-3xl border border-neutral-200/60 bg-white flex flex-col justify-between overflow-hidden shadow-sm"
                                                >
                                                    <div className="p-5 flex items-start justify-between gap-3 border-b border-neutral-100">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                                <ShieldCheck className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-neutral-800 text-base leading-tight">{nombreAutorizado}</h4>
                                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 mt-1 border border-emerald-100">
                                                                    {relacion}
                                                                </span>
                                                                <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-2 font-mono">
                                                                    <Phone className="w-3.5 h-3.5 text-neutral-400" /> {telefonoAutorizado}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEliminarAutorizado(idAutorizacion, nombreAutorizado)}
                                                            className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shrink-0"
                                                            title="Revocar autorización"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="p-5 bg-neutral-50/50 flex flex-col items-center gap-4">
                                                        <div className="bg-white rounded-2xl p-2 border border-neutral-200/60 flex items-center justify-center shadow-sm">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrToken || '')}`}
                                                                alt={`QR para ${nombreAutorizado}`}
                                                                width={120}
                                                                height={120}
                                                                className="rounded-lg bg-white p-1 border border-neutral-100"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadQr(qrToken || '', nombreAutorizado)}
                                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/40 font-bold text-xs shadow-sm transition-all cursor-pointer"
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="w-full max-w-md p-6 rounded-3xl border border-neutral-200 bg-white shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                                {/* Ambient glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100">
                                    <h3 className="text-lg font-black text-neutral-850 flex items-center gap-2 tracking-tight">
                                        <PlusCircle className="w-5 h-5 text-emerald-600" />
                                        Autorizar Adulto
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAuthModalOpen(false);
                                            setErrorAuthMsg(null);
                                        }}
                                        className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-750 hover:bg-neutral-50 transition-all cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleAgregarAutorizado} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5 ml-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej: Juan Pérez"
                                            value={authNombre}
                                            onChange={(e) => setAuthNombre(e.target.value)}
                                            className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400 focus:bg-white"
                                            disabled={submittingAuth}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5 ml-1">Relación / Parentesco</label>
                                        <select
                                            value={authRelacion}
                                            onChange={(e) => setAuthRelacion(e.target.value)}
                                            className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-neutral-850 text-sm outline-none cursor-pointer focus:bg-white"
                                            disabled={submittingAuth}
                                        >
                                            <option value="Madre">Madre</option>
                                            <option value="Padre">Padre</option>
                                            <option value="Tío/a">Tío/a</option>
                                            <option value="Abuelo/a">Abuelo/a</option>
                                            <option value="Tutor Legal">Tutor Legal</option>
                                            <option value="Niñero/a">Niñero/a</option>
                                            <option value="Chofer">Chofer</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5 ml-1">Teléfono Celular</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Ej: +54 9 11 2345 6789"
                                            value={authCelular}
                                            onChange={(e) => setAuthCelular(e.target.value)}
                                            className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-neutral-800 text-sm outline-none font-mono placeholder:text-neutral-400 focus:bg-white"
                                            disabled={submittingAuth}
                                        />
                                        <span className="text-[10px] text-neutral-450 mt-1 block">Preferentemente con código de país.</span>
                                    </div>

                                    {errorAuthMsg && (
                                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-500 text-xs font-semibold animate-in fade-in">
                                            {errorAuthMsg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 mt-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                {renderPreviewBar()}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf9f5] text-neutral-800 selection:bg-indigo-100 relative overflow-x-hidden font-sans">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-indigo-100/30 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-100/30 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 relative z-10">
                {/* Header / Envelope card */}
                <div className="relative w-full rounded-3xl border border-neutral-200 bg-white p-8 text-center mb-8 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="absolute inset-2 rounded-[22px] border border-dashed border-neutral-200 pointer-events-none" />
                    
                    <span className="relative z-10 px-3 py-1 rounded-full border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50/60 backdrop-blur-md mb-6 inline-block">
                        Confirma tu Asistencia
                    </span>

                    {invitacion?.saludo && (
                        <p className="text-indigo-650 text-indigo-600 text-sm font-semibold tracking-wide mb-2 uppercase">{invitacion.saludo}</p>
                    )}
                    <h1 className="text-3xl md:text-4.5xl font-serif font-black tracking-tight text-neutral-800 mb-3 leading-tight">
                        {step === 'RSVP' ? "¡Estás invitado!" : "¡Hola de nuevo!"}
                    </h1>
                    {invitacion?.anfitriones && (
                        <p className="text-neutral-500 mt-2 text-sm">
                            De parte de <span className="text-neutral-800 font-semibold tracking-wide">{invitacion.anfitriones}</span>
                        </p>
                    )}
                    {invitacion?.mensajeBienvenida && (
                        <div className="mt-6 pt-6 border-t border-neutral-100 max-w-md mx-auto">
                            <p className="text-neutral-600 text-sm italic font-serif leading-relaxed">
                                &ldquo;{invitacion.mensajeBienvenida}&rdquo;
                            </p>
                        </div>
                    )}
                </div>

                {/* --- Agenda del Evento --- */}
                {step === 'RSVP' && invitacion?.agenda && invitacion.agenda.length > 0 && (() => {
                    const agendaFiltrada = idAccesoNum
                        ? invitacion.agenda.filter(a => a.idAcceso === idAccesoNum)
                        : invitacion.agenda;
                    const agendaMostrar = agendaFiltrada.length > 0 ? agendaFiltrada : invitacion.agenda;

                    return (
                        <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Calendar className="w-4 h-4 text-indigo-550 text-indigo-500" /> Agenda & Detalles de Acceso
                            </h2>
                            {agendaMostrar.map((acceso, aIdx) => (
                                <div key={aIdx} className="rounded-3xl border border-neutral-200/60 bg-white overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-neutral-800 tracking-wide">{acceso.nombreAcceso}</h3>
                                        <span className="text-[10px] bg-neutral-100 border border-neutral-200/60 px-2.5 py-0.5 rounded-full text-neutral-500 font-medium">Programa</span>
                                    </div>
                                    <div className="p-6 relative">
                                        {/* Timeline vertical bar */}
                                        <div className="absolute left-10 top-8 bottom-8 w-[2px] bg-gradient-to-b from-indigo-200/50 via-purple-200/50 to-transparent" />
                                        
                                        <div className="space-y-8">
                                            {acceso.tramos.map((tramo, tIdx) => {
                                                const isCeremony = tramo.nombre.toLowerCase().includes('ceremonia') || tramo.nombre.toLowerCase().includes('boda') || tramo.nombre.toLowerCase().includes('civil');
                                                const isParty = tramo.nombre.toLowerCase().includes('fiesta') || tramo.nombre.toLowerCase().includes('baile') || tramo.nombre.toLowerCase().includes('show');
                                                const isDinner = tramo.nombre.toLowerCase().includes('cena') || tramo.nombre.toLowerCase().includes('comida') || tramo.nombre.toLowerCase().includes('recepcion') || tramo.nombre.toLowerCase().includes('recepción');
                                                
                                                let TramoIcon = Clock;
                                                if (isCeremony) TramoIcon = Heart;
                                                if (isParty) TramoIcon = Music;
                                                if (isDinner) TramoIcon = ChefHat;

                                                return (
                                                    <div key={tIdx} className="relative flex items-start gap-6 group">
                                                        <div className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                                                            <TramoIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-1">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                                <p className="font-bold text-sm text-neutral-850 group-hover:text-indigo-600 transition-colors">{tramo.nombre}</p>
                                                            </div>
                                                            {tramo.descripcion && (
                                                                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{tramo.descripcion}</p>
                                                            )}
                                                            {tramo.lugar && (
                                                                <a 
                                                                    href={tramo.direccion ? `https://maps.google.com/?q=${encodeURIComponent(tramo.lugar + ' ' + tramo.direccion)}` : '#'} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-[11px] text-neutral-400 hover:text-indigo-600 mt-2 flex items-center gap-1.5 w-fit transition-colors group/map"
                                                                >
                                                                    <MapPin className="w-3.5 h-3.5 text-neutral-400 group-hover/map:text-indigo-500 transition-colors" /> 
                                                                    <span className="underline decoration-neutral-300 hover:decoration-indigo-550 hover:decoration-indigo-500">{tramo.lugar}{tramo.direccion ? ` (${tramo.direccion})` : ''}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* --- PASO 1: Formulario RSVP --- */}
                {step === 'RSVP' && (
                    <form onSubmit={handleRsvpSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Asistencia Toggle - Large interactive cards */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block px-1">
                                ¿Nos acompañas en este día especial?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setGlobalAsiste(true)}
                                    className={`relative overflow-hidden p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-4 group ${
                                        globalAsiste === true 
                                            ? 'bg-emerald-50/70 border-emerald-250 text-emerald-850 shadow-md shadow-emerald-100' 
                                            : 'bg-white border-neutral-200/60 hover:border-neutral-300 hover:bg-neutral-50/50 text-neutral-800'
                                    }`}
                                >
                                    {globalAsiste === true && (
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
                                    )}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                        globalAsiste === true 
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-110' 
                                            : 'bg-neutral-100 text-neutral-450 group-hover:text-neutral-600'
                                    }`}>
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base tracking-wide ${globalAsiste === true ? 'text-emerald-800' : 'text-neutral-700'}`}>¡Sí, confirmo asistencia!</p>
                                        <p className={`text-xs mt-0.5 leading-relaxed ${globalAsiste === true ? 'text-emerald-650' : 'text-neutral-400'}`}>Allí estaré para celebrar juntos.</p>
                                    </div>
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => setGlobalAsiste(false)}
                                    className={`relative overflow-hidden p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-4 group ${
                                        globalAsiste === false 
                                            ? 'bg-rose-50/70 border-rose-250 text-rose-850 shadow-md shadow-rose-100' 
                                            : 'bg-white border-neutral-200/60 hover:border-neutral-300 hover:bg-neutral-50/50 text-neutral-800'
                                    }`}
                                >
                                    {globalAsiste === false && (
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />
                                    )}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                        globalAsiste === false 
                                            ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-110' 
                                            : 'bg-neutral-100 text-neutral-450 group-hover:text-neutral-600'
                                    }`}>
                                        <MailOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base tracking-wide ${globalAsiste === false ? 'text-rose-800' : 'text-neutral-700'}`}>No podré asistir</p>
                                        <p className={`text-xs mt-0.5 leading-relaxed ${globalAsiste === false ? 'text-rose-650' : 'text-neutral-400'}`}>Lo lamento, esta vez no podré ir.</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {globalAsiste !== null && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* --- Personas del Grupo --- */}
                                <div className="space-y-4">
                                    <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Users className="w-4 h-4 text-indigo-550 text-indigo-500" />
                                        {invitacion?.nombreGrupo ? `Grupo: ${invitacion.nombreGrupo}` : 'Datos de los Invitados'}
                                    </h2>

                                    {personas.map((persona, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`relative rounded-3xl border p-6 space-y-6 backdrop-blur-md transition-all duration-300 ${
                                                persona.asiste || idx === 0
                                                    ? 'bg-white border-neutral-200/60 shadow-sm' 
                                                    : 'bg-neutral-50/50 border-neutral-200/30 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                                                        persona.rolEvento === 'A'
                                                            ? 'bg-indigo-50 text-indigo-650 text-indigo-600 border border-indigo-100'
                                                            : 'bg-pink-50 text-pink-650 text-pink-600 border border-pink-100'
                                                    }`}>
                                                        {persona.rolEvento === 'A' ? <User className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-neutral-800 tracking-wide block">
                                                            {idx === 0 ? 'Titular del Grupo' : persona.rolEvento === 'A' ? 'Adulto Acompañante' : 'Menor Acompañante'}
                                                        </span>
                                                        {persona.isNew && (
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 mt-0.5 block">Nuevo Agregado</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Individual asiste toggle (only when global is "yes") */}
                                                    {globalAsiste === true && idx > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePersona(idx, 'asiste', !persona.asiste)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                                                persona.asiste
                                                                    ? 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
                                                                    : 'bg-red-50 border-red-250 text-red-700 hover:bg-red-100'
                                                            }`}
                                                        >
                                                            {persona.asiste ? 'Asistirá' : 'No asistirá'}
                                                        </button>
                                                    )}
                                                    {persona.isNew && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removePersona(idx)}
                                                            className="p-2 rounded-xl text-neutral-450 hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Nombre</label>
                                                    <input 
                                                        required 
                                                        value={persona.nombre} 
                                                        onChange={e => updatePersona(idx, 'nombre', e.target.value)}
                                                        placeholder="Ej. Juan"
                                                        className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Apellido</label>
                                                    <input 
                                                        required 
                                                        value={persona.apellido} 
                                                        onChange={e => updatePersona(idx, 'apellido', e.target.value)}
                                                        placeholder="Ej. Pérez"
                                                        className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* Email & Celular — adultos; required solo para el titular */}
                                            {persona.rolEvento === 'A' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">
                                                            <Mail className="w-3 h-3 inline mr-1 text-indigo-550 text-indigo-500" />
                                                            Email{idx === 0 && <span className="text-red-400 ml-0.5">*</span>}
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required={idx === 0 && globalAsiste === true}
                                                            value={persona.email}
                                                            onChange={e => updatePersona(idx, 'email', e.target.value)}
                                                            placeholder="juanperez@ejemplo.com"
                                                            className={`w-full p-3.5 rounded-2xl bg-neutral-50 border transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400 focus:bg-white
                                                                focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400
                                                                ${idx === 0 && globalAsiste === true && !persona.email.trim() ? 'border-red-400 bg-red-50/10' : 'border-neutral-200'}`}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">
                                                            <Phone className="w-3 h-3 inline mr-1 text-indigo-550 text-indigo-500" />
                                                            Celular{idx === 0 && <span className="text-red-400 ml-0.5">*</span>}
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            required={idx === 0 && globalAsiste === true}
                                                            value={persona.celular}
                                                            onChange={e => updatePersona(idx, 'celular', e.target.value)}
                                                            placeholder="+54 9 11 2345 6789"
                                                            className={`w-full p-3.5 rounded-2xl bg-neutral-50 border transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400 focus:bg-white
                                                                focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400
                                                                ${idx === 0 && globalAsiste === true && !persona.celular.trim() ? 'border-red-400 bg-red-50/10' : 'border-neutral-200'}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Sección Alimentación (solo si asiste) ── */}
                                            {(globalAsiste === true && (idx === 0 || persona.asiste)) && isFeatureActiva('RESTRICCIONES_ALIMENTARIAS') && (
                                                renderSeccionAlimentacion(persona, idx, 'main')
                                            )}
                                        </div>
                                    ))}

                                    {/* Buttons to add people if there are cupos */}
                                    {globalAsiste === true && (canAddAdulto || canAddMenor) && isFeatureActiva('RSVP_ACOMPANIANTES') && (
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            {canAddAdulto && (
                                                <button 
                                                    type="button" 
                                                    onClick={addPersonaAdulto}
                                                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-indigo-650 text-indigo-600 text-xs font-bold active:scale-[0.98] transition-all border border-indigo-100/50 cursor-pointer"
                                                >
                                                    <PlusCircle className="w-4 h-4" /> Agregar Adulto
                                                    <span className="text-[10px] text-neutral-550 text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md font-mono border border-neutral-200/40">
                                                        ({invitacion!.cuposAdultosRestantes - personas.filter(p => p.isNew && p.rolEvento === 'A').length} disp.)
                                                    </span>
                                                </button>
                                            )}
                                            {canAddMenor && (
                                                <button 
                                                    type="button" 
                                                    onClick={addPersonaMenor}
                                                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-650 text-pink-660 text-pink-600 text-xs font-bold active:scale-[0.98] transition-all border border-pink-100/50 cursor-pointer"
                                                >
                                                    <PlusCircle className="w-4 h-4" /> Agregar Menor
                                                    <span className="text-[10px] text-neutral-550 text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md font-mono border border-neutral-200/40">
                                                        ({invitacion!.cuposMenoresRestantes - personas.filter(p => p.isNew && p.rolEvento === 'N').length} disp.)
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Mensaje al Organizador y Sugerencia de música */}
                                <div className="space-y-6">
                                    {globalAsiste === true && isFeatureActiva('MUSICA_SUGERENCIAS') && (
                                        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 space-y-6 shadow-sm relative overflow-hidden">
                                            {/* Ambient record shadow */}
                                            <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-violet-100/30 rounded-full blur-2xl pointer-events-none" />
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                                                    <Music className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-neutral-800 tracking-wide">¿Qué tema no debería faltar en la pista?</h3>
                                                    <p className="text-xs text-neutral-500">Sugiérenos tus canciones favoritas para bailar toda la noche.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Título de la Canción</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Billie Jean, La Bilirrubina..."
                                                        value={personas[0]?.sugerenciaTema || ''}
                                                        onChange={e => updatePersona(0, 'sugerenciaTema', e.target.value)}
                                                        className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400 focus:bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Artista / Banda</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Michael Jackson, Juan Luis Guerra..."
                                                        value={personas[0]?.sugerenciaArtista || ''}
                                                        onChange={e => updatePersona(0, 'sugerenciaArtista', e.target.value)}
                                                        className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400 focus:bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">Link de Spotify o YouTube (opcional)</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://open.spotify.com/track/..."
                                                    value={personas[0]?.sugerenciaLink || ''}
                                                    onChange={e => updatePersona(0, 'sugerenciaLink', e.target.value)}
                                                    className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-neutral-800 text-sm outline-none placeholder:text-neutral-400 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block ml-1">
                                            <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-indigo-550 text-indigo-500" /> Mensaje para los Anfitriones
                                        </label>
                                        <textarea 
                                            rows={3} 
                                            value={mensajeGrupo} 
                                            onChange={e => setMensajeGrupo(e.target.value)}
                                            placeholder="Escribe un mensaje o dedicatoria..."
                                            className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-neutral-855 text-neutral-800 outline-none resize-none placeholder:text-neutral-400 focus:bg-white" 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 text-white font-black text-lg hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md cursor-pointer animate-in fade-in"
                                >
                                    Confirmar {globalAsiste ? 'Asistencia' : 'Inasistencia'} <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
            {renderPreviewBar()}
        </div>
    );
}
