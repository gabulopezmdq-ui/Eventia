using System;

namespace API.DataSchema
{
    public class ef_evento_live_dinamicas
    {
        public long id_dinamica { get; set; }
        public long id_evento { get; set; }
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string tipo_dinamica { get; set; } = string.Empty;
        public string estado { get; set; } = "BORRADOR";
        public DateTimeOffset? fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }
        public bool visible_portal { get; set; }
        public bool requiere_checkin { get; set; }
        public int max_respuestas_por_invitado { get; set; }
        public bool permite_cambiar_respuesta { get; set; }
        public bool mostrar_resultados_publicos { get; set; }
        public string modo_premio { get; set; } = "SIN_PREMIO";
        public int? cantidad_ganadores { get; set; }
        public string? config_json { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}