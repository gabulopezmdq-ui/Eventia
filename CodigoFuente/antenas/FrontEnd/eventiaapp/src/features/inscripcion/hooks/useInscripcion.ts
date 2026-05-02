import { useCallback } from 'react';
import { useInscripcionContext } from '../context/InscripcionContext';
import type {
    Participante,
    Responsable,
    FirmaResponsable,
    InscripcionPayload,
    FaseActual,
} from '../types/inscripcion.types';

/**
 * Hook principal de acceso al contexto de inscripción.
 * Expone el state, el dispatch y helpers de alto nivel.
 *
 * @example
 * const { state, agregarParticipante, buildPayload } = useInscripcion();
 */
export function useInscripcion() {
    const { state, dispatch, limpiarDraft } = useInscripcionContext();

    // ── Navegación de fases ───────────────────────────────────────

    const irAFase = useCallback((fase: FaseActual) => {
        dispatch({ type: 'SET_FASE', payload: fase });
    }, [dispatch]);

    const abrirDrawerResponsable = useCallback(() => {
        dispatch({ type: 'TOGGLE_DRAWER_RESPONSABLE', payload: true });
    }, [dispatch]);

    const cerrarDrawerResponsable = useCallback(() => {
        dispatch({ type: 'TOGGLE_DRAWER_RESPONSABLE', payload: false });
    }, [dispatch]);

    // ── Responsable ───────────────────────────────────────────────

    const guardarResponsable = useCallback((data: Partial<Responsable>) => {
        dispatch({ type: 'SET_RESPONSABLE', payload: data });
    }, [dispatch]);

    // ── Participantes ─────────────────────────────────────────────

    /**
     * Agrega un nuevo participante generando un _clientId único.
     * El _clientId se usa solo en el frontend para identificar tarjetas.
     */
    const agregarParticipante = useCallback((
        data: Omit<Participante, '_clientId'>
    ) => {
        const nuevoParticipante: Participante = {
            _clientId: crypto.randomUUID(),
            ...data,
        };
        dispatch({ type: 'ADD_PARTICIPANTE', payload: nuevoParticipante });
        return nuevoParticipante._clientId;
    }, [dispatch]);

    const actualizarParticipante = useCallback((
        clientId: string,
        data: Partial<Participante>
    ) => {
        dispatch({ type: 'UPDATE_PARTICIPANTE', payload: { clientId, data } });
    }, [dispatch]);

    const quitarParticipante = useCallback((clientId: string) => {
        dispatch({ type: 'REMOVE_PARTICIPANTE', payload: clientId });
    }, [dispatch]);

    /**
     * Copia las semanas seleccionadas de un participante a otro.
     * Útil para hermanos que van las mismas semanas.
     */
    const copiarSemanasDeHermano = useCallback((
        sourceClientId: string,
        targetClientId: string
    ) => {
        const source = state.participantes.find((p) => p._clientId === sourceClientId);
        if (!source) return;
        actualizarParticipante(targetClientId, {
            periodos: [...source.periodos],
            // Al copiar semanas, se limpian los servicios para que el usuario
            // los elija frescos con las nuevas semanas
            servicios: [],
        });
    }, [state.participantes, actualizarParticipante]);

    /**
     * Copia los servicios seleccionados de un participante a otro.
     */
    const copiarServiciosDeHermano = useCallback((
        sourceClientId: string,
        targetClientId: string
    ) => {
        const source = state.participantes.find((p) => p._clientId === sourceClientId);
        if (!source) return;
        actualizarParticipante(targetClientId, {
            servicios: source.servicios.map((s) => ({ ...s })),
        });
    }, [state.participantes, actualizarParticipante]);

    // ── Firma ─────────────────────────────────────────────────────

    const guardarFirma = useCallback((data: Partial<FirmaResponsable>) => {
        dispatch({ type: 'SET_FIRMA', payload: data });
    }, [dispatch]);

    // ── Idioma ────────────────────────────────────────────────────

    const cambiarIdioma = useCallback((idIdioma: number) => {
        dispatch({ type: 'SET_IDIOMA', payload: idIdioma });
    }, [dispatch]);

    // ── Estados UI ────────────────────────────────────────────────

    const setLoading = useCallback((value: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: value });
    }, [dispatch]);

    const setError = useCallback((msg: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: msg });
    }, [dispatch]);

    const setConfirmado = useCallback((token: string) => {
        dispatch({ type: 'SET_CONFIRMADO', payload: token });
    }, [dispatch]);

    // ── Build payload ─────────────────────────────────────────────

    /**
     * Construye el InscripcionPayload listo para el POST al backend.
     * Omite _clientId de cada participante.
     * Lanza error si faltan datos obligatorios.
     */
    const buildPayload = useCallback((firmaOverride?: Partial<FirmaResponsable>): InscripcionPayload => {
        const { programaData, idIdioma, responsable, participantes, firma: stateFirma } = state;
        
        const firmaDefinitiva = firmaOverride || stateFirma;

        if (!programaData) throw new Error('No hay datos del programa');
        if (!responsable.nombre) throw new Error('Faltan datos del responsable');
        if (!firmaDefinitiva.nombre_completo) throw new Error('Falta la firma');

        return {
            token: programaData.token,
            idIdioma,
            responsable: responsable as Responsable,
            participantes: participantes.map(({ _clientId: _omit, ...rest }) => rest),
            firma: firmaDefinitiva as FirmaResponsable,
        };
    }, [state]);

    return {
        state,
        // Fases
        irAFase,
        abrirDrawerResponsable,
        cerrarDrawerResponsable,
        // Responsable
        guardarResponsable,
        // Participantes
        agregarParticipante,
        actualizarParticipante,
        quitarParticipante,
        copiarSemanasDeHermano,
        copiarServiciosDeHermano,
        // Firma
        guardarFirma,
        // Idioma
        cambiarIdioma,
        // Estados
        setLoading,
        setError,
        setConfirmado,
        // POST
        buildPayload,
        // Draft
        limpiarDraft,
    };
}
