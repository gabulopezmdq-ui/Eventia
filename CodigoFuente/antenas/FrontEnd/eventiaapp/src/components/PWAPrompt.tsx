'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, Bell, X, Share, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/src/context/ToastContext';

type PromptType = 'install' | 'ios' | 'notifications' | null;

export default function PWAPrompt() {
  const pathname = usePathname();
  const { addToast } = useToast();
  
  const [promptType, setPromptType] = useState<PromptType>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Validar si la ruta actual califica para mostrar alertas
  const isAllowedPath = () => {
    if (!pathname) return false;
    
    // Excluir la landing/precios de forma estricta
    if (pathname === '/') return false;

    // Incluir específicamente las páginas de la aplicación
    const allowedPrefixes = [
      '/login',
      '/register',
      '/dashboard',
      '/staff',
      '/mi-eventia',
      '/portal',
      '/rsvp',
      '/registro',
      '/inscripcion'
    ];

    return allowedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detectar e instalar listener para PWA estándar (Android/Chrome/Windows)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      
      // Evaluar si mostramos el banner de instalación
      checkAndShowPrompt('install', e);
    };

    // Si el evento ya se disparó y guardó globalmente antes de montar este componente
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      checkAndShowPrompt('install', (window as any).deferredPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-install-available', () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        checkAndShowPrompt('install', (window as any).deferredPrompt);
      }
    });

    // 2. Evaluar soporte y necesidad de notificaciones
    // Solo si no se está mostrando el prompt de instalación
    if (!promptType) {
      checkAndShowPrompt('notifications');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [pathname]);

  const checkAndShowPrompt = (type: 'install' | 'notifications', activePromptEvent?: any) => {
    if (!isAllowedPath()) {
      setIsVisible(false);
      setPromptType(null);
      return;
    }

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (type === 'install') {
      // Verificar si fue descartado recientemente
      const dismissedTime = localStorage.getItem('pwa-install-dismissed');
      if (dismissedTime && now - parseInt(dismissedTime) < oneWeek) {
        // Si la instalación está descartada, evaluar si podemos ofrecer notificaciones
        checkAndShowPrompt('notifications');
        return;
      }

      // Verificar si ya está instalada la app
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (isStandalone) {
        checkAndShowPrompt('notifications');
        return;
      }

      // Detección especial de iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as any).standalone;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (isIOS && isSafari) {
        // En iOS Safari no hay beforeinstallprompt, pero podemos mostrar la guía personalizada
        setTimeout(() => {
          setPromptType('ios');
          setIsVisible(true);
        }, 2000); // Retraso elegante para que se cargue la página
      } else if (activePromptEvent || deferredPrompt) {
        setTimeout(() => {
          setPromptType('install');
          setIsVisible(true);
        }, 2000);
      } else {
        // Si no aplica instalar, ver si corresponde notificaciones
        checkAndShowPrompt('notifications');
      }
    }

    if (type === 'notifications') {
      // Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) return;

      // Verificar si ya tiene permisos concedidos o bloqueados
      if (Notification.permission !== 'default') return;

      // Verificar si fue descartado recientemente
      const dismissedTime = localStorage.getItem('pwa-notif-dismissed');
      if (dismissedTime && now - parseInt(dismissedTime) < oneWeek) return;

      // Mostrar prompt de notificaciones con retraso elegante
      setTimeout(() => {
        setPromptType('notifications');
        setIsVisible(true);
      }, 3000);
    }
  };

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (!promptEvent) return;

    // Disparar prompt nativo
    promptEvent.prompt();
    
    // Esperar respuesta del usuario
    const { outcome } = await promptEvent.userChoice;
    console.log(`PWA: El usuario respondió al prompt de instalación: ${outcome}`);

    if (outcome === 'accepted') {
      addToast('¡Instalación iniciada con éxito! Disfrutá de Eventia.', 'success');
      setIsVisible(false);
      setPromptType(null);
      // Limpiar el evento guardado
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    } else {
      // Si rechaza, lo tomamos como descarte temporal
      handleDismiss();
    }
  };

  const handleRequestNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addToast('¡Notificaciones activadas correctamente!', 'success');
        setIsVisible(false);
        setPromptType(null);
      } else {
        // Si lo bloqueó o cerró, guardamos el descarte para no insistir inmediatamente
        localStorage.setItem('pwa-notif-dismissed', Date.now().toString());
        setIsVisible(false);
        setPromptType(null);
        if (permission === 'denied') {
          addToast('Notificaciones desactivadas. Podés activarlas desde los ajustes del navegador.', 'info');
        }
      }
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Registrar el descarte con la fecha actual en localStorage
    if (promptType === 'install' || promptType === 'ios') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      // Luego del descarte de instalación, intentar inmediatamente ver si corresponde notificaciones
      setTimeout(() => {
        setPromptType(null);
        checkAndShowPrompt('notifications');
      }, 800);
    } else if (promptType === 'notifications') {
      localStorage.setItem('pwa-notif-dismissed', Date.now().toString());
      setTimeout(() => {
        setPromptType(null);
      }, 800);
    }
  };

  // No renderizar nada si el prompt no está activo o la ruta no es permitida
  if (!promptType || !isAllowedPath()) return null;

  return (
    <div
      className={`fixed bottom-0 sm:bottom-6 left-0 right-0 sm:right-6 sm:left-auto z-[999] px-4 pb-6 sm:p-0 sm:max-w-md w-full pointer-events-none transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 sm:translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-full pointer-events-auto rounded-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl p-5 md:p-6 transition-all duration-300">
        
        {/* Encabezado con Botón de Cierre */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {promptType === 'notifications' ? (
                <Bell className="w-5 h-5 animate-pulse" />
              ) : (
                <Download className="w-5 h-5 animate-bounce" />
              )}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3 h-3" />
              <span>Premium App</span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido Dinámico */}
        {promptType === 'install' && (
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Eventia en tu pantalla de inicio
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Accedé de forma directa con un solo toque y disfrutá de un rendimiento más rápido y fluido en todos tus eventos.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar ahora</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                Más tarde
              </button>
            </div>
          </div>
        )}

        {promptType === 'ios' && (
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Llevá Eventia en tu iPhone
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Para agregar la aplicación a tu pantalla de inicio y disfrutar la mejor experiencia, seguí estos pasos sencillos:
            </p>
            
            <div className="my-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/30 flex flex-col gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                  1
                </span>
                <span>
                  Tocá el botón <strong>"Compartir"</strong> en el navegador Safari.
                </span>
                <Share className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2.5 border-t border-zinc-100 dark:border-zinc-800/40 pt-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                  2
                </span>
                <span>
                  Seleccioná la opción <strong>"Agregar a inicio"</strong>.
                </span>
                <div className="w-5 h-5 rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-[13px] ml-auto flex-shrink-0 text-zinc-500">
                  +
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Entendido</span>
            </button>
          </div>
        )}

        {promptType === 'notifications' && (
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Activar Notificaciones
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Mantenete al tanto en tiempo real de los accesos a tus eventos, cambios de estados y alertas importantes del sistema.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={handleRequestNotifications}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Activar ahora</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                Más tarde
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
