'use client';

import { useEffect } from "react";
import PWAPrompt from "./PWAPrompt";

export default function PWARegister() {
  // Registro técnico del Service Worker
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox === undefined // Evita colisiones si se usan otras librerías de Workbox
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA: Service Worker registrado con éxito. Scope:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA: Error al registrar el Service Worker:", error);
          });
      });
    }
  }, []);

  // Captura global del evento de instalación (beforeinstallprompt)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el comportamiento por defecto de algunos navegadores móviles (mini-infobar)
      e.preventDefault();
      
      // Guardar el evento en el objeto global para que cualquier componente pueda acceder
      (window as any).deferredPrompt = e;
      
      // Disparar un evento personalizado para avisar al componente PWAPrompt
      window.dispatchEvent(new CustomEvent("pwa-install-available"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return <PWAPrompt />;
}

