using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaServicioBaseDTO
    {
        [JsonPropertyName("id_servicio_base")]
        public long IdServicioBase { get; set; }

        [JsonPropertyName("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? Descripcion { get; set; }

        [JsonPropertyName("orden")]
        public int Orden { get; set; }
    }
}