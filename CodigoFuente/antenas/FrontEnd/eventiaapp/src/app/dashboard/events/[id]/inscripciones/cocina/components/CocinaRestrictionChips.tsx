import { RestriccionResumen } from '@/src/features/inscripcion/types/cocina.types';
import { AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
    restricciones: RestriccionResumen[];
}

export default function CocinaRestrictionChips({ restricciones }: Props) {
    const ordenadas = useMemo(() => {
        return [...restricciones].sort((a, b) => {
            // 1. Primero alertaVisual = true
            if (a.alertaVisual && !b.alertaVisual) return -1;
            if (!a.alertaVisual && b.alertaVisual) return 1;

            // 2. Luego por cantidad DESC
            if (a.cantidad !== b.cantidad) {
                return b.cantidad - a.cantidad;
            }

            // 3. Luego alfabético
            return a.texto.localeCompare(b.texto);
        });
    }, [restricciones]);

    if (ordenadas.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {ordenadas.map((restriccion) => {
                const isAlert = restriccion.alertaVisual;
                return (
                    <div
                        key={restriccion.codigo}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isAlert
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-background border-card-border text-muted hover:border-card-border/80 hover:bg-card-bg'
                        }`}
                    >
                        {isAlert && <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{restriccion.texto} ({restriccion.cantidad})</span>
                    </div>
                );
            })}
        </div>
    );
}
