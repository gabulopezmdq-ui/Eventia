using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoCaptacionLinkDTO_
    {
        [JsonPropertyName("id_acceso_link")]
        public long id_acceso_link { get; set; }

        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("id_acceso")]
        public long id_acceso { get; set; }

        [JsonPropertyName("acceso_nombre")]
        public string acceso_nombre { get; set; } = null!;

        [JsonPropertyName("titulo")]
        public string titulo { get; set; } = null!;

        [JsonPropertyName("leyenda_publica")]
        public string? leyenda_publica { get; set; }

        [JsonPropertyName("token")]
        public string token { get; set; } = null!;

        [JsonPropertyName("es_captacion_publica")]
        public bool es_captacion_publica { get; set; }

        [JsonPropertyName("requiere_registro")]
        public bool requiere_registro { get; set; }

        [JsonPropertyName("max_personas_total")]
        public int max_personas_total { get; set; }

        [JsonPropertyName("max_adultos")]
        public int? max_adultos { get; set; }

        [JsonPropertyName("requiere_nombres_acompanantes")]
        public bool requiere_nombres_acompanantes { get; set; }

        [JsonPropertyName("cupo_beneficio")]
        public int? cupo_beneficio { get; set; }

        [JsonPropertyName("id_tipo_beneficio_registro")]
        public long? id_tipo_beneficio_registro { get; set; }

        [JsonPropertyName("tipo_beneficio_codigo")]
        public string? tipo_beneficio_codigo { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string? beneficio_titulo { get; set; }

        [JsonPropertyName("beneficio_descripcion")]
        public string? beneficio_descripcion { get; set; }

        [JsonPropertyName("beneficio_hasta")]
        public DateTimeOffset? beneficio_hasta { get; set; }

        [JsonPropertyName("mostrar_disponibles")]
        public bool mostrar_disponibles { get; set; }

        [JsonPropertyName("mensaje_post_registro")]
        public string? mensaje_post_registro { get; set; }

        [JsonPropertyName("origen_default")]
        public string? origen_default { get; set; }

        [JsonPropertyName("permite_reutilizar_audiencia")]
        public bool permite_reutilizar_audiencia { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("registrados")]
        public int registrados { get; set; }

        [JsonPropertyName("beneficios_otorgados")]
        public int beneficios_otorgados { get; set; }

        [JsonPropertyName("beneficios_canjeados")]
        public int beneficios_canjeados { get; set; }
    }

    public class EventoCaptacionLinkUpsertRequest
    {
        [JsonPropertyName("id_acceso_link")]
        public long? id_acceso_link { get; set; }

        [JsonPropertyName("id_acceso")]
        public long id_acceso { get; set; }

        [JsonPropertyName("titulo")]
        public string titulo { get; set; } = null!;

        [JsonPropertyName("leyenda_publica")]
        public string? leyenda_publica { get; set; }

        [JsonPropertyName("max_personas_total")]
        public int max_personas_total { get; set; }

        [JsonPropertyName("max_adultos")]
        public int? max_adultos { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("requiere_nombres_acompanantes")]
        public bool requiere_nombres_acompanantes { get; set; }

        [JsonPropertyName("es_captacion_publica")]
        public bool es_captacion_publica { get; set; }

        [JsonPropertyName("requiere_registro")]
        public bool requiere_registro { get; set; }

        [JsonPropertyName("cupo_beneficio")]
        public int? cupo_beneficio { get; set; }

        [JsonPropertyName("id_tipo_beneficio_registro")]
        public long? id_tipo_beneficio_registro { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string? beneficio_titulo { get; set; }

        [JsonPropertyName("beneficio_descripcion")]
        public string? beneficio_descripcion { get; set; }

        [JsonPropertyName("beneficio_hasta")]
        public DateTimeOffset? beneficio_hasta { get; set; }

        [JsonPropertyName("mostrar_disponibles")]
        public bool mostrar_disponibles { get; set; }

        [JsonPropertyName("mensaje_post_registro")]
        public string? mensaje_post_registro { get; set; }

        [JsonPropertyName("origen_default")]
        public string? origen_default { get; set; }

        [JsonPropertyName("permite_reutilizar_audiencia")]
        public bool permite_reutilizar_audiencia { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;
    }

    public class EventoCaptacionLandingDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("id_acceso_link")]
        public long id_acceso_link { get; set; }

        [JsonPropertyName("id_acceso")]
        public long id_acceso { get; set; }

        [JsonPropertyName("acceso_nombre")]
        public string acceso_nombre { get; set; } = null!;

        [JsonPropertyName("titulo")]
        public string titulo { get; set; } = null!;

        [JsonPropertyName("leyenda_publica")]
        public string? leyenda_publica { get; set; }

        [JsonPropertyName("anfitriones_texto")]
        public string anfitriones_texto { get; set; } = null!;

        [JsonPropertyName("mensaje_bienvenida")]
        public string? mensaje_bienvenida { get; set; }

        [JsonPropertyName("max_personas_total")]
        public int max_personas_total { get; set; }

        [JsonPropertyName("max_adultos")]
        public int? max_adultos { get; set; }

        [JsonPropertyName("requiere_nombres_acompanantes")]
        public bool requiere_nombres_acompanantes { get; set; }

        [JsonPropertyName("cupo_beneficio")]
        public int? cupo_beneficio { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string? beneficio_titulo { get; set; }

        [JsonPropertyName("beneficio_descripcion")]
        public string? beneficio_descripcion { get; set; }

        [JsonPropertyName("beneficio_hasta")]
        public DateTimeOffset? beneficio_hasta { get; set; }

        [JsonPropertyName("mostrar_disponibles")]
        public bool mostrar_disponibles { get; set; }

        [JsonPropertyName("mensaje_post_registro")]
        public string? mensaje_post_registro { get; set; }

        [JsonPropertyName("origen_default")]
        public string? origen_default { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("expirado")]
        public bool expirado { get; set; }
    }

    public class EventoCaptacionRegistroRequest
    {
        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("fecha_nacimiento")]
        public DateTime? fecha_nacimiento { get; set; }

        [JsonPropertyName("instagram")]
        public string? instagram { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("ciudad")]
        public string? ciudad { get; set; }

        [JsonPropertyName("id_perfil_asistencia")]
        public long? id_perfil_asistencia { get; set; }

        [JsonPropertyName("acepta_terminos")]
        public bool acepta_terminos { get; set; }

        [JsonPropertyName("acepta_comunicaciones")]
        public bool acepta_comunicaciones { get; set; }

        [JsonPropertyName("acepta_promociones")]
        public bool acepta_promociones { get; set; }

        [JsonPropertyName("origen_registro")]
        public string? origen_registro { get; set; }

        [JsonPropertyName("campania_fuente")]
        public string? campania_fuente { get; set; }

        [JsonPropertyName("campania_medio")]
        public string? campania_medio { get; set; }

        [JsonPropertyName("campania_nombre")]
        public string? campania_nombre { get; set; }

        [JsonPropertyName("campania_contenido")]
        public string? campania_contenido { get; set; }

        [JsonPropertyName("campania_termino")]
        public string? campania_termino { get; set; }

        [JsonPropertyName("pagina_origen")]
        public string? pagina_origen { get; set; }

        [JsonPropertyName("referer")]
        public string? referer { get; set; }

        [JsonPropertyName("id_intereses_evento")]
        public List<long> id_intereses_evento { get; set; } = new List<long>();

        [JsonPropertyName("id_preferencias_musicales")]
        public List<long> id_preferencias_musicales { get; set; } = new List<long>();
    }

    public class EventoCaptacionRegistroResponse
    {
        [JsonPropertyName("ok")]
        public bool ok { get; set; }

        [JsonPropertyName("id_invitado")]
        public long id_invitado { get; set; }

        [JsonPropertyName("id_audiencia_persona")]
        public long id_audiencia_persona { get; set; }

        [JsonPropertyName("beneficio_otorgado")]
        public bool beneficio_otorgado { get; set; }

        [JsonPropertyName("id_beneficio_registro")]
        public long? id_beneficio_registro { get; set; }

        [JsonPropertyName("codigo_canje")]
        public string? codigo_canje { get; set; }

        [JsonPropertyName("rsvp_token")]
        public string? rsvp_token { get; set; }

        [JsonPropertyName("qr_token")]
        public string? qr_token { get; set; }

        [JsonPropertyName("mensaje_post_registro")]
        public string? mensaje_post_registro { get; set; }
    }

    public class AudienciaRegistroEventoDTO
    {
        [JsonPropertyName("id_invitado")]
        public long id_invitado { get; set; }

        [JsonPropertyName("id_audiencia_persona")]
        public long? id_audiencia_persona { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset fecha_alta { get; set; }

        [JsonPropertyName("rsvp_estado")]
        public string rsvp_estado { get; set; } = null!;

        [JsonPropertyName("id_acceso")]
        public long? id_acceso { get; set; }

        [JsonPropertyName("acceso_nombre")]
        public string? acceso_nombre { get; set; }

        [JsonPropertyName("id_acceso_link")]
        public long? id_acceso_link { get; set; }

        [JsonPropertyName("origen_registro")]
        public string? origen_registro { get; set; }

        [JsonPropertyName("id_perfil_asistencia")]
        public long? id_perfil_asistencia { get; set; }

        [JsonPropertyName("intereses")]
        public List<string> intereses { get; set; } = new List<string>();

        [JsonPropertyName("preferencias_musicales")]
        public List<string> preferencias_musicales { get; set; } = new List<string>();

        [JsonPropertyName("acepta_comunicaciones")]
        public bool acepta_comunicaciones { get; set; }

        [JsonPropertyName("acepta_promociones")]
        public bool acepta_promociones { get; set; }

        [JsonPropertyName("beneficio_otorgado")]
        public bool beneficio_otorgado { get; set; }

        [JsonPropertyName("beneficio_canjeado")]
        public bool beneficio_canjeado { get; set; }

        [JsonPropertyName("asistio")]
        public bool asistio { get; set; }
    }

    public class AudienciaPersonaDTO
    {
        [JsonPropertyName("id_audiencia_persona")]
        public long id_audiencia_persona { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("fecha_nacimiento")]
        public DateTime? fecha_nacimiento { get; set; }

        [JsonPropertyName("instagram")]
        public string? instagram { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("ciudad")]
        public string? ciudad { get; set; }

        [JsonPropertyName("acepta_comunicaciones")]
        public bool acepta_comunicaciones { get; set; }

        [JsonPropertyName("acepta_promociones")]
        public bool acepta_promociones { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset fecha_alta { get; set; }

        [JsonPropertyName("eventos_registrados")]
        public int eventos_registrados { get; set; }

        [JsonPropertyName("eventos_asistidos")]
        public int eventos_asistidos { get; set; }

        [JsonPropertyName("ultima_participacion")]
        public DateTimeOffset? ultima_participacion { get; set; }

        [JsonPropertyName("tags")]
        public List<string> tags { get; set; } = new List<string>();
    }

    public class AudienciaDetalleDTO
    {
        [JsonPropertyName("id_audiencia_persona")]
        public long id_audiencia_persona { get; set; }

        [JsonPropertyName("id_cuenta")]
        public long id_cuenta { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("fecha_nacimiento")]
        public DateTime? fecha_nacimiento { get; set; }

        [JsonPropertyName("instagram")]
        public string? instagram { get; set; }

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("ciudad")]
        public string? ciudad { get; set; }

        [JsonPropertyName("acepta_comunicaciones")]
        public bool acepta_comunicaciones { get; set; }

        [JsonPropertyName("acepta_promociones")]
        public bool acepta_promociones { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset fecha_alta { get; set; }

        [JsonPropertyName("tags")]
        public List<string> tags { get; set; } = new List<string>();

        [JsonPropertyName("historial")]
        public List<AudienciaDetalleEventoDTO> historial { get; set; } = new List<AudienciaDetalleEventoDTO>();
    }

    public class AudienciaDetalleEventoDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("evento_nombre")]
        public string evento_nombre { get; set; } = null!;

        [JsonPropertyName("unidad")]
        public string? unidad { get; set; }

        [JsonPropertyName("fecha_registro")]
        public DateTimeOffset fecha_registro { get; set; }

        [JsonPropertyName("asistio")]
        public bool asistio { get; set; }

        [JsonPropertyName("origen_registro")]
        public string? origen_registro { get; set; }

        [JsonPropertyName("beneficio_otorgado")]
        public bool beneficio_otorgado { get; set; }

        [JsonPropertyName("beneficio_canjeado")]
        public bool beneficio_canjeado { get; set; }
    }

    public class AudienciaEventoMetricasDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("resumen")]
        public AudienciaMetricasResumenDTO resumen { get; set; } = new AudienciaMetricasResumenDTO();

        [JsonPropertyName("por_origen")]
        public List<AudienciaMetricasOrigenDTO> por_origen { get; set; } = new List<AudienciaMetricasOrigenDTO>();

        [JsonPropertyName("por_campania")]
        public List<AudienciaMetricasCampaniaDTO> por_campania { get; set; } = new List<AudienciaMetricasCampaniaDTO>();

        [JsonPropertyName("por_perfil_asistencia")]
        public List<AudienciaMetricasPerfilDTO> por_perfil_asistencia { get; set; } = new List<AudienciaMetricasPerfilDTO>();

        [JsonPropertyName("top_intereses")]
        public List<AudienciaMetricasItemDTO> top_intereses { get; set; } = new List<AudienciaMetricasItemDTO>();

        [JsonPropertyName("top_preferencias_musicales")]
        public List<AudienciaMetricasItemDTO> top_preferencias_musicales { get; set; } = new List<AudienciaMetricasItemDTO>();

        [JsonPropertyName("embudo")]
        public AudienciaMetricasEmbudoDTO embudo { get; set; } = new AudienciaMetricasEmbudoDTO();
    }

    public class AudienciaBusquedaRegistradoDTO
    {
        [JsonPropertyName("id_invitado")]
        public long id_invitado { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("id_acceso")]
        public long? id_acceso { get; set; }

        [JsonPropertyName("acceso_nombre")]
        public string? acceso_nombre { get; set; }

        [JsonPropertyName("id_acceso_link")]
        public long? id_acceso_link { get; set; }

        [JsonPropertyName("origen_registro")]
        public string? origen_registro { get; set; }

        [JsonPropertyName("asistio")]
        public bool asistio { get; set; }

        [JsonPropertyName("beneficio_otorgado")]
        public bool beneficio_otorgado { get; set; }

        [JsonPropertyName("beneficio_canjeado")]
        public bool beneficio_canjeado { get; set; }
    }

    public class QrEntradaResolucionDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("id_invitado")]
        public long id_invitado { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("id_acceso")]
        public long? id_acceso { get; set; }

        [JsonPropertyName("acceso_nombre")]
        public string? acceso_nombre { get; set; }

        [JsonPropertyName("id_acceso_link")]
        public long? id_acceso_link { get; set; }

        [JsonPropertyName("campania")]
        public string? campania { get; set; }

        [JsonPropertyName("origen_registro")]
        public string? origen_registro { get; set; }

        [JsonPropertyName("ya_ingreso")]
        public bool ya_ingreso { get; set; }

        [JsonPropertyName("ultimo_movimiento_tipo")]
        public string? ultimo_movimiento_tipo { get; set; }

        [JsonPropertyName("ultimo_movimiento_fecha")]
        public DateTimeOffset? ultimo_movimiento_fecha { get; set; }

        [JsonPropertyName("accion_sugerida")]
        public string accion_sugerida { get; set; } = null!; // INGRESO / REINGRESO

        [JsonPropertyName("beneficio_otorgado")]
        public bool beneficio_otorgado { get; set; }

        [JsonPropertyName("beneficio_canjeado")]
        public bool beneficio_canjeado { get; set; }

        [JsonPropertyName("beneficio_pendiente")]
        public bool beneficio_pendiente { get; set; }

        [JsonPropertyName("id_beneficio_registro")]
        public long? id_beneficio_registro { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string? beneficio_titulo { get; set; }

        [JsonPropertyName("beneficio_descripcion")]
        public string? beneficio_descripcion { get; set; }

        [JsonPropertyName("qr_token")]
        public string? qr_token { get; set; }

        [JsonPropertyName("mostrar_qr_para_canje")]
        public bool mostrar_qr_para_canje { get; set; }
    }

    public class QrBeneficioResolucionDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("id_invitado")]
        public long id_invitado { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("id_acceso_link")]
        public long? id_acceso_link { get; set; }

        [JsonPropertyName("campania")]
        public string? campania { get; set; }

        [JsonPropertyName("tiene_beneficio")]
        public bool tiene_beneficio { get; set; }

        [JsonPropertyName("id_beneficio_registro")]
        public long? id_beneficio_registro { get; set; }

        [JsonPropertyName("tipo_beneficio_codigo")]
        public string? tipo_beneficio_codigo { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string? beneficio_titulo { get; set; }

        [JsonPropertyName("beneficio_descripcion")]
        public string? beneficio_descripcion { get; set; }

        [JsonPropertyName("estado_beneficio")]
        public string estado_beneficio { get; set; } = null!; // PENDIENTE / CANJEADO / VENCIDO / NO_APLICA

        [JsonPropertyName("fecha_vencimiento")]
        public DateTimeOffset? fecha_vencimiento { get; set; }

        [JsonPropertyName("puede_canjear")]
        public bool puede_canjear { get; set; }

        [JsonPropertyName("mensaje")]
        public string mensaje { get; set; } = null!;
    }

    public class AudienciaMetricasResumenDTO
    {
        [JsonPropertyName("registrados")]
        public int registrados { get; set; }

        [JsonPropertyName("asistieron")]
        public int asistieron { get; set; }

        [JsonPropertyName("no_show")]
        public int no_show { get; set; }

        [JsonPropertyName("conversion_asistencia_pct")]
        public decimal conversion_asistencia_pct { get; set; }

        [JsonPropertyName("beneficios_otorgados")]
        public int beneficios_otorgados { get; set; }

        [JsonPropertyName("beneficios_canjeados")]
        public int beneficios_canjeados { get; set; }

        [JsonPropertyName("conversion_beneficio_pct")]
        public decimal conversion_beneficio_pct { get; set; }
    }

    public class AudienciaMetricasOrigenDTO
    {
        [JsonPropertyName("origen_registro")]
        public string origen_registro { get; set; } = null!;

        [JsonPropertyName("registrados")]
        public int registrados { get; set; }

        [JsonPropertyName("asistieron")]
        public int asistieron { get; set; }

        [JsonPropertyName("beneficios_otorgados")]
        public int beneficios_otorgados { get; set; }

        [JsonPropertyName("beneficios_canjeados")]
        public int beneficios_canjeados { get; set; }
    }

    public class AudienciaMetricasCampaniaDTO
    {
        [JsonPropertyName("id_acceso_link")]
        public long id_acceso_link { get; set; }

        [JsonPropertyName("campania")]
        public string campania { get; set; } = null!;

        [JsonPropertyName("registrados")]
        public int registrados { get; set; }

        [JsonPropertyName("asistieron")]
        public int asistieron { get; set; }

        [JsonPropertyName("beneficios_otorgados")]
        public int beneficios_otorgados { get; set; }

        [JsonPropertyName("beneficios_canjeados")]
        public int beneficios_canjeados { get; set; }
    }

    public class AudienciaMetricasPerfilDTO
    {
        [JsonPropertyName("id_perfil_asistencia")]
        public long? id_perfil_asistencia { get; set; }

        [JsonPropertyName("perfil_texto")]
        public string perfil_texto { get; set; } = null!;

        [JsonPropertyName("cantidad")]
        public int cantidad { get; set; }
    }

    public class AudienciaMetricasItemDTO
    {
        [JsonPropertyName("codigo")]
        public string codigo { get; set; } = null!;

        [JsonPropertyName("texto")]
        public string texto { get; set; } = null!;

        [JsonPropertyName("cantidad")]
        public int cantidad { get; set; }
    }

    public class AudienciaMetricasEmbudoDTO
    {
        [JsonPropertyName("landing_visitas")]
        public int? landing_visitas { get; set; }

        [JsonPropertyName("registrados")]
        public int registrados { get; set; }

        [JsonPropertyName("asistieron")]
        public int asistieron { get; set; }

        [JsonPropertyName("beneficios_canjeados")]
        public int beneficios_canjeados { get; set; }
    }


}