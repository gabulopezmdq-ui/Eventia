import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request, props: { params: Promise<{ idEvento: string }> }) {
    try {
        const { idEvento } = await props.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const res = await fetch(`${API_URL}/programas/${idEvento}/salud/config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        // Mapeo exhaustivo (snake_case, camelCase, PascalCase) y fallback a false para evitar perder propiedades
        const mappedData = {
            id_salud_config: data.id_salud_config ?? data.idSaludConfig ?? data.IdSaludConfig ?? null,
            id_evento: data.id_evento ?? data.idEvento ?? data.IdEvento ?? parseInt(idEvento),
            pedir_problema_medico: data.pedir_problema_medico ?? data.pedirProblemaMedico ?? data.PedirProblemaMedico ?? false,
            problema_medico_obligatorio: data.problema_medico_obligatorio ?? data.problemaMedicoObligatorio ?? data.ProblemaMedicoObligatorio ?? false,
            pedir_alergias_no_alimentarias: data.pedir_alergias_no_alimentarias ?? data.pedirAlergiasNoAlimentarias ?? data.PedirAlergiasNoAlimentarias ?? false,
            alergias_no_alimentarias_obligatorio: data.alergias_no_alimentarias_obligatorio ?? data.alergiasNoAlimentariasObligatorio ?? data.AlergiasNoAlimentariasObligatorio ?? false,
            pedir_necesidad_especial: data.pedir_necesidad_especial ?? data.pedirNecesidadEspecial ?? data.PedirNecesidadEspecial ?? false,
            necesidad_especial_obligatorio: data.necesidad_especial_obligatorio ?? data.necesidadEspecialObligatorio ?? data.NecesidadEspecialObligatorio ?? false,
            pedir_cobertura_medica: data.pedir_cobertura_medica ?? data.pedirCoberturaMedica ?? data.PedirCoberturaMedica ?? false,
            cobertura_medica_obligatorio: data.cobertura_medica_obligatorio ?? data.coberturaMedicaObligatorio ?? data.CoberturaMedicaObligatorio ?? false,
            pedir_contacto_emergencia: data.pedir_contacto_emergencia ?? data.pedirContactoEmergencia ?? data.PedirContactoEmergencia ?? false,
            contacto_emergencia_obligatorio: data.contacto_emergencia_obligatorio ?? data.contactoEmergenciaObligatorio ?? data.ContactoEmergenciaObligatorio ?? false,
            pedir_autoriza_emergencia_medica: data.pedir_autoriza_emergencia_medica ?? data.pedirAutorizaEmergenciaMedica ?? data.PedirAutorizaEmergenciaMedica ?? false,
            autoriza_emergencia_medica_obligatorio: data.autoriza_emergencia_medica_obligatorio ?? data.autorizaEmergenciaMedicaObligatorio ?? data.AutorizaEmergenciaMedicaObligatorio ?? false,
            pedir_observaciones_familia: data.pedir_observaciones_familia ?? data.pedirObservacionesFamilia ?? data.PedirObservacionesFamilia ?? false,
            observaciones_familia_obligatorio: data.observaciones_familia_obligatorio ?? data.observacionesFamiliaObligatorio ?? data.ObservacionesFamiliaObligatorio ?? false,
            pedir_medicaciones: data.pedir_medicaciones ?? data.pedirMedicaciones ?? data.PedirMedicaciones ?? false,
            medicaciones_obligatorio: data.medicaciones_obligatorio ?? data.medicacionesObligatorio ?? data.MedicacionesObligatorio ?? false,
            activo: data.activo ?? data.Activo ?? true
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
