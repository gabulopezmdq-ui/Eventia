import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  CalendarDays, 
  UtensilsCrossed, 
  WheatOff, 
  Stethoscope, 
  UserMinus,
  Loader2,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Download,
  Eye,
  QrCode
} from 'lucide-react';
import { 
  DetalleInscripcionOperativo,
  ParticipanteDetalle,
  EstadoPago,
  EstadoInscripcion,
  AutorizadoRetiro
} from '@/src/features/inscripcion/types/panel-inscriptos.types';
import { getDetalleInscripcion } from '@/src/features/inscripcion/panel-inscriptos.service';
import {
  createAutorizacionOperador,
  updateAutorizacion,
  deleteAutorizacion
} from '@/src/features/programas/autorizaciones-retiro.service';

interface DetalleInscripcionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  idInscripcion: number | null;
}

export default function DetalleInscripcionDrawer({ isOpen, onClose, idInscripcion }: DetalleInscripcionDrawerProps) {
  const [detalle, setDetalle] = useState<DetalleInscripcionOperativo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetalle = useCallback(async () => {
    if (!idInscripcion) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDetalleInscripcion(idInscripcion);
      setDetalle(data);
    } catch (err) {
      setError('No se pudo cargar el detalle operativo.');
    } finally {
      setIsLoading(false);
    }
  }, [idInscripcion]);

  useEffect(() => {
    if (isOpen) {
      loadDetalle();
    }
  }, [isOpen, loadDetalle]);

  const formatearMoneda = (valor: number, moneda: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda || 'EUR',
    }).format(valor);
  };

  const BadgePago = ({ estado }: { estado: EstadoPago }) => {
    const configs: Record<EstadoPago, { color: string, text: string }> = {
      PENDIENTE: { color: 'bg-red-500/10 text-red-600 border-red-500/20', text: 'PENDIENTE' },
      PARCIAL: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', text: 'PARCIAL' },
      PAGADO: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', text: 'PAGADO' },
      SIN_CARGO: { color: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20', text: 'SIN CARGO' },
    };
    const config = configs[estado] || configs.PENDIENTE;
    return <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${config.color}`}>{config.text}</span>;
  };

  const BadgeInscripcion = ({ estado }: { estado: EstadoInscripcion }) => {
    const configs: Record<EstadoInscripcion, { color: string, text: string }> = {
      CONFIRMADA: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', text: 'CONFIRMADA' },
      PENDIENTE: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', text: 'PENDIENTE' },
      CANCELADA: { color: 'bg-red-500/10 text-red-600 border-red-500/20', text: 'CANCELADA' },
    };
    const config = configs[estado] || configs.PENDIENTE;
    return <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${config.color}`}>{config.text}</span>;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-card-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-card-border bg-card-bg">
          <h2 className="text-xl font-bold text-foreground">Detalle Operativo</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-muted hover:bg-muted/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Drawer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Cargando detalle...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
              {error}
            </div>
          ) : !detalle ? (
            <div className="text-center text-muted py-10">No hay datos disponibles</div>
          ) : (
            <>
              {/* Sección Header del Responsable */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <User className="w-5 h-5" />
                      <h3 className="text-lg font-bold text-foreground">{detalle.responsable}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Phone className="w-4 h-4" /> {detalle.telefono}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Mail className="w-4 h-4" /> {detalle.email}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2 bg-background/50 p-4 rounded-xl border border-card-border">
                    <div className="flex gap-2">
                      <BadgeInscripcion estado={detalle.estadoInscripcion} />
                      <BadgePago estado={detalle.estadoPago} />
                    </div>
                    <div className="text-right w-full mt-2">
                      <span className="text-xs text-muted block">Saldo a pagar</span>
                      <span className="text-2xl font-black text-foreground">
                        {formatearMoneda(detalle.saldo, detalle.moneda)}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted font-medium w-full text-right mt-1">
                      Pagado: {formatearMoneda(detalle.totalPagado, detalle.moneda)} / Total: {formatearMoneda(detalle.totalOriginal, detalle.moneda)}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-black text-muted uppercase tracking-widest mt-8 mb-4 border-b border-card-border pb-2">
                Participantes ({detalle.participantes.length})
              </h3>

              <div className="space-y-6">
                {detalle.participantes.map((part) => (
                  <ParticipanteCard key={part.idInvitado} part={part} moneda={detalle.moneda} onRefresh={loadDetalle} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ParticipanteCard({ part, moneda, onRefresh }: { part: ParticipanteDetalle, moneda: string, onRefresh: () => void }) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda || 'EUR',
    }).format(valor);
  };

  // --- Modals state ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRelation, setAddRelation] = useState('Madre');
  const [addObs, setAddObs] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [errorAdd, setErrorAdd] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRelation, setEditRelation] = useState('Madre');
  const [editObs, setEditObs] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [viewQrToken, setViewQrToken] = useState('');
  const [viewQrName, setViewQrName] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addPhone.trim()) {
      setErrorAdd('El nombre y el celular son requeridos.');
      return;
    }
    setLoadingAdd(true);
    setErrorAdd(null);
    try {
      await createAutorizacionOperador({
        idInvitado: part.idInvitado,
        nombreAutorizado: addName.trim(),
        telefonoAutorizado: addPhone.trim(),
        relacion: addRelation,
        observaciones: addObs.trim() || undefined
      });
      setIsAddModalOpen(false);
      setAddName('');
      setAddPhone('');
      setAddRelation('Madre');
      setAddObs('');
      onRefresh();
    } catch (err: any) {
      setErrorAdd(err.message || 'Error al agregar autorizado');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName.trim() || !editPhone.trim()) {
      setErrorEdit('El nombre y el celular son requeridos.');
      return;
    }
    setLoadingEdit(true);
    setErrorEdit(null);
    try {
      await updateAutorizacion(editId, {
        nombreAutorizado: editName.trim(),
        telefonoAutorizado: editPhone.trim(),
        relacion: editRelation,
        observaciones: editObs.trim() || undefined
      });
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorEdit(err.message || 'Error al actualizar autorizado');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas revocar la autorización de retiro de ${name}? Su código QR se invalidará de inmediato.`)) {
      return;
    }
    try {
      await deleteAutorizacion(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al revocar la autorización');
    }
  };

  const openEditModal = (auth: AutorizadoRetiro) => {
    setEditId(auth.id_autorizacion);
    setEditName(auth.nombre);
    setEditPhone(auth.telefono_autorizado || '');
    setEditRelation(auth.relacion || 'Madre');
    setEditObs(auth.observaciones || '');
    setErrorEdit(null);
    setIsEditModalOpen(true);
  };

  const openQrModal = (token: string, name: string) => {
    setViewQrToken(token);
    setViewQrName(name);
    setIsQrModalOpen(true);
  };

  const handleDownloadQr = async (qrToken: string, name: string) => {
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrToken)}&format=png`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_autorizado_${name.toLowerCase().replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrToken)}&format=png`, '_blank');
    }
  };

  return (
    <div className="rounded-2xl border border-card-border bg-card-bg overflow-hidden shadow-sm">
      <div className="p-4 bg-background/50 border-b border-card-border flex items-center justify-between">
        <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
          {part.nombreCompleto}
        </h4>
        {part.fechaNacimiento && (
          <span className="text-xs font-medium text-muted">
            Nac: {new Date(part.fechaNacimiento).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Observaciones Generales */}
        {part.observaciones && (
          <p className="text-sm text-muted italic bg-muted/5 p-3 rounded-xl border border-card-border/50">
            "{part.observaciones}"
          </p>
        )}

        {/* Períodos */}
        <div>
          <h5 className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3">
            <CalendarDays className="w-4 h-4 text-indigo-400" /> Períodos Contratados
          </h5>
          <div className="space-y-2">
            {part.periodos.length > 0 ? part.periodos.map(p => (
              <div key={p.idProgramaPeriodo} className="flex justify-between items-center text-sm p-2 rounded-lg bg-background border border-card-border/50">
                <span className="font-medium text-foreground">{p.nombre}</span>
                <span className="text-muted font-mono">{formatearMoneda(p.precioBase)}</span>
              </div>
            )) : (
              <span className="text-sm text-muted">Sin períodos</span>
            )}
          </div>
        </div>

        {/* Servicios */}
        <div>
          <h5 className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3">
            <UtensilsCrossed className="w-4 h-4 text-purple-400" /> Servicios Adicionales
          </h5>
          <div className="space-y-2">
            {part.servicios.length > 0 ? part.servicios.map(s => (
              <div key={s.idProgramaServicio} className="flex justify-between items-center text-sm p-2 rounded-lg bg-background border border-card-border/50">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{s.nombre}</span>
                  {s.tipoCalculo === 'POR_DIA' && (
                    <span className="text-[10px] text-muted uppercase tracking-wider">{s.cantidadCalculada} días a {formatearMoneda(s.precio)} c/u</span>
                  )}
                </div>
                <span className="text-muted font-mono">{formatearMoneda(s.subtotal)}</span>
              </div>
            )) : (
              <span className="text-sm text-muted">Sin servicios</span>
            )}
          </div>
        </div>

        {/* Restricciones Alimentarias */}
        {part.restriccionesAlimentarias && part.restriccionesAlimentarias.length > 0 && (
          <div>
            <h5 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">
              <WheatOff className="w-4 h-4" /> Restricciones Alimentarias
            </h5>
            <div className="space-y-2">
              {part.restriccionesAlimentarias.map(r => (
                <div key={r.idRestriccionAlim} className={`p-3 rounded-lg border text-sm ${r.requiereAlertaVisual ? 'bg-amber-500/10 border-amber-500/30' : 'bg-background border-card-border/50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${r.requiereAlertaVisual ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>{r.texto}</span>
                    {r.esAlergeno && <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-black bg-red-500/10 text-red-500">Alérgeno</span>}
                  </div>
                  {r.observaciones && <p className="text-xs mt-1 text-muted">{r.observaciones}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salud */}
        {part.salud && (part.salud.descripcion || part.salud.observaciones) && (
          <div>
            <h5 className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-3">
              <Stethoscope className="w-4 h-4" /> Información de Salud
            </h5>
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm">
              {part.salud.descripcion && <p className="font-medium text-foreground mb-1">{part.salud.descripcion}</p>}
              {part.salud.observaciones && <p className="text-xs text-muted">{part.salud.observaciones}</p>}
            </div>
          </div>
        )}

        {/* Autorizados a Retirar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <h5 className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest">
              <UserMinus className="w-4 h-4 text-emerald-400" /> Autorizados a Retirar
            </h5>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>
          {part.autorizadosRetiro && part.autorizadosRetiro.length > 0 ? (
            <div className="divide-y divide-card-border/30 bg-background/30 rounded-xl border border-card-border/50 overflow-hidden">
              {part.autorizadosRetiro.map((a) => (
                <div key={a.id_autorizacion} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-background/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{a.nombre}</span>
                      {a.relacion && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                          {a.relacion}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                      {a.telefono_autorizado && <span className="font-mono">Cel: {a.telefono_autorizado}</span>}
                      {a.observaciones && <span className="italic">Obs: "{a.observaciones}"</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {a.qr_token && (
                      <button
                        type="button"
                        onClick={() => openQrModal(a.qr_token!, a.nombre)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors border border-indigo-500/10 cursor-pointer"
                        title="Ver código QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(a)}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors border border-amber-500/10 cursor-pointer"
                      title="Editar datos"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id_autorizacion, a.nombre)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/10 cursor-pointer"
                      title="Eliminar autorizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted block italic bg-background/25 p-3 rounded-xl border border-card-border/30">Sin autorizados registrados para este menor.</span>
          )}
        </div>
      </div>

      {/* ── Modal de Agregar Autorizado (Backoffice) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl border border-card-border bg-background shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-card-border">
              <h3 className="text-lg font-bold text-foreground">Autorizar Adulto</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setErrorAdd(null);
                }}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/15 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none"
                  disabled={loadingAdd}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Relación / Parentesco</label>
                <select
                  value={addRelation}
                  onChange={(e) => setAddRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none cursor-pointer"
                  disabled={loadingAdd}
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

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Celular / Teléfono</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: +5491123456789"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none font-mono"
                  disabled={loadingAdd}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Retira en puerta secundaria"
                  value={addObs}
                  onChange={(e) => setAddObs(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none"
                  disabled={loadingAdd}
                />
              </div>

              {errorAdd && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-semibold">
                  {errorAdd}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                disabled={loadingAdd}
              >
                {loadingAdd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Autorizar Retiro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Editar Autorizado (Backoffice) ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl border border-card-border bg-background shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-card-border">
              <h3 className="text-lg font-bold text-foreground">Editar Autorización</h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setErrorEdit(null);
                }}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/15 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none"
                  disabled={loadingEdit}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Relación / Parentesco</label>
                <select
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none cursor-pointer"
                  disabled={loadingEdit}
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

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Celular / Teléfono</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: +5491123456789"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none font-mono"
                  disabled={loadingEdit}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Retira en puerta secundaria"
                  value={editObs}
                  onChange={(e) => setEditObs(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-card-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none"
                  disabled={loadingEdit}
                />
              </div>

              {errorEdit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-semibold">
                  {errorEdit}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                disabled={loadingEdit}
              >
                {loadingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Visualizar QR (Backoffice) ── */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm p-6 rounded-2xl border border-card-border bg-background shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-card-border">
              <h3 className="text-base font-bold text-foreground truncate pr-6">QR Autorizado: {viewQrName}</h3>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/15 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-2 rounded-xl border border-card-border shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(viewQrToken)}`}
                  alt={`Código QR de ${viewQrName}`}
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={() => handleDownloadQr(viewQrToken, viewQrName)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar Código QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
