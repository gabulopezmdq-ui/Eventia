export interface SaludPanelResponse {
  id_inscripcion: number;
  id_invitado: number;
  id_rsvp_grupo_integrante: number;
  participante: string;
  responsable: string;
  telefono_responsable: string;
  email_responsable: string;
  tiene_problema_medico: boolean;
  problema_medico_detalle: string | null;
  tiene_alergias_no_alimentarias: boolean;
  alergias_no_alimentarias_detalle: string | null;
  tiene_necesidad_especial: boolean;
  necesidad_especial_detalle: string | null;
  tiene_restricciones_alimentarias: boolean;
  restricciones_alimentarias: string[];
  tiene_medicacion: boolean;
  medicaciones: string[];
  contacto_emergencia: string | null;
  telefono_emergencia: string | null;
  autoriza_emergencia_medica: boolean;
  observaciones_familia: string | null;
  acciones_salud_count: number;
  requiere_seguimiento: boolean;
  alerta_visual: boolean;
  nivel_alerta: 'TODOS' | 'ALTA' | 'MEDIA' | 'NORMAL' | string;
}

export interface SaludFicha {
  id_invitado: number;
  id_ficha_salud: number;
  id_evento: number;
  id_inscripcion: number;
  tiene_problema_medico: boolean;
  detalle_problema_medico: string | null;
  tiene_alergias_no_alimentarias: boolean;
  detalle_alergias_no_alimentarias: string | null;
  tiene_necesidad_especial: boolean;
  detalle_necesidad_especial: string | null;
  tiene_cobertura_medica: boolean;
  cobertura_medica_nombre: string | null;
  cobertura_medica_numero: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  contacto_emergencia_relacion: string | null;
  autoriza_emergencia_medica: boolean;
  observaciones_familia: string | null;
  observaciones_internas: string | null;
  activo: boolean;
  fecha_alta: string;
  id_rsvp_grupo_integrante: number;
}

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
  relacion: string;
  orden: number;
}

export interface SaludMedicacionItem {
  id_medicacion: number;
  id_evento: number;
  id_inscripcion: number;
  id_participante: number | null;
  participante: string | null;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  horario: string | null;
  instrucciones: string;
  administracion_autorizada: boolean;
  debe_llevar_participante: boolean;
  requiere_refrigeracion: boolean;
  activo: boolean;
  fecha_alta: string;
}

export interface SaludAccionItem {
  id_accion_salud: number;
  id_evento: number;
  id_participante: number;
  idInscripcion?: number; // Puede venir en camelCase
  id_inscripcion?: number; // O en snake_case
  fecha_hora: string;
  tipo_accion: string;
  descripcion: string;
  requirio_contacto_familia: boolean;
  contacto_realizado: boolean;
  requiere_seguimiento: boolean;
  usuario_registro: number;
  activo: boolean;
}

export interface SaludParticipanteDetalle {
  id_evento: number;
  id_inscripcion: number;
  id_invitado: number;
  id_rsvp_grupo_integrante: number;
  participante: string;
  responsable: string;
  telefono_responsable: string;
  email_responsable: string;
  ficha: SaludFicha | null;
  contactos_emergencia?: ContactoEmergencia[];
  medicaciones: SaludMedicacionItem[];
  acciones: SaludAccionItem[];
  restricciones_alimentarias: string[];
}

export interface SaludFichaItem {
  // Estos campos son inferidos a partir de las columnas de la grilla,
  // ya que no hay un response de ejemplo en el doc
  id_inscripcion: number;
  id_invitado: number;
  participante: string;
  responsable: string;
  telefono_responsable?: string;
  tiene_problema_medico: boolean;
  tiene_alergias_no_alimentarias: boolean;
  tiene_necesidad_especial: boolean;
  cobertura_medica_nombre: string | null;
  autoriza_emergencia_medica: boolean;
  contactos_count?: number;
  medicaciones_count?: number;
  acciones_salud_count?: number;
}

export interface TipoAccionSalud {
  id: number;
  codigo: string;
  texto: string;
  orden: number;
}

export interface RegistrarAccionPayload {
  id_inscripcion: number;
  id_participante: number;
  fecha_hora: string; // Formato ISO 8601
  tipo_accion: string;
  descripcion: string;
  requirio_contacto_familia: boolean;
  contacto_realizado: boolean;
  requiere_seguimiento: boolean;
}

// Interfaz para los query params del panel principal y filtros
export interface SaludFiltrosParams {
  q?: string;
  soloAlertas?: boolean;
  nivelAlerta?: string;
  tieneMedicacion?: boolean;
  requiereSeguimiento?: boolean;
  tieneRestricciones?: boolean;
}
