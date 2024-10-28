namespace API.DataSchema.DTO
{
    public class RegistrarPersonaRequest
    {
        public string DNI { get; set; }
        public string Legajo { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
    }
}
