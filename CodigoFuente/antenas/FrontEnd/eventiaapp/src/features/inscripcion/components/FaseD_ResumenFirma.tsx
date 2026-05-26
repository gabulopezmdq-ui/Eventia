import { useState, useEffect } from 'react';
import { useInscripcion } from '../hooks/useInscripcion';
import { useTotalEstimado } from '../hooks/useTotalEstimado';
import { confirmarInscripcion, cotizarInscripcion } from '../inscripcion.service';
import type { TotalEstimado } from '../types/inscripcion.types';
import { ArrowLeft, CheckCircle2, DollarSign, FileText, Loader2, Mail, Phone, Users, Server, AlertCircle } from 'lucide-react';

export function FaseD_ResumenFirma() {
    const { state, irAFase, guardarFirma, buildPayload, buildCotizarPayload, setLoading, setError, setConfirmado } = useInscripcion();
    
    // Cálculo local como fallback inmediato
    const localEstimado = useTotalEstimado(state.participantes, state.programaData);
    const autorizacionesConfig = state.programaData?.autorizaciones_configuradas ?? [];

    const [nombreFirma, setNombreFirma] = useState(state.firma.nombre_completo || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Cotización real del backend
    const [cotizacion, setCotizacion] = useState<TotalEstimado | null>(null);
    const [loadingCotizacion, setLoadingCotizacion] = useState(false);
    const [errorCotizacion, setErrorCotizacion] = useState(false);

    // Estado local de checkboxes de autorizaciones
    const [autorizaciones, setAutorizaciones] = useState<Record<number, boolean>>(
        () => Object.fromEntries(autorizacionesConfig.map(a => [a.id, false]))
    );

    // ── Obtener Cotización Oficial al Montar ──────────────────────
    useEffect(() => {
        if (!state.programaData?.token) return;

        async function obtenerCotizacionServidor() {
            try {
                setLoadingCotizacion(true);
                setErrorCotizacion(false);
                
                const payload = buildCotizarPayload();
                const res = await cotizarInscripcion(state.programaData!.token, payload);
                setCotizacion(res);
            } catch (e) {
                console.warn('Error al cotizar desde el backend, usando fallback local:', e);
                setErrorCotizacion(true);
            } finally {
                setLoadingCotizacion(false);
            }
        }

        obtenerCotizacionServidor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Usar la cotización del servidor si está disponible, de lo contrario usar el estimado local
    const subtotalDisplay = cotizacion ? cotizacion.subtotal : localEstimado.subtotal;
    const descuentoDisplay = cotizacion ? cotizacion.descuento : localEstimado.descuento;
    const totalDisplay = cotizacion ? cotizacion.total : localEstimado.total;
    const monedaDisplay = cotizacion ? cotizacion.moneda : localEstimado.moneda;

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
                                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                                    Semanas: <strong className="text-gray-900 dark:text-white">{p.periodos.length}</strong>
                                    {p.servicios.length > 0 && <span> • Servicios: <strong className="text-gray-900 dark:text-white">{p.servicios.length}</strong></span>}
                                    {p.modalidad_retiro && <span> • Retiro: <strong className="text-gray-900 dark:text-white">{p.modalidad_retiro === 'REQUIERE_AUTORIZADO' ? 'Con autorizado' : p.modalidad_retiro === 'SE_RETIRA_SOLO' ? 'Se retira solo/a' : 'No aplica'}</strong></span>}
                                </p>
                                {p.servicios.length > 0 && (
                                    <div className="mt-2 pl-4 text-xs text-gray-500 dark:text-gray-400 space-y-1 border-l-2 border-accent/20">
                                        {p.servicios.map((svcSel, idx) => {
                                            const svcDef = state.programaData?.servicios.find(
                                                (s) => s.idProgramaServicio === svcSel.id_programa_servicio
                                            );
                                            if (!svcDef) return null;
                                            
                                            const extraFieldsText = svcSel.campos_extra
                                                ? Object.entries(svcSel.campos_extra)
                                                      .map(([key, val]) => {
                                                          const campoDef = (svcDef.configJson as any)?.campos_extra?.find(
                                                              (c: any) => c.codigo === key
                                                          );
                                                          const displayVal = val === 'true' ? 'Sí' : val === 'false' ? 'No' : val;
                                                          return `${campoDef?.label || key}: ${displayVal}`;
                                                      })
                                                      .filter(t => t.trim() !== '')
                                                      .join(', ')
                                                : '';

                                            const periodoDef = state.programaData?.periodos.find(
                                                (pe) => pe.id_programa_periodo === svcSel.id_programa_periodo
                                            );

                                            return (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        • {svcDef.nombre} 
                                                        {periodoDef && <span className="text-[10px] text-gray-400 ml-1">({periodoDef.nombre})</span>}
                                                        {svcSel.fechas.length > 0 && <span className="text-[10px] text-accent ml-1 font-semibold">({svcSel.fechas.length} días)</span>}
                                                    </span>
                                                    {extraFieldsText && (
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">({extraFieldsText})</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumen Totales / Presupuesto */}
                <div className="bg-accent/5 p-6 rounded-2xl border-2 border-accent/20 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Presupuesto Final
                    </h3>

                    {loadingCotizacion ? (
                        /* Pulse Loader Premium */
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-accent/10 rounded w-1/3" />
                            <div className="h-4 bg-accent/10 rounded w-1/4" />
                            <div className="h-8 bg-accent/15 rounded w-1/2 mt-4" />
                        </div>
                    ) : (
                        <div className="space-y-2 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between items-center text-sm">
                                <span>Subtotal:</span>
                                <span className="font-medium">{subtotalDisplay} {monedaDisplay}</span>
                            </div>
                            {descuentoDisplay > 0 && (
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-medium text-sm">
                                    <span>Descuento aplicado:</span>
                                    <span>-{descuentoDisplay} {monedaDisplay}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-4 mt-2 border-t border-accent/20 text-xl font-bold text-gray-900 dark:text-white">
                                <span>Total a abonar:</span>
                                <span>{totalDisplay} <span className="text-sm font-normal text-gray-500">{monedaDisplay}</span></span>
                            </div>

                            {/* Badge de estado de cotización */}
                            <div className="pt-2 flex justify-end">
                                {cotizacion ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                                        <Server className="w-3 h-3" />
                                        Precios oficiales validados por servidor
                                    </span>
                                ) : errorCotizacion ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                        <AlertCircle className="w-3 h-3" />
                                        Servidor no disponible, cálculo local estimado
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    )}
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
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">
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
                        disabled={isSubmitting || !nombreFirma.trim() || loadingCotizacion}
                        className={`
                            mt-8 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all
                            ${nombreFirma.trim() && !isSubmitting && !loadingCotizacion
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
