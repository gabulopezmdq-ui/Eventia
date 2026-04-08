using System.Collections.Generic;
using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    public class CobranzasCorregirResponseDTO
    {
        [JsonProperty("ok")] public bool ok { get; set; }
        [JsonProperty("corregidos")] public int corregidos { get; set; }
        [JsonProperty("detalle")] public List<string> detalle { get; set; } = new List<string>();
    }
}
