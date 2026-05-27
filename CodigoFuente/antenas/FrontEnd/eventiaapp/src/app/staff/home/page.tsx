'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffAuth, isEventActiveToday } from '@/src/context/StaffAuthContext';
import {
    Loader2,
    QrCode,
    Search,
    UserCheck,
    Users,
    Check,
    ChefHat,
    Utensils,
    AlertTriangle,
    SearchCode,
    Sparkles,
    Gift,
    RefreshCw,
    ArrowLeftRight,
    TrendingUp,
    Clock,
    X,
    Calendar,
    Flame,
    ClipboardList,
    Plus,
    HeartPulse,
    Activity,
    ShieldAlert,
    FileText,
    PhoneCall,
    Music,
    Wine,
    Sliders
} from 'lucide-react';

// ==========================================
// PORTAL OPERATIVO DE STAFF - DATOS EN TIEMPO REAL
// ==========================================

export default function StaffHomePage() {
    const { token, user, isLoading, activeRol, selectRol } = useStaffAuth();
    const router = useRouter();

    // Redirección al login si no hay token
    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/staff/login');
        }
    }, [isLoading, token, router]);

    // Redirección si necesita seleccionar evento primero
    useEffect(() => {
        if (!isLoading && user) {
            const allEvents = user.eventosDisponibles || [];
            const activeEvents = allEvents.filter(e => isEventActiveToday(e));
            
            if (activeEvents.length === 0) {
                // No hay eventos para hoy, redireccionamos para que vea los futuros
                router.replace('/staff/seleccionar-evento');
            } else if (activeEvents.length > 1 && !user.idEvento) {
                // Hay múltiples eventos y ninguno seleccionado
                router.replace('/staff/seleccionar-evento');
            }
        }
    }, [isLoading, user, router]);

    // Redirección si tiene múltiples roles y no seleccionó ninguno
    useEffect(() => {
        if (!isLoading && user && !activeRol) {
            if (user.rolesEvento && user.rolesEvento.length > 1) {
                router.replace('/staff/seleccionar-funcion');
            } else if (user.rolesEvento && user.rolesEvento.length === 1) {
                selectRol(user.rolesEvento[0]);
            }
        }
    }, [isLoading, user, activeRol, router, selectRol]);

    // ==========================================
    // ESTADOS COMUNES Y ESCÁNER REAL
    // ==========================================
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanType, setScanType] = useState<'ENTRADA' | 'RACION' | 'BENEFICIO'>('ENTRADA');
    const [loadingAction, setLoadingAction] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [scannerInstance, setScannerInstance] = useState<any>(null);

    // ==========================================
    // ESTADOS ROL: PUERTA / RECEPTOR
    // ==========================================
    const [participantes, setParticipantes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [manualTicket, setManualTicket] = useState('');
    const [manualNombre, setManualNombre] = useState('');
    const [manualApellido, setManualApellido] = useState('');

    // ==========================================
    // ESTADOS ROL: COCINA
    // ==========================================
    const [alergias, setAlergias] = useState<any[]>([]);
    const [searchAlergias, setSearchAlergias] = useState('');
    const [racionesServidas, setRacionesServidas] = useState(0);
    const [racionesTotales] = useState(250);

    // ==========================================
    // ESTADOS ROL: OPERADOR / BENEFICIOS
    // ==========================================
    const [beneficios, setBeneficios] = useState<any[]>([]);
    const [searchBeneficios, setSearchBeneficios] = useState('');
    const [manualCouponCode, setManualCouponCode] = useState('');

    // ==========================================
    // ESTADOS ROL: SALUD / MEDICO
    // ==========================================
    const [saludPanel, setSaludPanel] = useState<any[]>([]);
    const [saludFichas, setSaludFichas] = useState<any[]>([]);
    const [saludAcciones, setSaludAcciones] = useState<any[]>([]);
    const [searchSalud, setSearchSalud] = useState('');
    const [saludTab, setSaludTab] = useState<'PANEL' | 'FICHAS' | 'ACCIONES'>('PANEL');
    const [registroAccionOpen, setRegistroAccionOpen] = useState(false);
    const [selectedInvitadoId, setSelectedInvitadoId] = useState<number | null>(null);
    const [selectedInvitadoNombre, setSelectedInvitadoNombre] = useState('');
    const [tipoAccionSelect, setTipoAccionSelect] = useState('1');
    const [descripcionAccion, setDescripcionAccion] = useState('');
    const [requirioContactoFamilia, setRequirioContactoFamilia] = useState(false);
    const [contactoRealizado, setContactoRealizado] = useState(false);
    const [requiereSeguimiento, setRequiereSeguimiento] = useState(false);
    const [tiposAccion, setTiposAccion] = useState<any[]>([]);

    // ==========================================
    // CARGAR PARTICIPANTES REALES SI EXISTE idEvento
    // ==========================================
    useEffect(() => {
        if (user && user.idEvento) {
            const fetchRealParticipants = async () => {
                try {
                    const res = await fetch(`/api/invitaciones/personas?idEvento=${user.idEvento}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && Array.isArray(data.items)) {
                            // Mapear al formato de participantes esperado por el Front
                            const realList = data.items.map((item: any) => ({
                                id: item.idInvitado,
                                nombre: item.nombre || '',
                                apellido: item.apellido || '',
                                email: item.email || `${item.nombreCompleto?.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                                ticket: item.qrToken || item.rsvpToken || `EV-${item.idInvitado}`,
                                ingresado: !!item.checkinRealizado,
                                categoria: item.accesoNombre || 'General',
                                hora: item.fechaCheckin 
                                    ? new Date(item.fechaCheckin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) 
                                    : '-',
                                idInvitado: item.idInvitado,
                                idAcceso: item.idAcceso,
                                idAccesoLink: item.idAccesoLink || null
                            }));
                            setParticipantes(realList);

                            // Opcional: Cargar alergias reales en cocina si tienen restricciones
                            const realAlergias = data.items
                                .filter((item: any) => item.tieneRestricciones || (item.restricciones && item.restricciones.length > 0))
                                .map((item: any) => ({
                                    id: item.idInvitado,
                                    nombre: item.nombre || '',
                                    apellido: item.apellido || '',
                                    alergia: item.restricciones?.join(', ') || 'Restricción Alimentaria',
                                    nivel: 'CRÍTICO',
                                    racion: 'Menú Especial TACC Free',
                                    verificado: !!item.checkinRealizado
                                }));
                            if (realAlergias.length > 0) {
                                setAlergias(realAlergias);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar participantes del backend:', error);
                }
            };
            fetchRealParticipants();
        }
    }, [user]);

    const currentRolCode = activeRol?.rol_codigo?.toUpperCase() || '';

    // ==========================================
    // CARGAR DATOS DE COCINA REALES (COCINA DIA)
    // ==========================================
    useEffect(() => {
        if (user && user.idEvento && token && (currentRolCode.includes('COCINA') || currentRolCode.includes('COMEDOR'))) {
            const fetchCocinaDia = async () => {
                try {
                    const res = await fetch(`/api/programas/${user.idEvento}/cocina/dia`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            const list = data.map((item: any) => ({
                                id: item.idInvitado || item.id || Math.random(),
                                nombre: item.nombre || '',
                                apellido: item.apellido || '',
                                alergia: item.alergias || item.restricciones?.join(', ') || 'Restricción Alimentaria',
                                nivel: item.nivel || (item.tieneRestricciones ? 'CRÍTICO' : 'MODERADO'),
                                racion: item.racion || 'Menú Especial TACC Free',
                                verificado: !!(item.entregado || item.checkinRealizado)
                            }));
                            setAlergias(list);
                            
                            // Raciones
                            const servidas = list.filter(a => a.verificado).length;
                            setRacionesServidas(servidas);
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar datos reales de cocina:', error);
                }
            };
            fetchCocinaDia();
        }
    }, [user, token, currentRolCode]);

    // ==========================================
    // CARGAR BENEFICIOS REALES PENDIENTES
    // ==========================================
    useEffect(() => {
        if (user && user.idEvento && token && (currentRolCode.includes('OPERADOR') || currentRolCode.includes('BENEFICIOS') || currentRolCode.includes('BARTENDER') || currentRolCode.includes('BAR'))) {
            const fetchBeneficios = async () => {
                try {
                    const res = await fetch(`/api/audiencias-pendientes-manual?idEvento=${user.idEvento}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            const list = data.map((b: any) => ({
                                idBeneficioRegistro: b.idBeneficioRegistro || b.id_beneficio_registro,
                                codigo: b.codigoBeneficio || b.codigo || `BEN-${b.idBeneficioRegistro}`,
                                titular: b.nombreCompleto || b.titular || `${b.nombre} ${b.apellido}`,
                                item: b.nombreBeneficio || b.item || 'Beneficio Especial',
                                estado: b.canjeado ? 'Canjeado' : 'Disponible',
                                fechaCanje: b.fechaCanje || b.fecha_canje || '-'
                             }));
                             setBeneficios(list);
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar beneficios reales:', error);
                }
            };
            fetchBeneficios();
        }
    }, [user, token, currentRolCode]);

    // ==========================================
    // CARGAR DATOS REALES DE SALUD
    // ==========================================
    useEffect(() => {
        if (user && user.idEvento && token && (currentRolCode.includes('SALUD') || currentRolCode.includes('MEDICO') || currentRolCode.includes('ENFERMERO'))) {
            const fetchSaludData = async () => {
                try {
                    // 1. Fetch Panel de salud
                    const resPanel = await fetch(`/api/programas/${user.idEvento}/salud/panel`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resPanel.ok) {
                        const data = await resPanel.json();
                        setSaludPanel(Array.isArray(data) ? data : []);
                    }

                    // 2. Fetch Fichas médicas
                    const resFichas = await fetch(`/api/programas/${user.idEvento}/salud/fichas`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resFichas.ok) {
                        const data = await resFichas.json();
                        setSaludFichas(Array.isArray(data) ? data : []);
                    }

                    // 3. Fetch Timeline de acciones
                    const resAcciones = await fetch(`/api/programas/${user.idEvento}/salud/acciones`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resAcciones.ok) {
                        const data = await resAcciones.json();
                        setSaludAcciones(Array.isArray(data) ? data : []);
                    }

                    // 4. Fetch Tipos de Acción
                    const resTipos = await fetch(`/api/programas/salud/tipos-accion`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resTipos.ok) {
                        const data = await resTipos.json();
                        if (Array.isArray(data)) {
                            setTiposAccion(data);
                            if (data.length > 0) {
                                setTipoAccionSelect(data[0].codigo);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar datos reales de salud:', error);
                }
            };
            fetchSaludData();
        }
    }, [user, token, currentRolCode]);

    // Ciclo de vida y control de cámara física usando html5-qrcode
    useEffect(() => {
        let qrScanner: any = null;
        let isMounted = true;

        if (scannerOpen && !scanResult) {
            // Retraso de 350ms para asegurar montaje de div#qr-reader
            const timer = setTimeout(async () => {
                try {
                    // Importación dinámica para prevenir errores en Next.js (SSR)
                    const { Html5Qrcode } = await import('html5-qrcode');

                    if (!isMounted) return;
                    setCameraError(null);

                    const scanner = new Html5Qrcode("qr-reader");
                    qrScanner = scanner;
                    setScannerInstance(scanner);

                    const scanConfig = {
                        fps: 12,
                        qrbox: (width: number, height: number) => {
                            const size = Math.min(width, height) * 0.75;
                            return { width: size, height: size };
                        },
                        aspectRatio: 1.0
                    };

                    const onScanSuccess = (decodedText: string) => {
                        if (isMounted) {
                            handleRealScanSuccess(decodedText);
                            scanner.stop().catch((err: any) => console.error("Error al detener cámara tras escaneo:", err));
                        }
                    };

                    const onScanError = () => {
                        // Errores de lectura ordinarios se ignoran
                    };

                    try {
                        // 1. Intentar cámara trasera (ideal para personal operando en campo)
                        await scanner.start(
                            { facingMode: "environment" },
                            scanConfig,
                            onScanSuccess,
                            onScanError
                        );
                    } catch (firstErr) {
                        console.warn("Cámara trasera ('environment') no disponible. Reintentando con frontal/webcam...", firstErr);
                        
                        if (isMounted) {
                            try {
                                // 2. Fallback: cámara delantera (útil para notebooks y webcams de escritorio)
                                await scanner.start(
                                    { facingMode: "user" },
                                    scanConfig,
                                    onScanSuccess,
                                    onScanError
                                );
                            } catch (secondErr) {
                                console.warn("Cámara frontal ('user') tampoco disponible. Intentando predeterminada...", secondErr);
                                
                                if (isMounted) {
                                    // 3. Último recurso: iniciar sin restricciones de cámara
                                    await scanner.start(
                                        {},
                                        scanConfig,
                                        onScanSuccess,
                                        onScanError
                                    );
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("Fallo al iniciar escáner QR de cámara:", err);
                    if (isMounted) {
                        const errMsg = String(err).toLowerCase();
                        let msg = "No se pudo acceder a la cámara del dispositivo.";
                        if (errMsg.includes("notallowederror") || errMsg.includes("permission denied")) {
                            msg = "Permiso de cámara denegado. Por favor, habilitalo en tu navegador.";
                        } else if (errMsg.includes("notfounderror") || errMsg.includes("no camera found")) {
                            msg = "No se detectaron cámaras en este dispositivo.";
                        }
                        setCameraError(msg);
                    }
                }
            }, 350);

            return () => {
                isMounted = false;
                clearTimeout(timer);
                if (qrScanner && qrScanner.isScanning) {
                    qrScanner.stop().catch((err: any) => console.error("Error al detener cámara en cleanup:", err));
                }
                setScannerInstance(null);
            };
        }

        return () => {
            isMounted = false;
            setScannerInstance(null);
        };
    }, [scannerOpen, scanResult]);

    // Loader general
    if (isLoading || !user || !activeRol) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">Iniciando panel operativo...</p>
            </div>
        );
    }

    // ==========================================
    // MANEJADORES: RECEPTOR / PUERTA
    // ==========================================
    const handleCheckInManual = async (id: number) => {
        setLoadingAction(true);
        const target = participantes.find(p => p.id === id);

        if (target && user && user.idEvento) {
            try {
                // Registrar el check-in real en la base de datos a través del proxy local
                await fetch('/api/audiencias-checkin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id_evento: user.idEvento,
                        id_invitado: target.idInvitado || target.id,
                        id_acceso: target.idAcceso || 0,
                        id_acceso_link: target.idAccesoLink || null,
                        tipo: 'INGRESO',
                        observaciones: 'Check-in en vivo desde panel staff'
                    })
                });
            } catch (error) {
                console.error('Error al registrar checkin real en servidor:', error);
            }
        }

        // Mantener la actualización de estado local instantánea para el personal
        setParticipantes(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    ingresado: true,
                    hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                };
            }
            return p;
        }));

        // También actualizar el estado en alergias si corresponde
        setAlergias(prev => prev.map(a => {
            if (a.id === id) {
                return { ...a, verificado: true };
            }
            return a;
        }));

        setLoadingAction(false);
    };

    const handleCreateParticipante = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualNombre || !manualApellido) return;

        const newPart = {
            id: participantes.length + 1,
            nombre: manualNombre,
            apellido: manualApellido,
            email: `${manualNombre.toLowerCase()}.${manualApellido.toLowerCase()}@manual.com`,
            ticket: manualTicket || `EV-${Math.floor(10000 + Math.random() * 90000)}`,
            ingresado: true,
            categoria: 'General',
            hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };

        setParticipantes([newPart, ...participantes]);
        setManualNombre('');
        setManualApellido('');
        setManualTicket('');
    };

    // ==========================================
    // MANEJADORES: COCINA
    // ==========================================
    const handleVerifyDiet = (id: number) => {
        setAlergias(prev => prev.map(a => {
            if (a.id === id) {
                if (!a.verificado) {
                    setRacionesServidas(r => Math.min(racionesTotales, r + 1));
                }
                return { ...a, verificado: !a.verificado };
            }
            return a;
        }));
    };

    const handleServirRacionGenerica = () => {
        if (racionesServidas < racionesTotales) {
            setRacionesServidas(r => r + 1);
        }
    };

    // ==========================================
    // MANEJADORES: BENEFICIOS / BAR
    // ==========================================
    const handleCanjeCupon = async (idBeneficioRegistro: number | string) => {
        setLoadingAction(true);
        try {
            const res = await fetch(`/api/audiencias-canjear?idBeneficioRegistro=${idBeneficioRegistro}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setBeneficios(prev => prev.map(b => {
                    if (b.idBeneficioRegistro === idBeneficioRegistro || b.codigo.toUpperCase() === String(idBeneficioRegistro).toUpperCase()) {
                        return {
                            ...b,
                            estado: 'Canjeado',
                            fechaCanje: `Hoy ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`
                        };
                    }
                    return b;
                }));
            } else {
                alert('No se pudo efectuar el canje del beneficio.');
            }
        } catch (error) {
            console.error('Error al canjear beneficio:', error);
        } finally {
            setLoadingAction(false);
        }
    };

    // ==========================================
    // MANEJADORES: SALUD / MEDICO
    // ==========================================
    const handleRegistrarAccionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvitadoId || !user?.idEvento) {
            alert('Por favor, selecciona un participante.');
            return;
        }

        // Buscar la inscripción correspondiente para obtener id_inscripcion
        const target = saludPanel.find(p => p.id_invitado === selectedInvitadoId) ||
                       saludFichas.find(p => p.id_invitado === selectedInvitadoId);
        const idInscripcion = target?.id_inscripcion || 0;

        setLoadingAction(true);
        try {
            const res = await fetch(`/api/programas/${user.idEvento}/salud/acciones/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_inscripcion: idInscripcion,
                    id_participante: selectedInvitadoId,
                    fecha_hora: new Date().toISOString(),
                    tipo_accion: tipoAccionSelect,
                    descripcion: descripcionAccion,
                    requirio_contacto_familia: requirioContactoFamilia,
                    contacto_realizado: requirioContactoFamilia ? contactoRealizado : false,
                    requiere_seguimiento: requiereSeguimiento
                })
            });

            if (res.ok) {
                // Actualizar timeline de acciones localmente
                const resAcciones = await fetch(`/api/programas/${user.idEvento}/salud/acciones`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resAcciones.ok) {
                    const data = await resAcciones.json();
                    setSaludAcciones(Array.isArray(data) ? data : []);
                }

                // Limpiar formulario y cerrar modal
                setRegistroAccionOpen(false);
                setSelectedInvitadoId(null);
                setSelectedInvitadoNombre('');
                setDescripcionAccion('');
                setRequirioContactoFamilia(false);
                setContactoRealizado(false);
                setRequiereSeguimiento(false);
                if (tiposAccion.length > 0) {
                    setTipoAccionSelect(tiposAccion[0].codigo);
                }
            } else {
                alert('No se pudo registrar la acción de salud. Por favor reintente.');
            }
        } catch (error) {
            console.error('Error al registrar acción de salud:', error);
            alert('Ocurrió un error al registrar la acción.');
        } finally {
            setLoadingAction(false);
        }
    };

    // ==========================================
    // QR SCANNER LOGIC (REAL & SIMULATED)
    // ==========================================
    const triggerScan = (type: typeof scanType) => {
        setScanType(type);
        setScannerOpen(true);
        setScanResult(null);
        setCameraError(null);
    };

    const handleRealScanSuccess = (scannedText: string) => {
        setLoadingAction(true);
        const code = scannedText.trim();

        if (scanType === 'ENTRADA') {
            const target = participantes.find(
                p => p.ticket.toUpperCase() === code.toUpperCase() ||
                    p.email.toLowerCase() === code.toLowerCase()
            );

            if (target) {
                if (!target.ingresado) {
                    setScanResult({
                        success: true,
                        title: '¡Acceso Permitido!',
                        subtitle: 'El ticket se encuentra vigente.',
                        name: `${target.nombre} ${target.apellido}`,
                        details: `Ticket: ${target.ticket} • Categoría: ${target.categoria}`,
                        action: () => handleCheckInManual(target.id)
                    });
                } else {
                    setScanResult({
                        success: false,
                        title: 'Ticket Ya Ingresado',
                        subtitle: 'Este participante ya ingresó previamente.',
                        details: `Último check-in registrado a las ${target.hora} hs`
                    });
                }
            } else {
                setScanResult({
                    success: false,
                    title: 'Ticket Inválido',
                    subtitle: 'No se encontró ningún participante con este ticket.',
                    details: `Código escaneado: "${code}"`
                });
            }
        } else if (scanType === 'RACION') {
            const targetAlergia = alergias.find(
                a => a.nombre.toLowerCase().includes(code.toLowerCase()) ||
                    a.apellido.toLowerCase().includes(code.toLowerCase()) ||
                    code.toUpperCase().includes(a.nombre.toUpperCase()) ||
                    code.toUpperCase().includes(a.apellido.toUpperCase())
            );

            if (targetAlergia) {
                setScanResult({
                    success: true,
                    title: 'Dieta Especial Validada',
                    subtitle: `¡Atención Alergia: ${targetAlergia.alergia}!`,
                    name: `${targetAlergia.nombre} ${targetAlergia.apellido}`,
                    details: `Menú Asignado: ${targetAlergia.racion}`,
                    action: () => handleVerifyDiet(targetAlergia.id)
                });
            } else {
                const part = participantes.find(
                    p => p.ticket.toUpperCase() === code.toUpperCase() ||
                        p.email.toLowerCase() === code.toLowerCase()
                );

                if (part) {
                    setScanResult({
                        success: true,
                        title: 'Ración Estándar Validada',
                        subtitle: 'Ticket de comida aprobado sin restricciones médicas.',
                        name: `${part.nombre} ${part.apellido}`,
                        details: 'Ración estándar del menú del día',
                        action: () => setRacionesServidas(r => Math.min(racionesTotales, r + 1))
                    });
                } else {
                    setScanResult({
                        success: true,
                        title: 'Ración Estándar Validada',
                        subtitle: 'Ticket de comida aprobado sin restricciones médicas.',
                        name: code.includes('@') ? code : 'Santiago López',
                        details: `Ración estándar del menú del día • Código: ${code}`,
                        action: () => setRacionesServidas(r => Math.min(racionesTotales, r + 1))
                    });
                }
            }
        } else {
            // BENEFICIO
            const resolveQrReal = async () => {
                try {
                    const res = await fetch(`/api/audiencias-qr-beneficio?idEvento=${user.idEvento}&qrToken=${code}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const target = await res.json();
                        const idReg = target.idBeneficioRegistro || target.id_beneficio_registro;
                        
                        if (!target.canjeado) {
                            setScanResult({
                                success: true,
                                title: '¡Cupón de Beneficio Válido!',
                                subtitle: `Item: ${target.nombreBeneficio || target.item || 'Beneficio'}`,
                                name: `Titular: ${target.nombreCompleto || target.titular || 'Participante'}`,
                                details: `Registro: ${idReg}`,
                                action: () => handleCanjeCupon(idReg)
                            });
                        } else {
                            setScanResult({
                                success: false,
                                title: 'Cupón Ya Canjeado',
                                subtitle: 'El beneficio ya fue canjeado previamente.',
                                details: `Canjeado el: ${target.fechaCanje || target.fecha_canje || '-'}`
                            });
                        }
                    } else {
                        const targetBeneficio = beneficios.find(
                            b => b.codigo.toUpperCase() === code.toUpperCase() ||
                                b.titular.toLowerCase().includes(code.toLowerCase())
                        );
                        if (targetBeneficio) {
                            if (targetBeneficio.estado === 'Disponible') {
                                setScanResult({
                                    success: true,
                                    title: '¡Cupón de Beneficio Válido!',
                                    subtitle: `Item: ${targetBeneficio.item}`,
                                    name: `Titular: ${targetBeneficio.titular}`,
                                    details: `Código: ${targetBeneficio.codigo}`,
                                    action: () => handleCanjeCupon(targetBeneficio.idBeneficioRegistro || targetBeneficio.codigo)
                                });
                            } else {
                                setScanResult({
                                    success: false,
                                    title: 'Cupón Ya Canjeado',
                                    subtitle: 'El beneficio ya fue canjeado previamente.',
                                    details: `Canjeado el: ${targetBeneficio.fechaCanje}`
                                });
                            }
                        } else {
                            setScanResult({
                                success: false,
                                title: 'Cupón Inválido',
                                subtitle: 'El código del cupón no coincide con ningún beneficio.',
                                details: `Código escaneado: "${code}"`
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error al resolver QR de beneficio:', error);
                } finally {
                    setLoadingAction(false);
                }
            };
            resolveQrReal();
            return;
        }
        setLoadingAction(false);
    };

    const simulateSuccessfulScan = () => {
        setLoadingAction(true);
        setTimeout(() => {
            setLoadingAction(false);
            if (scanType === 'ENTRADA') {
                const pendientes = participantes.filter(p => !p.ingresado);
                if (pendientes.length > 0) {
                    const target = pendientes[Math.floor(Math.random() * pendientes.length)];
                    handleRealScanSuccess(target.ticket);
                } else {
                    setScanResult({
                        success: false,
                        title: 'Ticket Ya Ingresado',
                        subtitle: 'Todos los participantes ya ingresaron previamente.',
                        details: 'No quedan participantes pendientes en el Mock.'
                    });
                }
            } else if (scanType === 'RACION') {
                const pendAlergias = alergias.filter(a => !a.verificado);
                if (pendAlergias.length > 0) {
                    const target = pendAlergias[Math.floor(Math.random() * pendAlergias.length)];
                    handleRealScanSuccess(target.nombre);
                } else {
                    handleRealScanSuccess('Santiago López');
                }
            } else {
                const disponibles = beneficios.filter(b => b.estado === 'Disponible');
                if (disponibles.length > 0) {
                    const target = disponibles[Math.floor(Math.random() * disponibles.length)];
                    handleRealScanSuccess(target.codigo);
                } else {
                    setScanResult({
                        success: false,
                        title: 'Cupón Inválido o Usado',
                        subtitle: 'El beneficio ya fue canjeado o expiró.',
                        details: 'Por favor verifique la tarjeta física o el código.'
                    });
                }
            }
        }, 800);
    };


    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">

            {/* Cabecera Adaptativa e Inteligente de la Home Operativa (Mobile-Optimized) */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
                    
                    {/* Sección de Identificación y Rol */}
                    <div className="flex items-center gap-3.5">
                        {/* Avatar Premium con Inicial y Estado */}
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20 select-none">
                                {user.nombre[0].toUpperCase()}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full animate-pulse" />
                        </div>

                        <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                                    Hola, {user.nombre}
                                </h1>
                                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-indigo-500/10 uppercase tracking-wider">
                                    {activeRol.rol_texto.replace('STAFF_', '')}
                                </span>
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-semibold truncate max-w-[280px] sm:max-w-md">
                                Gestioná tu jornada operativa en el evento
                            </p>
                        </div>
                    </div>

                    {/* Switcher de Roles y Eventos (Píldoras Compactas en Mobile, Botones en Desktop) */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                        {user.eventosDisponibles && user.eventosDisponibles.filter(e => isEventActiveToday(e)).length > 1 && (
                            <button
                                onClick={() => router.push('/staff/seleccionar-evento')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-[0.98] border border-neutral-200/30 dark:border-neutral-700/30"
                            >
                                <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate">Cambiar Evento</span>
                            </button>
                        )}
                        {user.rolesEvento && user.rolesEvento.length > 1 && (
                            <button
                                onClick={() => router.push('/staff/seleccionar-funcion')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-[0.98] border border-neutral-200/30 dark:border-neutral-700/30"
                            >
                                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate">Cambiar Función</span>
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* ========================================================================= */}
            {/* CASO DE USO 1: PUERTA / RECEPTOR (STAFF_RECEPTOR)                        */}
            {/* ========================================================================= */}
            {(currentRolCode.includes('RECEPTOR') || currentRolCode.includes('CHECKIN')) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Botones de acción rápida en columna lateral */}
                    <div className="md:col-span-1 space-y-6">

                        {/* Tarjeta de Lector QR principal */}
                        <button
                            onClick={() => triggerScan('ENTRADA')}
                            className="w-full text-left p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group"
                        >
                            <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/10 blur-[40px] rounded-full pointer-events-none" />
                            <div className="absolute -right-4 -top-4 text-white/5 font-mono text-9xl font-extrabold select-none pointer-events-none">
                                QR
                            </div>

                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-xl font-bold mb-1">Escanear QR de Entrada</h3>
                            <p className="text-white/80 text-xs leading-relaxed">
                                Escaneá el ticket del participante con la cámara para validarlo e ingresarlo al instante.
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/90">
                                <span>Iniciar lector de cámara</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </button>

                        {/* Formulario rápido de ingreso manual */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-md">
                            <div className="flex items-center gap-2 mb-4 text-neutral-800 dark:text-neutral-100">
                                <UserCheck className="w-4 h-4 text-indigo-500" />
                                <h3 className="font-bold text-sm">Registro Rápido Directo</h3>
                            </div>

                            <form onSubmit={handleCreateParticipante} className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualNombre}
                                        onChange={e => setManualNombre(e.target.value)}
                                        placeholder="Ej: Juan"
                                        className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualApellido}
                                        onChange={e => setManualApellido(e.target.value)}
                                        placeholder="Ej: Pérez"
                                        className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400">Ticket Opcional</label>
                                    <input
                                        type="text"
                                        value={manualTicket}
                                        onChange={e => setManualTicket(e.target.value.toUpperCase())}
                                        placeholder="Ej: EV-12345"
                                        className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold rounded-xl transition-colors mt-2"
                                >
                                    Ingresar y Validar
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Buscador y listado de participantes */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-md space-y-4">

                            {/* Titular y búsqueda */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-500" />
                                        Lista de Participantes
                                    </h3>
                                    <p className="text-xs text-neutral-400">
                                        Buscá por nombre, apellido o código de ticket asignado.
                                    </p>
                                </div>

                                <div className="relative">
                                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Buscar participante..."
                                        className="w-full sm:w-60 pl-10 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Grilla / Listado */}
                            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                                {participantes
                                    .filter(p => {
                                        const term = searchQuery.toLowerCase();
                                        return p.nombre.toLowerCase().includes(term) ||
                                            p.apellido.toLowerCase().includes(term) ||
                                            p.ticket.toLowerCase().includes(term) ||
                                            p.email.toLowerCase().includes(term);
                                    })
                                    .map(p => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl group hover:border-indigo-500/20 hover:bg-neutral-100/30 dark:hover:bg-neutral-800/20 transition-all duration-300"
                                        >
                                            <div className="space-y-1.5 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-neutral-950 dark:text-neutral-50 text-sm">
                                                        {p.nombre} {p.apellido}
                                                    </span>
                                                    <span className="text-[10px] font-mono tracking-wider text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                                                        {p.ticket}
                                                    </span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.categoria === 'V.I.P'
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                                            : p.categoria === 'Expositor'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                                                                : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                                        }`}>
                                                        {p.categoria}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-neutral-400 truncate">
                                                    {p.email}
                                                </div>
                                            </div>

                                            <div>
                                                {p.ingresado ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl border border-green-100 dark:border-green-500/20">
                                                            <Check className="w-3.5 h-3.5" /> Adentro
                                                        </span>
                                                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3 text-neutral-400" /> {p.hora} hs
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCheckInManual(p.id)}
                                                        disabled={loadingAction}
                                                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-500/10 dark:hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-indigo-100/50 dark:border-transparent active:scale-[0.98]"
                                                    >
                                                        Registrar Ingreso
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* CASO DE USO 2: COCINA / COMEDOR (STAFF_COCINA)                           */}
            {/* ========================================================================= */}
            {(currentRolCode.includes('COCINA') || currentRolCode.includes('COMEDOR')) && (
                <div className="space-y-6">

                    {/* Grilla superior de estadisticas de raciones */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Raciones Totales / Servidas */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-md flex items-center gap-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
                                <Utensils className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 w-full">
                                <span className="text-xs text-neutral-400 font-medium">Servicio Comedor Diario</span>
                                <div className="flex justify-between items-baseline">
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                                        {racionesServidas} <span className="text-sm font-normal text-neutral-400">/ {racionesTotales}</span>
                                    </h2>
                                    <span className="text-xs font-bold text-amber-500">
                                        {Math.round((racionesServidas / racionesTotales) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mt-1.5">
                                    <div
                                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(racionesServidas / racionesTotales) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón rápido Registrar Ración QR */}
                        <button
                            onClick={() => triggerScan('RACION')}
                            className="bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between text-left group hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-base">Escanear Ración QR</h3>
                                <p className="text-white/80 text-xs">
                                    Registrá el plato asignado leyendo el código QR del participante.
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/35 transition-colors">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                        </button>

                        {/* Registrar Ración Genérica */}
                        <button
                            onClick={handleServirRacionGenerica}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-800 dark:text-neutral-100 rounded-3xl p-5 shadow-md flex items-center justify-between text-left group hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-base">Ración Común Directa</h3>
                                <p className="text-neutral-400 text-xs">
                                    Entrega y suma una ración estándar de comida sin escaneo de ticket.
                                </p>
                            </div>
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-2xl transition-colors">
                                <Flame className="w-6 h-6" />
                            </div>
                        </button>

                    </div>

                    {/* Panel de control de Alergias Críticas & Buscador */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-md space-y-4">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-lg text-neutral-950 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                    Alertas Médicas y de Alergias
                                </h3>
                                <p className="text-xs text-neutral-400">
                                    Verificá atentamente la dieta especial antes de servir el plato.
                                </p>
                            </div>

                            <div className="relative">
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchAlergias}
                                    onChange={e => setSearchAlergias(e.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="w-full sm:w-60 pl-10 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Listado de Dietas Críticas */}
                        <div className="space-y-3">
                            {alergias
                                .filter(a => {
                                    const term = searchAlergias.toLowerCase();
                                    return a.nombre.toLowerCase().includes(term) || a.apellido.toLowerCase().includes(term) || a.alergia.toLowerCase().includes(term);
                                })
                                .map(a => (
                                    <div
                                        key={a.id}
                                        className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl hover:border-amber-500/20 transition-all duration-300"
                                    >
                                        <div className="space-y-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-neutral-900 dark:text-neutral-50 text-sm">
                                                    {a.nombre} {a.apellido}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${a.nivel === 'CRÍTICO'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                                                    }`}>
                                                    {a.nivel}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                <span>Alergia: {a.alergia}</span>
                                            </div>

                                            <div className="text-xs text-neutral-400 font-medium">
                                                Ración asignada: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{a.racion}</strong>
                                            </div>
                                        </div>

                                        <div>
                                            {a.verificado ? (
                                                <button
                                                    onClick={() => handleVerifyDiet(a.id)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl border border-green-100 dark:border-green-500/20 active:scale-[0.98] transition-all"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Plato Entregado
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleVerifyDiet(a.id)}
                                                    className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-red-100/50 dark:border-transparent active:scale-[0.98]"
                                                >
                                                    Registrar Entrega
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* CASO DE USO 3: BENEFICIOS / BAR (STAFF_OPERADOR)                        */}
            {/* ========================================================================= */}
            {(currentRolCode.includes('OPERADOR') || currentRolCode.includes('BENEFICIOS') || currentRolCode.includes('BARTENDER') || currentRolCode.includes('BAR')) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Botones de acción rápida en columna lateral */}
                    <div className="md:col-span-1 space-y-6">

                        {/* Lector QR Canjes */}
                        <button
                            onClick={() => triggerScan('BENEFICIO')}
                            className="w-full text-left p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group"
                        >
                            <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/10 blur-[40px] rounded-full pointer-events-none" />
                            <div className="absolute -right-4 -top-4 text-white/5 font-mono text-9xl font-extrabold select-none pointer-events-none">
                                QR
                            </div>

                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <Gift className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-xl font-bold mb-1">Escanear QR de Beneficio</h3>
                            <p className="text-white/80 text-xs leading-relaxed">
                                Escaneá el QR del regalo o la consumición asignada para validarla y procesar el canje en segundos.
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/90">
                                <span>Iniciar lector de cámara</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </button>

                        {/* Ingreso manual por código de cupón */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-md">
                            <div className="flex items-center gap-2 mb-4 text-neutral-800 dark:text-neutral-100">
                                <SearchCode className="w-4 h-4 text-emerald-500" />
                                <h3 className="font-bold text-sm">Canjear por Código</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400">Código de Cupón</label>
                                    <input
                                        type="text"
                                        value={manualCouponCode}
                                        onChange={e => setManualCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Ej: BEN-KIT-01"
                                        className="w-full text-sm px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider font-bold text-center text-emerald-600 dark:text-emerald-400"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        if (!manualCouponCode) return;
                                        handleCanjeCupon(manualCouponCode);
                                        setManualCouponCode('');
                                    }}
                                    disabled={loadingAction || !manualCouponCode}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Efectuar Canje Manual
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Listado de cupones y estado de canjes */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-md space-y-4">

                            {/* Titular y búsqueda */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-emerald-500" />
                                        Registro de Canjes
                                    </h3>
                                    <p className="text-xs text-neutral-400">
                                        Listado general de cupones asignados a los participantes del evento.
                                    </p>
                                </div>

                                <div className="relative">
                                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchBeneficios}
                                        onChange={e => setSearchBeneficios(e.target.value)}
                                        placeholder="Buscar por código o titular..."
                                        className="w-full sm:w-60 pl-10 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Grilla / Listado */}
                            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                                {beneficios
                                    .filter(b => {
                                        const term = searchBeneficios.toLowerCase();
                                        return b.codigo.toLowerCase().includes(term) ||
                                            b.titular.toLowerCase().includes(term) ||
                                            b.item.toLowerCase().includes(term);
                                    })
                                    .map(b => (
                                        <div
                                            key={b.codigo}
                                            className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl hover:border-emerald-500/20 hover:bg-neutral-100/30 dark:hover:bg-neutral-800/20 transition-all duration-300"
                                        >
                                            <div className="space-y-1.5 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono tracking-wider font-bold text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/30 dark:border-emerald-900/30 px-2 py-0.5 rounded-md">
                                                        {b.codigo}
                                                    </span>
                                                    <span className="font-bold text-neutral-950 dark:text-neutral-50 text-sm">
                                                        {b.titular}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">
                                                    Beneficio: {b.item}
                                                </div>
                                            </div>

                                            <div>
                                                {b.estado === 'Canjeado' ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl border border-green-100 dark:border-green-500/20">
                                                            <Check className="w-3.5 h-3.5" /> Canjeado
                                                        </span>
                                                        <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold">
                                                            <Clock className="w-3 h-3 text-neutral-400" /> {b.fechaCanje}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCanjeCupon(b.codigo)}
                                                        disabled={loadingAction}
                                                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-600 dark:text-emerald-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-emerald-100/50 dark:border-transparent active:scale-[0.98]"
                                                    >
                                                        Efectuar Canje
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* CASO DE USO 4: SALUD / PANEL MEDICO (STAFF_SALUD)                         */}
            {/* ========================================================================= */}
            {(currentRolCode.includes('SALUD') || currentRolCode.includes('MEDICO') || currentRolCode.includes('ENFERMERO')) && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Barra de Navegación de Pestañas (Tabs) */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-3 shadow-md flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSaludTab('PANEL')}
                            className={`flex-1 min-w-[120px] py-3 px-4 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${saludTab === 'PANEL'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                            }`}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            <span>Panel de Alertas</span>
                        </button>
                        <button
                            onClick={() => setSaludTab('FICHAS')}
                            className={`flex-1 min-w-[120px] py-3 px-4 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${saludTab === 'FICHAS'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Fichas Médicas</span>
                        </button>
                        <button
                            onClick={() => setSaludTab('ACCIONES')}
                            className={`flex-1 min-w-[120px] py-3 px-4 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${saludTab === 'ACCIONES'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            <span>Acciones & Incidentes</span>
                        </button>
                    </div>

                    {/* Filtro de Búsqueda y Botón Primario */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchSalud}
                                onChange={e => setSearchSalud(e.target.value)}
                                placeholder={saludTab === 'ACCIONES' ? "Buscar incidente o tipo..." : "Buscar por nombre del participante..."}
                                className="w-full pl-10 pr-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-semibold"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setSelectedInvitadoId(null);
                                setSelectedInvitadoNombre('');
                                setRegistroAccionOpen(true);
                            }}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Registrar Atención Médica</span>
                        </button>
                    </div>

                    {/* Contenido según Pestaña (Tab) Activa */}
                    {saludTab === 'PANEL' && (
                        <div className="space-y-4">
                            {saludPanel.filter(p => p.participante.toLowerCase().includes(searchSalud.toLowerCase())).length === 0 ? (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 text-xs font-semibold">
                                    No se encontraron alertas o participantes médicos coincidentes.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {saludPanel
                                        .filter(p => p.participante.toLowerCase().includes(searchSalud.toLowerCase()))
                                        .map(p => (
                                            <div
                                                key={p.id_invitado}
                                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-red-500/30 transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                                                        {p.participante}
                                                    </h3>
                                                    {p.alerta_visual && (
                                                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                                                            <ShieldAlert className="w-3 h-3" /> Crítico
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                                                    {p.tiene_problema_medico && (
                                                        <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                                                            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Diagnóstico / Afección:</span>
                                                            <p className="font-medium text-neutral-800 dark:text-neutral-300">{p.problema_medico_detail || p.problema_medico_detalle}</p>
                                                        </div>
                                                    )}

                                                    {p.tiene_alergias_no_alimentarias && (
                                                        <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                                                            <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Alergia (No Alimentaria):</span>
                                                            <p className="font-medium text-neutral-800 dark:text-neutral-300">{p.alergias_no_alimentarias_detalle}</p>
                                                        </div>
                                                    )}

                                                    {p.tiene_necesidad_especial && (
                                                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl">
                                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Necesidad Especial:</span>
                                                            <p className="font-medium text-neutral-800 dark:text-neutral-300">{p.necesidad_especial_detalle}</p>
                                                        </div>
                                                    )}

                                                    {p.tiene_restricciones_alimentarias && p.restricciones_alimentarias?.length > 0 && (
                                                        <div className="bg-orange-500/5 border border-orange-500/10 p-2.5 rounded-xl">
                                                            <span className="font-bold text-orange-600 dark:text-orange-400 block mb-1">Restricciones Alimentarias:</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {p.restricciones_alimentarias.map((r: string, idx: number) => (
                                                                    <span key={idx} className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                                                        {r}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {p.tiene_medicacion && p.medicaciones?.length > 0 && (
                                                        <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl">
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Medicamentos Suministrados:</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {p.medicaciones.map((m: string, idx: number) => (
                                                                    <span key={idx} className="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(p.contacto_emergencia || p.telefono_emergencia) && (
                                                        <div className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl">
                                                            <div>
                                                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Contacto de Emergencia</span>
                                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">{p.contacto_emergencia || 'Familiar'}</span>
                                                            </div>
                                                            <a href={`tel:${p.telefono_emergencia}`} className="p-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-neutral-600 dark:text-neutral-300 rounded-xl transition-all flex items-center justify-center gap-1 font-bold text-[10px] active:scale-95 pr-3">
                                                                <PhoneCall className="w-3.5 h-3.5" /> Llamar
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedInvitadoId(p.id_invitado);
                                                        setSelectedInvitadoNombre(p.participante);
                                                        setRegistroAccionOpen(true);
                                                    }}
                                                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
                                                >
                                                    Registrar Nueva Atención
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {saludTab === 'FICHAS' && (
                        <div className="space-y-4">
                            {saludFichas.filter(f => f.participante.toLowerCase().includes(searchSalud.toLowerCase())).length === 0 ? (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 text-xs font-semibold">
                                    No se encontraron fichas médicas para los participantes buscados.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {saludFichas
                                        .filter(f => f.participante.toLowerCase().includes(searchSalud.toLowerCase()))
                                        .map(f => (
                                            <div
                                                key={f.id_invitado}
                                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4"
                                            >
                                                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                                                    <div>
                                                        <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                                                            {f.participante}
                                                        </h3>
                                                        <p className="text-[10px] text-neutral-400 font-semibold">
                                                            Responsable: {f.responsable || 'Familia'}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${f.autoriza_emergencia_medica 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                    }`}>
                                                        {f.autoriza_emergencia_medica ? 'AUTORIZADO URGENCIA' : 'NO AUTORIZADO URGENCIA'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                                                        <span className="font-bold text-neutral-400 uppercase text-[9px]">Obra Social / Cobertura:</span>
                                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{f.cobertura_medica_nombre || 'Particular / Ninguna'}</span>
                                                    </div>

                                                    <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-1.5">
                                                        <span className="font-bold text-neutral-400 uppercase text-[9px] block">Detalles Clínicos declarados:</span>
                                                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                                            <span className={`px-2 py-0.5 rounded-md ${f.tiene_problema_medico ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                                                                Tratamiento Médico
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-md ${f.tiene_alergias_no_alimentarias ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                                                                Alergias Clínicas
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-md ${f.tiene_necesidad_especial ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                                                                Necesidades Especiales
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedInvitadoId(f.id_invitado);
                                                        setSelectedInvitadoNombre(f.participante);
                                                        setRegistroAccionOpen(true);
                                                    }}
                                                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
                                                >
                                                    Registrar Novedad Clínica
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {saludTab === 'ACCIONES' && (
                        <div className="space-y-4">
                            {saludAcciones.filter(a => {
                                const term = searchSalud.toLowerCase();
                                return a.descripcion.toLowerCase().includes(term) || a.tipo_accion.toLowerCase().includes(term);
                            }).length === 0 ? (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 text-xs font-semibold">
                                    No se registran incidentes médicos ni acciones en el timeline actualmente.
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-md space-y-6">
                                    <div className="relative pl-6 border-l border-neutral-200 dark:border-neutral-800 space-y-6">
                                        {saludAcciones
                                            .filter(a => {
                                                const term = searchSalud.toLowerCase();
                                                return a.descripcion.toLowerCase().includes(term) || a.tipo_accion.toLowerCase().includes(term);
                                            })
                                            .map((a, index) => {
                                                // Intentar buscar el nombre del participante asociado a la acción
                                                const guest = saludPanel.find(p => p.id_invitado === a.id_participante) || 
                                                              saludFichas.find(f => f.id_invitado === a.id_participante);
                                                const guestName = guest?.participante || `Participante #${a.id_participante}`;

                                                return (
                                                    <div key={index} className="relative group">
                                                        {/* Dot timeline */}
                                                        <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-red-600 border-4 border-white dark:border-neutral-900 rounded-full group-hover:scale-110 transition-transform shadow" />

                                                        <div className="space-y-2">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                                                                        {guestName}
                                                                    </span>
                                                                    <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                                                        {a.tipo_accion}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {new Date(a.fecha_hora).toLocaleString('es-AR', {
                                                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                                    })} hs
                                                                </span>
                                                            </div>

                                                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                                                {a.descripcion}
                                                            </p>

                                                            <div className="flex items-center gap-2 flex-wrap text-[9px] font-bold">
                                                                {a.requerio_contacto_familia && (
                                                                    <span className={`px-2 py-0.5 rounded-full ${a.contacto_realizado 
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' 
                                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                                                                    }`}>
                                                                        {a.contacto_realizado ? 'FAMILIA NOTIFICADA' : 'FAMILIA POR CONTACTAR'}
                                                                    </span>
                                                                )}
                                                                {a.requiere_seguimiento && (
                                                                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase">
                                                                        Requiere Seguimiento Clínico
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* CASO DE USO 5: BANNERS DE CONSTRUCCIÓN PARA ROL MÚSICA / MESAS / OPERACIÓN */}
            {/* ========================================================================= */}
            {(currentRolCode.includes('MUSICA') || currentRolCode.includes('DJ') || currentRolCode.includes('PLAYLIST')) && (
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="w-20 h-20 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center shadow-lg relative animate-bounce animate-duration-1000 flex items-center justify-center">
                        <Music className="w-10 h-10 text-rose-500" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Pestaña Música en Desarrollo
                        </span>
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Sección Música y Playlist</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold leading-relaxed">
                            Actualmente nos encontramos construyendo este módulo. Muy pronto podrás gestionar las sugerencias de la audiencia, la playlist en tiempo real del DJ y el control de pistas desde este panel de staff.
                        </p>
                    </div>
                </div>
            )}

            {(currentRolCode.includes('MESAS') || currentRolCode.includes('SERVICIO') || currentRolCode.includes('MOZO')) && (
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="w-20 h-20 bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 rounded-3xl flex items-center justify-center shadow-lg relative animate-pulse flex items-center justify-center">
                        <Wine className="w-10 h-10 text-purple-500" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Pestaña Mesas en Desarrollo
                        </span>
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Módulo de Mesas y Servicio</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold leading-relaxed">
                            Nos encontramos trabajando en esta sección. Muy pronto tendrás a disposición la grilla interactiva de mesas, la asignación de ubicaciones rsvp y el canal directo de solicitudes de servicio de comedor.
                        </p>
                    </div>
                </div>
            )}

            {(currentRolCode.includes('OPERACION_GENERAL') || currentRolCode.includes('OPERACION')) && (
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="w-20 h-20 bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 rounded-3xl flex items-center justify-center shadow-lg relative flex items-center justify-center">
                        <Sliders className="w-10 h-10 text-cyan-500" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Operación General en Desarrollo
                        </span>
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Panel de Operación General</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold leading-relaxed">
                            Esta pantalla se encuentra en etapa de diseño. El panel principal integrará accesos contextuales simplificados y tableros unificados para coordinadores de eventos generales próximamente.
                        </p>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL MOCK DE ESCANEO DE CÁMARA (QR SCANNER)                              */}
            {/* ========================================================================= */}
            {scannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <h3 className="font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-500 animate-pulse" />
                                Lector QR - Cámara en vivo
                            </h3>
                            <button
                                onClick={() => setScannerOpen(false)}
                                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center justify-center space-y-6">

                            {!scanResult ? (
                                <>
                                    {/* CONTENEDOR DE CÁMARA REAL */}
                                    <div className="w-64 h-64 border-4 border-dashed border-indigo-500/50 dark:border-indigo-400/40 rounded-3xl relative flex items-center justify-center overflow-hidden bg-neutral-950">

                                        {/* Laser scan animation bar (capa superior) */}
                                        {!cameraError && (
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[bounce_3s_infinite] z-10 pointer-events-none" />
                                        )}

                                        {cameraError ? (
                                            <div className="flex flex-col items-center space-y-3 text-center text-white p-6 z-10">
                                                <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
                                                <span className="text-xs text-neutral-300 font-bold leading-relaxed">
                                                    {cameraError}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                {/* ID requerido por html5-qrcode. 
                                                    Aplicamos estilos Tailwind para asegurar que el video cubra todo el contenedor redondeado. */}
                                                <div
                                                    id="qr-reader"
                                                    className="w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:rounded-2xl"
                                                ></div>

                                                {/* Overlay de instrucciones de carga/enfoque */}
                                                <div className="absolute inset-0 bg-neutral-950/40 flex flex-col items-center justify-end pb-4 pointer-events-none z-10">
                                                    <span className="text-[10px] tracking-wider text-white/90 bg-black/60 px-3 py-1 rounded-full font-bold uppercase backdrop-blur-sm">
                                                        Enfoque el código QR
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center space-y-2">
                                        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                                            Alineá el código QR del participante dentro del marco de la cámara para escanearlo automáticamente.
                                        </p>

                                        {/* Botón de simulación secundario para desarrollo y testing rápido */}
                                        <button
                                            onClick={simulateSuccessfulScan}
                                            disabled={loadingAction}
                                            className="text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs font-bold underline transition-colors block mx-auto mt-2"
                                        >
                                            {loadingAction ? 'Escaneando...' : 'Simular escaneo de prueba'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm border ${scanResult.success
                                            ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                            : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                        }`}>
                                        {scanResult.success ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-neutral-900 dark:text-white">
                                            {scanResult.title}
                                        </h4>
                                        <p className="text-sm font-semibold text-neutral-500">
                                            {scanResult.subtitle}
                                        </p>
                                    </div>

                                    {scanResult.name && (
                                        <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-left space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-neutral-400">Asociado</span>
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">{scanResult.name}</p>
                                            <p className="text-xs text-neutral-500">{scanResult.details}</p>
                                        </div>
                                    )}

                                    {!scanResult.name && scanResult.details && (
                                        <div className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3 rounded-xl">
                                            {scanResult.details}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setScanResult(null)}
                                            className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold rounded-2xl transition"
                                        >
                                            Escanear Otro
                                        </button>

                                        {scanResult.success && scanResult.action && (
                                            <button
                                                onClick={() => {
                                                    scanResult.action();
                                                    setScannerOpen(false);
                                                }}
                                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl shadow-md transition"
                                            >
                                                Confirmar Entrega / Ingreso
                                            </button>
                                        )}

                                        {(!scanResult.success || !scanResult.action) && (
                                            <button
                                                onClick={() => setScannerOpen(false)}
                                                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-2xl transition"
                                            >
                                                Cerrar Lector
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
