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
        public List<LiveOpcionDTO> opciones { get; set; } = new();
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
        public bool requiere_checkin { get; set; }
        public int max_respuestas_por_invitado { get; set; } = 1;
        public bool permite_cambiar_respuesta { get; set; }
        public bool mostrar_resultados_publicos { get; set; }
        public string? modo_premio { get; set; }
        public int? cantidad_ganadores { get; set; }
        public List<LiveCrearOpcionRequestDTO> opciones { get; set; } = new();
    }

    public class LiveEditarRequestDTO
    {
        public string? codigo { get; set; }
        public string? titulo { get; set; }
        public string? descripcion { get; set; }
        public string? tipo_dinamica { get; set; }
        public string? estado { get; set; }
        public DateTimeOffset? fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }
        public bool? visible_portal { get; set; }
        public bool? requiere_checkin { get; set; }
        public int? max_respuestas_por_invitado { get; set; }
        public bool? permite_cambiar_respuesta { get; set; }
        public bool? mostrar_resultados_publicos { get; set; }
        public string? modo_premio { get; set; }
        public int? cantidad_ganadores { get; set; }

        // Si viene null, no toca opciones.
        // Si viene lista, reemplaza opciones activas por esta lista.
        public List<LiveCrearOpcionRequestDTO>? opciones { get; set; }
    }

    public class LiveCrearOpcionRequestDTO
    {
        public long? id_opcion { get; set; }
        public string texto { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string? imagen_url { get; set; }
        public int orden { get; set; }
        public bool es_correcta { get; set; }
        public bool activo { get; set; } = true;
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

    public class LiveGanadorDTO
    {
        public long id_ganador { get; set; }
        public long id_premio { get; set; }
        public long id_dinamica { get; set; }
        public long? id_respuesta { get; set; }
        public long id_evento { get; set; }
        public long? id_invitado { get; set; }
        public string? token_consulta { get; set; }
        public int? orden_ganador { get; set; }
        public string estado { get; set; } = string.Empty;
        public string? observaciones { get; set; }
        public DateTimeOffset fecha_ganador { get; set; }
        public DateTimeOffset? fecha_entrega { get; set; }

        public string? invitado_nombre { get; set; }
        public string? invitado_email { get; set; }
        public string? opcion_texto { get; set; }
        public DateTimeOffset? fecha_respuesta { get; set; }

        public string? qr_token_premio { get; set; }
        public DateTimeOffset? fecha_generacion_qr { get; set; }
        public long? entregado_por_usuario { get; set; }
    }

    public class LiveGanadorEstadoRequestDTO
    {
        public string estado { get; set; } = string.Empty;
        public string? observaciones { get; set; }
        public long? entregado_por_usuario { get; set; }
    }

    public class LivePremioDTO
    {
        public long id_premio { get; set; }
        public long id_dinamica { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string modo_premio { get; set; } = string.Empty;
        public int? cantidad_ganadores { get; set; }
        public string? instrucciones_entrega { get; set; }
        public string? sponsor_nombre { get; set; }
        public bool activo { get; set; }
    }

    public class LivePremioUpsertRequestDTO
    {
        public long? id_premio { get; set; }
        public long id_dinamica { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string modo_premio { get; set; } = string.Empty;
        public int? cantidad_ganadores { get; set; }
        public string? instrucciones_entrega { get; set; }
        public string? sponsor_nombre { get; set; }
        public bool activo { get; set; } = true;
    }

    public class LiveCanjearPremioRequestDTO
    {
        public string qr_token_premio { get; set; } = string.Empty;
        public long? entregado_por_usuario { get; set; }
        public string? observaciones { get; set; }
    }

    public class LiveCanjearPremioResponseDTO
    {
        public bool ok { get; set; }
        public string estado { get; set; } = string.Empty;
        public string mensaje { get; set; } = string.Empty;
        public long? id_ganador { get; set; }
        public long? id_evento { get; set; }
        public long? id_dinamica { get; set; }
        public long? id_invitado { get; set; }
        public string? premio { get; set; }
        public string? invitado_nombre { get; set; }
        public DateTimeOffset? fecha_entrega { get; set; }
    }

    public class LivePremioPorQrResponseDTO
    {
        public bool ok { get; set; }
        public string estado { get; set; } = string.Empty;
        public string mensaje { get; set; } = string.Empty;

        public long? id_ganador { get; set; }
        public long? id_evento { get; set; }
        public long? id_dinamica { get; set; }
        public long? id_invitado { get; set; }

        public string? premio { get; set; }
        public string? premio_descripcion { get; set; }
        public string? sponsor_nombre { get; set; }

        public string? invitado_nombre { get; set; }
        public string? invitado_email { get; set; }

        public DateTimeOffset? fecha_ganador { get; set; }
        public DateTimeOffset? fecha_entrega { get; set; }
    }

}