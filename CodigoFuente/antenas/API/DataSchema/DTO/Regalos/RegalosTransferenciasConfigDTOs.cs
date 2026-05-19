namespace API.DataSchema.DTO.Regalos
{
    public class RegalosTransferenciasConfigUpsertDTO
    {
        public long id_evento { get; set; }
        public string titulo { get; set; } = "Regalos";
        public string? texto_intro { get; set; }
        public bool activo { get; set; } = true;
    }

    public class RegalosTransferenciasConfigDTO
    {
        public long id_evento { get; set; }
        public string titulo { get; set; } = null!;
        public string? texto_intro { get; set; }
        public bool activo { get; set; }
    }
}