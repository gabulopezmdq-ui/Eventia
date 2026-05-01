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
    tipo_evento_codigo?: string;
    idioma: unknown | null;
    dress_code: unknown | null;
    cliente: unknown | null;
}

// Payload del POST /eventos (Paso 1 - Crear evento base)
export interface CreateEventPayload {
    idTipoEvento: number;
    idIdioma: number;
    idPlantilla?: number;
    idDressCode?: number;
    anfitrionesTexto: string;
    saludo?: string;
    mensajeBienvenida?: string;
    notas?: string;
    // Campos opcionales que pueden enviarse pero normalmente van en AplicarPlantilla
    fechaHora?: string;
    lugar?: string;
    direccion?: string;
    latitud?: number;
    longitud?: number;

    // 👇 Nuevos campos añadidos / actualizados 👇
    modalidad?: 'PROPIO' | 'CLIENTE' | null;
    // B2B: asociación a cuenta empresarial
    idUnidad?: number | null;
    idCliente?: number | null;
    // B2C: plan seleccionado por el usuario
    codigoPlan?: string | null;
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

// Dress Code
export interface DressCode {
    id: number;
    codigo: string;
    texto: string;
    orden: number | null;
}

// Detalle completo de una plantilla (incluye tramos, accesos y relaciones)
export interface PlantillaDetalle {
    id_plantilla: number;
    id_tipo_evento: number;
    codigo: string;
    nombre: string;
    activo: boolean;
    tramos: PlantillaTramo[];
    accesos: PlantillaAccesoDetalle[];
    relaciones: PlantillaRelacion[];
    tramos_count: number;
    accesos_count: number;
}

// Accesos dentro de una plantilla detallada
export interface PlantillaAccesoDetalle {
    id_plantilla_acceso: number;
    nombre_default: string;
    mensaje_rsvp_default: string;
    es_publico_default: boolean;
    orden: number;
    es_default: boolean;
    activo: boolean;
}

// Relaciones acceso-tramo dentro de una plantilla
export interface PlantillaRelacion {
    id_plantilla_acceso: number;
    id_plantilla_tramo: number;
}

// Payload para aplicar una plantilla a un evento
export interface AplicarPlantillaPayload {
    id_plantilla: number;
    borrar_existente: boolean;
    fecha_base: string;
    lugar_base?: string;
    direccion_base?: string;
    latitud_base?: number;
    longitud_base?: number;
}

// Estructura completa de un evento (después de aplicar plantilla)
export interface EstructuraEvento {
    id_evento: number;
    id_acceso_default: number | null;
    tramos: TramoEvento[];
    accesos: AccesoEvento[];
    relaciones: RelacionAccesoTramo[];
}

// Tramo de un evento (instancia real, editable)
export interface TramoEvento {
    id_tramo: number;
    id_evento: number;
    id_tramo_tipo: number;
    nombre: string;
    leyenda_visible: string | null;
    notas_internas: string | null;
    fecha_hora_inicio: string | null;
    fecha_hora_fin: string | null;
    lugar: string | null;
    direccion: string | null;
    latitud: number | null;
    longitud: number | null;
    orden: number;
    cupo: number | null;
    activo: boolean;
}

// Acceso de un evento (instancia real, editable)
export interface AccesoEvento {
    id_acceso: number;
    id_evento: number;
    nombre: string;
    mensaje_rsvp: string | null;
    es_publico: boolean;
    cupo: number | null;
    precio: number | null;
    orden: number;
    activo: boolean;
}

// Relación acceso-tramo de un evento
export interface RelacionAccesoTramo {
    id_acceso: number;
    id_tramo: number;
}

// ═══════════ Interfaces para Flujo SIN Plantilla (Manual) ═══════════

// Tramo Tipo (Paramétrica para Select)
export interface TramoTipo {
    id: number;
    codigo: string;
    texto: string;
    orden: number | null;
}

// Payload manual para el POST /eventos_plantillas/CrearEstructuraManual
export interface RelacionManualPayload {
    acceso_orden: number;
    tramo_orden: number;
}

export interface AccesoManualPayload extends Partial<AccesoEvento> {
    es_default?: boolean;
}

export interface CrearEstructuraManualPayload {
    borrar_existente: boolean;
    id_solicitud_draft?: number;
    motivo?: string;
    tramos: Partial<TramoEvento>[];
    accesos: AccesoManualPayload[];
    relaciones: RelacionManualPayload[];
    id_acceso_default_orden?: number;
}
