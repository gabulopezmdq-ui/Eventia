export interface PerfilData {
    email: string;
    nombre: string | null;
    apellido: string | null;
    telefono: string | null;
    pais: string | null;
    idioma_preferido?: string | null;
    fecha_alta?: string;
    ultimo_acceso?: string;
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
        email: data.email || data.Email || '',
        nombre: data.nombre || data.Nombre || '',
        apellido: data.apellido || data.Apellido || '',
        telefono: data.telefono || data.Telefono || '',
        pais: data.pais || data.Pais || '',
        idioma_preferido: data.idioma_preferido || data.IdiomaPreferido || 'es',
        fecha_alta: data.fecha_alta || data.FechaAlta,
        ultimo_acceso: data.ultimo_acceso || data.UltimoAcceso,
    };
}

export async function updateMiPerfil(payload: Partial<PerfilData>): Promise<void> {
    // Convertir las props a PascalCase en caso de que el backend lo espere
    const bodyArgs = {
        Nombre: payload.nombre,
        Apellido: payload.apellido,
        Telefono: payload.telefono,
        Pais: payload.pais,
        IdiomaPreferido: payload.idioma_preferido,
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
