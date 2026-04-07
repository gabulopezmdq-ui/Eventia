using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    /// <summary>
    /// Pago manual para B2C (evento). Usado por POST /admin/pagos/registrar
    /// </summary>
    public class PagoManualRequestDTO : PagoManualBaseDTO
    {
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonProperty("codigo_plan")]
        public string CodigoPlan { get; set; } = null!;
    }
}
