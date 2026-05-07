import { CalendarRange } from 'lucide-react';

interface InscriptosHeaderProps {
  programa?: string;
  isLoading: boolean;
}

export default function InscriptosHeader({ programa, isLoading }: InscriptosHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-card-border pb-6">
      <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
        <CalendarRange className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Panel de Inscriptos
        </h1>
        {isLoading ? (
          <div className="h-4 bg-muted/20 animate-pulse rounded w-64 mt-1"></div>
        ) : (
          <p className="text-sm font-medium text-muted mt-1">
            Programa: <span className="text-foreground">{programa || 'Sin especificar'}</span>
          </p>
        )}
      </div>
    </header>
  );
}
