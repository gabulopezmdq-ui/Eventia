// Respuesta del GET ALL
export interface Event {
    id_evento: number;
    id_tipo_evento: number;
    id_idioma: number;
    id_cliente: number | null;
    anfitriones_texto: string;
    fecha_hora: string;
    lugar: string;
    direccion: string;
    latitud: number;
    longitud: number;
    id_dress_code: number | null;
    dress_code_descripcion: string | null;
    saludo: string;
    mensaje_bienvenida: string;
    notas: string;
    fecha_alta: string;
    fecha_modif: string | null;
    estado: string;
    uniqueProperties: unknown[];
    tipo_evento: unknown | null;
    idioma: unknown | null;
    dress_code: unknown | null;
    cliente: unknown | null;
}

// Payload del POST
export interface CreateEventPayload {
    idTipoEvento: number;
    idIdioma: number;
    idPlantilla?: number;
    fechaHora: string;
    anfitrionesTexto: string;
    lugar: string;
    direccion: string;
    latitud: number;
    longitud: number;
    saludo: string;
    mensajeBienvenida: string;
    notas?: string;
}

// Tipos de evento (ParametricaDTO del backend)
export interface TipoEvento {
    id: number;
    codigo: string;
    texto: string;
    orden: number | null;
}

// Idiomas activos
export interface Idioma {
    id_idioma: number;
    codigo_idioma: string;
    codigo_region: string;
    locale: string;
    nombre_largo: string;
    bandera_iso2: string;
    activo: boolean;
}

// Plantillas de evento
export interface PlantillaEvento {
    id_plantilla: number;
    codigo: string;
    activo: boolean;
    id_tipo_evento: number | null;
}

// Tramos de plantilla
export interface PlantillaTramo {
    id_plantilla_tramo: number;
    id_plantilla: number;
    id_tramo_tipo: number | null;
    nombre_default: string;
    leyenda_default: string;
    orden: number;
    activo: boolean;
}
