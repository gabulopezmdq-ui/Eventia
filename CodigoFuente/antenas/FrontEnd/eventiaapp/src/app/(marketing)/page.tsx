import Link from "next/link";

export default function Page() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black">
            {/* HERO */}
            <section className="mx-auto max-w-6xl px-6 py-32 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Organizá, viví y compartí tus eventos
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                    Eventia centraliza la experiencia de tus eventos: invitados,
                    contenidos, interacción y recuerdos, todo en un solo lugar.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                    <Link
                        href="/register"
                        className="rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                    >
                        Crear cuenta gratis
                    </Link>
                    <Link
                        href="#como-funciona"
                        className="rounded-full border border-zinc-300 px-6 py-3 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                        Cómo funciona
                    </Link>
                </div>
            </section>

            {/* FEATURES */}
            <section className="mx-auto max-w-6xl px-6 py-24 grid gap-12 md:grid-cols-3">
                {[
                    {
                        title: "Eventos personalizados",
                        desc: "Creá eventos únicos con información, muro y galería propia.",
                    },
                    {
                        title: "Gestión de invitados",
                        desc: "Controlá accesos, roles y participación de cada usuario.",
                    },
                    {
                        title: "Interacción en vivo",
                        desc: "Muro, dinámicas y contenido compartido durante el evento.",
                    },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900"
                    >
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                            {item.title}
                        </h3>
                        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </section>

            {/* HOW IT WORKS */}
            <section
                id="como-funciona"
                className="mx-auto max-w-4xl px-6 py-24 text-center"
            >
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    Cómo funciona
                </h2>

                <ol className="mt-12 grid gap-8 md:grid-cols-4 text-left">
                    {[
                        "Registrate en Eventia",
                        "Creá tu evento",
                        "Compartí el link",
                        "Viví la experiencia",
                    ].map((step, index) => (
                        <li key={step} className="text-zinc-600 dark:text-zinc-400">
                            <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                Paso {index + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
            </section>

            {/* CTA FINAL */}
            <section className="bg-zinc-900 py-24 text-center text-white">
                <h2 className="text-3xl font-bold">
                    Empezá a organizar tus eventos hoy
                </h2>
                <p className="mt-4 text-zinc-300">
                    Crear una cuenta es gratis y toma menos de un minuto.
                </p>
                <Link
                    href="/register"
                    className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-black font-medium"
                >
                    Crear cuenta
                </Link>
            </section>
        </main>
    );
}
