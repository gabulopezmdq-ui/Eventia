"use client";

import React from "react";

export default function StarModules() {
  const modules = [
    {
      title: "Invitación + RSVP",
      description: "Invitaciones digitales personalizadas con confirmación de asistencia integrada. Rápido, fácil y sin planillas de Excel.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Segmentos y accesos",
      description: "Agrupá a tus invitados en familias, mesas o círculos. Delimitá quiénes asisten a qué etapa de la celebración.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Sugerencias de Música",
      description: "Recibí los temas que no pueden faltar en tu fiesta antes del gran día mediante un sistema de votos en vivo.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      title: "Álbum colaborativo (QR)",
      description: "Tus invitados pueden subir las fotos que saquen escaneando un QR. Un muro digital para compartir recuerdos.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Votaciones y momentos",
      description: "Dinámicas divertidas en tiempo real: ¿Quién es el mejor vestido? ¿Cuál es el próximo tema? ¡Hacé participar a todos!",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white py-24 sm:py-32 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Módulos Estrella
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Todas las herramientas que necesitas para conectar a tus invitados en una experiencia única y colaborativa.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {modules.map((mod, idx) => (
              <div key={idx} className="flex flex-col bg-zinc-50 p-8 rounded-3xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-transform hover:-translate-y-1">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
                    {mod.icon}
                  </div>
                  {mod.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  <p className="flex-auto">{mod.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
