using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaServicioDTO
    {
        [JsonPropertyName("id_programa_servicio")]
        public long? IdProgramaServicio { get; set; }

        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? Descripcion { get; set; }

        [JsonPropertyName("tipo_calculo")]
        public string TipoCalculo { get; set; } = null!;

        [JsonPropertyName("precio")]
        public decimal Precio { get; set; }

        [JsonPropertyName("moneda")]
        public string Moneda { get; set; } = "EUR";

        [JsonPropertyName("obligatorio")]
        public bool Obligatorio { get; set; }

        [JsonPropertyName("permite_cantidad")]
        public bool PermiteCantidad { get; set; }

        [JsonPropertyName("cupo")]
        public int? Cupo { get; set; }

        [JsonPropertyName("orden")]
        public int Orden { get; set; }

        [JsonPropertyName("activo")]
        public bool Activo { get; set; } = true;

        [JsonPropertyName("requiere_seleccion_dias")]
        public bool RequiereSeleccionDias { get; set; }
       
        [JsonPropertyName("id_servicio_base")]
        public long? IdServicioBase { get; set; }

        [JsonPropertyName("servicio_base_codigo")]
        public string? ServicioBaseCodigo { get; set; }

        [JsonPropertyName("config_json")]
        public string? ConfigJson { get; set; }
    }
}