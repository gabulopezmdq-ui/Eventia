export interface PerfilData {
    id_usuario?: number;
    email: string;
    nombre: string | null;
    apellido: string | null;
    telefono: string | null;
    // País
    id_pais?: number | null;
    pais_nombre?: string | null;
    // Idioma preferido
    id_idioma_preferido?: number | null;
    idioma_preferido_nombre?: string | null;
    // Idioma default evento
    id_idioma_default_evento?: number | null;
    idioma_default_evento_nombre?: string | null;
    // Preferencias
    recibir_novedades?: boolean;
    // Timestamps
    fecha_alta?: string;
    ultimo_acceso?: string;
    // Stats
    cantidad_eventos_propios?: number;
    cantidad_eventos_compartidos?: number;
    cantidad_eventos_cuenta?: number;
    ultimo_evento_creado?: string | null;
    // Legacy – kept for backward compat
    pais?: string | null;
    idioma_preferido?: string | null;
}

export async function getMiPerfil(): Promise<PerfilData> {
    const res = await fetch('/api/perfil', {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('No se pudo obtener el perfil');
    }

    const data = await res.json();
    return {
        id_usuario: data.id_usuario,
        email: data.email || data.Email || '',
        nombre: data.nombre || data.Nombre || '',
        apellido: data.apellido || data.Apellido || '',
        telefono: data.telefono || data.Telefono || '',
        // País
        id_pais: data.id_pais,
        pais_nombre: data.pais_nombre || data.pais || data.Pais || '',
        // Idiomas
        id_idioma_preferido: data.id_idioma_preferido,
        idioma_preferido_nombre: data.idioma_preferido_nombre || data.idioma_preferido || data.IdiomaPreferido || '',
        id_idioma_default_evento: data.id_idioma_default_evento,
        idioma_default_evento_nombre: data.idioma_default_evento_nombre || '',
        // Preferencias
        recibir_novedades: data.recibir_novedades ?? false,
        // Timestamps
        fecha_alta: data.fecha_alta || data.FechaAlta,
        ultimo_acceso: data.ultimo_acceso || data.UltimoAcceso,
        // Stats
        cantidad_eventos_propios: data.cantidad_eventos_propios ?? 0,
        cantidad_eventos_compartidos: data.cantidad_eventos_compartidos ?? 0,
        cantidad_eventos_cuenta: data.cantidad_eventos_cuenta ?? 0,
        ultimo_evento_creado: data.ultimo_evento_creado ?? null,
        // Legacy
        pais: data.pais_nombre || data.pais || data.Pais || '',
        idioma_preferido: data.idioma_preferido_nombre || data.idioma_preferido || data.IdiomaPreferido || '',
    };
}

export async function updateMiPerfil(payload: Partial<PerfilData>): Promise<void> {
    const bodyArgs = {
        nombre: payload.nombre,
        apellido: payload.apellido,
        telefono: payload.telefono,
        id_pais: payload.id_pais,
        id_idioma_preferido: payload.id_idioma_preferido,
        id_idioma_default_evento: payload.id_idioma_default_evento,
        recibir_novedades: payload.recibir_novedades,
    };

    const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyArgs),
    });

    if (!res.ok) {
        throw new Error('Error al actualizar el perfil');
    }
}
