"use client";

import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Elegí tu evento y plantilla",
      description: "Seleccioná el tipo de celebración y elegí el diseño base que más te guste para arrancar rápidamente.",
    },
    {
      number: "02",
      title: "Gestioná tus invitados",
      description: "Cargá tu lista, administrá accesos y recibí las confirmaciones (RSVP) de asistencia en tiempo real.",
    },
    {
      number: "03",
      title: "Viví el evento",
      description: "Compartí fotos, música, álbumes colaborativos y votaciones en el muro en vivo con todos tus invitados.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        {/* Lado izquierdo: Textos y pasos */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Cómo funciona Eventia
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            En un par de pasos, tu evento estará listo para compartir y disfrutar con todos tus invitados.
          </p>

          <dl className="mt-10 space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {step.number}
                </div>
                <div>
                  <dt className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {step.title}
                  </dt>
                  <dd className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Lado derecho: Demo Visual (Mockups) */}
        <div className="relative">
          <div className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5] xl:aspect-[3/2] overflow-hidden rounded-3xl bg-zinc-100 shadow-2xl dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            {/* Estos divs representan placeholders para los screenshots o mockups previstos */}
            <div className="absolute top-[10%] left-[5%] right-[20%] bottom-[20%] rounded-2xl bg-white shadow-xl rotate-[-2deg] flexflex-col p-4 overflow-hidden dark:bg-zinc-900">
              <div className="w-full h-8 bg-zinc-100 rounded-lg dark:bg-zinc-800 mb-4" />
              <div className="w-full h-40 bg-blue-50 rounded-xl dark:bg-blue-900/20 mb-4" />
              <div className="w-3/4 h-4 bg-zinc-100 rounded dark:bg-zinc-800" />
            </div>
            
            <div className="absolute top-[20%] right-[5%] bottom-[10%] left-[20%] rounded-2xl bg-white shadow-2xl rotate-[3deg] flex flex-col p-4 dark:bg-black border border-zinc-100 dark:border-zinc-800">
               <div className="w-1/2 h-6 bg-zinc-100 rounded mb-4 dark:bg-zinc-800" />
               <div className="flex gap-2 mb-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30" />
                 <div className="flex flex-col gap-2 justify-center w-full">
                    <div className="w-full h-3 bg-zinc-100 rounded dark:bg-zinc-800" />
                    <div className="w-2/3 h-3 bg-zinc-100 rounded dark:bg-zinc-800" />
                 </div>
               </div>
               <div className="flex gap-2">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30" />
                 <div className="flex flex-col gap-2 justify-center w-full">
                    <div className="w-full h-3 bg-zinc-100 rounded dark:bg-zinc-800" />
                    <div className="w-3/4 h-3 bg-zinc-100 rounded dark:bg-zinc-800" />
                 </div>
               </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent flex items-end justify-center pb-8 dark:from-black/60 font-medium text-zinc-900 dark:text-zinc-300">
               Demo Visual: Invitación, Panel & RSVP
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
