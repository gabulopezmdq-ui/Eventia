using System;
using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoCreateRequest
    {
        [JsonProperty("id_tipo_evento")]
        [JsonPropertyName("id_tipo_evento")]
        public int IdTipoEvento { get; set; }

        [JsonProperty("id_idioma")]
        [JsonPropertyName("id_idioma")]
        public short IdIdioma { get; set; } // opcional

        [JsonProperty("id_pais")]
        [JsonPropertyName("id_pais")]
        public short? IdPais { get; set; }

        // B2B
        [JsonProperty("id_cuenta")]
        [JsonPropertyName("id_cuenta")]
        public long? IdCuenta { get; set; }

        [JsonProperty("id_unidad")]
        [JsonPropertyName("id_unidad")]
        public long? IdUnidad { get; set; }

        [JsonProperty("id_cliente")]
        [JsonPropertyName("id_cliente")]
        public long? IdCliente { get; set; }

        // Solo para UI / validación funcional
        // Valores sugeridos: "PROPIO" | "CLIENTE"
        [JsonProperty("modalidad")]
        [JsonPropertyName("modalidad")]
        public string? Modalidad { get; set; }

        [JsonProperty("anfitriones_texto")]
        [JsonPropertyName("anfitriones_texto")]
        public string? AnfitrionesTexto { get; set; }

        [JsonProperty("id_dress_code")]
        [JsonPropertyName("id_dress_code")]
        public short? IdDressCode { get; set; }

        [JsonProperty("dress_code_descripcion")]
        [JsonPropertyName("dress_code_descripcion")]
        public string? DressCodeDescripcion { get; set; }

        [JsonProperty("saludo")]
        [JsonPropertyName("saludo")]
        public string? Saludo { get; set; }

        [JsonProperty("mensaje_bienvenida")]
        [JsonPropertyName("mensaje_bienvenida")]
        public string? MensajeBienvenida { get; set; }

        [JsonProperty("notas")]
        [JsonPropertyName("notas")]
        public string? Notas { get; set; }
        
        [JsonProperty("codigo_plan")]
        [JsonPropertyName("codigo_plan")]
        public string? CodigoPlan { get; set; } // "B2C_FREE", "B2C_BASIC", "B2C_PLUS", "B2C_PRO"

        [JsonProperty("tipo_operacion")]
        [JsonPropertyName("tipo_operacion")]
        public string? TipoOperacion { get; set; } // EVENTO | PROGRAMA

        [JsonProperty("fecha_inicio")]
        [JsonPropertyName("fecha_inicio")]
        public DateOnly? FechaInicio { get; set; }

        [JsonProperty("fecha_fin")]
        [JsonPropertyName("fecha_fin")]
        public DateOnly? FechaFin { get; set; }
    }

    public class EventoResponse
    {
        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_tipo_evento")]
        public int IdTipoEvento { get; set; }

        // NUEVO: código opcional (útil para íconos en front)
        [JsonPropertyName("tipo_evento_codigo")]
        public string? TipoEventoCodigo { get; set; }

        // NUEVO: descripción traducida
        [JsonPropertyName("tipo_evento_descripcion")]
        public string? TipoEventoDescripcion { get; set; }

        [JsonPropertyName("id_idioma")]
        public short IdIdioma { get; set; }


        // B2B
        [JsonPropertyName("id_cuenta")]
        public long? IdCuenta { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? IdUnidad { get; set; }

        [JsonPropertyName("unidad_nombre")]
        public string? UnidadNombre { get; set; }

        [JsonPropertyName("id_cliente")]
        public long? IdCliente { get; set; }

        [JsonPropertyName("cliente_nombre")]
        public string? ClienteNombre { get; set; }

        // Derivado
        [JsonPropertyName("modalidad")]
        public string? Modalidad { get; set; } // "PROPIO" | "CLIENTE" | null



        [JsonPropertyName("anfitriones_texto")]
        public string AnfitrionesTexto { get; set; } = null!;

        [JsonPropertyName("estado")]
        public string Estado { get; set; } = null!;

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset FechaAlta { get; set; }
        [JsonPropertyName("id_dress_code")]
        public short? IdDressCode { get; set; }

        [JsonPropertyName("dress_code_descripcion")]
        public string? DressCodeDescripcion { get; set; }

        [JsonPropertyName("dress_code_texto")]
        public string? DressCodeTexto { get; set; }

        [JsonPropertyName("saludo")]
        public string? Saludo { get; set; }

        [JsonPropertyName("mensaje_bienvenida")]
        public string? MensajeBienvenida { get; set; }

        [JsonPropertyName("notas")]
        public string? Notas { get; set; }

        // info del plan (para mostrar en UI)
        [JsonPropertyName("id_plan")]
        public long? IdPlan { get; set; }

        [JsonPropertyName("plan_codigo")]
        public string? PlanCodigo { get; set; }

        [JsonPropertyName("plan_nombre")]
        public string? PlanNombre { get; set; }

        // Plan de cuenta (solo lectura útil en B2B)
        [JsonPropertyName("cuenta_plan_codigo")]
        public string? CuentaPlanCodigo { get; set; }

        [JsonPropertyName("cuenta_plan_nombre")]
        public string? CuentaPlanNombre { get; set; }

        [JsonPropertyName("tipo_operacion")]
        public string TipoOperacion { get; set; } = "EVENTO";

        [JsonPropertyName("es_publico")]
        public bool EsPublico { get; set; }

        [JsonPropertyName("modo_ui")]
        public string ModoUi { get; set; } = null!;

        [JsonPropertyName("mostrar_gestion_invitados")]
        public bool MostrarGestionInvitados { get; set; }

        [JsonPropertyName("mostrar_audiencias")]
        public bool MostrarAudiencias { get; set; }

        [JsonPropertyName("modo_gestion_invitados")]
        public string ModoGestionInvitados { get; set; } = null!;

        [JsonPropertyName("fecha_inicio")]
        public DateOnly? FechaInicio { get; set; }

        [JsonPropertyName("fecha_fin")]
        public DateOnly? FechaFin { get; set; }

        [JsonPropertyName("id_pais")]
        public short? IdPais { get; set; }

        [JsonPropertyName("pais_codigo_iso2")]
        public string? PaisCodigoIso2 { get; set; }

        [JsonPropertyName("codigo_mercado")]
        public string? CodigoMercado { get; set; }

        [JsonPropertyName("codigo_moneda")]
        public string? CodigoMoneda { get; set; }


    }
}