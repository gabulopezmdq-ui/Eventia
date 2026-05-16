'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface UpsellModalProps {
    /** Si el modal está visible */
    open: boolean;
    /** Mensaje del error de límite recibido del backend */
    message: string;
    /** Título del modal. Default: "Límite de plan alcanzado" */
    title?: string;
    /** Ruta de planes. Default: /dashboard/cuenta/planes */
    planesHref?: string;
    /** Callback al cerrar */
    onClose: () => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function UpsellModal({
    open,
    message,
    title = 'Límite de plan alcanzado',
    planesHref = '/dashboard/cuenta/planes',
    onClose,
}: UpsellModalProps) {
    const router = useRouter();

    // Cerrar con Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!open) return;
        document.addEventListener('keydown', handleKeyDown);
        // Bloquear scroll del body mientras el modal está abierto
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    const handleVerPlanes = () => {
        onClose();
        router.push(planesHref);
    };

    return (
        /* Overlay */
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upsell-modal-title"
            aria-describedby="upsell-modal-description"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                animation: 'upsell-fade-in 0.2s ease',
            }}
        >
            {/* Panel */}
            <div
                style={{
                    background: 'var(--upsell-bg, #1e1e2e)',
                    border: '1px solid var(--upsell-border, rgba(245,158,11,0.35))',
                    borderRadius: '1.25rem',
                    padding: '2rem 2rem 1.75rem',
                    maxWidth: '440px',
                    width: '100%',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                    animation: 'upsell-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    position: 'relative',
                }}
            >
                {/* Ícono de candado */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '50%',
                            background: 'rgba(245,158,11,0.15)',
                            border: '2px solid rgba(245,158,11,0.4)',
                            fontSize: '1.75rem',
                        }}
                        aria-hidden="true"
                    >
                        🔒
                    </div>
                </div>

                {/* Título */}
                <h2
                    id="upsell-modal-title"
                    style={{
                        margin: 0,
                        marginBottom: '0.625rem',
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: 'var(--upsell-title, #f1f5f9)',
                    }}
                >
                    {title}
                </h2>

                {/* Mensaje del backend */}
                <p
                    id="upsell-modal-description"
                    style={{
                        margin: 0,
                        marginBottom: '1.75rem',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        textAlign: 'center',
                        color: 'var(--upsell-text, #94a3b8)',
                    }}
                >
                    {message}
                </p>

                {/* Divider */}
                <div
                    style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.07)',
                        marginBottom: '1.5rem',
                    }}
                />

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                    <button
                        id="upsell-modal-btn-planes"
                        onClick={handleVerPlanes}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(245,158,11,0.35)';
                        }}
                    >
                        ✨ Ver planes y precios
                    </button>

                    <button
                        id="upsell-modal-btn-cerrar"
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: 'var(--upsell-text, #94a3b8)',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--upsell-text, #94a3b8)';
                        }}
                    >
                        Quizás luego
                    </button>
                </div>

                {/* Botón X */}
                <button
                    aria-label="Cerrar modal"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--upsell-text, #64748b)',
                        fontSize: '1.25rem',
                        lineHeight: 1,
                        padding: '0.25rem',
                        borderRadius: '0.375rem',
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--upsell-text, #64748b)'; }}
                >
                    ×
                </button>
            </div>

            {/* Keyframes via style tag */}
            <style>{`
                @keyframes upsell-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes upsell-slide-up {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
            `}</style>
        </div>
    );
}
