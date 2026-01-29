'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loginWithGoogle } from './auth.service';

declare global {
    interface Window {
        handleGoogleCallback?: (response: { credential: string }) => void;
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        config: {
                            theme?: string;
                            size?: string;
                            text?: string;
                            width?: number;
                            logo_alignment?: string;
                        }
                    ) => void;
                };
            };
        };
    }
}

interface GoogleSignInButtonProps {
    text?: 'signin' | 'signup';
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function GoogleSignInButton({
    text = 'signin',
    onSuccess,
    onError
}: GoogleSignInButtonProps) {
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [buttonRendered, setButtonRendered] = useState(false);

    const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
        setLoading(true);
        setError(null);

        try {
            const data = await loginWithGoogle(response.credential);

            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }

            onSuccess?.();
            window.location.href = '/dashboard';
        } catch (err) {
            const errorMessage = 'Error al autenticar con Google';
            setError(errorMessage);
            onError?.(errorMessage);
            setLoading(false);
        }
    }, [onSuccess, onError]);

    useEffect(() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
            setError('Google Client ID no configurado');
            return;
        }

        // Definir callback global
        window.handleGoogleCallback = handleCredentialResponse;

        const initializeGoogleButton = () => {
            if (!window.google?.accounts?.id || !googleButtonRef.current) {
                return false;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    auto_select: false,
                });

                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: 'filled_black',
                    size: 'large',
                    text: text === 'signup' ? 'signup_with' : 'continue_with',
                    width: 320,
                    logo_alignment: 'left',
                });

                setButtonRendered(true);
                return true;
            } catch (err) {
                console.error('Error rendering Google button:', err);
                return false;
            }
        };

        // Cargar script de Google
        const loadScript = () => {
            if (document.getElementById('google-gsi-script')) {
                setScriptLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => setScriptLoaded(true);
            script.onerror = () => setError('No se pudo cargar Google Sign-In');
            document.body.appendChild(script);
        };

        loadScript();
    }, [handleCredentialResponse, text]);

    // Renderizar botón cuando el script esté listo
    useEffect(() => {
        if (!scriptLoaded || buttonRendered) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || !googleButtonRef.current) return;

        // Esperar a que google esté disponible
        const checkAndRender = () => {
            if (window.google?.accounts?.id && googleButtonRef.current) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        auto_select: false,
                    });

                    window.google.accounts.id.renderButton(googleButtonRef.current, {
                        theme: 'filled_black',
                        size: 'large',
                        text: text === 'signup' ? 'signup_with' : 'continue_with',
                        width: 320,
                        logo_alignment: 'left',
                    });

                    setButtonRendered(true);
                } catch (err) {
                    console.error('Error initializing Google:', err);
                }
            } else {
                setTimeout(checkAndRender, 100);
            }
        };

        checkAndRender();
    }, [scriptLoaded, buttonRendered, handleCredentialResponse, text]);

    const buttonText = text === 'signup' ? 'Registrarse con Google' : 'Continuar con Google';

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800 py-3 px-4 text-white">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <span>Autenticando...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center justify-center gap-3 rounded-lg border border-red-700 bg-neutral-800 py-3 px-4 text-red-400 hover:bg-neutral-700 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Error - Click para reintentar</span>
                </button>
                <p className="text-xs text-red-400 mt-1 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Contenedor para el botón de Google */}
            <div
                ref={googleButtonRef}
                className="w-full flex justify-center"
                style={{ minHeight: '44px' }}
            />

            {/* Fallback mientras carga */}
            {!buttonRendered && (
                <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800 py-3 px-4 text-neutral-400"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Cargando Google...</span>
                </button>
            )}
        </div>
    );
}
