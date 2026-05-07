export interface CocinaDiaResponse {
    idEvento: number;
    programa?: string;
    fecha: string;
    servicioCodigo: string;
    resumen: {
        totalComedor: number;
        sinRestricciones: number;
        conRestricciones: number;
        alertasAltas: number;
    };
    totalesPorRestriccion: RestriccionResumen[];
    items: ParticipanteCocina[]; 
}

export interface RestriccionResumen {
    codigo: string;
    texto: string;
    cantidad: number;
    alertaVisual: boolean;
}

export interface ParticipanteCocina {
    idInvitado: number;
    idRsvpGrupoIntegrante: number;
    participante: string;
    responsable: string;
    telefonoResponsable: string;
    servicio: string;
    restricciones: RestriccionDetalle[];
    alertaVisual: boolean;
    nivelAlerta: 'ALTA' | 'MEDIA' | 'NORMAL';
    observacionesSalud: string | null;
}

export interface RestriccionDetalle {
    idRestriccionAlim: number;
    codigo: string;
    texto: string;
    categoria: string;
    requiereAlertaVisual: boolean;
    requiereConfirmacionOrganizador: boolean;
    esAlergeno: boolean;
    observaciones: string;
    severidad: string | null;
}

// Estructura real devuelta por GET /programas/{id}/cocina/participantes/{idInvitado}/detalle
export interface ParticipanteDetalleResponse {
    idEvento: number;
    programa?: string;
    fecha: string;
    servicioCodigo: string;
    participante: {
        idInvitado: number;
        idRsvpGrupoIntegrante: number;
        nombreCompleto: string;
    };
    responsable: {
        nombreCompleto: string;
        telefono: string;
        email: string;
    };
    serviciosDelDia: Array<{ codigo: string; nombre: string }>;
    restricciones: RestriccionDetalle[];
    salud: null | Array<{ problemaMedico?: string; necesidadEspecial?: string; observacionesFamilia?: string }>;
    alertaVisual: boolean;
    nivelAlerta: 'ALTA' | 'MEDIA' | 'NORMAL';
}

