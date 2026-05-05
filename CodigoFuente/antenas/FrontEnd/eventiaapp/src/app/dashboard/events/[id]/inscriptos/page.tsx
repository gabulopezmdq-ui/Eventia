'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import {
  ResumenInscriptos,
  InscriptoFila,
  FiltrosInscriptos,
} from '@/src/features/inscripcion/types/panel-inscriptos.types';
import {
  getResumenInscriptos,
  getInscriptosList,
} from '@/src/features/inscripcion/panel-inscriptos.service';

import InscriptosHeader from './components/InscriptosHeader';
import ResumenCards from './components/ResumenCards';
import InscriptosFiltros from './components/InscriptosFiltros';
import InscriptosTable from './components/InscriptosTable';
import DetalleInscripcionDrawer from './components/DetalleInscripcionDrawer';

export default function PanelInscriptosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idEvento = Number(id);

  // Estados de datos
  const [resumen, setResumen] = useState<ResumenInscriptos | null>(null);
  const [inscriptos, setInscriptos] = useState<InscriptoFila[]>([]);

  // Estados de UI
  const [isLoadingResumen, setIsLoadingResumen] = useState(true);
  const [isLoadingLista, setIsLoadingLista] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosInscriptos>({
    q: '',
    estadoPago: 'TODOS',
    soloAlertas: false,
  });

  // Estados del Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState<number | null>(null);

  // Carga inicial (Resumen + Lista base)
  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingResumen(true);
      setIsLoadingLista(true);
      try {
        const [resumenData, listaData] = await Promise.all([
          getResumenInscriptos(idEvento).catch(() => null), // Permite que falle uno solo y el otro avance
          getInscriptosList(idEvento, filtros),
        ]);

        if (resumenData) setResumen(resumenData);
        setInscriptos(listaData);
      } catch (err) {
        setError('No se pudo cargar el panel de inscriptos.');
      } finally {
        setIsLoadingResumen(false);
        setIsLoadingLista(false);
      }
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEvento]);

  // Refetch de lista cuando cambian los filtros
  const fetchListaFiltrada = useCallback(async (nuevosFiltros: FiltrosInscriptos) => {
    setIsLoadingLista(true);
    try {
      const listaData = await getInscriptosList(idEvento, nuevosFiltros);
      setInscriptos(listaData);
    } catch (err) {
      console.error('Error al filtrar inscriptos', err);
    } finally {
      setIsLoadingLista(false);
    }
  }, [idEvento]);

  const handleFiltrosChange = (nuevosFiltros: FiltrosInscriptos) => {
    setFiltros(nuevosFiltros);
    fetchListaFiltrada(nuevosFiltros);
  };

  const handleOpenDetalle = (idInscripcion: number) => {
    setInscripcionSeleccionada(idInscripcion);
    setIsDrawerOpen(true);
  };

  const handleCloseDetalle = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setInscripcionSeleccionada(null), 300);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-10 space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest">
        <Link href={`/dashboard/events/${idEvento}`} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Volver al Evento
        </Link>
        <span>/</span>
        <span className="text-indigo-400">Inscriptos</span>
      </nav>

      {/* ── Header ── */}
      <InscriptosHeader
        programa={resumen?.programa}
        isLoading={isLoadingResumen}
      />

      {/* ── KPIs ── */}
      <ResumenCards
        resumen={resumen}
        isLoading={isLoadingResumen}
      />

      {/* ── Filtros y Tabla ── */}
      <div className="space-y-4">
        <InscriptosFiltros
          filtros={filtros}
          onChange={handleFiltrosChange}
        />

        <InscriptosTable
          inscriptos={inscriptos}
          isLoading={isLoadingLista}
          onVerDetalle={handleOpenDetalle}
        />
      </div>

      {/* ── Drawer de Detalle ── */}
      <DetalleInscripcionDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDetalle}
        idInscripcion={inscripcionSeleccionada}
      />
    </div>
  );
}
