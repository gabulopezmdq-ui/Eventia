import type { Metadata } from 'next';
import { InscripcionProvider } from '@/src/features/inscripcion/context/InscripcionContext';

interface Props {
    children: React.ReactNode;
    params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
    title: 'Inscripción — Eventia',
    description: 'Formulario de inscripción al programa',
};

/**
 * Layout independiente para el flujo de inscripción pública.
 * No hereda el layout del dashboard (sin sidebar, sin AuthProvider).
 * Solo provee el InscripcionProvider con el token de la URL.
 */
export default async function InscripcionLayout({ children, params }: Props) {
    const { token } = await params;

    return (
        <InscripcionProvider token={token}>
            <div className="inscripcion-layout">
                {children}
            </div>
        </InscripcionProvider>
    );
}
