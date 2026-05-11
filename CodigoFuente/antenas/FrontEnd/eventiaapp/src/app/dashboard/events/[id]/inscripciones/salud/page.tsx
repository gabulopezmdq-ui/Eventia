'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Stethoscope, Loader2, AlertCircle, RefreshCw, Search, Plus } from 'lucide-react';
import { getSaludPanel, getSaludFichas, getSaludMedicaciones, getSaludAcciones } from '@/src/features/inscripcion/salud.service';
import type { SaludPanelResponse, SaludFichaItem, SaludMedicacionItem, SaludAccionItem } from '@/src/features/inscripcion/types/salud.types';
import SaludSummaryCards from './components/SaludSummaryCards';
import PanelPrincipalTab from './components/PanelPrincipalTab';
import FichasTab from './components/FichasTab';
import MedicacionesTab from './components/MedicacionesTab';
import AccionesTab from './components/AccionesTab';
import RestriccionesTab from './components/RestriccionesTab';
import DetalleParticipanteDrawer, { ScrollTarget } from './components/DetalleParticipanteDrawer';
import RegistrarAccionModal from './components/RegistrarAccionModal';

type Tab = 'panel' | 'fichas' | 'medicaciones' | 'acciones' | 'restricciones';

interface ParticipanteTarget {
    id: number;
    nombre: string;
    id_inscripcion: number;
}

const TABS: { id: Tab; label: string }[] = [
    { id: 'panel', label: 'Panel Principal' },
    { id: 'fichas', label: 'Fichas' },
    { id: 'medicaciones', label: 'Medicaciones' },
    { id: 'acciones', label: 'Acciones / Incidentes' },
    { id: 'restricciones', label: 'Restricciones Alimentarias' },
];

