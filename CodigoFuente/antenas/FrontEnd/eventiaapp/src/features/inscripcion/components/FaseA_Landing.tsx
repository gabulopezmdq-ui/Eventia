import { useState } from 'react';
import { useInscripcion } from '../hooks/useInscripcion';
import { Calendar, Clock, DollarSign, Info, ChevronRight, Globe, ChevronDown, ChevronUp, Users } from 'lucide-react';

export function FaseA_Landing() {
    const { state, irAFase, abrirDrawerResponsable, cambiarIdioma } = useInscripcion();
    const { programaData } = state;

    // Estados para el acordeón (por defecto cerrados o abiertos según prefieras, los dejo cerrados para ahorrar espacio)
    const [semanasAbiertas, setSemanasAbiertas] = useState(false);
    const [serviciosAbiertos, setServiciosAbiertos] = useState(false);

    if (!programaData) return null;

    const handleComenzar = () => {
        irAFase('panel');
        abrirDrawerResponsable();
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {programaData.saludo}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                        {programaData.mensaje_bienvenida}
                    </p>
                </div>

                {programaData.idiomas.length > 1 && (
                    <div className="flex items-center gap-2 bg-white dark:bg-card-bg px-3 py-2 rounded-lg border border-gray-200 dark:border-card-border shadow-sm shrink-0">
                        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <select
                            value={state.idIdioma}
                            onChange={(e) => cambiarIdioma(Number(e.target.value))}
                            className="text-sm bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white cursor-pointer outline-none"
                        >
                            {programaData.idiomas.map((idioma) => (
                                <option
                                    key={idioma.idIdioma}
                                    value={idioma.idIdioma}
                                    className="text-gray-900"
                                >
                                    {idioma.nombreLargo}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Acordeón Semanas */}
                <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-card-border overflow-hidden self-start">
                    <button
                        onClick={() => setSemanasAbiertas(!semanasAbiertas)}
                        className="w-full px-6 py-4 border-b border-gray-200 dark:border-card-border bg-gray-50 dark:bg-black/20 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-black/40 transition-colors"
                    >
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Calendar className="w-5 h-5 text-accent" />
                            Semanas Disponibles ({programaData.periodos.length})
                        </h2>
                        {semanasAbiertas ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {semanasAbiertas && (
                        <ul className="divide-y divide-gray-200 dark:divide-card-border max-h-[350px] overflow-y-auto">
                            {programaData.periodos.map(periodo => (
                                <li key={periodo.id_programa_periodo} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{periodo.nombre}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {periodo.fecha_desde} al {periodo.fecha_hasta}
                                        </p>
                                    </div>
                                    <div className="text-accent font-semibold flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full text-sm shrink-0">
                                        <DollarSign className="w-4 h-4" />
                                        {periodo.precio_base} {periodo.moneda}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Acordeón Servicios */}
                <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-card-border overflow-hidden self-start">
                    <button
                        onClick={() => setServiciosAbiertos(!serviciosAbiertos)}
                        className="w-full px-6 py-4 border-b border-gray-200 dark:border-card-border bg-gray-50 dark:bg-black/20 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-black/40 transition-colors"
                    >
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Info className="w-5 h-5 text-accent" />
                            Servicios Adicionales ({programaData.servicios.length})
                        </h2>
                        {serviciosAbiertos ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {serviciosAbiertos && (
                        programaData.servicios.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-card-border max-h-[350px] overflow-y-auto">
                                {programaData.servicios.map(servicio => (
                                    <li key={servicio.idProgramaServicio} className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white pr-4">{servicio.nombre}</h3>
                                            <span className="text-accent font-medium text-sm shrink-0">
                                                {servicio.precio > 0 ? `+${servicio.precio} ${servicio.moneda}` : 'Gratis'}
                                                {servicio.tipoCalculo === 'POR_DIA' && ' /día'}
                                            </span>
                                        </div>
                                        {servicio.descripcion && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{servicio.descripcion}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No hay servicios adicionales configurados.
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Información adicional: Pago */}
            <div className="mt-8 space-y-6">
                {/* Sección de Pago / Información Pública */}
                {programaData.info_publica && (
                    <div className="bg-white dark:bg-card-bg border border-gray-200 dark:border-card-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                            <DollarSign className="w-5 h-5 text-accent" />
                            Información de Pago e Inscripción
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {programaData.info_publica}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={handleComenzar}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold py-4 px-10 rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl text-lg"
                >
                    Comenzar Inscripción
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
