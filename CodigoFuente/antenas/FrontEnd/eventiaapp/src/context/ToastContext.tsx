'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useEffect,
    useRef,
} from 'react';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number; // ms, default 5000
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    /** Shortcut para errores de límite de plan */
    toastPlanLimit: (message: string) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = 5000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        },
        []
    );

    const toastPlanLimit = useCallback(
        (message: string) => {
            addToast(message, 'warning', 7000);
        },
        [addToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, toastPlanLimit }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast debe usarse dentro de <ToastProvider>');
    }
    return ctx;
}

// ─────────────────────────────────────────────
// ToastContainer — UI de las notificaciones
// ─────────────────────────────────────────────

function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    return (
        <div
            aria-live="polite"
            aria-atomic="false"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxWidth: '420px',
                pointerEvents: 'none',
            }}
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// ToastItem individual con auto-dismiss
// ─────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
    success: { bg: 'rgba(16,185,129,0.12)', border: '#10b981', icon: '✓', color: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', icon: '✕', color: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', icon: '⚠', color: '#f59e0b' },
    info:    { bg: 'rgba(99,102,241,0.12)', border: '#6366f1', icon: 'ℹ', color: '#6366f1' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const style = TOAST_STYLES[toast.type];
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in
        const raf = requestAnimationFrame(() => setVisible(true));
        // Auto-dismiss
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration ?? 5000);

        return () => {
            cancelAnimationFrame(raf);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div
            role="alert"
            style={{
                pointerEvents: 'all',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                background: style.bg,
                border: `1px solid ${style.border}`,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                transform: visible ? 'translateX(0)' : 'translateX(120%)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
            }}
        >
            {/* Ícono */}
            <span
                style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: style.color,
                    flexShrink: 0,
                    marginTop: '0.05rem',
                }}
            >
                {style.icon}
            </span>
            {/* Mensaje */}
            <span
                style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    color: 'var(--foreground, #f1f5f9)',
                    flex: 1,
                }}
            >
                {toast.message}
            </span>
            {/* Cerrar */}
            <button
                aria-label="Cerrar notificación"
                onClick={() => onRemove(toast.id)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--foreground, #94a3b8)',
                    fontSize: '1rem',
                    lineHeight: 1,
                    flexShrink: 0,
                    padding: 0,
                    opacity: 0.6,
                }}
            >
                ×
            </button>
        </div>
    );
}
