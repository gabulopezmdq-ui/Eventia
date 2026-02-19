namespace API.DataSchema.DTO
{
    public class SolicitudPlantillaDraftDTO
    {
        public long id_evento { get; set; }
        public int id_tipo_evento { get; set; }

        // Podés fijarlo desde el front o dejarlo null y resolverlo en back
        // (ver nota debajo)
        public string? motivo { get; set; }  // "NO_HABIA_PLANTILLAS" | "NINGUNA_SE_ADAPTA"
    }

    public class SolicitudPlantillaDraftResponseDTO
    {
        public long id_solicitud { get; set; }
        public string estado { get; set; } = "D";
    }
}