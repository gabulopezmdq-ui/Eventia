import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request, props: { params: Promise<{ idEvento: string }> }) {
    try {
        const { idEvento } = await props.params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const body = await req.json();

        // Mapeo snake_case -> PascalCase
        const payload = {
            idSaludConfig: body.id_salud_config,
            idEvento: parseInt(idEvento),
            pedirProblemaMedico: body.pedir_problema_medico,
            problemaMedicoObligatorio: body.problema_medico_obligatorio,
            pedirAlergiasNoAlimentarias: body.pedir_alergias_no_alimentarias,
            alergiasNoAlimentariasObligatorio: body.alergias_no_alimentarias_obligatorio,
            pedirNecesidadEspecial: body.pedir_necesidad_especial,
            necesidadEspecialObligatorio: body.necesidad_especial_obligatorio,
            pedirCoberturaMedica: body.pedir_cobertura_medica,
            coberturaMedicaObligatorio: body.cobertura_medica_obligatorio,
            pedirContactoEmergencia: body.pedir_contacto_emergencia,
            contactoEmergenciaObligatorio: body.contacto_emergencia_obligatorio,
            pedirAutorizaEmergenciaMedica: body.pedir_autoriza_emergencia_medica,
            autorizaEmergenciaMedicaObligatorio: body.autoriza_emergencia_medica_obligatorio,
            pedirObservacionesFamilia: body.pedir_observaciones_familia,
            observacionesFamiliaObligatorio: body.observaciones_familia_obligatorio,
            pedirMedicaciones: body.pedir_medicaciones,
            medicacionesObligatorio: body.medicaciones_obligatorio,
            activo: body.activo
        };

        const res = await fetch(`${API_URL}/programas/${idEvento}/salud/config/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error backend', details: errorBody }, { status: res.status });
        }

        const data = await res.json();
        
        // Mapeo PascalCase -> snake_case
        const mappedData = {
            id_salud_config: data.idSaludConfig,
            id_evento: data.idEvento,
            pedir_problema_medico: data.pedirProblemaMedico,
            problema_medico_obligatorio: data.problemaMedicoObligatorio,
            pedir_alergias_no_alimentarias: data.pedirAlergiasNoAlimentarias,
            alergias_no_alimentarias_obligatorio: data.alergiasNoAlimentariasObligatorio,
            pedir_necesidad_especial: data.pedirNecesidadEspecial,
            necesidad_especial_obligatorio: data.necesidadEspecialObligatorio,
            pedir_cobertura_medica: data.pedirCoberturaMedica,
            cobertura_medica_obligatorio: data.coberturaMedicaObligatorio,
            pedir_contacto_emergencia: data.pedirContactoEmergencia,
            contacto_emergencia_obligatorio: data.contactoEmergenciaObligatorio,
            pedir_autoriza_emergencia_medica: data.pedirAutorizaEmergenciaMedica,
            autoriza_emergencia_medica_obligatorio: data.autorizaEmergenciaMedicaObligatorio,
            pedir_observaciones_familia: data.pedirObservacionesFamilia,
            observaciones_familia_obligatorio: data.observacionesFamiliaObligatorio,
            pedir_medicaciones: data.pedirMedicaciones,
            medicaciones_obligatorio: data.medicacionesObligatorio,
            activo: data.activo
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno del proxy' }, { status: 500 });
    }
}
