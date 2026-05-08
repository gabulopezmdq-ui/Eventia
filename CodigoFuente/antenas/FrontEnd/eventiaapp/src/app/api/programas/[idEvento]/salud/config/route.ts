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
        
        // Mapeo PascalCase -> snake_case
        const mappedData = {
            id_salud_config: data.idSaludConfig ?? data.IdSaludConfig,
            id_evento: data.idEvento ?? data.IdEvento,
            pedir_problema_medico: data.pedirProblemaMedico ?? data.PedirProblemaMedico,
            problema_medico_obligatorio: data.problemaMedicoObligatorio ?? data.ProblemaMedicoObligatorio,
            pedir_alergias_no_alimentarias: data.pedirAlergiasNoAlimentarias ?? data.PedirAlergiasNoAlimentarias,
            alergias_no_alimentarias_obligatorio: data.alergiasNoAlimentariasObligatorio ?? data.AlergiasNoAlimentariasObligatorio,
            pedir_necesidad_especial: data.pedirNecesidadEspecial ?? data.PedirNecesidadEspecial,
            necesidad_especial_obligatorio: data.necesidadEspecialObligatorio ?? data.NecesidadEspecialObligatorio,
            pedir_cobertura_medica: data.pedirCoberturaMedica ?? data.PedirCoberturaMedica,
            cobertura_medica_obligatorio: data.coberturaMedicaObligatorio ?? data.CoberturaMedicaObligatorio,
            pedir_contacto_emergencia: data.pedirContactoEmergencia ?? data.PedirContactoEmergencia,
            contacto_emergencia_obligatorio: data.contactoEmergenciaObligatorio ?? data.ContactoEmergenciaObligatorio,
            pedir_autoriza_emergencia_medica: data.pedirAutorizaEmergenciaMedica ?? data.PedirAutorizaEmergenciaMedica,
            autoriza_emergencia_medica_obligatorio: data.autorizaEmergenciaMedicaObligatorio ?? data.AutorizaEmergenciaMedicaObligatorio,
            pedir_observaciones_familia: data.pedirObservacionesFamilia ?? data.PedirObservacionesFamilia,
            observaciones_familia_obligatorio: data.observacionesFamiliaObligatorio ?? data.ObservacionesFamiliaObligatorio,
            pedir_medicaciones: data.pedirMedicaciones ?? data.PedirMedicaciones,
            medicaciones_obligatorio: data.medicacionesObligatorio ?? data.MedicacionesObligatorio,
            activo: data.activo ?? data.Activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
