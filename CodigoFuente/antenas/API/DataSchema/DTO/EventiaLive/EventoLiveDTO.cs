using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.EventiaLive
{
    public class LiveDinamicaDTO
    {
        public long id_dinamica { get; set; }
        public long id_evento { get; set; }
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string tipo_dinamica { get; set; } = string.Empty;
        public string estado { get; set; } = string.Empty;
        public DateTimeOffset? fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }
        public bool visible_portal { get; set; }
        public bool requiere_checkin { get; set; }
        public int max_respuestas_por_invitado { get; set; }
        public bool permite_cambiar_respuesta { get; set; }
        public bool mostrar_resultados_publicos { get; set; }
        public string modo_premio { get; set; } = string.Empty;
        public int? cantidad_ganadores { get; set; }
        public List<LiveOpcionDTO> opciones { get; set; } = new List<LiveOpcionDTO>();
    }

    public class LiveOpcionDTO
    {
        public long id_opcion { get; set; }
        public string texto { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string? imagen_url { get; set; }
        public int orden { get; set; }
        public bool es_correcta { get; set; }
    }

    public class LiveCrearRequestDTO
    {
        public long id_evento { get; set; }
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string tipo_dinamica { get; set; } = string.Empty;
        public string? estado { get; set; }
        public DateTimeOffset? fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }
        public bool visible_portal { get; set; } = true;
        public bool requiere_checkin { get; set; } = false;
        public int max_respuestas_por_invitado { get; set; } = 1;
        public bool permite_cambiar_respuesta { get; set; } = false;
        public bool mostrar_resultados_publicos { get; set; } = false;
        public string? modo_premio { get; set; }
        public int? cantidad_ganadores { get; set; }
        public List<LiveCrearOpcionRequestDTO> opciones { get; set; } = new List<LiveCrearOpcionRequestDTO>();
    }

    public class LiveCrearOpcionRequestDTO
    {
        public string texto { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string? imagen_url { get; set; }
        public int orden { get; set; }
        public bool es_correcta { get; set; } = false;
    }

    public class LiveCambiarEstadoRequestDTO
    {
        public string estado { get; set; } = string.Empty;
    }

    public class LiveVotarRequestDTO
    {
        public long id_dinamica { get; set; }
        public long? id_opcion { get; set; }
        public long? id_invitado { get; set; }
        public string? token_consulta { get; set; }
        public string? respuesta_texto { get; set; }
    }

    public class LiveCalcularGanadoresRequestDTO
    {
        public long id_dinamica { get; set; }
        public long id_opcion_correcta { get; set; }
    }
}