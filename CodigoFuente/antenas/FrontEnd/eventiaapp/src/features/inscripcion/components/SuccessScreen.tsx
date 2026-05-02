import { useEffect } from 'react';
import { useInscripcion } from '../hooks/useInscripcion';
import { CheckCircle, Mail, RotateCcw } from 'lucide-react';

export function SuccessScreen() {
    const { state, limpiarDraft } = useInscripcion();

    useEffect(() => {
        limpiarDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white dark:bg-card-bg p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-card-border text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
                </div>
                
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    ¡Inscripción Confirmada!
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Hemos recibido tu solicitud correctamente y procesado tus datos con éxito.
                </p>

                <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border-2 border-dashed border-green-200 dark:border-green-900/50 mb-8">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Código de confirmación</p>
                    <p className="text-3xl font-mono font-black text-green-700 dark:text-green-400">
                        {state.tokenConfirmacion}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 mb-10 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-left">
                    <Mail className="w-6 h-6 text-blue-500 shrink-0" />
                    <p className="text-sm">
                        En breve recibirás un email en <strong className="text-gray-900 dark:text-white">{state.responsable.email}</strong> con los detalles y las instrucciones para el pago.
                    </p>
                </div>

                <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <RotateCcw className="w-5 h-5" />
                    Hacer otra inscripción
                </button>
            </div>
        </div>
    );
}
