import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import { FiltrosInscriptos, EstadoPago } from '@/src/features/inscripcion/types/panel-inscriptos.types';

interface InscriptosFiltrosProps {
  filtros: FiltrosInscriptos;
  onChange: (nuevosFiltros: FiltrosInscriptos) => void;
}

export default function InscriptosFiltros({ filtros, onChange }: InscriptosFiltrosProps) {
  const [searchTerm, setSearchTerm] = useState(filtros.q || '');

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filtros.q) {
        onChange({ ...filtros, q: searchTerm });
      }
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, filtros, onChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-card-bg border border-card-border rounded-2xl items-center justify-between">
      
      {/* ── Buscador ── */}
      <div className="relative flex-1 w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="block w-full pl-10 pr-3 py-2 border border-card-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* ── Filtro Estado Pago ── */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={filtros.estadoPago}
            onChange={(e) => onChange({ ...filtros, estadoPago: e.target.value as EstadoPago | 'TODOS' })}
            className="block w-full py-2 pl-3 pr-8 border border-card-border rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
          >
            <option value="TODOS">Estado: Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PARCIAL">Parcial</option>
            <option value="PAGADO">Pagado</option>
          </select>
        </div>

        {/* ── Toggle Solo Alertas ── */}
        <button
          onClick={() => onChange({ ...filtros, soloAlertas: !filtros.soloAlertas })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
            filtros.soloAlertas 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500' 
              : 'bg-background border-card-border text-muted hover:border-amber-500/30 hover:text-amber-500'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${filtros.soloAlertas ? 'fill-amber-500/20' : ''}`} />
          Solo Alertas
        </button>
      </div>
    </div>
  );
}
