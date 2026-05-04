import { useState } from 'react';
import { useInscripcion } from '../hooks/useInscripcion';
import { useTotalEstimado } from '../hooks/useTotalEstimado';
import { confirmarInscripcion } from '../inscripcion.service';
import { ArrowLeft, CheckCircle2, DollarSign, FileText, Loader2, Mail, Phone, Users } from 'lucide-react';

export function FaseD_ResumenFirma() {
    const { state, irAFase, guardarFirma, buildPayload, setLoading, setError, setConfirmado } = useInscripcion();
    const { subtotal, descuento, total, moneda } = useTotalEstimado(state.participantes, state.programaData);
    const autorizacionesConfig = state.programaData?.autorizaciones_configuradas ?? [];

    const [nombreFirma, setNombreFirma] = useState(state.firma.nombre_completo || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Estado local de checkboxes de autorizaciones
    const [autorizaciones, setAutorizaciones] = useState<Record<number, boolean>>(
        () => Object.fromEntries(autorizacionesConfig.map(a => [a.id, false]))
    );

    const handleConfirmar = async () => {
        if (!nombreFirma.trim()) {
            alert('Debe ingresar su nombre completo como firma.');
            return;
        }

        // Verificar autorizaciones obligatorias
        const faltaObligatoria = autorizacionesConfig.some(
            a => a.obligatoria && !autorizaciones[a.id]
        );
        if (faltaObligatoria) {
            alert('Debés aceptar todas las autorizaciones obligatorias para continuar.');
            return;
        }

        const fechaActual = new Date().toISOString().split('T')[0];
        const firmaDefinitiva = {
            nombre_completo: nombreFirma,
            fecha: fechaActual,
            autorizaciones: autorizacionesConfig.map(a => ({
                id_autorizacion: a.id,
                acepta: autorizaciones[a.id] ?? false,
            })),
        };

        guardarFirma(firmaDefinitiva);

        try {
            setIsSubmitting(true);
            setLoading(true);
            const payload = buildPayload(firmaDefinitiva);
            const response = await confirmarInscripcion(payload);
            setConfirmado(response);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido al confirmar';
            setError(msg);
            irAFase('panel');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32 animate-in slide-in-from-right-8 duration-300">
            <button 
                onClick={() => irAFase('panel')} 
                className="flex items-center gap-2 text-gray-500 hover:text-accent font-medium mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver al panel y seguir editando
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                <FileText className="w-7 h-7 text-accent" />
                Resumen de Inscripción
            </h2>

            <div className="space-y-6">
                {/* Resumen Responsable */}
                <div className="bg-white dark:bg-card-bg p-6 rounded-xl border border-gray-200 dark:border-card-border shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Responsable / Tutor</h3>
                    <div className="flex flex-col gap-1">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {state.responsable.nombre} {state.responsable.apellido} 
                            <span className="text-sm font-normal text-gray-500 ml-2">({state.responsable.relacion})</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                            <Mail className="w-4 h-4" /> {state.responsable.email}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> {state.responsable.telefono}
                        </p>
                    </div>
                </div>

                {/* Resumen Participantes */}
                <div className="bg-white dark:bg-card-bg p-6 rounded-xl border border-gray-200 dark:border-card-border shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participantes ({state.participantes.length})
                    </h3>
                    <div className="divide-y divide-gray-100 dark:divide-card-border">
                        {state.participantes.map(p => (
                            <div key={p._clientId} className="py-4 first:pt-0 last:pb-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                    👦👧 {p.nombre} {p.apellido}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Semanas: <strong className="text-gray-900 dark:text-white">{p.periodos.length}</strong>
                                    {p.servicios.length > 0 && <span> • Servicios: <strong className="text-gray-900 dark:text-white">{p.servicios.length}</strong></span>}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumen Totales */}
                <div className="bg-accent/5 p-6 rounded-xl border-2 border-accent/20">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Presupuesto Estimado
                    </h3>
                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                        <div className="flex justify-between items-center">
                            <span>Subtotal:</span>
                            <span className="font-medium">{subtotal} {moneda}</span>
                        </div>
                        {descuento > 0 && (
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-medium">
                                <span>Descuento hermanos (10%):</span>
                                <span>-{descuento} {moneda}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-accent/20 text-xl font-bold text-gray-900 dark:text-white">
                            <span>Total a abonar:</span>
                            <span>{total} <span className="text-sm font-normal text-gray-500">{moneda}</span></span>
                        </div>
                    </div>
                </div>

                {/* Autorizaciones del programa */}
                {autorizacionesConfig.length > 0 && (
                    <div className="bg-white dark:bg-card-bg p-6 rounded-xl border border-gray-200 dark:border-card-border shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                            Autorizaciones
                        </h3>
                        <div className="space-y-3">
                            {autorizacionesConfig.map(a => (
                                <label key={a.id} className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autorizaciones[a.id] ?? false}
                                        onChange={e => setAutorizaciones(prev => ({ ...prev, [a.id]: e.target.checked }))}
                                        className="w-4 h-4 mt-0.5 accent-accent"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {a.descripcion}
                                        {a.obligatoria && (
                                            <span className="text-red-500 ml-1 font-medium">*</span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Firma */}
                <div className="bg-white dark:bg-card-bg p-8 rounded-xl border border-gray-200 dark:border-card-border shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Firma de Autorización</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Al ingresar mi nombre completo a continuación, acepto las condiciones del programa, 
                        declaro que los datos médicos y personales provistos son verdaderos, y autorizo 
                        la participación en las actividades de la colonia.
                    </p>
                    
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white">
                            Escribí tu nombre completo como firma digital:
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ej. Juan Pérez"
                            value={nombreFirma}
                            onChange={(e) => setNombreFirma(e.target.value)}
                            className="w-full px-5 py-4 text-lg bg-gray-50 dark:bg-black/20 border-2 border-gray-200 dark:border-card-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <button 
                        onClick={handleConfirmar}
                        disabled={isSubmitting || !nombreFirma.trim()}
                        className={`
                            mt-8 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all
                            ${nombreFirma.trim() && !isSubmitting 
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Procesando inscripción...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                Confirmar Inscripción Definitiva
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