export default function SaludDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEvento = Number(id);

    // ── Tab State ──
    const [activeTab, setActiveTab] = useState<Tab>('panel');

    // ── Data State ──
    const [panelData, setPanelData] = useState<SaludPanelResponse[]>([]);
    const [fichasData, setFichasData] = useState<SaludFichaItem[]>([]);
    const [medicacionesData, setMedicacionesData] = useState<SaludMedicacionItem[]>([]);
    const [accionesData, setAccionesData] = useState<SaludAccionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Filtros Panel/Restricciones ──
    const [searchQ, setSearchQ] = useState('');
    const [soloAlertas, setSoloAlertas] = useState(false);
    const [nivelAlerta, setNivelAlerta] = useState('');
    const [tieneMedicacion, setTieneMedicacion] = useState(false);

    // ── Filtros Fichas ──
    const [fichasSearch, setFichasSearch] = useState('');
    const [fichaConProblema, setFichaConProblema] = useState(false);
    const [fichaConAlergias, setFichaConAlergias] = useState(false);
    const [fichaAutoriza, setFichaAutoriza] = useState(false);

    // ── Filtros Medicaciones ──
    const [medSearch, setMedSearch] = useState('');
    const [medReqAutorizacion, setMedReqAutorizacion] = useState(false);
    const [medTieneHorario, setMedTieneHorario] = useState(false);

    // ── Filtros Acciones ──
    const [accionSearch, setAccionSearch] = useState('');
    const [accionTipo, setAccionTipo] = useState('');
    const [accionConSeguimiento, setAccionConSeguimiento] = useState(false);

    // ── Drawer State ──
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [idInvitadoSeleccionado, setIdInvitadoSeleccionado] = useState<number | null>(null);
    const [drawerScrollTo, setDrawerScrollTo] = useState<ScrollTarget>('top');

    // ── Modal Registrar Acción ──
    const [modalOpen, setModalOpen] = useState(false);
    const [participanteTarget, setParticipanteTarget] = useState<ParticipanteTarget | null>(null);

    // ── Fetch ──
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [panel, fichas, medicaciones, acciones] = await Promise.all([
                getSaludPanel(idEvento),
                getSaludFichas(idEvento),
                getSaludMedicaciones(idEvento),
                getSaludAcciones(idEvento),
            ]);
            setPanelData(panel);
            setFichasData(fichas);
            setMedicacionesData(medicaciones);
            setAccionesData(acciones);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos de salud');
        } finally {
            setLoading(false);
        }
    }, [idEvento]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Handlers Drawer ──
    const handleVerDetalle = (idInvitado: number, scrollTo: ScrollTarget = 'top') => {
        setIdInvitadoSeleccionado(idInvitado);
        setDrawerScrollTo(scrollTo);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setTimeout(() => setIdInvitadoSeleccionado(null), 300);
    };

    // ── Handlers Modal ──
    const handleRegistrarAccion = (invitado: ParticipanteTarget) => {
        setParticipanteTarget(invitado);
        setModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchAll();
        setModalOpen(false);
    };

    // ── Filtros en cliente ──
    const filteredPanel = panelData.filter(item => {
        if (searchQ && !`${item.participante} ${item.responsable} ${item.telefono_responsable}`.toLowerCase().includes(searchQ.toLowerCase())) return false;
        if (soloAlertas && !item.alerta_visual) return false;
        if (nivelAlerta && nivelAlerta !== 'TODOS' && item.nivel_alerta !== nivelAlerta) return false;
        if (tieneMedicacion && !item.tiene_medicacion) return false;
        return true;
    });

    const filteredFichas = fichasData.filter(item => {
        if (fichasSearch && !item.participante.toLowerCase().includes(fichasSearch.toLowerCase())) return false;
        if (fichaConProblema && !item.tiene_problema_medico) return false;
        if (fichaConAlergias && !item.tiene_alergias_no_alimentarias) return false;
        if (fichaAutoriza && !item.autoriza_emergencia_medica) return false;
        return true;
    });

    const filteredMedicaciones = medicacionesData.filter(item => {
        if (medSearch && !item.nombre_medicamento.toLowerCase().includes(medSearch.toLowerCase()) && !(item.participante ?? '').toLowerCase().includes(medSearch.toLowerCase())) return false;
        if (medReqAutorizacion && !item.administracion_autorizada) return false;
        if (medTieneHorario && !item.horario) return false;
        return true;
    });

    const filteredAcciones = accionesData.filter(item => {
        if (accionSearch && !item.descripcion.toLowerCase().includes(accionSearch.toLowerCase())) return false;
        if (accionTipo && item.tipo_accion !== accionTipo) return false;
        if (accionConSeguimiento && !item.requiere_seguimiento) return false;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
                <Link href="/dashboard/events" className="hover:text-foreground transition-colors">Eventos</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${id}`} className="hover:text-foreground transition-colors">Detalle #{id}</Link>
                <span>/</span>
                <span className="text-blue-500">Salud</span>
            </nav>

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Stethoscope className="w-8 h-8 text-blue-500" />
                        Gestión de Salud
                    </h1>
                    <p className="text-muted text-sm mt-1">Fichas médicas, medicaciones, incidentes y restricciones alimentarias</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        className="p-3 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-all disabled:opacity-50"
                        title="Refrescar"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => { setParticipanteTarget(null); setModalOpen(true); }}
                        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Registrar Acción
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            {!loading && panelData.length > 0 && <SaludSummaryCards items={panelData} />}

            {/* Tabs */}
            <div className="border-b border-card-border">
                <div className="flex gap-1 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading / Error */}
            {loading ? (
                <div className="p-12 rounded-2xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-muted text-sm">Cargando datos de salud...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-card-bg border border-red-500/20 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={fetchAll} className="text-sm text-blue-500 hover:underline">Reintentar</button>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* ── Tab Panel Principal ── */}
                    {activeTab === 'panel' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input type="text" placeholder="Buscar participante, responsable, teléfono..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground" />
                                </div>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={soloAlertas} onChange={e => setSoloAlertas(e.target.checked)} className="accent-blue-500" />
                                    Solo alertas
                                </label>
                                <select value={nivelAlerta} onChange={e => setNivelAlerta(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 transition-all text-foreground">
                                    <option value="">Nivel alerta: TODOS</option>
                                    <option value="ALTA">ALTA</option>
                                    <option value="MEDIA">MEDIA</option>
                                    <option value="NORMAL">NORMAL</option>
                                </select>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={tieneMedicacion} onChange={e => setTieneMedicacion(e.target.checked)} className="accent-blue-500" />
                                    Con medicación
                                </label>
                            </div>
                            <PanelPrincipalTab items={filteredPanel} onVerDetalle={handleVerDetalle} onRegistrarAccion={handleRegistrarAccion} />
                        </div>
                    )}

                    {/* ── Tab Fichas ── */}
                    {activeTab === 'fichas' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input type="text" placeholder="Buscar participante..." value={fichasSearch} onChange={e => setFichasSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground" />
                                </div>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={fichaConProblema} onChange={e => setFichaConProblema(e.target.checked)} className="accent-blue-500" />
                                    Con problema médico
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={fichaConAlergias} onChange={e => setFichaConAlergias(e.target.checked)} className="accent-blue-500" />
                                    Con alergias
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={fichaAutoriza} onChange={e => setFichaAutoriza(e.target.checked)} className="accent-blue-500" />
                                    Autoriza emergencia
                                </label>
                            </div>
                            <FichasTab items={filteredFichas} onVerDetalle={(id) => handleVerDetalle(id, 'top')} />
                        </div>
                    )}

                    {/* ── Tab Medicaciones ── */}
                    {activeTab === 'medicaciones' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input type="text" placeholder="Buscar participante o medicación..." value={medSearch} onChange={e => setMedSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground" />
                                </div>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={medReqAutorizacion} onChange={e => setMedReqAutorizacion(e.target.checked)} className="accent-blue-500" />
                                    Requiere autorización
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={medTieneHorario} onChange={e => setMedTieneHorario(e.target.checked)} className="accent-blue-500" />
                                    Tiene horario
                                </label>
                            </div>
                            <MedicacionesTab items={filteredMedicaciones} onVerDetalle={(id, scrollTo) => handleVerDetalle(id, scrollTo)} />
                        </div>
                    )}

                    {/* ── Tab Acciones ── */}
                    {activeTab === 'acciones' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input type="text" placeholder="Buscar en descripción..." value={accionSearch} onChange={e => setAccionSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground" />
                                </div>
                                <select value={accionTipo} onChange={e => setAccionTipo(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 transition-all text-foreground">
                                    <option value="">Tipo: TODOS</option>
                                    <option value="MEDICACION">Medicación</option>
                                    <option value="PRIMEROS_AUXILIOS">Primeros auxilios</option>
                                    <option value="CONTACTO_FAMILIA">Contacto familia</option>
                                    <option value="DERIVACION">Derivación</option>
                                    <option value="OBSERVACION">Observación</option>
                                </select>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={accionConSeguimiento} onChange={e => setAccionConSeguimiento(e.target.checked)} className="accent-blue-500" />
                                    Con seguimiento
                                </label>
                            </div>
                            <AccionesTab
                                items={filteredAcciones}
                                onVerDetalle={(id, scrollTo) => handleVerDetalle(id, scrollTo)}
                                onRegistrarAccion={() => { setParticipanteTarget(null); setModalOpen(true); }}
                            />
                        </div>
                    )}

                    {/* ── Tab Restricciones ── */}
                    {activeTab === 'restricciones' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="relative flex-1 min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input type="text" placeholder="Buscar participante..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground" />
                                </div>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg border border-card-border cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
                                    <input type="checkbox" checked={soloAlertas} onChange={e => setSoloAlertas(e.target.checked)} className="accent-blue-500" />
                                    Solo alertas visuales
                                </label>
                            </div>
                            <RestriccionesTab items={filteredPanel} onVerDetalle={(id) => handleVerDetalle(id, 'top')} />
                        </div>
                    )}
                </div>
            )}

            {/* Drawer Detalle */}
            <DetalleParticipanteDrawer
                isOpen={drawerOpen}
                onClose={handleCloseDrawer}
                idEvento={idEvento}
                idInvitado={idInvitadoSeleccionado}
                scrollTo={drawerScrollTo}
                onRegistrarAccion={handleRegistrarAccion}
            />

            {/* Modal Registrar Acción */}
            <RegistrarAccionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                idEvento={idEvento}
                participante={participanteTarget}
                participantesDisponibles={panelData}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
