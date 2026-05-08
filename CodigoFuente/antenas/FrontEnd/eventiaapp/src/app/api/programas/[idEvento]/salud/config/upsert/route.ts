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

        // Mapeo exhaustivo para asegurar compatibilidad con cualquier deserializador en el backend
        const payload = {
            // snake_case original
            ...body,
            id_evento: parseInt(idEvento),
            
            // camelCase
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
            activo: body.activo,

            // PascalCase
            IdSaludConfig: body.id_salud_config,
            IdEvento: parseInt(idEvento),
            PedirProblemaMedico: body.pedir_problema_medico,
            ProblemaMedicoObligatorio: body.problema_medico_obligatorio,
            PedirAlergiasNoAlimentarias: body.pedir_alergias_no_alimentarias,
            AlergiasNoAlimentariasObligatorio: body.alergias_no_alimentarias_obligatorio,
            PedirNecesidadEspecial: body.pedir_necesidad_especial,
            NecesidadEspecialObligatorio: body.necesidad_especial_obligatorio,
            PedirCoberturaMedica: body.pedir_cobertura_medica,
            CoberturaMedicaObligatorio: body.cobertura_medica_obligatorio,
            PedirContactoEmergencia: body.pedir_contacto_emergencia,
            ContactoEmergenciaObligatorio: body.contacto_emergencia_obligatorio,
            PedirAutorizaEmergenciaMedica: body.pedir_autoriza_emergencia_medica,
            AutorizaEmergenciaMedicaObligatorio: body.autoriza_emergencia_medica_obligatorio,
            PedirObservacionesFamilia: body.pedir_observaciones_familia,
            ObservacionesFamiliaObligatorio: body.observaciones_familia_obligatorio,
            PedirMedicaciones: body.pedir_medicaciones,
            MedicacionesObligatorio: body.medicaciones_obligatorio,
            Activo: body.activo
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
