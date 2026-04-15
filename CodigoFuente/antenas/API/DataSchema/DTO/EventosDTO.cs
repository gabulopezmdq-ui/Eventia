using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoCreateRequest
    {
        [JsonPropertyName("id_tipo_evento")]
        public int IdTipoEvento { get; set; }

        [JsonPropertyName("id_idioma")]
        public short IdIdioma { get; set; } // opcional

        // B2B
        [JsonPropertyName("id_cuenta")]
        public long? IdCuenta { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? IdUnidad { get; set; }

        [JsonPropertyName("id_cliente")]
        public long? IdCliente { get; set; }

        // Solo para UI / validación funcional
        // Valores sugeridos: "PROPIO" | "CLIENTE"
        [JsonPropertyName("modalidad")]
        public string? Modalidad { get; set; }


        [JsonPropertyName("anfitriones_texto")]
        public string AnfitrionesTexto { get; set; } = null!;

        [JsonPropertyName("id_dress_code")]
        public short? IdDressCode { get; set; }

        [JsonPropertyName("dress_code_descripcion")]
        public string? DressCodeDescripcion { get; set; }

        [JsonPropertyName("saludo")]
        public string? Saludo { get; set; }

        [JsonPropertyName("mensaje_bienvenida")]
        public string? MensajeBienvenida { get; set; }

        [JsonPropertyName("notas")]
        public string? Notas { get; set; }
        
        [JsonPropertyName("codigo_plan")]
        public string? CodigoPlan { get; set; } // "B2C_FREE", "B2C_BASIC", "B2C_PLUS", "B2C_PRO"
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
    }
}