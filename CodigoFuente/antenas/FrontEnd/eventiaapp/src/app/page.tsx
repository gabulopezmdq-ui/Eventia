import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 py-32 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Eventia
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Organizá, viví y compartí eventos en un solo lugar.
          Invitados, contenidos, interacción y recuerdos, todo integrado.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Crear cuenta
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-zinc-300 px-6 py-3 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* QUÉ ES EVENTIA */}
      <section className="mx-auto max-w-6xl px-6 py-24 grid gap-12 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h3 className="text-xl font-semibold">Eventos personalizados</h3>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Cada evento tiene su propio espacio con información, muro y galería.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h3 className="text-xl font-semibold">Gestión de invitados</h3>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Administrá accesos, permisos y participación.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h3 className="text-xl font-semibold">Interacción en vivo</h3>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Muro, dinámicas y contenido compartido durante el evento.
          </p>
        </div>
      </section>
    </main>
  );
}
