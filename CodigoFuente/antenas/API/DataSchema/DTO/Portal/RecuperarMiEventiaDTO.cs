namespace API.DataSchema.DTO.Portal
{
    public class RecuperarMiEventiaRequestDTO
    {
        public string? email { get; set; }
        public string? telefono { get; set; }
        public string canal { get; set; } = "EMAIL"; // EMAIL / WHATSAPP
    }

    public class RecuperarMiEventiaResponseDTO
    {
        public bool ok { get; set; }
        public string mensaje { get; set; } = null!;
        public string? token_recuperacion { get; set; } // solo para test/dev
    }

    public class ValidarRecuperacionRequestDTO
    {
        public string token_recuperacion { get; set; } = null!;
        public string? codigo { get; set; }
    }

    public class ValidarRecuperacionResponseDTO
    {
        public bool ok { get; set; }
        public string token_portal { get; set; } = null!;
        public string url_mi_eventia { get; set; } = null!;
    }
}
