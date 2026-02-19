namespace API.DataSchema.DTO
{
    public class SolicitudPlantillaCancelarDraftRequestDTO
    {
        // opcional, si querés guardar una nota mínima del porqué canceló
        public string? observaciones { get; set; }
    }
}
