namespace API.DataSchema.DTO.Portal
{
    public class SolicitarCodigoPortalRequestDTO
    {
        public string canal { get; set; } = "EMAIL"; // EMAIL / WHATSAPP
    }

    public class SolicitarCodigoPortalResponseDTO
    {
        public bool ok { get; set; }
        public string mensaje { get; set; } = null!;
        public string? codigo_dev { get; set; } // solo test/dev
    }

    public class ValidarCodigoPortalRequestDTO
    {
        public string codigo { get; set; } = null!;
    }

    public class ValidarCodigoPortalResponseDTO
    {
        public bool ok { get; set; }
        public bool desbloqueado { get; set; }
        public string mensaje { get; set; } = null!;
    }
}
