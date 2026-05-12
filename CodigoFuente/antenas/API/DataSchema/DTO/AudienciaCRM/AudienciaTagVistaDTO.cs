using System.Text.Json.Serialization;

public class AudienciaTagVistaDTO
{
    [JsonPropertyName("id_audiencia_persona_tag")]
    public long id_audiencia_persona_tag { get; set; }

    [JsonPropertyName("tag_tipo")]
    public string tag_tipo { get; set; } = null!;

    [JsonPropertyName("tag_valor")]
    public string tag_valor { get; set; } = null!;

    [JsonPropertyName("nombre_mostrar")]
    public string nombre_mostrar { get; set; } = null!;

    [JsonPropertyName("origen")]
    public string origen { get; set; } = null!;

    [JsonPropertyName("activo")]
    public bool activo { get; set; }
}