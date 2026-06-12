export interface TransferenciaConfig {
    id_evento: number;
    titulo: string;
    texto_intro: string | null;
    activo: boolean;
}

export interface TransferenciaDestino {
    id_evento_regalo_transferencia: number | null;
    id_evento?: number;
    codigo_moneda: string;
    titulo: string | null;
    datos_transferencia_texto: string;
    instrucciones: string | null;
    orden: number;
    activo: boolean;
}

export interface MonedaCombo {
    codigo_moneda: string;
    nombre: string;
    simbolo: string;
    orden: number;
    codigo?: string;
    descripcion?: string;
}

export interface RegaloItem {
    id_regalo_item: number | null;
    id_evento?: number;
    titulo: string;
    descripcion: string | null;
    cantidad_total: number;
    cantidad_reservada?: number;
    cantidad_disponible?: number;
    permitir_excedente?: boolean;
    orden: number;
    visible: boolean;
    activo?: boolean;
}

export interface FondoConfig {
    id_fondo: number | null;
    id_evento?: number;
    titulo: string;
    descripcion_publica: string | null;
    moneda_base: string;
    modo_confirmacion: string; // INVITADO_Y_ORGANIZADOR or SOLO_ORGANIZADOR
    permitir_excedente?: boolean;
    mostrar_pendientes?: boolean;
    mostrar_muro_mensajes?: boolean;
    permitir_anonimo?: boolean;
    activo: boolean;
}

export interface MetaItem {
    id_meta: number | null;
    id_evento?: number;
    id_fondo: number;
    tipo_meta?: string; // default GENERICA
    titulo: string;
    descripcion: string | null;
    objetivo_monto: number;
    total_confirmado?: number;
    total_pendiente?: number;
    porcentaje?: number;
    orden: number;
    visible: boolean;
    activo?: boolean;
}

export interface AporteItem {
    id_aporte: number;
    id_evento: number;
    id_fondo: number;
    id_meta: number;
    meta_titulo: string;
    estado: 'DECLARADO' | 'CONFIRMADO' | string;
    monto_aporte: number;
    moneda_aporte: string;
    monto_base_calculado: number | null;
    tipo_cambio_usado: number | null;
    nombre_mostrado: string | null;
    es_anonimo: boolean;
    mensaje: string | null;
    mostrar_en_muro: boolean;
    fecha_declara: string;
    fecha_confirma: string | null;
    id_usuario_confirma: number | null;
    activo: boolean;
}
