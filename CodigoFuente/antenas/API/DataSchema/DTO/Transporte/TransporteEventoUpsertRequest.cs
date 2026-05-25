namespace API.DataSchema.DTO.Transporte
{
    public class TransporteEventoUpsertRequest
    {
        public string? info_publica { get; set; }
        public bool activo { get; set; } = true;
    }
}