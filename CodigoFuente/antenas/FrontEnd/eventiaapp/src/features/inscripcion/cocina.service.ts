import { CocinaDiaResponse, ParticipanteDetalleResponse } from './types/cocina.types';

const API_URL = '/api/programas';

export const getCocinaDia = async (idEvento: number, fecha: string, idIdioma?: number): Promise<CocinaDiaResponse> => {
    const params = new URLSearchParams({ fecha });
    if (idIdioma) params.append('idIdioma', idIdioma.toString());

    const res = await fetch(`${API_URL}/${idEvento}/cocina/dia?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener la organización de la comida');
    return res.json();
};

export const getParticipanteCocinaDetalle = async (
    idEvento: number,
    idInvitado: number,
    fecha: string,
    idIdioma?: number
): Promise<ParticipanteDetalleResponse> => {
    const params = new URLSearchParams({ fecha });
    if (idIdioma) params.append('idIdioma', idIdioma.toString());

    const res = await fetch(`${API_URL}/${idEvento}/cocina/participantes/${idInvitado}/detalle?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener el detalle del participante');
    return res.json();
};
