import Link from "next/link";
import React from "react";

export default function HeroSection({
  onOpenB2BModal,
}: {
  onOpenB2BModal: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 to-white dark:from-black dark:to-zinc-900 pb-20 pt-32 text-center md:pb-32 md:pt-48">
      {/* Decorative background blur */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-600/20" />
      <div className="absolute right-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/3 rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-600/20" />

      <div className="mx-auto max-w-5xl px-6">
        <h1 className="animate-fade-in-up bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl dark:from-zinc-100 dark:to-zinc-400">
          Tu Evento organizado en <br className="hidden sm:block" /> un solo
          lugar
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 sm:text-xl dark:text-zinc-400">
          Plantillas + RSVP + invitados + experiencias (música, álbum,
          votaciones). Todo lo que necesitas para que tu evento sea inolvidable.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register?flow=b2c"
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
          >
            <span>Crear mi Evento</span>
          </Link>

          <a
            href="#planes"
            className="flex items-center justify-center rounded-full border border-zinc-200 bg-white px-8 py-4 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900 shadow-sm"
          >
            Ver planes
          </a>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onOpenB2BModal}
            className="text-sm font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
          >
            ¿Tenés una Empresa, Salón u organizás eventos?
          </button>
        </div>
      </div>
    </section>
  );
}
