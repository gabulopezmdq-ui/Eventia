import { Users, UserPlus, CreditCard, AlertTriangle, Wallet } from 'lucide-react';
import { ResumenInscriptos } from '@/src/features/inscripcion/types/panel-inscriptos.types';

interface ResumenCardsProps {
  resumen: ResumenInscriptos | null;
  isLoading: boolean;
}

export default function ResumenCards({ resumen, isLoading }: ResumenCardsProps) {
  // Función para formatear moneda
  const formatearMoneda = (valor: number, moneda: string = 'EUR') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda,
    }).format(valor);
  };

  if (isLoading || !resumen) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-card-bg border border-card-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* ── Familias ── */}
      <div className="p-5 rounded-2xl bg-card-bg border border-card-border flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Familias</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <span className="text-3xl font-black text-foreground">{resumen.total_familias}</span>
      </div>

      {/* ── Participantes ── */}
      <div className="p-5 rounded-2xl bg-card-bg border border-card-border flex flex-col justify-between group hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Participantes</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <UserPlus className="w-4 h-4" />
          </div>
        </div>
        <span className="text-3xl font-black text-foreground">{resumen.total_participantes}</span>
      </div>

      {/* ── Deuda Total ── */}
      <div className="p-5 rounded-2xl bg-card-bg border border-card-border flex flex-col justify-between group hover:border-red-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Deuda Total</span>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <span className="text-2xl font-black text-foreground truncate" title={formatearMoneda(resumen.total_deuda, resumen.moneda)}>
          {formatearMoneda(resumen.total_deuda, resumen.moneda)}
        </span>
      </div>

      {/* ── Estado de Pagos ── */}
      <div className="p-5 rounded-2xl bg-card-bg border border-card-border flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Estado Pagos</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-muted">Pendientes</span>
            <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{resumen.pendientes}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-muted">Parciales</span>
            <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{resumen.parciales}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-muted">Pagados</span>
            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{resumen.pagados}</span>
          </div>
        </div>
      </div>

      {/* ── Alertas ── */}
      <div className={`p-5 rounded-2xl bg-card-bg border transition-all flex flex-col justify-between group ${resumen.con_alertas > 0 ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500' : 'border-card-border hover:border-indigo-500/30'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Alertas Médicas</span>
          <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${resumen.con_alertas > 0 ? 'bg-amber-500 text-white' : 'bg-muted/10 text-muted'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-black ${resumen.con_alertas > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-foreground'}`}>
            {resumen.con_alertas}
          </span>
          <span className="text-xs font-medium text-muted mb-1 pb-1">participantes</span>
        </div>
      </div>
    </div>
  );
}
