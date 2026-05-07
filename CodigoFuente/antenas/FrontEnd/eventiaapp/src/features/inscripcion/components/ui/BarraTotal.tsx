import { useInscripcion } from '../../hooks/useInscripcion';
import { useTotalEstimado } from '../../hooks/useTotalEstimado';
import { useInscripcionValida } from '../../hooks/useInscripcionValida';
import { ArrowRight } from 'lucide-react';

export function BarraTotal() {
    const { state, irAFase } = useInscripcion();
    const { subtotal, descuento, total, moneda } = useTotalEstimado(state.participantes, state.programaData);
    const { valida, errores } = useInscripcionValida(state);

    const handleContinuar = () => {
        if (!valida) {
            alert('Por favor completá los datos faltantes:\n\n- ' + errores.join('\n- '));
            return;
        }
        irAFase('resumen');
    };

    if (state.participantes.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-bg border-t border-gray-200 dark:border-card-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col text-center sm:text-left">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Subtotal: {subtotal} {moneda}
                    </div>
                    {descuento > 0 && (
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            Dto. Hnos: -{descuento} {moneda}
                        </div>
                    )}
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        Total: {total} <span className="text-sm font-normal text-gray-500">{moneda}</span>
                    </div>
                </div>
                
                <button 
                    onClick={handleContinuar}
                    className={`
                        flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-lg transition-all
                        ${valida 
                            ? 'bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }
                    `}
                >
                    Revisar y Firmar
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
