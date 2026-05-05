import { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { 
  DetalleInscripcionOperativo,
  ParticipanteDetalle,
  EstadoPago,
  EstadoInscripcion
} from '@/src/features/inscripcion/types/panel-inscriptos.types';
import { getDetalleInscripcion } from '@/src/features/inscripcion/panel-inscriptos.service';

interface DetalleInscripcionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  idInscripcion: number | null;
}

export default function DetalleInscripcionDrawer({ isOpen, onClose, idInscripcion }: DetalleInscripcionDrawerProps) {
  const [detalle, setDetalle] = useState<DetalleInscripcionOperativo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetalle() {
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
    }

    if (isOpen) {
      loadDetalle();
    } else {
      // Limpiar al cerrar después de la animación para evitar pantallazos
      // Esto lo podemos manejar con un timeout, pero por ahora conservamos la data
      // hasta que se abra uno nuevo
    }
  }, [idInscripcion, isOpen]);

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
                  <ParticipanteCard key={part.idInvitado} part={part} moneda={detalle.moneda} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ParticipanteCard({ part, moneda }: { part: ParticipanteDetalle, moneda: string }) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda || 'EUR',
    }).format(valor);
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
        <div>
          <h5 className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-3">
            <UserMinus className="w-4 h-4 text-emerald-400" /> Autorizados a Retirar
          </h5>
          {part.autorizadosRetiro && part.autorizadosRetiro.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {part.autorizadosRetiro.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {a.nombre}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted">Sin autorizados registrados (solo responsable principal)</span>
          )}
        </div>
      </div>
    </div>
  );
}
