import { 
  Eye, 
  Stethoscope, 
  WheatOff, 
  Inbox
} from 'lucide-react';
import { InscriptoFila, EstadoPago } from '@/src/features/inscripcion/types/panel-inscriptos.types';

interface InscriptosTableProps {
  inscriptos: InscriptoFila[];
  isLoading: boolean;
  onVerDetalle: (idInscripcion: number) => void;
}

export default function InscriptosTable({ inscriptos, isLoading, onVerDetalle }: InscriptosTableProps) {

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

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden mt-6 animate-pulse">
        <div className="h-12 bg-muted/10 border-b border-card-border" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 border-b border-card-border/50" />
        ))}
      </div>
    );
  }

  if (inscriptos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card-bg border border-card-border rounded-2xl mt-6">
        <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No hay inscriptos para mostrar</h3>
        <p className="text-sm text-muted mt-1 max-w-sm">
          Intenta cambiar los filtros de búsqueda o verifica si hay registros para este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden mt-6 shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-card-border bg-background/50 text-xs uppercase tracking-widest font-bold text-muted">
            <th className="px-6 py-4 w-16 text-center">⚠</th>
            <th className="px-6 py-4">Responsable</th>
            <th className="px-6 py-4">Participantes</th>
            <th className="px-6 py-4 text-center">Períodos</th>
            <th className="px-6 py-4 text-center">Servicios</th>
            <th className="px-6 py-4">Estado Pago</th>
            <th className="px-6 py-4 text-right">Saldo</th>
            <th className="px-6 py-4 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border/50">
          {inscriptos.map((fila) => (
            <tr key={fila.idInscripcion} className="hover:bg-muted/5 transition-colors group">
              {/* Alertas */}
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-1">
                  {fila.tieneAlertasSalud && (
                    <span title="Alerta de Salud">
                      <Stethoscope className="w-4 h-4 text-red-500" />
                    </span>
                  )}
                  {fila.tieneRestriccionesAlimentarias && (
                    <span title="Restricciones Alimentarias">
                      <WheatOff className="w-4 h-4 text-amber-500" />
                    </span>
                  )}
                  {!fila.tieneAlertasSalud && !fila.tieneRestriccionesAlimentarias && (
                    <span className="text-muted/30 text-xs">-</span>
                  )}
                </div>
              </td>
              
              {/* Responsable */}
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">{fila.responsable}</span>
                  <span className="text-xs text-muted truncate max-w-[200px]">{fila.email}</span>
                  <span className="text-xs text-muted">{fila.telefono}</span>
                </div>
              </td>
              
              {/* Participantes */}
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{fila.cantidadParticipantes} {fila.cantidadParticipantes === 1 ? 'niño' : 'niños'}</span>
                  <span className="text-xs text-muted max-w-[150px] truncate">
                    {fila.participantes.join(', ')}
                  </span>
                </div>
              </td>
              
              {/* Períodos y Servicios */}
              <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                {fila.cantidadPeriodos}
              </td>
              <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                {fila.cantidadServicios}
              </td>
              
              {/* Estado Pago */}
              <td className="px-6 py-4">
                <BadgePago estado={fila.estadoPago} />
              </td>
              
              {/* Saldo */}
              <td className="px-6 py-4 text-right">
                <span className="font-bold text-sm text-foreground">
                  {formatearMoneda(fila.saldo, fila.moneda)}
                </span>
              </td>
              
              {/* Acciones */}
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onVerDetalle(fila.idInscripcion)}
                  className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors opacity-70 group-hover:opacity-100"
                  title="Ver detalle operativo"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
