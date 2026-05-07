'use client';

import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import type {
    InscripcionState,
    FaseActual,
    Responsable,
    Participante,
    FirmaResponsable,
    ProgramaInscripcionData,
    ConfirmacionResponse,
} from '../types/inscripcion.types';

// ─────────────────────────────────────────────────────────────
// Persistencia en localStorage
// ─────────────────────────────────────────────────────────────

const DRAFT_TTL = 24 * 60 * 60 * 1000; // 24 horas en ms

function getDraftKey(token: string) {
    return `eventia_inscripcion_draft_${token}`;
}

function saveDraft(token: string, state: InscripcionState) {
    try {
        localStorage.setItem(
            getDraftKey(token),
            JSON.stringify({ state, timestamp: Date.now() })
        );
    } catch {
        // localStorage puede no estar disponible (SSR, modo incógnito, etc.)
    }
}

function loadDraft(token: string): InscripcionState | null {
    try {
        const raw = localStorage.getItem(getDraftKey(token));
        if (!raw) return null;
        const { state, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp > DRAFT_TTL) {
            localStorage.removeItem(getDraftKey(token));
            return null;
        }
        return state as InscripcionState;
    } catch {
        return null;
    }
}

function clearDraft(token: string) {
    try {
        localStorage.removeItem(getDraftKey(token));
    } catch {}
}

// ─────────────────────────────────────────────────────────────
// Estado inicial
// ─────────────────────────────────────────────────────────────

const initialState: InscripcionState = {
    programaData: null,
    idIdioma: 3,
    fase: 'landing',
    drawerResponsableAbierto: false,
    responsable: {},
    participantes: [],
    firma: {},
    isLoading: false,
    error: null,
    resultadoConfirmacion: null,
};

// ─────────────────────────────────────────────────────────────
// Acciones del Reducer
// ─────────────────────────────────────────────────────────────

type Action =
    | { type: 'SET_PROGRAMA_DATA'; payload: ProgramaInscripcionData }
    | { type: 'SET_IDIOMA'; payload: number }
    | { type: 'SET_FASE'; payload: FaseActual }
    | { type: 'TOGGLE_DRAWER_RESPONSABLE'; payload: boolean }
    | { type: 'SET_RESPONSABLE'; payload: Partial<Responsable> }
    | { type: 'ADD_PARTICIPANTE'; payload: Participante }
    | { type: 'UPDATE_PARTICIPANTE'; payload: { clientId: string; data: Partial<Participante> } }
    | { type: 'REMOVE_PARTICIPANTE'; payload: string }
    | { type: 'SET_FIRMA'; payload: Partial<FirmaResponsable> }
    | { type: 'SET_CONFIRMADO'; payload: ConfirmacionResponse }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESTORE_DRAFT'; payload: InscripcionState };

// ─────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────

function inscripcionReducer(state: InscripcionState, action: Action): InscripcionState {
    switch (action.type) {
        case 'SET_PROGRAMA_DATA':
            return { ...state, programaData: action.payload, error: null };

        case 'SET_IDIOMA':
            return { ...state, idIdioma: action.payload };

        case 'SET_FASE':
            return { ...state, fase: action.payload };

        case 'TOGGLE_DRAWER_RESPONSABLE':
            return { ...state, drawerResponsableAbierto: action.payload };

        case 'SET_RESPONSABLE':
            return {
                ...state,
                responsable: { ...state.responsable, ...action.payload },
            };

        case 'ADD_PARTICIPANTE':
            return {
                ...state,
                participantes: [...state.participantes, action.payload],
            };

        case 'UPDATE_PARTICIPANTE':
            return {
                ...state,
                participantes: state.participantes.map((p) =>
                    p._clientId === action.payload.clientId
                        ? { ...p, ...action.payload.data }
                        : p
                ),
            };

        case 'REMOVE_PARTICIPANTE':
            return {
                ...state,
                participantes: state.participantes.filter(
                    (p) => p._clientId !== action.payload
                ),
            };

        case 'SET_FIRMA':
            return {
                ...state,
                firma: { ...state.firma, ...action.payload },
            };

        case 'SET_CONFIRMADO':
            return {
                ...state,
                resultadoConfirmacion: action.payload,
                fase: 'success',
                isLoading: false,
                error: null,
            };

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };

        case 'RESTORE_DRAFT':
            return { ...action.payload };

        default:
            return state;
    }
}

// ─────────────────────────────────────────────────────────────
// Tipos del Context
// ─────────────────────────────────────────────────────────────

interface InscripcionContextValue {
    state: InscripcionState;
    dispatch: React.Dispatch<Action>;
    /** Limpia el draft de localStorage (llamar en SuccessScreen) */
    limpiarDraft: () => void;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const InscripcionContext = createContext<InscripcionContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

interface InscripcionProviderProps {
    children: ReactNode;
    /** Token del programa — se usa como clave del draft en localStorage */
    token: string;
}

export function InscripcionProvider({ children, token }: InscripcionProviderProps) {
    const [state, dispatch] = useReducer(inscripcionReducer, initialState);

    // Al montar: intentar restaurar draft si existe y tiene < 24h
    useEffect(() => {
        const draft = loadDraft(token);
        if (draft) {
            dispatch({ type: 'RESTORE_DRAFT', payload: draft });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Al cambiar el state: guardar en localStorage
    // Se excluye cuando isLoading para no persistir estados transitorios
    useEffect(() => {
        if (!state.isLoading && state.programaData !== null) {
            saveDraft(token, state);
        }
    }, [state, token]);

    const limpiarDraft = useCallback(() => {
        clearDraft(token);
    }, [token]);

    return (
        <InscripcionContext.Provider value={{ state, dispatch, limpiarDraft }}>
            {children}
        </InscripcionContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────
// Hook de acceso al context
// ─────────────────────────────────────────────────────────────

/**
 * Hook para consumir el contexto de inscripción.
 * Debe usarse dentro de un componente envuelto por <InscripcionProvider>.
 *
 * @example
 * const { state, dispatch, limpiarDraft } = useInscripcionContext();
 */
export function useInscripcionContext(): InscripcionContextValue {
    const ctx = useContext(InscripcionContext);
    if (!ctx) {
        throw new Error('useInscripcionContext debe usarse dentro de <InscripcionProvider>');
    }
    return ctx;
}
