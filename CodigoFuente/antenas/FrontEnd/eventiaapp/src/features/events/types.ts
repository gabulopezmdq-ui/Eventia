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
