'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, CreditCard, Gift, Sparkles, Plus, Edit, Copy, Check, Info,
    Eye, EyeOff, Coins, List, HelpCircle, Loader2, ArrowRight, DollarSign,
    Calendar, CheckCircle, Clock, Trash2, MessageSquare, AlertTriangle, AlertCircle
} from 'lucide-react';
import { useToast } from '@/src/context/ToastContext';
import {
    getTransferenciasConfig,
    saveTransferenciasConfig,
    getTransferencias,
    saveTransferencia,
    toggleTransferenciaActivo,
    getListaRegalos,
    getRegaloItem,
    saveRegaloItem,
    toggleRegaloVisible,
    duplicarRegaloItem,
    getFondo,
    saveFondo,
    getMetas,
    saveMeta,
    toggleMetaVisible,
    getAportes,
    confirmarAporte,
    getMonedasCombo
} from '@/src/features/regalos/regalos.service';
import {
    TransferenciaConfig,
    TransferenciaDestino,
    MonedaCombo,
    RegaloItem,
    FondoConfig,
    MetaItem,
    AporteItem
} from '@/src/features/regalos/types';

interface Props {
    params: Promise<{ id: string }>;
}

type TabId = 'transferencias' | 'lista' | 'fondo';
type AportesTabId = 'pendientes' | 'confirmados';

