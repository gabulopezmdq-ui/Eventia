import { Event } from '../events/types';

export interface Programa extends Event {
    tipo_operacion: 'PROGRAMA';
    fecha_inicio: string;
    fecha_fin: string;
    mensaje_bienvenida?: string;
}

export interface CrearProgramaPayload {
    id_tipo_evento: number;
    id_idioma: number;
    id_cuenta: number;
    id_unidad: number;
    id_cliente: number | null;
    modalidad: string;
    anfitriones_texto: string;
    saludo: string;
    mensaje_bienvenida: string;
    notas: string;
    fecha_inicio: string;
    fecha_fin: string;
    codigo_plan: string;
}

export interface ProgramaPeriodo {
    id_programa_periodo?: number;
    id_evento: number;
    codigo: string;
    nombre: string;
    fecha_desde: string;
    fecha_hasta: string;
    precio_base: number;
    moneda: string;
    cupo: number | null;
    orden: number;
    activo: boolean;
}

export interface CampoExtra {
    codigo: string;
    label: string;
    tipo: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE' | 'BOOLEAN';
    obligatorio: boolean;
    opciones?: string[];
}

export interface ProgramaServicioConfig {
    campos_extra?: CampoExtra[];
}

export interface ProgramaServicio {
    id_programa_servicio?: number;
    id_evento: number;
    id_servicio_base: number | null;
    servicio_base_codigo?: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    tipo_calculo: string;
    precio: number;
    moneda: string;
    obligatorio: boolean;
    permite_cantidad: boolean;
    requiere_seleccion_dias: boolean;
    cupo: number | null;
    orden: number;
    activo: boolean;
    config_json?: string | null;
}

export interface AutorizacionConfig {
    id_programa_autorizacion_config?: number;
    id_evento: number;
    id_autorizacion_base: number | null;
    codigo: string;
    titulo?: string;
    texto?: string;
    obligatoria: boolean;
    requiere_aceptacion: boolean;
    requiere_datos_responsable: boolean;
    orden: number;
    activo: boolean;
}

export interface TraduccionAutorizacion {
    id_idioma: number;
    titulo: string;
    texto: string;
    activo: boolean;
}

export interface SaludConfig {
    id_salud_config?: number;
    id_evento: number;
    pedir_problema_medico: boolean;
    problema_medico_obligatorio: boolean;
    pedir_alergias_no_alimentarias: boolean;
    alergias_no_alimentarias_obligatorio: boolean;
    pedir_necesidad_especial: boolean;
    necesidad_especial_obligatorio: boolean;
    pedir_cobertura_medica: boolean;
    cobertura_medica_obligatorio: boolean;
    pedir_contacto_emergencia: boolean;
    contacto_emergencia_obligatorio: boolean;
    pedir_autoriza_emergencia_medica: boolean;
    autoriza_emergencia_medica_obligatorio: boolean;
    pedir_observaciones_familia: boolean;
    observaciones_familia_obligatorio: boolean;
    pedir_medicaciones: boolean;
    medicaciones_obligatorio: boolean;
    activo: boolean;
}

export interface StaffPrograma {
    id_evento: number;
    id_usuario?: number;
    email?: string;
    id_rol: string;
    activo: boolean;
}
