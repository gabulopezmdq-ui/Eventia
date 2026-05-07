'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useInscripcionContext } from '@/src/features/inscripcion/context/InscripcionContext';
import { useInscripcion } from '@/src/features/inscripcion/hooks/useInscripcion';
import { getProgramaInscripcion } from '@/src/features/inscripcion/inscripcion.service';

// Componentes de fase — se descomentan en Bloque 2, 3 y 4
import { FaseA_Landing } from '@/src/features/inscripcion/components/FaseA_Landing';
import { FaseB_ResponsableDrawer } from '@/src/features/inscripcion/components/FaseB_ResponsableDrawer';
import { FaseC_PanelFamiliar } from '@/src/features/inscripcion/components/FaseC_PanelFamiliar';
import { FaseD_ResumenFirma } from '@/src/features/inscripcion/components/FaseD_ResumenFirma';
import { SuccessScreen } from '@/src/features/inscripcion/components/SuccessScreen';

/**
 * Página principal del flujo de inscripción pública.
 * Responsabilidades:
 *  1. Cargar los datos del programa via GET al montar
 *  2. Renderizar la fase correspondiente según state.fase
 *  3. Mostrar spinner mientras carga y pantalla de error si falla
 */
export default function InscripcionPage() {
    const params = useParams<{ token: string }>();
    const token = params.token;

    // dispatch viene del context directamente para el GET inicial
    const { dispatch } = useInscripcionContext();
    const { state, setLoading, setError, cambiarIdioma } = useInscripcion();

    // ── Carga inicial del programa ────────────────────────────────
    useEffect(() => {
        // Si ya tenemos datos (draft restaurado de localStorage), no recargamos
        if (state.programaData !== null) return;

        async function cargarPrograma() {
            setLoading(true);
            try {
                const data = await getProgramaInscripcion(token, state.idIdioma);
                dispatch({ type: 'SET_PROGRAMA_DATA', payload: data });
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Error al cargar el programa';
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        cargarPrograma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // ── Re-fetch al cambiar idioma (solo visible en fase landing) ─
    useEffect(() => {
        if (state.fase !== 'landing' || state.programaData === null) return;

        async function recargarIdioma() {
            try {
                const data = await getProgramaInscripcion(token, state.idIdioma);
                dispatch({ type: 'SET_PROGRAMA_DATA', payload: data });
            } catch {
                // Fallo silencioso — no mostramos error por cambio de idioma
            }
        }

        recargarIdioma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.idIdioma]);

    // ── Estado: cargando sin datos ────────────────────────────────
    if (state.isLoading && state.programaData === null) {
        return (
            <div className="inscripcion-loading">
                <div className="inscripcion-spinner" aria-label="Cargando" />
                <p>Cargando programa...</p>
            </div>
        );
    }

    // ── Estado: error sin datos ───────────────────────────────────
    if (state.error && state.programaData === null) {
        return (
            <div className="inscripcion-error">
                <h2>No se pudo cargar el programa</h2>
                <p>{state.error}</p>
                <button
                    className="btn-primary"
                    onClick={() => window.location.reload()}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!state.programaData) return null;

    // ── Renderizado por fase ──────────────────────────────────────
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative pb-20 sm:pb-0">
            {/* Overlay de carga (para POST) */}
            {state.isLoading && state.programaData !== null && (
                <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-[9999] flex justify-center items-center">
                    <div className="bg-white dark:bg-card-bg p-8 rounded-2xl shadow-2xl text-center border border-gray-100 dark:border-card-border">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="font-bold text-lg text-gray-900 dark:text-white">Procesando...</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Por favor, no cierres la ventana</p>
                    </div>
                </div>
            )}

            {/* Error global toast */}
            {state.error && state.programaData !== null && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-xl z-[9999] shadow-xl flex flex-col items-center max-w-sm w-[90%] animate-in slide-in-from-top-4">
                    <p className="font-medium text-center">❌ {state.error}</p>
                    <button 
                        onClick={() => setError(null)} 
                        className="mt-3 text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {/* ── FASE A: Landing / Presentación del programa ──── */}
            {state.fase === 'landing' && (
                <FaseA_Landing />
            )}

            {/* ── FASE B: Drawer responsable (superpuesto al panel) */}
            {state.drawerResponsableAbierto && <FaseB_ResponsableDrawer />}

            {/* ── FASE C: Panel Familiar ────────────────────────── */}
            {state.fase === 'panel' && (
                <FaseC_PanelFamiliar />
            )}

            {/* ── FASE D: Resumen y Firma ───────────────────────── */}
            {state.fase === 'resumen' && (
                <FaseD_ResumenFirma />
            )}

            {/* ── FASE E: Confirmación exitosa ──────────────────── */}
            {state.fase === 'success' && (
                <SuccessScreen />
            )}

        </main>
    );
}