export default function RegalosDashboardPage({ params }: Props) {
    const { id } = use(params);
    const idEvento = Number(id);
    const router = useRouter();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabId>('transferencias');
    const [loading, setLoading] = useState(true);
    const [monedas, setMonedas] = useState<MonedaCombo[]>([]);

    // ─────────────────────────────────────────────────────────────────
    // ESTADO: TAB TRANSFERENCIAS
    // ─────────────────────────────────────────────────────────────────
    const [tfConfig, setTfConfig] = useState<TransferenciaConfig>({
        id_evento: idEvento,
        titulo: 'Regalos',
        texto_intro: '',
        activo: true
    });
    const [tfDestinos, setTfDestinos] = useState<TransferenciaDestino[]>([]);
    const [tfConfigSaving, setTfConfigSaving] = useState(false);
    const [isTfModalOpen, setIsTfModalOpen] = useState(false);
    const [selectedTf, setSelectedTf] = useState<TransferenciaDestino | null>(null);
    const [tfForm, setTfForm] = useState({
        codigo_moneda: 'ARS',
        titulo: '',
        datos_transferencia_texto: '',
        instrucciones: '',
        orden: 1,
        activo: true
    });
    const [tfSaving, setTfSaving] = useState(false);

    // ─────────────────────────────────────────────────────────────────
    // ESTADO: TAB LISTA DE REGALOS
    // ─────────────────────────────────────────────────────────────────
    const [regalos, setRegalos] = useState<RegaloItem[]>([]);
    const [isRegaloModalOpen, setIsRegaloModalOpen] = useState(false);
    const [selectedRegalo, setSelectedRegalo] = useState<RegaloItem | null>(null);
    const [regaloForm, setRegaloForm] = useState({
        titulo: '',
        descripcion: '',
        cantidad_total: 1,
        permitir_excedente: false,
        orden: 1,
        visible: true
    });
    const [regaloSaving, setRegaloSaving] = useState(false);

    // ─────────────────────────────────────────────────────────────────
    // ESTADO: TAB FONDO / METAS
    // ─────────────────────────────────────────────────────────────────
    const [fondo, setFondo] = useState<FondoConfig | null>(null);
    const [fondoSaving, setFondoSaving] = useState(false);
    const [metas, setMetas] = useState<MetaItem[]>([]);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [selectedMeta, setSelectedMeta] = useState<MetaItem | null>(null);
    const [metaForm, setMetaForm] = useState({
        titulo: '',
        descripcion: '',
        objetivo_monto: 100,
        orden: 1,
        visible: true
    });
    const [metaSaving, setMetaSaving] = useState(false);

    // Aportes
    const [aportesTab, setAportesTab] = useState<AportesTabId>('pendientes');
    const [aportesPendientes, setAportesPendientes] = useState<AporteItem[]>([]);
    const [aportesConfirmados, setAportesConfirmados] = useState<AporteItem[]>([]);
    const [aportesLoading, setAportesLoading] = useState(false);
    const [isConfirmAporteModalOpen, setIsConfirmAporteModalOpen] = useState(false);
    const [selectedAporte, setSelectedAporte] = useState<AporteItem | null>(null);
    const [confirmAporteForm, setConfirmAporteForm] = useState({
        monto_base_calculado: 0,
        tipo_cambio_usado: ''
    });
    const [confirmAporteSaving, setConfirmAporteSaving] = useState(false);

    // Cargar combo de monedas
    useEffect(() => {
        getMonedasCombo()
            .then(setMonedas)
            .catch(err => console.error('Error al cargar monedas:', err));
    }, []);

    // Cargar datos principales según pestaña
    const loadTabDetails = useCallback(async (tab: TabId) => {
        setLoading(true);
        try {
            if (tab === 'transferencias') {
                const config = await getTransferenciasConfig(idEvento).catch(() => ({
                    id_evento: idEvento,
                    titulo: 'Regalos',
                    texto_intro: '',
                    activo: true
                }));
                setTfConfig(config);
                const destinos = await getTransferencias(idEvento).catch(() => []);
                setTfDestinos(destinos);
            } else if (tab === 'lista') {
                const items = await getListaRegalos(idEvento).catch(() => []);
                setRegalos(items);
            } else if (tab === 'fondo') {
                const fData = await getFondo(idEvento).catch(() => null);
                setFondo(fData);
                if (fData) {
                    const mList = await getMetas(idEvento).catch(() => []);
                    setMetas(mList);
                    await loadAportes(idEvento);
                }
            }
        } catch (error) {
            console.error('Error al cargar pestaña:', error);
            addToast('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    }, [idEvento, addToast]);

    useEffect(() => {
        loadTabDetails(activeTab);
    }, [activeTab, loadTabDetails]);

    const loadAportes = async (evtId: number) => {
        setAportesLoading(true);
        try {
            const pend = await getAportes(evtId, 'DECLARADO').catch(() => []);
            const conf = await getAportes(evtId, 'CONFIRMADO').catch(() => []);
            setAportesPendientes(pend);
            setAportesConfirmados(conf);
        } catch (error) {
            console.error('Error al cargar aportes:', error);
        } finally {
            setAportesLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────
    // ACCIONES: TRANSFERENCIAS
    // ─────────────────────────────────────────────────────────────────
    const handleSaveTfConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setTfConfigSaving(true);
        try {
            await saveTransferenciasConfig(idEvento, tfConfig);
            addToast('Configuración guardada correctamente', 'success');
        } catch (err: any) {
            addToast(err.message || 'Error al guardar configuración', 'error');
        } finally {
            setTfConfigSaving(false);
        }
    };

    const handleOpenTfModal = (tf: TransferenciaDestino | null = null) => {
        setSelectedTf(tf);
        if (tf) {
            setTfForm({
                codigo_moneda: tf.codigo_moneda,
                titulo: tf.titulo || '',
                datos_transferencia_texto: tf.datos_transferencia_texto,
                instrucciones: tf.instrucciones || '',
                orden: tf.orden,
                activo: tf.activo
            });
        } else {
            setTfForm({
                codigo_moneda: monedas[0]?.codigo || 'ARS',
                titulo: '',
                datos_transferencia_texto: '',
                instrucciones: '',
                orden: tfDestinos.length + 1,
                activo: true
            });
        }
        setIsTfModalOpen(true);
    };

    const handleSaveTfDestino = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tfForm.datos_transferencia_texto.trim()) {
            addToast('Los datos de transferencia son obligatorios', 'error');
            return;
        }
        setTfSaving(true);
        try {
            const payload: TransferenciaDestino = {
                id_evento_regalo_transferencia: selectedTf ? selectedTf.id_evento_regalo_transferencia : null,
                id_evento: idEvento,
                codigo_moneda: tfForm.codigo_moneda,
                titulo: tfForm.titulo.trim() || null,
                datos_transferencia_texto: tfForm.datos_transferencia_texto.trim(),
                instrucciones: tfForm.instrucciones.trim() || null,
                orden: tfForm.orden,
                activo: tfForm.activo
            };
            await saveTransferencia(idEvento, payload);
            addToast('Destino de transferencia guardado', 'success');
            setIsTfModalOpen(false);
            const list = await getTransferencias(idEvento);
            setTfDestinos(list);
        } catch (err: any) {
            addToast(err.message || 'Error al guardar destino', 'error');
        } finally {
            setTfSaving(false);
        }
    };

    const handleToggleTfActivo = async (tf: TransferenciaDestino) => {
        if (tf.id_evento_regalo_transferencia === null) return;
        try {
            const nextVal = !tf.activo;
            await toggleTransferenciaActivo(idEvento, tf.id_evento_regalo_transferencia, nextVal);
            setTfDestinos(prev =>
                prev.map(x => x.id_evento_regalo_transferencia === tf.id_evento_regalo_transferencia ? { ...x, activo: nextVal } : x)
            );
            addToast(nextVal ? 'Destino activado' : 'Destino desactivado', 'success');
        } catch (err: any) {
            addToast(err.message || 'Error al cambiar estado', 'error');
        }
    };

    // ─────────────────────────────────────────────────────────────────
    // ACCIONES: LISTA DE REGALOS
    // ─────────────────────────────────────────────────────────────────
    const handleOpenRegaloModal = (regalo: RegaloItem | null = null) => {
        setSelectedRegalo(regalo);
        if (regalo) {
            setRegaloForm({
                titulo: regalo.titulo,
                descripcion: regalo.descripcion || '',
                cantidad_total: regalo.cantidad_total,
                permitir_excedente: regalo.permitir_excedente || false,
                orden: regalo.orden,
                visible: regalo.visible
            });
        } else {
            setRegaloForm({
                titulo: '',
                descripcion: '',
                cantidad_total: 1,
                permitir_excedente: false,
                orden: regalos.length + 1,
                visible: true
            });
        }
        setIsRegaloModalOpen(true);
    };

    const handleSaveRegalo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regaloForm.titulo.trim()) {
            addToast('El título del regalo es obligatorio', 'error');
            return;
        }
        if (regaloForm.cantidad_total < 1) {
            addToast('La cantidad debe ser mayor o igual a 1', 'error');
            return;
        }
        setRegaloSaving(true);
        try {
            const payload: RegaloItem = {
                id_regalo_item: selectedRegalo ? selectedRegalo.id_regalo_item : null,
                id_evento: idEvento,
                titulo: regaloForm.titulo.trim(),
                descripcion: regaloForm.descripcion.trim() || null,
                cantidad_total: regaloForm.cantidad_total,
                permitir_excedente: regaloForm.permitir_excedente,
                orden: regaloForm.orden,
                visible: regaloForm.visible
            };
            await saveRegaloItem(idEvento, payload);
            addToast('Regalo guardado correctamente', 'success');
            setIsRegaloModalOpen(false);
            const items = await getListaRegalos(idEvento);
            setRegalos(items);
        } catch (err: any) {
            addToast(err.message || 'Error al guardar regalo', 'error');
        } finally {
            setRegaloSaving(false);
        }
    };

    const handleToggleRegaloVisible = async (regalo: RegaloItem) => {
        if (regalo.id_regalo_item === null) return;
        try {
            const nextVal = !regalo.visible;
            await toggleRegaloVisible(idEvento, regalo.id_regalo_item, nextVal);
            setRegalos(prev =>
                prev.map(x => x.id_regalo_item === regalo.id_regalo_item ? { ...x, visible: nextVal } : x)
            );
            addToast(nextVal ? 'Regalo visible en la lista' : 'Regalo oculto en la lista', 'success');
        } catch (err: any) {
            addToast(err.message || 'Error al cambiar visibilidad', 'error');
        }
    };

    const handleDuplicarRegalo = async (regalo: RegaloItem) => {
        if (regalo.id_regalo_item === null) return;
        try {
            await duplicarRegaloItem(idEvento, regalo.id_regalo_item);
            addToast('Regalo duplicado', 'success');
            const items = await getListaRegalos(idEvento);
            setRegalos(items);
        } catch (err: any) {
            addToast(err.message || 'Error al duplicar regalo', 'error');
        }
    };

    // ─────────────────────────────────────────────────────────────────
    // ACCIONES: FONDO / METAS
    // ─────────────────────────────────────────────────────────────────
    const handleCrearFondoInicial = async () => {
        setFondoSaving(true);
        try {
            const defaultFondo: FondoConfig = {
                id_fondo: null,
                id_evento: idEvento,
                titulo: 'Ayudanos con la luna de miel ✨',
                descripcion_publica: 'Elegí una experiencia y aportá lo que quieras.',
                moneda_base: monedas[0]?.codigo || 'ARS',
                modo_confirmacion: 'INVITADO_Y_ORGANIZADOR',
                permitir_excedente: true,
                mostrar_pendientes: true,
                mostrar_muro_mensajes: true,
                permitir_anonimo: true,
                activo: true
            };
            const saved = await saveFondo(idEvento, defaultFondo);
            setFondo(saved);
            addToast('Fondo de metas creado', 'success');
            const mList = await getMetas(idEvento).catch(() => []);
            setMetas(mList);
        } catch (err: any) {
            addToast(err.message || 'Error al crear fondo', 'error');
        } finally {
            setFondoSaving(false);
        }
    };

    const handleSaveFondo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fondo) return;
        if (!fondo.titulo.trim()) {
            addToast('El título del fondo es obligatorio', 'error');
            return;
        }
        setFondoSaving(true);
        try {
            const saved = await saveFondo(idEvento, fondo);
            setFondo(saved);
            addToast('Fondo guardado correctamente', 'success');
        } catch (err: any) {
            addToast(err.message || 'Error al guardar fondo', 'error');
        } finally {
            setFondoSaving(false);
        }
    };

    const handleOpenMetaModal = (meta: MetaItem | null = null) => {
        setSelectedMeta(meta);
        if (meta) {
            setMetaForm({
                titulo: meta.titulo,
                descripcion: meta.descripcion || '',
                objetivo_monto: meta.objetivo_monto,
                orden: meta.orden,
                visible: meta.visible
            });
        } else {
            setMetaForm({
                titulo: '',
                descripcion: '',
                objetivo_monto: 100,
                orden: metas.length + 1,
                visible: true
            });
        }
        setIsMetaModalOpen(true);
    };

    const handleSaveMeta = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fondo) return;
        if (!metaForm.titulo.trim()) {
            addToast('El título de la meta es obligatorio', 'error');
            return;
        }
        if (metaForm.objetivo_monto <= 0) {
            addToast('El monto objetivo debe ser mayor a 0', 'error');
            return;
        }
        setMetaSaving(true);
        try {
            const payload: MetaItem = {
                id_meta: selectedMeta ? selectedMeta.id_meta : null,
                id_evento: idEvento,
                id_fondo: fondo.id_fondo!,
                tipo_meta: 'GENERICA',
                titulo: metaForm.titulo.trim(),
                descripcion: metaForm.descripcion.trim() || null,
                objetivo_monto: metaForm.objetivo_monto,
                orden: metaForm.orden,
                visible: metaForm.visible
            };
            await saveMeta(idEvento, payload);
            addToast('Meta guardada correctamente', 'success');
            setIsMetaModalOpen(false);
            const mList = await getMetas(idEvento);
            setMetas(mList);
        } catch (err: any) {
            addToast(err.message || 'Error al guardar meta', 'error');
        } finally {
            setMetaSaving(false);
        }
    };

    const handleToggleMetaVisible = async (meta: MetaItem) => {
        if (meta.id_meta === null) return;
        try {
            const nextVal = !meta.visible;
            await toggleMetaVisible(idEvento, meta.id_meta, nextVal);
            setMetas(prev =>
                prev.map(x => x.id_meta === meta.id_meta ? { ...x, visible: nextVal } : x)
            );
            addToast(nextVal ? 'Meta visible' : 'Meta oculta', 'success');
        } catch (err: any) {
            addToast(err.message || 'Error al cambiar visibilidad', 'error');
        }
    };

    // Confirmar Aportes
    const handleOpenConfirmAporteModal = (aporte: AporteItem) => {
        setSelectedAporte(aporte);
        setConfirmAporteForm({
            monto_base_calculado: aporte.monto_aporte,
            tipo_cambio_usado: ''
        });
        setIsConfirmAporteModalOpen(true);
    };

    const handleConfirmAporteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAporte) return;
        if (confirmAporteForm.monto_base_calculado <= 0) {
            addToast('El monto confirmado debe ser mayor a 0', 'error');
            return;
        }
        setConfirmAporteSaving(true);
        try {
            const tc = parseFloat(confirmAporteForm.tipo_cambio_usado);
            const payload = {
                monto_base_calculado: confirmAporteForm.monto_base_calculado,
                tipo_cambio_usado: isNaN(tc) ? null : tc
            };
            await confirmarAporte(idEvento, selectedAporte.id_aporte, payload);
            addToast('Aporte confirmado correctamente', 'success');
            setIsConfirmAporteModalOpen(false);
            await loadAportes(idEvento);
            // También recargar metas ya que el total_confirmado cambió
            const mList = await getMetas(idEvento).catch(() => []);
            setMetas(mList);
        } catch (err: any) {
            addToast(err.message || 'Error al confirmar aporte', 'error');
        } finally {
            setConfirmAporteSaving(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency || 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* ── Breadcrumbs & Back ── */}
            <div className="flex items-center gap-3">
                <Link
                    href={`/dashboard/events/${idEvento}`}
                    className="p-2 text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Configurar Regalos y Cuentas</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Cargá tus datos de transferencia, lista de regalos y administrá los aportes para tu fondo.
                    </p>
                </div>
            </div>

            {/* Tabs de Regalos */}
            <div className="flex p-1 bg-card-bg/50 rounded-2xl border border-card-border overflow-x-auto">
                <button
                    onClick={() => setActiveTab('transferencias')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap px-4 ${activeTab === 'transferencias'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-neutral-400 hover:text-foreground hover:bg-white/5'
                        }`}
                >
                    <CreditCard className="w-4 h-4" />
                    Datos para Transferencias
                </button>
                <button
                    onClick={() => setActiveTab('lista')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap px-4 ${activeTab === 'lista'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-neutral-400 hover:text-foreground hover:bg-white/5'
                        }`}
                >
                    <Gift className="w-4 h-4" />
                    Lista de Regalos
                </button>
                <button
                    onClick={() => setActiveTab('fondo')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap px-4 ${activeTab === 'fondo'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-neutral-400 hover:text-foreground hover:bg-white/5'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Fondo / Metas con barra
                </button>
            </div>

            {/* loader */}
            {loading ? (
                <div className="p-16 rounded-3xl bg-card-bg border border-card-border flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    <p className="text-neutral-400 text-sm">Cargando información del módulo...</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* TAB: TRANSFERENCIAS */}
                    {activeTab === 'transferencias' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Configuración Intro */}
                            <div className="lg:col-span-1 bg-card-bg border border-card-border p-6 rounded-2xl space-y-6">
                                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-card-border pb-3">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                    Introducción Sección
                                </h3>
                                <form onSubmit={handleSaveTfConfig} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Título de Sección</label>
                                        <input
                                            type="text"
                                            value={tfConfig.titulo}
                                            onChange={e => setTfConfig({ ...tfConfig, titulo: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                            placeholder="Ej: Regalos / Donaciones"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Texto Introductorio</label>
                                        <textarea
                                            value={tfConfig.texto_intro || ''}
                                            onChange={e => setTfConfig({ ...tfConfig, texto_intro: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none h-28 resize-none"
                                            placeholder="Mensaje de bienvenida y agradecimiento..."
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-background border border-card-border rounded-xl">
                                        <span className="text-xs font-bold text-neutral-400 uppercase">Activar Transferencias</span>
                                        <button
                                            type="button"
                                            onClick={() => setTfConfig({ ...tfConfig, activo: !tfConfig.activo })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${tfConfig.activo ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${tfConfig.activo ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={tfConfigSaving}
                                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-wider"
                                    >
                                        {tfConfigSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </form>
                            </div>

                            {/* Grilla Destinos */}
                            <div className="lg:col-span-2 bg-card-bg border border-card-border p-6 rounded-2xl space-y-6">
                                <div className="flex items-center justify-between border-b border-card-border pb-3">
                                    <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-indigo-400" />
                                        Cuentas y Destinos de Transferencia
                                    </h3>
                                    <button
                                        onClick={() => handleOpenTfModal()}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Agregar Destino
                                    </button>
                                </div>

                                {tfDestinos.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-neutral-500 border border-dashed border-card-border rounded-xl">
                                        No has cargado ningún destino de transferencia todavía.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-card-border bg-background">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-card-border bg-card-bg/30 text-neutral-400 font-bold uppercase tracking-wider">
                                                    <th className="p-3">Orden</th>
                                                    <th className="p-3">Moneda</th>
                                                    <th className="p-3">Título</th>
                                                    <th className="p-3">Datos</th>
                                                    <th className="p-3 text-center">Activo</th>
                                                    <th className="p-3 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tfDestinos.map(tf => (
                                                    <tr key={tf.id_evento_regalo_transferencia} className="border-b border-card-border/50 hover:bg-card-bg/20 transition-colors">
                                                        <td className="p-3 font-mono">{tf.orden}</td>
                                                        <td className="p-3">
                                                            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-black">{tf.codigo_moneda}</span>
                                                        </td>
                                                        <td className="p-3 font-semibold">{tf.titulo || '—'}</td>
                                                        <td className="p-3 font-mono truncate max-w-xs">{tf.datos_transferencia_texto.split('\n')[0]}...</td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => handleToggleTfActivo(tf)}
                                                                className={`px-2 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider ${tf.activo
                                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                                    : 'bg-neutral-600/10 border-neutral-600/20 text-neutral-400'
                                                                    }`}
                                                            >
                                                                {tf.activo ? 'Sí' : 'No'}
                                                            </button>
                                                        </td>
                                                        <td className="p-3 text-right space-x-2">
                                                            <button
                                                                onClick={() => handleOpenTfModal(tf)}
                                                                className="p-1 text-neutral-400 hover:text-indigo-400 transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: LISTA DE REGALOS */}
                    {activeTab === 'lista' && (
                        <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-6">
                            <div className="flex items-center justify-between border-b border-card-border pb-3">
                                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-indigo-400" />
                                    Artículos de Regalo Disponibles
                                </h3>
                                <button
                                    onClick={() => handleOpenRegaloModal()}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Agregar Regalo
                                </button>
                            </div>

                            {regalos.length === 0 ? (
                                <div className="text-center py-12 text-sm text-neutral-500 border border-dashed border-card-border rounded-xl">
                                    Aún no has agregado ítems a la lista de regalos.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-card-border bg-background">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-card-border bg-card-bg/30 text-neutral-400 font-bold uppercase tracking-wider">
                                                <th className="p-3">Orden</th>
                                                <th className="p-3">Artículo</th>
                                                <th className="p-3">Descripción</th>
                                                <th className="p-3 text-center">Cant. Total</th>
                                                <th className="p-3 text-center">Reservado</th>
                                                <th className="p-3 text-center">Disponible</th>
                                                <th className="p-3 text-center">Visible</th>
                                                <th className="p-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regalos.map(item => (
                                                <tr key={item.id_regalo_item} className="border-b border-card-border/50 hover:bg-card-bg/20 transition-colors">
                                                    <td className="p-3 font-mono">{item.orden}</td>
                                                    <td className="p-3 font-semibold text-foreground text-sm">{item.titulo}</td>
                                                    <td className="p-3 text-neutral-400 truncate max-w-[200px]">{item.descripcion || '—'}</td>
                                                    <td className="p-3 text-center font-bold text-foreground">{item.cantidad_total}</td>
                                                    <td className="p-3 text-center font-bold text-indigo-400">{item.cantidad_reservada ?? 0}</td>
                                                    <td className="p-3 text-center font-bold text-emerald-400">{item.cantidad_disponible ?? item.cantidad_total}</td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => handleToggleRegaloVisible(item)}
                                                            className="p-1 hover:scale-110 transition-transform"
                                                            title={item.visible ? 'Ocultar en portal' : 'Hacer visible en portal'}
                                                        >
                                                            {item.visible ? (
                                                                <Eye className="w-4 h-4 text-emerald-400" />
                                                            ) : (
                                                                <EyeOff className="w-4 h-4 text-neutral-500" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="p-3 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleDuplicarRegalo(item)}
                                                            className="p-1.5 text-neutral-400 hover:text-indigo-400 transition-colors bg-card-bg border border-card-border rounded-lg"
                                                            title="Duplicar item"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenRegaloModal(item)}
                                                            className="p-1.5 text-neutral-400 hover:text-indigo-400 transition-colors bg-card-bg border border-card-border rounded-lg"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: FONDO / METAS */}
                    {activeTab === 'fondo' && (
                        <div className="space-y-6">
                            {fondo === null ? (
                                <div className="p-12 rounded-3xl bg-card-bg border border-card-border flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
                                    <Sparkles className="w-12 h-12 text-indigo-500 animate-pulse" />
                                    <h3 className="text-lg font-bold text-foreground">Aún no creaste un fondo monetizable</h3>
                                    <p className="text-sm text-neutral-400">
                                        Crear un fondo permite definir una meta general (como la Luna de Miel) y subdividirla en metas específicas donde los invitados pueden aportar libremente.
                                    </p>
                                    <button
                                        onClick={handleCrearFondoInicial}
                                        disabled={fondoSaving}
                                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {fondoSaving ? 'Creando fondo...' : 'Crear Fondo e Iniciar Metas'}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Configuración del Fondo */}
                                    <div className="lg:col-span-1 bg-card-bg border border-card-border p-6 rounded-2xl space-y-6">
                                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-card-border pb-3">
                                            <Sparkles className="w-4 h-4 text-indigo-400" />
                                            Fondo de Metas
                                        </h3>
                                        <form onSubmit={handleSaveFondo} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Título del Fondo</label>
                                                <input
                                                    type="text"
                                                    value={fondo.titulo}
                                                    onChange={e => setFondo({ ...fondo, titulo: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                                    placeholder="Ej: Ayudanos con la luna de miel"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Descripción Pública</label>
                                                <textarea
                                                    value={fondo.descripcion_publica || ''}
                                                    onChange={e => setFondo({ ...fondo, descripcion_publica: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none h-24 resize-none"
                                                    placeholder="Indicaciones para los invitados sobre cómo aportar..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Moneda Base</label>
                                                    <select
                                                        value={fondo.moneda_base}
                                                        onChange={e => setFondo({ ...fondo, moneda_base: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                                    >
                                                        {monedas.map(m => {
                                                            const cod = m.codigo_moneda || m.codigo;
                                                            return (
                                                                <option key={cod} value={cod}>{cod} ({m.simbolo})</option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Confirmación</label>
                                                    <select
                                                        value={fondo.modo_confirmacion}
                                                        onChange={e => setFondo({ ...fondo, modo_confirmacion: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                                    >
                                                        <option value="INVITADO_Y_ORGANIZADOR">Invitado y Org.</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Permitir Excedente</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFondo({ ...fondo, permitir_excedente: !fondo.permitir_excedente })}
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${fondo.permitir_excedente ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${fondo.permitir_excedente ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Mostrar Aportes Pendientes</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFondo({ ...fondo, mostrar_pendientes: !fondo.mostrar_pendientes })}
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${fondo.mostrar_pendientes ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${fondo.mostrar_pendientes ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Permitir Aportes Anónimos</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFondo({ ...fondo, permitir_anonimo: !fondo.permitir_anonimo })}
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${fondo.permitir_anonimo ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${fondo.permitir_anonimo ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Fondo Activo y Visible</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFondo({ ...fondo, activo: !fondo.activo })}
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${fondo.activo ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${fondo.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={fondoSaving}
                                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-wider"
                                            >
                                                {fondoSaving ? 'Guardando...' : 'Guardar Fondo'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Metas y Aportes */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Sección Metas */}
                                        <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-6">
                                            <div className="flex items-center justify-between border-b border-card-border pb-3">
                                                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <List className="w-4 h-4 text-indigo-400" />
                                                    Metas Monetizables
                                                </h3>
                                                <button
                                                    onClick={() => handleOpenMetaModal()}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Agregar Meta
                                                </button>
                                            </div>

                                            {metas.length === 0 ? (
                                                <div className="text-center py-12 text-sm text-neutral-500 border border-dashed border-card-border rounded-xl">
                                                    No has cargado metas para tu fondo.
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto rounded-xl border border-card-border bg-background">
                                                    <table className="w-full text-left border-collapse text-xs">
                                                        <thead>
                                                            <tr className="border-b border-card-border bg-card-bg/30 text-neutral-400 font-bold uppercase tracking-wider">
                                                                <th className="p-3">Orden</th>
                                                                <th className="p-3">Meta</th>
                                                                <th className="p-3">Monto Objetivo</th>
                                                                <th className="p-3">Confirmado</th>
                                                                {fondo.mostrar_pendientes && <th className="p-3">Pendiente</th>}
                                                                <th className="p-3 text-center">Progreso</th>
                                                                <th className="p-3 text-center">Visible</th>
                                                                <th className="p-3 text-right">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {metas.map(m => (
                                                                <tr key={m.id_meta} className="border-b border-card-border/50 hover:bg-card-bg/20 transition-colors">
                                                                    <td className="p-3 font-mono">{m.orden}</td>
                                                                    <td className="p-3 font-semibold text-foreground">{m.titulo}</td>
                                                                    <td className="p-3 font-mono font-bold text-foreground">{formatCurrency(m.objetivo_monto, fondo.moneda_base)}</td>
                                                                    <td className="p-3 font-mono font-semibold text-emerald-400">{formatCurrency(m.total_confirmado ?? 0, fondo.moneda_base)}</td>
                                                                    {fondo.mostrar_pendientes && (
                                                                        <td className="p-3 font-mono text-amber-500">{formatCurrency(m.total_pendiente ?? 0, fondo.moneda_base)}</td>
                                                                    )}
                                                                    <td className="p-3">
                                                                        <div className="flex items-center gap-2 min-w-[80px]">
                                                                            <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                                                                                <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, m.porcentaje || 0)}%` }} />
                                                                            </div>
                                                                            <span className="font-mono text-[10px] font-bold">{(m.porcentaje || 0).toFixed(0)}%</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        <button
                                                                            onClick={() => handleToggleMetaVisible(m)}
                                                                            className="p-1 hover:scale-110 transition-transform"
                                                                        >
                                                                            {m.visible ? (
                                                                                <Eye className="w-4 h-4 text-emerald-400" />
                                                                            ) : (
                                                                                <EyeOff className="w-4 h-4 text-neutral-500" />
                                                                            )}
                                                                        </button>
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <button
                                                                            onClick={() => handleOpenMetaModal(m)}
                                                                            className="p-1.5 text-neutral-400 hover:text-indigo-400 transition-colors bg-card-bg border border-card-border rounded-lg"
                                                                        >
                                                                            <Edit className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sección Aportes */}
                                        <div className="bg-card-bg border border-card-border p-6 rounded-2xl space-y-6">
                                            <div className="flex items-center justify-between border-b border-card-border pb-3">
                                                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Coins className="w-4 h-4 text-indigo-400" />
                                                    Aportes de Invitados
                                                </h3>
                                                <div className="flex p-0.5 bg-background border border-card-border rounded-lg text-xs">
                                                    <button
                                                        onClick={() => setAportesTab('pendientes')}
                                                        className={`px-3 py-1.5 font-bold rounded-md transition-all ${aportesTab === 'pendientes' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-foreground'}`}
                                                    >
                                                        Pendientes
                                                    </button>
                                                    <button
                                                        onClick={() => setAportesTab('confirmados')}
                                                        className={`px-3 py-1.5 font-bold rounded-md transition-all ${aportesTab === 'confirmados' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-foreground'}`}
                                                    >
                                                        Confirmados
                                                    </button>
                                                </div>
                                            </div>

                                            {aportesLoading ? (
                                                <div className="py-12 flex justify-center items-center">
                                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Pendientes */}
                                                    {aportesTab === 'pendientes' && (
                                                        aportesPendientes.length === 0 ? (
                                                            <div className="text-center py-8 text-sm text-neutral-500">
                                                                No hay aportes declarados pendientes de confirmación.
                                                            </div>
                                                        ) : (
                                                            <div className="overflow-x-auto rounded-xl border border-card-border bg-background">
                                                                <table className="w-full text-left border-collapse text-xs">
                                                                    <thead>
                                                                        <tr className="border-b border-card-border bg-card-bg/30 text-neutral-400 font-bold uppercase tracking-wider">
                                                                            <th className="p-3">Fecha</th>
                                                                            <th className="p-3">Meta</th>
                                                                            <th className="p-3">Invitado</th>
                                                                            <th className="p-3">Monto Declarado</th>
                                                                            <th className="p-3">Mensaje</th>
                                                                            <th className="p-3 text-right">Acción</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {aportesPendientes.map(ap => (
                                                                            <tr key={ap.id_aporte} className="border-b border-card-border/50 hover:bg-card-bg/20 transition-colors">
                                                                                <td className="p-3 text-neutral-400 whitespace-nowrap">{new Date(ap.fecha_declara).toLocaleDateString()}</td>
                                                                                <td className="p-3 font-semibold text-foreground">{ap.meta_titulo}</td>
                                                                                <td className="p-3 font-medium text-foreground">{ap.es_anonimo ? 'Anónimo' : (ap.nombre_mostrado || '(sin nombre)')}</td>
                                                                                <td className="p-3 font-mono font-bold text-foreground">{ap.monto_aporte} {ap.moneda_aporte}</td>
                                                                                <td className="p-3 text-neutral-400 max-w-xs truncate" title={ap.mensaje || ''}>{ap.mensaje || '—'}</td>
                                                                                <td className="p-3 text-right">
                                                                                    <button
                                                                                        onClick={() => handleOpenConfirmAporteModal(ap)}
                                                                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors"
                                                                                    >
                                                                                        Confirmar
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )
                                                    )}

                                                    {/* Confirmados */}
                                                    {aportesTab === 'confirmados' && (
                                                        aportesConfirmados.length === 0 ? (
                                                            <div className="text-center py-8 text-sm text-neutral-500">
                                                                Aún no has confirmado ningún aporte.
                                                            </div>
                                                        ) : (
                                                            <div className="overflow-x-auto rounded-xl border border-card-border bg-background">
                                                                <table className="w-full text-left border-collapse text-xs">
                                                                    <thead>
                                                                        <tr className="border-b border-card-border bg-card-bg/30 text-neutral-400 font-bold uppercase tracking-wider">
                                                                            <th className="p-3">Fecha Declara</th>
                                                                            <th className="p-3">Fecha Confirma</th>
                                                                            <th className="p-3">Meta</th>
                                                                            <th className="p-3">Invitado</th>
                                                                            <th className="p-3">Monto Declarado</th>
                                                                            <th className="p-3">Confirmado Base</th>
                                                                            <th className="p-3">Tipo Cambio</th>
                                                                            <th className="p-3">Mensaje</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {aportesConfirmados.map(ap => (
                                                                            <tr key={ap.id_aporte} className="border-b border-card-border/50 hover:bg-card-bg/20 transition-colors">
                                                                                <td className="p-3 text-neutral-400 whitespace-nowrap">{new Date(ap.fecha_declara).toLocaleDateString()}</td>
                                                                                <td className="p-3 text-neutral-400 whitespace-nowrap">{ap.fecha_confirma ? new Date(ap.fecha_confirma).toLocaleDateString() : '—'}</td>
                                                                                <td className="p-3 font-semibold text-foreground">{ap.meta_titulo}</td>
                                                                                <td className="p-3 font-medium text-foreground">{ap.es_anonimo ? 'Anónimo' : (ap.nombre_mostrado || '(sin nombre)')}</td>
                                                                                <td className="p-3 font-mono text-neutral-400">{ap.monto_aporte} {ap.moneda_aporte}</td>
                                                                                <td className="p-3 font-mono font-bold text-emerald-400">{formatCurrency(ap.monto_base_calculado ?? 0, fondo.moneda_base)}</td>
                                                                                <td className="p-3 font-mono text-neutral-400">{ap.tipo_cambio_usado ? ap.tipo_cambio_usado.toFixed(4) : '—'}</td>
                                                                                <td className="p-3 text-neutral-400 max-w-xs truncate" title={ap.mensaje || ''}>{ap.mensaje || '—'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── MODAL: TRANSFERENCIAS ── */}
            {isTfModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card-bg rounded-3xl shadow-2xl border border-card-border animate-in zoom-in-95 duration-200 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-card-border pb-3">
                            <h3 className="text-base font-bold text-foreground">
                                {selectedTf ? 'Editar Destino de Transferencia' : 'Agregar Destino de Transferencia'}
                            </h3>
                            <button onClick={() => setIsTfModalOpen(false)} className="text-neutral-400 hover:text-foreground text-xs font-bold bg-white/5 border border-card-border p-1.5 rounded-xl transition-all">Cerrar</button>
                        </div>
                        <form onSubmit={handleSaveTfDestino} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Moneda *</label>
                                    <select
                                        value={tfForm.codigo_moneda}
                                        onChange={e => setTfForm({ ...tfForm, codigo_moneda: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        required
                                    >
                                        {monedas.map(m => {
                                            const cod = m.codigo_moneda || m.codigo;
                                            return (
                                                <option key={cod} value={cod}>{cod} ({m.simbolo})</option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Título / Etiqueta</label>
                                    <input
                                        type="text"
                                        value={tfForm.titulo}
                                        onChange={e => setTfForm({ ...tfForm, titulo: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        placeholder="Ej: Novia (ARS), Novio (USD)"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Datos para transferir *</label>
                                <textarea
                                    value={tfForm.datos_transferencia_texto}
                                    onChange={e => setTfForm({ ...tfForm, datos_transferencia_texto: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none h-32 resize-none font-mono"
                                    placeholder="Alias: mi.boda.alias&#10;CBU: 000000000000000000&#10;Banco: Galicia"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Instrucciones de Referencia</label>
                                <input
                                    type="text"
                                    value={tfForm.instrucciones}
                                    onChange={e => setTfForm({ ...tfForm, instrucciones: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                    placeholder="Ej: Incluir concepto BODA + Nombre"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Orden de Visualización</label>
                                    <input
                                        type="number"
                                        value={tfForm.orden}
                                        onChange={e => setTfForm({ ...tfForm, orden: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center justify-between p-3.5 bg-background border border-card-border rounded-xl">
                                        <span className="text-xs font-bold text-neutral-400 uppercase">Destino Activo</span>
                                        <button
                                            type="button"
                                            onClick={() => setTfForm({ ...tfForm, activo: !tfForm.activo })}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${tfForm.activo ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${tfForm.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                                <button
                                    type="button"
                                    onClick={() => setIsTfModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-background border border-card-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold uppercase transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={tfSaving}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 uppercase transition-all disabled:opacity-50"
                                >
                                    {tfSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: REGALO ITEM ── */}
            {isRegaloModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card-bg rounded-3xl shadow-2xl border border-card-border animate-in zoom-in-95 duration-200 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-card-border pb-3">
                            <h3 className="text-base font-bold text-foreground">
                                {selectedRegalo ? 'Editar Regalo' : 'Agregar Regalo'}
                            </h3>
                            <button onClick={() => setIsRegaloModalOpen(false)} className="text-neutral-400 hover:text-foreground text-xs font-bold bg-white/5 border border-card-border p-1.5 rounded-xl transition-all">Cerrar</button>
                        </div>
                        <form onSubmit={handleSaveRegalo} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Título / Regalo *</label>
                                <input
                                    type="text"
                                    value={regaloForm.titulo}
                                    onChange={e => setRegaloForm({ ...regaloForm, titulo: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                    placeholder="Ej: Juego de Platos, Cafetera, Bicicleta"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Descripción (opcional)</label>
                                <textarea
                                    value={regaloForm.descripcion}
                                    onChange={e => setRegaloForm({ ...regaloForm, descripcion: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none h-20 resize-none"
                                    placeholder="Detalles sobre color, modelo o lugar sugerido..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Cantidad Total *</label>
                                    <input
                                        type="number"
                                        value={regaloForm.cantidad_total}
                                        onChange={e => setRegaloForm({ ...regaloForm, cantidad_total: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center justify-between p-3.5 bg-background border border-card-border rounded-xl">
                                        <span className="text-xs font-bold text-neutral-400 uppercase">Permitir Excedente</span>
                                        <button
                                            type="button"
                                            onClick={() => setRegaloForm({ ...regaloForm, permitir_excedente: !regaloForm.permitir_excedente })}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${regaloForm.permitir_excedente ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${regaloForm.permitir_excedente ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Orden</label>
                                    <input
                                        type="number"
                                        value={regaloForm.orden}
                                        onChange={e => setRegaloForm({ ...regaloForm, orden: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center justify-between p-3.5 bg-background border border-card-border rounded-xl">
                                        <span className="text-xs font-bold text-neutral-400 uppercase">Regalo Visible</span>
                                        <button
                                            type="button"
                                            onClick={() => setRegaloForm({ ...regaloForm, visible: !regaloForm.visible })}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${regaloForm.visible ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${regaloForm.visible ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                                <button
                                    type="button"
                                    onClick={() => setIsRegaloModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-background border border-card-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold uppercase transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={regaloSaving}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 uppercase transition-all disabled:opacity-50"
                                >
                                    {regaloSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: META ── */}
            {isMetaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card-bg rounded-3xl shadow-2xl border border-card-border animate-in zoom-in-95 duration-200 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-card-border pb-3">
                            <h3 className="text-base font-bold text-foreground">
                                {selectedMeta ? 'Editar Meta' : 'Agregar Meta'}
                            </h3>
                            <button onClick={() => setIsMetaModalOpen(false)} className="text-neutral-400 hover:text-foreground text-xs font-bold bg-white/5 border border-card-border p-1.5 rounded-xl transition-all">Cerrar</button>
                        </div>
                        <form onSubmit={handleSaveMeta} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Título de Meta *</label>
                                <input
                                    type="text"
                                    value={metaForm.titulo}
                                    onChange={e => setMetaForm({ ...metaForm, titulo: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                    placeholder="Ej: 3 Noches de Hotel, Excursión en Bote"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Descripción (opcional)</label>
                                <textarea
                                    value={metaForm.descripcion}
                                    onChange={e => setMetaForm({ ...metaForm, descripcion: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none h-20 resize-none"
                                    placeholder="Detalles sobre la experiencia..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Monto Objetivo ({fondo?.moneda_base}) *</label>
                                    <input
                                        type="number"
                                        value={metaForm.objetivo_monto}
                                        onChange={e => setMetaForm({ ...metaForm, objetivo_monto: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        min="1"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Orden de Visualización</label>
                                    <input
                                        type="number"
                                        value={metaForm.orden}
                                        onChange={e => setMetaForm({ ...metaForm, orden: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-background border border-card-border rounded-xl">
                                <span className="text-xs font-bold text-neutral-400 uppercase">Meta Visible</span>
                                <button
                                    type="button"
                                    onClick={() => setMetaForm({ ...metaForm, visible: !metaForm.visible })}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${metaForm.visible ? 'bg-indigo-600' : 'bg-neutral-600'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${metaForm.visible ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                                <button
                                    type="button"
                                    onClick={() => setIsMetaModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-background border border-card-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold uppercase transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={metaSaving}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 uppercase transition-all disabled:opacity-50"
                                >
                                    {metaSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: CONFIRMAR APORTE ── */}
            {isConfirmAporteModalOpen && selectedAporte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card-bg rounded-3xl shadow-2xl border border-card-border animate-in zoom-in-95 duration-200 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-card-border pb-3">
                            <h3 className="text-base font-bold text-foreground">Confirmar Aporte Recibido</h3>
                            <button onClick={() => setIsConfirmAporteModalOpen(false)} className="text-neutral-400 hover:text-foreground text-xs font-bold bg-white/5 border border-card-border p-1.5 rounded-xl transition-all">Cerrar</button>
                        </div>

                        {/* Datos de solo lectura del aporte */}
                        <div className="p-4 bg-background border border-card-border rounded-2xl space-y-2.5 text-xs text-neutral-400">
                            <div className="flex justify-between">
                                <span>Meta Destino:</span>
                                <strong className="text-foreground">{selectedAporte.meta_titulo}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Invitado:</span>
                                <strong className="text-foreground">{selectedAporte.es_anonimo ? 'Anónimo' : (selectedAporte.nombre_mostrado || 'Sin nombre')}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Monto Declarado:</span>
                                <strong className="text-foreground font-mono">{selectedAporte.monto_aporte} {selectedAporte.moneda_aporte}</strong>
                            </div>
                            {selectedAporte.mensaje && (
                                <div className="pt-2 border-t border-card-border/50">
                                    <span>Mensaje:</span>
                                    <p className="italic text-foreground mt-0.5">&quot;{selectedAporte.mensaje}&quot;</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs flex gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>El monto declarado es una referencia del invitado. Confirmá el monto real que ingresó a tu cuenta.</p>
                        </div>

                        <form onSubmit={handleConfirmAporteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">
                                    Monto confirmado en {fondo?.moneda_base} *
                                </label>
                                <input
                                    type="number"
                                    value={confirmAporteForm.monto_base_calculado}
                                    onChange={e => setConfirmAporteForm({ ...confirmAporteForm, monto_base_calculado: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none font-mono"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {selectedAporte.moneda_aporte !== fondo?.moneda_base && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">
                                        Tipo de cambio usado ({selectedAporte.moneda_aporte} a {fondo?.moneda_base})
                                    </label>
                                    <input
                                        type="number"
                                        value={confirmAporteForm.tipo_cambio_usado}
                                        onChange={e => setConfirmAporteForm({ ...confirmAporteForm, tipo_cambio_usado: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground focus:border-indigo-500 outline-none font-mono"
                                        placeholder="Ej: 0.92"
                                        step="0.000001"
                                    />
                                    <span className="text-[10px] text-neutral-500 mt-1 block">Solo para dejar constancia de cómo convertiste el valor.</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmAporteModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-background border border-card-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold uppercase transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={confirmAporteSaving}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 uppercase transition-all disabled:opacity-50"
                                >
                                    {confirmAporteSaving ? 'Confirmando...' : 'Confirmar Aporte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
