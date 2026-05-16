export default function PerfilCuentaLoading() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-3">
                <div className="h-4 w-14 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-4 w-64 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
            </div>

            {/* Card skeleton: Datos de tu empresa */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="h-4 w-40 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-11 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <div className="h-11 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            </div>

            {/* Card skeleton: Datos fiscales */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="h-4 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
            </div>

            {/* Card skeleton: Descripción */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="h-4 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800 mb-4" />
                <div className="h-24 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            </div>

            {/* Button skeleton */}
            <div className="h-14 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
    );
}
